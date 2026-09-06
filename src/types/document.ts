// ============================================================
// Shared TypeScript types for BillEase documents
// ============================================================

export type DocType = 'bill' | 'invoice'
export type DocStatus = 'paid' | 'unpaid' | 'draft' | 'pending'

// A single line item inside a bill or invoice
export interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number   // quantity × rate (auto-calculated)
}

// The full document structure (bill or invoice)
export interface BillEaseDocument {
  id: string           // unique ID e.g. "INV-2026-001"
  type: DocType
  status: DocStatus

  // Dates
  createdAt: string    // ISO string
  updatedAt: string    // ISO string
  date: string         // display date e.g. "Sep 2, 2026"
  dueDate?: string     // invoice only

  // Parties
  billTo: {
    name: string
    email?: string
    address?: string
    phone?: string
  }
  billFrom: {
    name: string
    email?: string
    address?: string
    phone?: string
  }

  // Line items
  items: LineItem[]

  // Totals
  subtotal: number
  taxRate: number      // percentage, e.g. 18 for 18%
  taxAmount: number
  total: number

  // Invoice-only extras
  invoiceNumber?: string
  paymentTerms?: string
  bankDetails?: string
  notes?: string
  templateId?: string
}
