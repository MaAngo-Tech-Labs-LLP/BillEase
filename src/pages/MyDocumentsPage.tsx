import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Filter, Eye, Pencil, Download, Trash2,
  FolderOpen, Receipt, FileText, Plus, PackageOpen,
  AlertTriangle, CheckCircle2, X
} from 'lucide-react'
import Navbar from '../components/Navbar'
import { useDocuments, formatAmount, formatDisplayDate } from '../hooks/useDocuments'
import type { BillEaseDocument, DocStatus } from '../types/document'

type FilterTab = 'all' | 'bills' | 'invoices'

// ---------- Status Badge ----------
const STATUS_CONFIG: Record<DocStatus, { label: string; bg: string; color: string }> = {
  paid:    { label: 'Paid',    bg: 'rgba(168, 213, 194, 0.3)', color: '#4E8F75' },
  unpaid:  { label: 'Unpaid',  bg: 'rgba(186, 26,  26,  0.1)', color: '#ba1a1a' },
  draft:   { label: 'Draft',   bg: 'rgba(110, 110, 110, 0.12)', color: '#6E6E6E' },
  pending: { label: 'Pending', bg: 'rgba(255, 180, 80,  0.2)', color: '#B07D2A' },
}

const StatusBadge = ({ status }: { status: DocStatus }) => {
  const cfg = STATUS_CONFIG[status]
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '0.7rem',
      fontWeight: 600,
      background: cfg.bg,
      color: cfg.color,
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}

