import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, Save, Download, Plus, Trash2, Eye, FileText, LayoutTemplate, Sparkles,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import DocumentRenderer from '../components/DocumentRenderer'
import { useDocuments, generateDocId } from '../hooks/useDocuments'
import type { LineItem, BillEaseDocument } from '../types/document'
import { TEMPLATES, getTemplateChoice, getTemplateById, setTemplateChoice } from '../data/templates'

const today = new Date().toISOString().slice(0, 10)
const due30  = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)

const fmt = (n: number) =>
  '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const newItem = (): LineItem => ({
  id: crypto.randomUUID(),
  description: '',
  quantity: 1,
  rate: 0,
  amount: 0,
})

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: '1.5px solid rgba(0,0,0,0.09)',
  background: 'rgba(255,255,255,0.75)', fontSize: '0.875rem',
  color: 'var(--charcoal)', outline: 'none', transition: 'border-color 0.2s',
  boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.72rem', fontWeight: 600,
  color: 'var(--charcoal-mid)', marginBottom: '5px', letterSpacing: '0.3px',
}
const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.55)',
  border: '1.5px solid rgba(255,255,255,0.75)',
  borderRadius: '16px',
  backdropFilter: 'blur(18px) saturate(160%)',
  WebkitBackdropFilter: 'blur(18px) saturate(160%)',
  boxShadow: '0 4px 24px rgba(168,213,194,0.14)',
  padding: '1.5rem',
}

const Field = ({ label, value, onChange, type = 'text', placeholder = '', rows }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; rows?: number;
}) => (
  <div>
    <label style={labelStyle}>{label}</label>
    {rows ? (
      <textarea rows={rows} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, resize: 'vertical' }} />
    ) : (
      <input type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} style={inputStyle} />
    )}
  </div>
)

