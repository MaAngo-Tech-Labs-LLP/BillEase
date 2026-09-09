import { useState, useEffect, useCallback } from 'react';
import { BillDocument, DocumentType } from '../types';
import { DEFAULT_BILL, DEFAULT_INVOICE, SAMPLE_DOCUMENTS } from '../data/templates';
import { applyBusinessProfileToDoc, PROFILE_UPDATED_EVENT } from '../utils/profileSync';

const STORAGE_DOCS_KEY = 'billease_documents_list';
const STORAGE_DRAFT_KEY = 'billease_active_draft';

export function useDocuments() {
  // Saved documents list
  const [documents, setDocuments] = useState<BillDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DOCS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed reading documents from storage:', e);
    }
    return SAMPLE_DOCUMENTS;
  });

  // Active working draft (e.g. for Bill or Invoice creator)
  const [draft, setDraft] = useState<BillDocument>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DRAFT_KEY);
      if (saved) {
        return applyBusinessProfileToDoc(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed reading draft from storage:', e);
    }
    return applyBusinessProfileToDoc(DEFAULT_BILL);
  });

  // Listen for real-time Profile & Settings updates and automatically update draft
  useEffect(() => {
    const handleProfileUpdate = (e: any) => {
      const p = e?.detail || null;
      setDraft((prev) => applyBusinessProfileToDoc(prev, p, true));
    };
    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdate as EventListener);
    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdate as EventListener);
    };
  }, []);

  // Sync documents list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(documents));
    } catch (e) {
      console.error('Failed saving documents list:', e);
    }
  }, [documents]);

  // Sync active draft to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      console.error('Failed saving draft:', e);
    }
  }, [draft]);

  // Save current draft or specific doc to saved documents
  const saveDocument = useCallback((docToSave?: BillDocument): BillDocument => {
    const target = docToSave || draft;
    
    // Generate fresh unique ID if creating from a default template ID to prevent overwriting
    const isTemplateDefaultId = target.id === 'doc-apex-billing' || target.id === 'inv-acme-design' || target.id === 'inv-studio-pulse';
    const uniqueId = (!target.id || isTemplateDefaultId)
      ? `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      : target.id;

    const documentRecord: BillDocument = {
      ...target,
      id: uniqueId,
      createdAt: target.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDocuments((prev) => {
      const existingIdx = prev.findIndex((d) => d.id === documentRecord.id);
      let updated: BillDocument[];
      if (existingIdx >= 0) {
        // Move updated document to the top of list
        const filtered = prev.filter((d) => d.id !== documentRecord.id);
        updated = [documentRecord, ...filtered];
      } else {
        // Place the newly created/saved document at the very top
        updated = [documentRecord, ...prev];
      }
      try {
        localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed saving documents list to storage:', e);
      }
      return updated;
    });

    return documentRecord;
  }, [draft]);

  // Delete a document
  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      try {
        localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  }, []);

  // Create a new blank draft of specified type
  const createNewDraft = useCallback((type: DocumentType = 'bill'): BillDocument => {
    const num = Math.floor(1000 + Math.random() * 9000);

    if (type === 'invoice') {
      const newInvoice: BillDocument = applyBusinessProfileToDoc({
        ...DEFAULT_INVOICE,
        id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        billNumber: `INV-2026-${num}`,
        createdAt: new Date().toISOString(),
      });
      setDraft(newInvoice);
      return newInvoice;
    }

    const newDoc: BillDocument = applyBusinessProfileToDoc({
      ...DEFAULT_BILL,
      id: `doc-${Date.now()}`,
      type: 'bill',
      title: `New Bill #${num}`,
      billNumber: `BIL-2026-${num}`,
      items: [
        { id: 'item-1', description: 'Professional Consulting Services', qty: 1, rate: 1000 },
      ],
      createdAt: new Date().toISOString(),
    });
    setDraft(newDoc);
    return newDoc;
  }, []);

  // Update draft field
  const updateDraft = useCallback((updates: Partial<BillDocument>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    documents,
    draft,
    setDraft,
    updateDraft,
    saveDocument,
    deleteDocument,
    createNewDraft,
  };
}
