// ============================================================
// useDocuments — custom hook for localStorage CRUD
//
// All documents are stored under one key: "billease_documents"
// Data persists forever unless the user clears browser storage.
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import type { BillEaseDocument, DocStatus } from '../types/document'

const STORAGE_KEY = 'billease_documents'

// ---------- Helper: generate a document ID ----------
export function generateDocId(type: 'bill' | 'invoice'): string {
  const prefix = type === 'bill' ? 'BIL' : 'INV'
  const year   = new Date().getFullYear()
  const rand   = Math.floor(Math.random() * 9000) + 1000  // 4-digit number
  return `${prefix}-${year}-${rand}`
}

// ---------- Helper: format date for display ----------
export function formatDisplayDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

// ---------- Helper: format amount ----------
export function formatAmount(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

// ---------- Low-level storage functions ----------

/** Read all documents from localStorage */
function readFromStorage(): BillEaseDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as BillEaseDocument[]
  } catch {
    console.error('BillEase: failed to read from localStorage')
    return []
  }
}

/** Write documents array to localStorage and broadcast event */
function writeToStorage(docs: BillEaseDocument[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs))
    window.dispatchEvent(new CustomEvent('billease_documents_updated', { detail: docs }))
  } catch {
    console.error('BillEase: failed to write to localStorage (storage may be full)')
  }
}

// ---------- The hook ----------

export function useDocuments() {
  const [documents, setDocuments] = useState<BillEaseDocument[]>([])

  // Load from localStorage on mount and listen to broadcast updates
  useEffect(() => {
    setDocuments(readFromStorage())

    const handleUpdate = () => {
      setDocuments(readFromStorage())
    }
    window.addEventListener('storage', handleUpdate)
    window.addEventListener('billease_documents_updated', handleUpdate)
    return () => {
      window.removeEventListener('storage', handleUpdate)
      window.removeEventListener('billease_documents_updated', handleUpdate)
    }
  }, [])

  // ----- Save a new document -----
  const saveDocument = useCallback((doc: BillEaseDocument): void => {
    setDocuments(prev => {
      const exists = prev.find(d => d.id === doc.id)
      // If already exists, update it; otherwise add it
      const updated = exists
        ? prev.map(d => d.id === doc.id ? { ...doc, updatedAt: new Date().toISOString() } : d)
        : [...prev, doc]
      writeToStorage(updated)
      return updated
    })
  }, [])

  // ----- Delete a document by ID -----
  const deleteDocument = useCallback((id: string): void => {
    setDocuments(prev => {
      const cleanId = String(id || '').trim()
      const updated = prev.filter(d => {
        const dId = String(d.id || '').trim()
        const invNum = String(d.invoiceNumber || '').trim()
        return dId !== cleanId && invNum !== cleanId
      })
      writeToStorage(updated)
      return updated
    })
  }, [])

  // ----- Update only the status of a document -----
  const updateStatus = useCallback((id: string, status: DocStatus): void => {
    setDocuments(prev => {
      const updated = prev.map(d =>
        d.id === id
          ? { ...d, status, updatedAt: new Date().toISOString() }
          : d
      )
      writeToStorage(updated)
      return updated
    })
  }, [])

  // ----- Get a single document by ID -----
  const getDocument = useCallback((id: string): BillEaseDocument | undefined => {
    return documents.find(d => d.id === id)
  }, [documents])

  // ----- Clear ALL documents (use with caution) -----
  const clearAll = useCallback((): void => {
    localStorage.removeItem(STORAGE_KEY)
    setDocuments([])
  }, [])

  return {
    documents,       // all documents (reactive)
    saveDocument,    // create or update
    deleteDocument,  // delete by ID
    updateStatus,    // change status only
    getDocument,     // find one by ID
    clearAll,        // wipe everything
  }
}