const CreateInvoicePage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const templateParam = searchParams.get('template')
  const { documents, saveDocument } = useDocuments()

  // Active template choice
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    if (templateParam) return templateParam
    const stored = getTemplateChoice()
    return stored || 'tpl-gst'
  })

  const currentTemplate = getTemplateById(selectedTemplateId)

  const [invoiceNumber, setInvoiceNumber] = useState(() => editId || generateDocId('invoice'))
  const [clientName,    setClientName]    = useState('')
  const [clientEmail,   setClientEmail]   = useState('')
  const [clientPhone,   setClientPhone]   = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [issueDate,     setIssueDate]     = useState(today)
  const [dueDate,       setDueDate]       = useState(due30)
  const [paymentTerms,  setPaymentTerms]  = useState('Net 30')

  const [myName,    setMyName]    = useState('')
  const [myEmail,   setMyEmail]   = useState('')
  const [myPhone,   setMyPhone]   = useState('')
  const [myAddress, setMyAddress] = useState('')
  const [gstNumber, setGstNumber] = useState('')

  const [items,   setItems]   = useState<LineItem[]>([newItem()])
  const [taxRate, setTaxRate] = useState('18')

  // Load sample data helper when template changes or initially
  const loadTemplateSampleData = (tId: string) => {
    const t = getTemplateById(tId)
    if (t?.sampleItems && t.sampleItems.length > 0) {
      setItems(t.sampleItems.map(si => ({
        id: crypto.randomUUID(),
        description: si.desc,
        quantity: si.qty,
        rate: si.rate,
        amount: si.qty * si.rate,
      })))
      if (!myName && t.logoText) setMyName(t.logoText)
      if (!clientName && t.sampleClient) setClientName(t.sampleClient)
    }
  }

  // Load existing document if in edit mode or apply templateParam
  useEffect(() => {
    if (editId && documents.length > 0) {
      const doc = documents.find(d => d.id === editId)
      if (doc) {
        setInvoiceNumber(doc.id)
        if (doc.templateId) {
          setSelectedTemplateId(doc.templateId)
        }
        if (doc.billTo) {
          setClientName(doc.billTo.name || '')
          setClientEmail(doc.billTo.email || '')
          setClientPhone(doc.billTo.phone || '')
          setClientAddress(doc.billTo.address || '')
        }
        if (doc.billFrom) {
          setMyName(doc.billFrom.name || '')
          setMyEmail(doc.billFrom.email || '')
          setMyPhone(doc.billFrom.phone || '')
          setMyAddress(doc.billFrom.address || '')
        }
        if (doc.date) setIssueDate(doc.date)
        if (doc.dueDate) setDueDate(doc.dueDate)
        if (doc.paymentTerms) setPaymentTerms(doc.paymentTerms)
        if (doc.items && doc.items.length > 0) setItems(doc.items)
        if (doc.taxRate !== undefined) setTaxRate(String(doc.taxRate))
        if (doc.bankDetails) setBankDetails(doc.bankDetails)
        if (doc.notes) setNotes(doc.notes)
      }
    } else if (templateParam && items.length === 1 && !items[0].description) {
      // If user came directly with ?template=... and items are empty, prefill sample items
      loadTemplateSampleData(templateParam)
    }
  }, [editId, documents, templateParam])

  const updateItem = useCallback((id: string, field: keyof LineItem, val: string | number) => {
    setItems(prev => prev.map(it => {
      if (it.id !== id) return it
      const updated = { ...it, [field]: val }
      updated.amount = Number(updated.quantity) * Number(updated.rate)
      return updated
    }))
  }, [])

  const addItem    = () => setItems(p => [...p, newItem()])
  const removeItem = (id: string) => setItems(p => p.length > 1 ? p.filter(i => i.id !== id) : p)

  const [bankDetails, setBankDetails] = useState('')
  const [notes,       setNotes]       = useState('')

  const subtotal = items.reduce((s, i) => s + i.amount, 0)
  const taxAmt   = subtotal * (parseFloat(taxRate) || 0) / 100
  const total    = subtotal + taxAmt

  const buildDoc = (status: 'draft' | 'paid'): BillEaseDocument => ({
    id: invoiceNumber,
    type: 'invoice',
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    date: issueDate,
    dueDate,
    billTo:   { name: clientName, email: clientEmail, address: clientAddress, phone: clientPhone },
    billFrom: { name: myName, email: myEmail, address: myAddress, phone: myPhone },
    items,
    subtotal,
    taxRate: parseFloat(taxRate) || 0,
    taxAmount: taxAmt,
    total,
    invoiceNumber,
    paymentTerms,
    bankDetails,
    notes,
    templateId: selectedTemplateId,
  })

  // ── Workflow handlers ──
  const handleSaveDraft = () => {
    const doc = buildDoc('draft')
    saveDocument(doc)
    // Takes user directly to the preview of their saved draft
    navigate(`/preview?id=${encodeURIComponent(doc.id)}&saved=1&status=draft`)
  }

  const handleFinalize = (downloadImmediately = false) => {
    const doc = buildDoc('paid')
    saveDocument(doc)
    // Takes user to preview with download ready
    navigate(`/preview?id=${encodeURIComponent(doc.id)}&saved=1&ready=1${downloadImmediately ? '&action=print' : ''}`)
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', paddingTop: '68px', paddingBottom: '4rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 2rem' }}>

          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--charcoal-soft)', fontSize: '0.72rem', marginBottom: '6px' }}>
                <span>Dashboard</span><span style={{ fontSize: '10px' }}>›</span>
                <span>Documents</span><span style={{ fontSize: '10px' }}>›</span>
                <span style={{ color: '#8A7CC0', fontWeight: 600 }}>{editId ? 'Edit Invoice' : 'Create Invoice'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8A7CC0', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
                <FileText size={12} /> {editId ? 'Invoice Editor' : 'Invoice Builder'}
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--charcoal)', margin: 0 }}>
                {editId ? `Edit Invoice: ${invoiceNumber}` : 'Professional Invoice Builder'}
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '12px', border: '1.5px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.7)', color: 'var(--charcoal-mid)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                <ArrowLeft size={15} /> Back
              </button>
              <button onClick={handleSaveDraft} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '12px', border: '1.5px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.7)', color: 'var(--charcoal)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                <Save size={15} /> Save Draft & Preview
              </button>
              <button onClick={() => handleFinalize(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6E5CB6, #9B8FD4)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(110,92,182,0.35)' }}>
                <Download size={15} /> {editId ? 'Update & Download PDF' : 'Save & Download PDF'}
              </button>
            </div>
          </div>

          {/* Two-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '1.75rem', alignItems: 'start' }}>

            {/* LEFT: Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* ① Template Architecture Picker */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--charcoal)', margin: 0 }}>① Choose Document Layout Architecture</h2>
                    <p style={{ fontSize: '0.76rem', color: 'var(--charcoal-soft)', margin: '2px 0 0 0' }}>Real document formats with tailored layouts and structures</p>
                  </div>
                  <button
                    onClick={() => loadTemplateSampleData(selectedTemplateId)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
                      borderRadius: '8px', border: '1px solid rgba(110,92,182,0.3)',
                      background: 'rgba(110,92,182,0.08)', color: '#6E5CB6', fontSize: '0.75rem',
                      fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    <Sparkles size={13} /> Load Sample Items for this Layout
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {TEMPLATES.map(t => {
                    const isSel = selectedTemplateId === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedTemplateId(t.id)
                          setTemplateChoice(t.id)
                        }}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                          padding: '0.85rem', borderRadius: '12px',
                          border: isSel ? `2px solid ${t.accentColor}` : '1.5px solid rgba(0,0,0,0.08)',
                          background: isSel ? `${t.accentColor}12` : 'rgba(255,255,255,0.65)',
                          cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                          boxShadow: isSel ? `0 4px 14px ${t.accentColor}30` : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: `${t.accentColor}20`, color: t.accentColor, textTransform: 'uppercase' }}>
                            {t.category}
                          </span>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: t.accentColor, display: 'inline-block' }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--charcoal)', marginBottom: '3px' }}>{t.name}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--charcoal-soft)', lineHeight: 1.3 }}>{t.description}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ② Client & Invoice Meta */}
              <div style={cardStyle}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '1.25rem' }}>② Client & Invoice Metadata</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label="Client / Company Name" value={clientName} onChange={setClientName} placeholder="Acme Corporation Ltd." />
                    <Field label="Client Email" value={clientEmail} onChange={setClientEmail} placeholder="billing@client.com" type="email" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label="Client Phone" value={clientPhone} onChange={setClientPhone} placeholder="+91 98765 43210" />
                    <Field label="Payment Terms" value={paymentTerms} onChange={setPaymentTerms} placeholder="Net 30" />
                  </div>
                  <Field label="Client Billing Address" value={clientAddress} onChange={setClientAddress} placeholder="123 Main Street, Mumbai 400001" rows={2} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <Field label="Invoice Number" value={invoiceNumber} onChange={setInvoiceNumber} placeholder="INV-2026-001" />
                    <Field label="Issue Date" value={issueDate} onChange={setIssueDate} type="date" />
                    <Field label="Due Date" value={dueDate} onChange={setDueDate} type="date" />
                  </div>
                </div>
              </div>

              {/* ③ My Info */}
              <div style={cardStyle}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '1.25rem' }}>③ Your Information</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label="Your Name / Business" value={myName} onChange={setMyName} placeholder="Your Business Name" />
                    <Field label="GST / PAN Number (optional)" value={gstNumber} onChange={setGstNumber} placeholder="22AAAAA0000A1Z5" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label="Your Email" value={myEmail} onChange={setMyEmail} placeholder="you@business.com" type="email" />
                    <Field label="Your Phone" value={myPhone} onChange={setMyPhone} placeholder="+91 98765 43210" />
                  </div>
                  <Field label="Your Address" value={myAddress} onChange={setMyAddress} placeholder="Your business address" rows={2} />
                </div>
              </div>

              {/* ④ Line Items */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--charcoal)', margin: 0 }}>④ Itemized Services & Products</h2>
                    <p style={{ fontSize: '0.78rem', color: 'var(--charcoal-soft)', marginTop: '3px' }}>Add the work done or products sold.</p>
                  </div>
                  <button onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '9px', border: '1.5px solid rgba(138,124,192,0.4)', background: 'rgba(138,124,192,0.12)', color: '#6E5CB6', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>
                    <Plus size={13} /> Add Line Item
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 95px 82px 36px', gap: '8px', padding: '0 4px', marginBottom: '6px' }}>
                  {['Description', 'Qty', 'Rate (₹)', 'Amount', ''].map(h => (
                    <span key={h} style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--charcoal-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</span>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {items.map(item => (
                    <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 95px 82px 36px', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.6)', borderRadius: '12px', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.8)' }}>
                      <input style={{ ...inputStyle, padding: '8px 10px' }} placeholder="Service / product description" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} />
                      <input style={{ ...inputStyle, padding: '8px 10px', textAlign: 'center' }} type="number" min="1" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} />
                      <input style={{ ...inputStyle, padding: '8px 10px', textAlign: 'right' }} type="number" min="0" step="0.01" value={item.rate} onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--charcoal)', textAlign: 'right', paddingRight: '4px' }}>{fmt(item.amount)}</span>
                      <button onClick={() => removeItem(item.id)} style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: 'rgba(186,26,26,0.08)', color: '#ba1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.875rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ width: '190px' }}>
                    <label style={labelStyle}>GST / Tax Rate</label>
                    <select value={taxRate} onChange={e => setTaxRate(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="0">No Tax (0%)</option>
                      <option value="5">GST 5%</option>
                      <option value="12">GST 12%</option>
                      <option value="18">GST 18%</option>
                      <option value="28">GST 28%</option>
                    </select>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--charcoal-soft)' }}>Subtotal: <strong style={{ color: 'var(--charcoal)' }}>{fmt(subtotal)}</strong></div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--charcoal-soft)' }}>Tax ({taxRate}%): <strong style={{ color: 'var(--charcoal)' }}>{fmt(taxAmt)}</strong></div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6E5CB6', marginTop: '4px' }}>Total: {fmt(total)}</div>
                  </div>
                </div>
              </div>

              {/* ⑤ Notes & Bank */}
              <div style={cardStyle}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '1.25rem' }}>⑤ Notes & Payment Details</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Field label="Bank / UPI Payment Details" value={bankDetails} onChange={setBankDetails} rows={3} placeholder={'Bank: HDFC Bank\nAccount: 1234567890\nIFSC: HDFC0001234\nUPI: yourname@upi'} />
                  <Field label="Additional Notes / Thank You Message" value={notes} onChange={setNotes} rows={2} placeholder="Thank you for your business! Payment is due within 30 days." />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.06)', flexWrap: 'wrap' }}>
                  <button onClick={handleSaveDraft} style={{ flex: '1 1 160px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '12px 18px', borderRadius: '12px', border: '1.5px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.85)', color: 'var(--charcoal)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                    <Save size={16} /> Save Draft & Preview
                  </button>
                  <button onClick={() => handleFinalize(false)} style={{ flex: '1 1 160px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '12px 18px', borderRadius: '12px', border: '1.5px solid #6E5CB6', background: 'rgba(110,92,182,0.08)', color: '#6E5CB6', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
                    <Eye size={16} /> Save & Preview
                  </button>
                  <button onClick={() => handleFinalize(true)} style={{ flex: '2 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '12px 20px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6E5CB6, #9B8FD4)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(110,92,182,0.3)' }}>
                    <Download size={16} /> {editId ? 'Update & Download PDF' : 'Save & Download PDF'}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: Sticky Live Preview */}
            <div style={{ position: 'sticky', top: '88px' }}>
              <div style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(255,255,255,0.75)', borderRadius: '16px', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', boxShadow: '0 4px 24px rgba(138,124,192,0.14)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.6)', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--charcoal)' }}>
                    <Eye size={15} style={{ color: '#8A7CC0' }} />
                    Live Layout Architecture
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                      value={selectedTemplateId}
                      onChange={e => {
                        const newId = e.target.value
                        setSelectedTemplateId(newId)
                        setTemplateChoice(newId)
                      }}
                      style={{
                        padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)',
                        fontSize: '0.72rem', fontWeight: 600, color: 'var(--charcoal)',
                        background: '#fff', cursor: 'pointer'
                      }}
                      title="Switch template architecture"
                    >
                      {TEMPLATES.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => navigate('/templates')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)',
                        background: 'rgba(255,255,255,0.9)', fontSize: '0.7rem', fontWeight: 600,
                        color: 'var(--charcoal-mid)', cursor: 'pointer',
                      }}
                      title="Browse full template gallery"
                    >
                      <LayoutTemplate size={12} /> Gallery
                    </button>
                  </div>
                </div>
                <div style={{ padding: '0.75rem', maxHeight: '720px', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
                  <DocumentRenderer
                    doc={buildDoc('draft')}
                    templateId={selectedTemplateId}
                    containerId="invoice-live-preview"
                    scale={0.8}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: '0.72rem', color: 'var(--charcoal-soft)', background: 'rgba(255,255,255,0.4)' }}>
                  <span>Layout: <strong>{currentTemplate?.name}</strong></span>
                  <button
                    onClick={() => loadTemplateSampleData(selectedTemplateId)}
                    style={{ background: 'none', border: 'none', color: '#6E5CB6', fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Sparkles size={11} /> Load Sample Data
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}

export default CreateInvoicePage
