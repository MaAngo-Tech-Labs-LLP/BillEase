import { useEffect, useState } from 'react'
import { Link, useSearchParams, useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, Download, Printer, FileText, Receipt, LayoutTemplate, Lock, Eye, Pencil, Sparkles, Check, Trash2, AlertTriangle, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import DocumentRenderer from '../components/DocumentRenderer'
import { useDocuments, formatAmount, formatDisplayDate } from '../hooks/useDocuments'
import type { BillEaseDocument } from '../types/document'
import { TEMPLATES } from '../data/templates'

// ── Helpers ──────────────────────────────────────────────────
const fmt = (n: number) =>
  '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// ── Status badge ──────────────────────────────────────────────
const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  paid:    { bg: 'rgba(91,158,134,0.15)', color: '#4E8F75', label: 'Paid' },
  unpaid:  { bg: 'rgba(186,26,26,0.1)',  color: '#ba1a1a', label: 'Unpaid' },
  draft:   { bg: 'rgba(110,110,110,0.1)', color: '#6E6E6E', label: 'Draft' },
  pending: { bg: 'rgba(255,180,80,0.18)', color: '#B07D2A', label: 'Pending' },
}

// ── Empty state ───────────────────────────────────────────────
const EmptyState = () => (
  <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--charcoal-soft)' }}>
    <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(168,213,194,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
      <Eye size={30} color="#7BBFA5" />
    </div>
    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>No Document Selected</h3>
    <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
      Select a saved document from the list on the left to preview it here, or create a new one.
    </p>
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
      <Link to="/create-bill" style={{ textDecoration: 'none' }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '12px', border: '1.5px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.8)', color: 'var(--charcoal)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
          <Receipt size={15} /> Create Bill
        </button>
      </Link>
      <Link to="/create-invoice" style={{ textDecoration: 'none' }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #5B9E86, #7BBFA5)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
          <FileText size={15} /> Create Invoice
        </button>
      </Link>
    </div>
  </div>
)

// ── PreviewPage ───────────────────────────────────────────────
const PreviewPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { id: routeId } = useParams<{ id: string }>()
  const { documents, saveDocument, deleteDocument } = useDocuments()
  const [docToDelete, setDocToDelete] = useState<BillEaseDocument | null>(null)

  const urlId = routeId || searchParams.get('id')
  const [selectedId, setSelectedId] = useState<string | null>(urlId || null)

  // Sync selectedId with URL or fallback to first document
  useEffect(() => {
    if (urlId) {
      setSelectedId(urlId)
    } else if (documents.length > 0 && !selectedId) {
      setSelectedId(documents[0].id)
    }
  }, [urlId, documents, selectedId])

  // Handle action=print query param
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'print') {
      setTimeout(() => window.print(), 500)
    }
  }, [searchParams])

  const selectedDoc = documents.find(d => d.id === selectedId) || null
  const isSaved = searchParams.get('saved') === '1'
  const statusParam = searchParams.get('status')

  const [activeTemplateId, setActiveTemplateId] = useState<string>('tpl-gst')

  // Keep activeTemplateId synced with the document's selected template
  useEffect(() => {
    if (selectedDoc?.templateId) {
      setActiveTemplateId(selectedDoc.templateId)
    } else if (selectedDoc?.type === 'bill') {
      setActiveTemplateId('tpl-receipt')
    } else if (selectedDoc?.type === 'invoice') {
      setActiveTemplateId('tpl-gst')
    }
  }, [selectedDoc])

  const handlePrint = () => { window.print() }

  const handleDownloadText = () => {
    if (!selectedDoc) return
    const content = `BillEase Document\n${selectedDoc.type === 'bill' ? 'BILL' : 'INVOICE'} #${selectedDoc.invoiceNumber || selectedDoc.id}\n\nBilled To: ${selectedDoc.billTo?.name}\nDate: ${selectedDoc.date}\nDue Date: ${selectedDoc.dueDate}\n\nItems:\n${(selectedDoc.items || []).map(i => `  ${i.description} x${i.quantity} @ ${fmt(i.rate)} = ${fmt(i.amount)}`).join('\n')}\n\nSubtotal: ${fmt(selectedDoc.subtotal || 0)}\nTax (${selectedDoc.taxRate}%): ${fmt(selectedDoc.taxAmount || 0)}\nTotal Due: ${fmt(selectedDoc.total || 0)}\n\n${selectedDoc.notes ? `Notes: ${selectedDoc.notes}` : ''}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `${selectedDoc.invoiceNumber || selectedDoc.id}.txt`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', paddingTop: '68px', paddingBottom: '4rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 2rem' }}>

          {/* Top breadcrumb bar */}
          <div className="no-print" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--charcoal-soft)', fontSize: '0.72rem', marginBottom: '6px' }}>
                <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Dashboard</Link>
                <span style={{ fontSize: '10px' }}>›</span>
                <Link to="/documents" style={{ color: 'inherit', textDecoration: 'none' }}>Documents</Link>
                <span style={{ fontSize: '10px' }}>›</span>
                <span style={{ color: '#5B9E86', fontWeight: 600 }}>PDF Downloader & Ready</span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--charcoal)', margin: 0 }}>
                PDF Preview & Downloader
              </h1>
            </div>

            {selectedDoc && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to={`/create-${selectedDoc.type}?edit=${selectedDoc.id}`} style={{ textDecoration: 'none' }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '12px', border: '1.5px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.7)', color: 'var(--charcoal)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                    <Pencil size={15} /> Edit Document
                  </button>
                </Link>
                <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '12px', border: '1.5px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.85)', color: 'var(--charcoal)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                  <Printer size={15} /> Print
                </button>
                <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #5B9E86, #7BBFA5)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(91,158,134,0.35)' }}>
                  <Download size={15} /> Download PDF
                </button>
              </div>
            )}
          </div>

          {/* Document Saved Notification Banner */}
          {isSaved && (
            <div className="no-print" style={{
              marginBottom: '1.75rem', padding: '1.1rem 1.6rem', borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(91,158,134,0.14), rgba(123,191,165,0.24))',
              border: '1.5px solid rgba(91,158,134,0.38)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
              boxShadow: '0 4px 20px rgba(91,158,134,0.12)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#5B9E86', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(91,158,134,0.35)' }}>
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--charcoal)' }}>
                    {statusParam === 'draft' ? 'Draft Saved Successfully!' : 'Document Saved Successfully!'}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--charcoal-soft)', marginTop: '2px' }}>
                    Your {selectedDoc?.type === 'bill' ? 'bill' : 'invoice'} has been compiled and saved to local storage. Your preview is ready below to review and download.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '11px', border: 'none', background: '#5B9E86', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(91,158,134,0.35)' }}>
                  <Download size={15} /> Download PDF Now
                </button>
              </div>
            </div>
          )}

          {/* Two-column layout */}
          <div className="preview-page-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.75rem', alignItems: 'start' }}>

            {/* LEFT: Document list */}
            <div className="no-print" style={{ position: 'sticky', top: '88px' }}>
              <div style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(255,255,255,0.75)', borderRadius: '16px', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', boxShadow: '0 4px 24px rgba(168,213,194,0.14)', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--charcoal)' }}>Saved Documents</span>
                  <span style={{ background: 'rgba(91,158,134,0.15)', color: '#5B9E86', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>{documents.length}</span>
                </div>

                {documents.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--charcoal-soft)', fontSize: '0.82rem' }}>
                    <FileText size={28} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                    <p>No saved documents yet.</p>
                    <Link to="/create-bill" style={{ color: '#5B9E86', fontWeight: 600, fontSize: '0.8rem' }}>Create your first document →</Link>
                  </div>
                ) : (
                  <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
                    {documents.map(doc => {
                      const isSelected = doc.id === selectedId
                      const sc = STATUS_COLORS[doc.status] || STATUS_COLORS.draft
                      return (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedId(doc.id)}
                          style={{
                            width: '100%', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '10px',
                            background: isSelected ? 'rgba(91,158,134,0.12)' : 'transparent',
                            borderLeft: isSelected ? '3px solid #5B9E86' : '3px solid transparent',
                            border: 'none', cursor: 'pointer', textAlign: 'left',
                            borderBottom: '1px solid rgba(0,0,0,0.05)', transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: doc.type === 'invoice' ? 'rgba(138,124,192,0.15)' : 'rgba(168,213,194,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {doc.type === 'invoice' ? <FileText size={16} color="#8A7CC0" /> : <Receipt size={16} color="#5B9E86" />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {doc.type === 'bill' ? 'Bill' : 'Invoice'} #{doc.invoiceNumber || doc.id}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--charcoal-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {doc.billTo?.name || 'Walk-in'} · {formatAmount(doc.total || 0)}
                            </div>
                          </div>
                          <div style={{ flexShrink: 0 }}>
                            <span style={{ background: sc.bg, color: sc.color, fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', textTransform: 'capitalize' }}>{sc.label}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Footer links */}
                <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: '0.5rem' }}>
                  <Link to="/create-bill" style={{ flex: 1, textDecoration: 'none' }}>
                    <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px', borderRadius: '9px', border: '1.5px solid rgba(0,0,0,0.09)', background: 'rgba(255,255,255,0.7)', color: 'var(--charcoal-mid)', fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer' }}>
                      <Receipt size={12} /> New Bill
                    </button>
                  </Link>
                  <Link to="/create-invoice" style={{ flex: 1, textDecoration: 'none' }}>
                    <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px', borderRadius: '9px', border: 'none', background: 'linear-gradient(135deg, #5B9E86, #7BBFA5)', color: '#fff', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}>
                      <FileText size={12} /> New Invoice
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT: Stitch PDF Downloader & Ready Presentation Area */}
            <div>
              {selectedDoc ? (
                <>
                  {/* Stitch PDF Downloader & Ready Hero */}
                  <div className="no-print" style={{
                    background: 'rgba(255,255,255,0.65)', border: '1.5px solid rgba(255,255,255,0.85)',
                    borderRadius: '24px', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(168,213,194,0.18)', padding: '2.5rem 2rem',
                    textAlign: 'center', marginBottom: '2rem',
                  }}>
                    {/* Circle checkmark */}
                    <div style={{
                      width: '76px', height: '76px', borderRadius: '50%',
                      background: 'rgba(91,158,134,0.16)', color: '#4E8F75',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 1.25rem', boxShadow: '0 6px 20px rgba(91,158,134,0.2)'
                    }}>
                      <CheckCircle2 size={40} />
                    </div>

                    <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                      Your document is ready for download
                    </h2>
                    <p style={{ fontSize: '0.95rem', color: 'var(--charcoal-soft)', maxWidth: '580px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
                      Your {selectedDoc.type === 'bill' ? 'bill' : 'invoice'} has been successfully compiled and securely saved in your local storage. You can now download as PDF, print, or edit.
                    </p>

                    {/* Metadata breakdown box */}
                    <div style={{
                      background: 'rgba(255,255,255,0.85)', borderRadius: '16px',
                      padding: '1.25rem 1.75rem', border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.03)', maxWidth: '500px', margin: '0 auto 1.75rem',
                      display: 'flex', flexDirection: 'column', gap: '0.65rem', textAlign: 'left',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--charcoal-soft)' }}>Document Type</span>
                        <span style={{ fontWeight: 600, color: 'var(--charcoal)' }}>{selectedDoc.type === 'bill' ? 'Standard Bill' : 'Professional Invoice'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--charcoal-soft)' }}>Invoice / Bill #</span>
                        <span style={{ fontWeight: 700, color: 'var(--charcoal)' }}>{selectedDoc.invoiceNumber || selectedDoc.id}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--charcoal-soft)' }}>Date</span>
                        <span style={{ fontWeight: 600, color: 'var(--charcoal)' }}>{formatDisplayDate(selectedDoc.createdAt)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--charcoal-soft)' }}>Billed To</span>
                        <span style={{ fontWeight: 600, color: 'var(--charcoal)' }}>{selectedDoc.billTo?.name || 'Walk-in Client'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--charcoal-soft)' }}>Tax ({selectedDoc.taxRate || 0}%)</span>
                        <span style={{ fontWeight: 600, color: 'var(--charcoal)' }}>{fmt(selectedDoc.taxAmount || 0)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '2px solid rgba(0,0,0,0.08)', fontSize: '1.1rem', fontWeight: 800 }}>
                        <span style={{ color: 'var(--charcoal)' }}>Total Amount</span>
                        <span style={{ color: selectedDoc.type === 'invoice' ? '#6E5CB6' : '#5B9E86' }}>{fmt(selectedDoc.total || 0)}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '500px', margin: '0 auto 1.25rem' }}>
                      <button
                        onClick={handlePrint}
                        style={{
                          flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          padding: '14px 24px', borderRadius: '14px', border: 'none',
                          background: 'linear-gradient(135deg, #5B9E86, #7BBFA5)', color: '#fff',
                          fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                          boxShadow: '0 6px 20px rgba(91,158,134,0.35)', transition: 'all 0.2s',
                        }}
                      >
                        <Download size={18} /> Download PDF
                      </button>
                      <button
                        onClick={handlePrint}
                        style={{
                          flex: '1 1 140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          padding: '14px 20px', borderRadius: '14px', border: '1.5px solid rgba(0,0,0,0.1)',
                          background: 'rgba(255,255,255,0.9)', color: 'var(--charcoal)',
                          fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s',
                        }}
                      >
                        <Printer size={18} /> Print
                      </button>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--charcoal-soft)', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.6)', padding: '7px 16px', borderRadius: '20px', display: 'inline-block' }}>
                      💡 Tip: In the browser print window, select <strong>"Save as PDF"</strong> to save this document directly to your device.
                    </div>

                    {/* Secondary links */}
                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                      <Link
                        to={`/create-${selectedDoc.type}?edit=${selectedDoc.id}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#5B9E86', fontWeight: 600, textDecoration: 'none' }}
                      >
                        <Pencil size={13} /> Edit this document
                      </Link>
                      <span style={{ color: '#ccc' }}>•</span>
                      <Link
                        to="/documents"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--charcoal-soft)', fontWeight: 600, textDecoration: 'none' }}
                      >
                        <FileText size={13} /> View all in My Documents
                      </Link>
                      <span style={{ color: '#ccc' }}>•</span>
                      <button
                        onClick={handleDownloadText}
                        style={{ background: 'none', border: 'none', color: 'var(--charcoal-soft)', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
                      >
                        Download as .txt
                      </button>
                      <span style={{ color: '#ccc' }}>•</span>
                      <button
                        onClick={() => setDocToDelete(selectedDoc)}
                        style={{ background: 'none', border: 'none', color: '#ba1a1a', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>

                    {/* Security note */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.72rem', color: '#7BBFA5', marginTop: '1.5rem' }}>
                      <Lock size={12} /> Secure 256-bit Local Browser Storage Active
                    </div>
                  </div>

                  {/* Real Document Template Architecture Switcher Toolbar */}
                  <div className="no-print" style={{
                    background: 'rgba(255,255,255,0.7)', borderRadius: '14px',
                    padding: '0.75rem 1.25rem', border: '1px solid rgba(0,0,0,0.08)',
                    marginBottom: '1.25rem', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <LayoutTemplate size={16} color="#5B9E86" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--charcoal)' }}>Layout Architecture:</span>
                      <select
                        value={activeTemplateId}
                        onChange={e => {
                          const newId = e.target.value
                          setActiveTemplateId(newId)
                          if (selectedDoc) {
                            saveDocument({ ...selectedDoc, templateId: newId })
                          }
                        }}
                        style={{
                          padding: '6px 12px', borderRadius: '8px', border: '1.5px solid rgba(0,0,0,0.12)',
                          fontSize: '0.8rem', fontWeight: 700, color: 'var(--charcoal)', background: '#fff', cursor: 'pointer'
                        }}
                        title="Switch template architecture"
                      >
                        {TEMPLATES.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                        ))}
                      </select>
                      <span style={{ fontSize: '0.72rem', color: 'var(--charcoal-soft)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Check size={12} color="#5B9E86" /> Auto-saved
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Link to={`/create-${selectedDoc.type}?edit=${selectedDoc.id}&template=${activeTemplateId}`} style={{ textDecoration: 'none' }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', background: '#fff', color: 'var(--charcoal)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                          <Pencil size={12} /> Edit Document & Items
                        </button>
                      </Link>
                      <Link to="/templates" style={{ textDecoration: 'none' }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'rgba(91,158,134,0.14)', color: '#4E8F75', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                          <Sparkles size={12} /> Gallery
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* High-fidelity Real Document Architecture Sheet */}
                  <DocumentRenderer
                    doc={{ ...selectedDoc, templateId: activeTemplateId }}
                    templateId={activeTemplateId}
                    containerId="printable-a4-doc"
                  />
                </>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(255,255,255,0.75)', borderRadius: '16px', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}>
                  <EmptyState />
                </div>
              )}
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
              Are you sure you want to permanently delete <strong>{docToDelete.id}</strong>? This document will be removed from local storage.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => setDocToDelete(null)}
                style={{
                  flex: 1, padding: '11px 18px', borderRadius: '12px',
                  border: '1.5px solid rgba(0,0,0,0.12)', background: '#FFFFFF',
                  color: '#374151', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteDocument(docToDelete.id)
                  setDocToDelete(null)
                  navigate('/documents')
                }}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '11px 18px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #ba1a1a, #dc2626)', color: '#FFFFFF',
                  fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(186,26,26,0.35)',
                }}
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Print Styles */}
      <style>{`
        @media print {
          body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          nav, header, .navbar, button, a, .no-print, .no-print * {
            display: none !important;
          }
          .preview-page-grid {
            display: block !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          #printable-a4-doc {
            box-shadow: none !important;
            margin: 0 auto !important;
            width: 100% !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>
    </>
  )
}

export default PreviewPage
