import { useState, useEffect, useCallback } from 'react';
import { BillDocument, DocumentType } from '../types';
import { DEFAULT_BILL, DEFAULT_INVOICE, SAMPLE_DOCUMENTS, getTodayIsoDate, getFutureIsoDate } from '../data/templates';
import { applyBusinessProfileToDoc, PROFILE_UPDATED_EVENT } from '../utils/profileSync';

const STORAGE_DOCS_KEY = 'billease_documents_list';
const STORAGE_DRAFT_KEY = 'billease_active_draft';

export function useDocuments() {
  // Saved documents list. Sample documents are only used to seed a
  // brand-new install (no saved key at all yet) — an explicitly saved empty
  // array (e.g. after "Clear All") must stay empty, not be treated the same
  // as "nothing saved" and quietly repopulated with the samples.
  const [documents, setDocuments] = useState<BillDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DOCS_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
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

    // Keep active draft in sync with saved record
    setDraft(documentRecord);
    try {
      if (documentRecord.type === 'invoice') {
        localStorage.setItem('billease_invoice_draft', JSON.stringify(documentRecord));
      } else {
        localStorage.setItem('billease_bill_draft', JSON.stringify(documentRecord));
      }
    } catch (_) {}

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

  // Permanently delete every saved document (My Documents list only — does
  // not touch the working drafts, business profile, or theme).
  const clearAllDocuments = useCallback(() => {
    setDocuments([]);
    try {
      localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify([]));
    } catch (_) {}
  }, []);

  // Create a new blank draft of specified type
  const createNewDraft = useCallback((type: DocumentType = 'bill'): BillDocument => {
    const num = Math.floor(1000 + Math.random() * 9000);

    if (type === 'invoice') {
      const newInvoice: BillDocument = applyBusinessProfileToDoc({
        ...DEFAULT_INVOICE,
        id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: 'INVOICE',
        billNumber: `INV-2026-${num}`,
        poNumber: '',
        // DEFAULT_INVOICE.issueDate/dueDate are computed once when the app
        // loads and never change afterward — recompute fresh here so a new
        // document always gets today's actual date, not whatever day the
        // page happened to first load on.
        issueDate: getTodayIsoDate(),
        dueDate: getFutureIsoDate(30),
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        items: [
          { id: 'item-1', name: '', description: '', qty: 1, rate: 0, taxRate: 0 },
        ],
        taxRate: 0,
        discount: 0,
        paymentNotes: '',
        notes: '',
        paymentTerms: '',
        termsAndConditions: '',
        createdAt: new Date().toISOString(),
      });
      setDraft(newInvoice);
      try {
        localStorage.setItem('billease_invoice_draft', JSON.stringify(newInvoice));
      } catch (_) {}
      return newInvoice;
    }

    const newDoc: BillDocument = applyBusinessProfileToDoc({
      ...DEFAULT_BILL,
      id: `bill-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'bill',
      title: 'BILL',
      billNumber: `BIL-2026-${num}`,
      poNumber: '',
      // DEFAULT_BILL.issueDate/dueDate are computed once when the app loads
      // and never change afterward — recompute fresh here so a new document
      // always gets today's actual date, not whatever day the page happened
      // to first load on.
      issueDate: getTodayIsoDate(),
      dueDate: getFutureIsoDate(30),
      clientName: '',
      clientCompany: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      shippingAddress: '',
      shippingSameAsBilling: true,
      clientTaxNumber: '',
      items: [
        { id: 'item-1', name: '', description: '', qty: 1, rate: 0, taxRate: 0, discount: 0 },
      ],
      taxRate: 0,
      discount: 0,
      additionalCharges: 0,
      amountPaid: 0,
      paymentNotes: '',
      notes: '',
      paymentTerms: '',
      termsAndConditions: '',
      createdAt: new Date().toISOString(),
    });
    setDraft(newDoc);
    try {
      localStorage.setItem('billease_bill_draft', JSON.stringify(newDoc));
    } catch (_) {}
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
    clearAllDocuments,
    createNewDraft,
  };
}