// ---------- Page ----------
const MyDocumentsPage = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [docToDelete, setDocToDelete] = useState<BillEaseDocument | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const { documents, deleteDocument } = useDocuments()

  const handleConfirmDelete = () => {
    if (!docToDelete) return
    const idToDelete = docToDelete.id
    deleteDocument(idToDelete)
    setDocToDelete(null)
    setToastMessage(`Document #${idToDelete} deleted successfully.`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filter logic — runs on real localStorage data with safe fallbacks
  const filtered = documents.filter(doc => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'bills'    && doc.type === 'bill') ||
      (activeTab === 'invoices' && doc.type === 'invoice')

    const clientName = doc.billTo?.name || ''
    const docId = doc.id || ''
    const invNum = doc.invoiceNumber || ''

    const matchesSearch =
      clientName.toLowerCase().includes(search.toLowerCase()) ||
      docId.toLowerCase().includes(search.toLowerCase()) ||
      invNum.toLowerCase().includes(search.toLowerCase())

    return matchesTab && matchesSearch
  })

  return (
    <>
      <Navbar />

      <main style={{ minHeight: '100vh', paddingTop: '68px', paddingBottom: '4rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem' }}>

          {/* ---- Page header ---- */}
          <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7BBFA5', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                <FolderOpen size={13} />
                Professional Suite
              </div>
              <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--charcoal)', margin: 0 }}>
                My Documents
              </h1>
              <p style={{ color: 'var(--charcoal-soft)', marginTop: '0.4rem', fontSize: '0.95rem' }}>
                Your saved bills and invoices — ready to manage, export, and track.
              </p>
            </div>

            {/* New document button */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/create-bill" style={{ textDecoration: 'none' }}>
                <button style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 18px', borderRadius: '12px',
                  background: 'rgba(168, 213, 194, 0.25)',
                  border: '1.5px solid rgba(168, 213, 194, 0.5)',
                  color: '#4E8F75', fontWeight: 600, fontSize: '0.85rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  <Plus size={15} /> New Bill
                </button>
              </Link>
              <Link to="/create-invoice" style={{ textDecoration: 'none' }}>
                <button style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 18px', borderRadius: '12px',
                  background: 'rgba(201, 192, 232, 0.25)',
                  border: '1.5px solid rgba(201, 192, 232, 0.5)',
                  color: '#7060A8', fontWeight: 600, fontSize: '0.85rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  <Plus size={15} /> New Invoice
                </button>
              </Link>
            </div>
          </div>

          {/* ---- Glass container ---- */}
          <div className="glass-card" style={{ padding: '1.5rem', overflow: 'hidden' }}>

            {/* Filter tabs + Search row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>

              {/* Filter tabs */}
              <div style={{
                display: 'flex', gap: '4px',
                background: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.7)',
                borderRadius: '10px', padding: '4px',
              }}>
                {(['all', 'bills', 'invoices'] as FilterTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '6px 16px', borderRadius: '8px', border: 'none',
                      fontSize: '0.825rem', fontWeight: 600, cursor: 'pointer',
                      textTransform: 'capitalize',
                      background: activeTab === tab ? 'rgba(255,255,255,0.9)' : 'transparent',
                      color: activeTab === tab ? 'var(--charcoal)' : 'var(--charcoal-soft)',
                      boxShadow: activeTab === tab ? '0 1px 6px rgba(0,0,0,0.07)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {tab === 'all' ? 'All' : tab === 'bills' ? 'Bills' : 'Invoices'}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(255,255,255,0.75)',
                borderRadius: '10px', padding: '8px 14px', flex: 1, maxWidth: '320px',
              }}>
                <Search size={15} color="var(--charcoal-soft)" />
                <input
                  type="text"
                  placeholder="Search by client or document ID…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    border: 'none', background: 'transparent', outline: 'none',
                    fontSize: '0.85rem', color: 'var(--charcoal)', width: '100%',
                  }}
                />
                <Filter size={14} color="var(--charcoal-soft)" style={{ cursor: 'pointer', flexShrink: 0 }} />
              </div>
            </div>

            {/* ---- Table ---- */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    {['Document ID', 'Type', 'Client', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{
                        padding: '10px 14px', textAlign: 'left',
                        fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.8px',
                        textTransform: 'uppercase', color: 'var(--charcoal-soft)',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--charcoal-soft)' }}>
                          <PackageOpen size={36} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                          <p style={{ fontWeight: 600, color: 'var(--charcoal-mid)', marginBottom: '0.4rem' }}>
                            {search || activeTab !== 'all' ? 'No documents match your filter.' : 'No documents yet.'}
                          </p>
                          <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                            {search || activeTab !== 'all' ? 'Try a different search or filter.' : 'Create your first bill or invoice to get started.'}
                          </p>
                          {!search && activeTab === 'all' && (
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                              <Link to="/create-bill" style={{ textDecoration: 'none', padding: '8px 18px', borderRadius: '10px', background: 'rgba(168,213,194,0.25)', border: '1.5px solid rgba(168,213,194,0.5)', color: '#4E8F75', fontWeight: 600, fontSize: '0.85rem' }}>+ New Bill</Link>
                              <Link to="/create-invoice" style={{ textDecoration: 'none', padding: '8px 18px', borderRadius: '10px', background: 'rgba(201,192,232,0.25)', border: '1.5px solid rgba(201,192,232,0.5)', color: '#7060A8', fontWeight: 600, fontSize: '0.85rem' }}>+ New Invoice</Link>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((doc, i) => (
                      <tr
                        key={doc.id}
                        style={{
                          borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.5)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* Doc ID */}
                        <td style={{ padding: '14px 14px', fontWeight: 600, color: '#5B9E86' }}>
                          {doc.id}
                        </td>

                        {/* Type */}
                        <td style={{ padding: '14px 14px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--charcoal-mid)' }}>
                            {doc.type === 'bill'
                              ? <Receipt size={14} color="#5B9E86" />
                              : <FileText size={14} color="#8A7CC0" />}
                            <span style={{ fontSize: '0.8rem', fontWeight: 500, textTransform: 'capitalize' }}>{doc.type}</span>
                          </span>
                        </td>

                        {/* Client */}
                        <td style={{ padding: '14px 14px', color: 'var(--charcoal)' }}>{doc.billTo.name}</td>

                        {/* Date */}
                        <td style={{ padding: '14px 14px', color: 'var(--charcoal-soft)' }}>
                          {formatDisplayDate(doc.createdAt)}
                        </td>

                        {/* Amount */}
                        <td style={{ padding: '14px 14px', fontWeight: 600, color: 'var(--charcoal)' }}>
                          {formatAmount(doc.total)}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '14px 14px' }}>
                          <StatusBadge status={doc.status} />
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 14px' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                              <Link to={`/preview?id=${doc.id}`} style={{ textDecoration: 'none' }}>
                                <button title="View / Print PDF" aria-label="View"
                                  style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.07)', background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6E6E6E', transition: 'all 0.15s' }}
                                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.95)')}
                                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.6)')}
                                ><Eye size={13} /></button>
                              </Link>

                              <Link to={`/create-${doc.type}?edit=${doc.id}`} style={{ textDecoration: 'none' }}>
                                <button title="Edit" aria-label="Edit"
                                  style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.07)', background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6E6E6E', transition: 'all 0.15s' }}
                                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.95)')}
                                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.6)')}
                                ><Pencil size={13} /></button>
                              </Link>

                              <Link to={`/preview?id=${doc.id}&action=print`} style={{ textDecoration: 'none' }}>
                                <button title="Download / Print PDF" aria-label="Download PDF"
                                  style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.07)', background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6E6E6E', transition: 'all 0.15s' }}
                                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.95)')}
                                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.6)')}
                                ><Download size={13} /></button>
                              </Link>

                              <button
                                title="Delete document"
                                aria-label="Delete"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDocToDelete(doc)
                                }}
                                style={{
                                  width: '30px', height: '30px', borderRadius: '8px',
                                  border: '1px solid rgba(186,26,26,0.18)', background: 'rgba(186,26,26,0.06)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: 'pointer', color: '#ba1a1a', transition: 'all 0.15s'
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.background = '#ba1a1a'
                                  e.currentTarget.style.color = '#ffffff'
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.background = 'rgba(186,26,26,0.06)'
                                  e.currentTarget.style.color = '#ba1a1a'
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer row */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.775rem', color: 'var(--charcoal-soft)' }}>
                Showing {filtered.length} of {documents.length} document{documents.length !== 1 ? 's' : ''}
              </span>
              <span style={{ fontSize: '0.775rem', color: 'var(--charcoal-soft)' }}>
                Page 1 of 1
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Modern Delete Confirmation Modal */}
      {docToDelete && (
        <div
          onClick={() => setDocToDelete(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '440px', background: '#FFFFFF',
              borderRadius: '20px', padding: '2rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.22)', border: '1px solid rgba(0,0,0,0.08)',
              position: 'relative', textAlign: 'center',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setDocToDelete(null)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%',
                width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: '#6B7280'
              }}
              title="Close"
            >
              <X size={16} />
            </button>

            {/* Danger Icon Badge */}
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'rgba(186,26,26,0.12)', color: '#ba1a1a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <AlertTriangle size={30} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: '0 0 0.5rem' }}>
              Delete Document?
            </h3>

            <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <strong>{docToDelete.id}</strong>
              {docToDelete.billTo?.name ? ` for ${docToDelete.billTo.name}` : ''}? This document will be removed from local storage and cannot be restored.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => setDocToDelete(null)}
                style={{
                  flex: 1, padding: '11px 18px', borderRadius: '12px',
                  border: '1.5px solid rgba(0,0,0,0.12)', background: '#FFFFFF',
                  color: '#374151', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '11px 18px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #ba1a1a, #dc2626)', color: '#FFFFFF',
                  fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(186,26,26,0.35)', transition: 'all 0.15s'
                }}
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
          background: '#111827', color: '#FFFFFF', padding: '12px 20px',
          borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.25)', fontSize: '0.875rem', fontWeight: 600,
        }}>
          <CheckCircle2 size={18} color="#7BBFA5" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  )
}

export default MyDocumentsPage
