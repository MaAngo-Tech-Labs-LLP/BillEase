// ============================================================
// useDocuments — custom hook for localStorage CRUD
//
// All documents are stored under one key: "billease_documents"
// Data persists forever unless the user clears browser storage.
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import type { BillEaseDocument, DocStatus } from '../types/document'

const STORAGE_KEY = 'billease_documents'

// ---------- Business Profile Defaults ----------
export interface BusinessProfile {
  name: string
  email: string
  phone: string
  address: string
  gstNumber?: string
  bankDetails?: string
}

const PROFILE_KEY = 'billease_business_profile'

export function getBusinessProfile(): BusinessProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) {
      return {
        name: '',
        email: '',
        phone: '',
        address: '',
        gstNumber: '',
        bankDetails: '',
      }
    }
    return JSON.parse(raw) as BusinessProfile
  } catch {
    return { name: '', email: '', phone: '', address: '', gstNumber: '', bankDetails: '' }
  }
}

export function saveBusinessProfile(profile: BusinessProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    window.dispatchEvent(new CustomEvent('billease_profile_updated', { detail: profile }))
  } catch {
    console.error('BillEase: failed to save business profile')
  }
}

// ---------- Helper: generate a document ID ----------
export function generateDocId(type: 'bill' | 'invoice'): string {
  const prefix = type === 'bill' ? 'BIL' : 'INV'
  const year   = new Date().getFullYear()
  const rand   = Math.floor(Math.random() * 9000) + 1000  // 4-digit number
  return `${prefix}-${year}-${rand}`
}

// ---------- Helper: format date for display ----------
export function formatDisplayDate(isoString?: string): string {
  if (!isoString) return '—'
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return String(isoString)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

// ---------- Helper: format amount ----------
export function formatAmount(amount: number): string {
  const safe = Number(amount) || 0
  return '₹' + safe.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

// ---------- Low-level storage functions ----------

/** Read all documents from localStorage (sorted newest first) */
function readFromStorage(): BillEaseDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as BillEaseDocument[]
    if (!Array.isArray(parsed)) return []
    // Sort newest first based on updatedAt or createdAt
    return parsed.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime()
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime()
      return dateB - dateA
    })
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
  const [documents, setDocuments] = useState<BillEaseDocument[]>(() => readFromStorage())

  // Listen to broadcast and storage updates
  useEffect(() => {
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

  // ----- Save a new or edited document -----
  const saveDocument = useCallback((doc: BillEaseDocument): void => {
    setDocuments(prev => {
      const exists = prev.find(d => d.id === doc.id)
      const now = new Date().toISOString()
      const updatedDoc = {
        ...doc,
        createdAt: doc.createdAt || exists?.createdAt || now,
        updatedAt: now,
      }
      const updated = exists
        ? prev.map(d => d.id === doc.id ? updatedDoc : d)
        : [updatedDoc, ...prev]
      writeToStorage(updated)
      return updated
    })
  }, [])

  // ----- Delete a document by ID -----
  const deleteDocument = useCallback((id: string): void => {
    setDocuments(prev => {
      const cleanId = String(id || '').trim()
      if (!cleanId) return prev
      const updated = prev.filter(d => String(d.id || '').trim() !== cleanId)
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
    documents,       // all documents (reactive, newest first)
    saveDocument,    // create or update
    deleteDocument,  // delete by ID
    updateStatus,    // change status only
    getDocument,     // find one by ID
    clearAll,        // wipe everything
  }
}
