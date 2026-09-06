import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Save, Download,
  Plus, Trash2, Eye, Receipt, LayoutTemplate, Sparkles,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import DocumentRenderer from '../components/DocumentRenderer'
import { useDocuments, generateDocId } from '../hooks/useDocuments'
import type { LineItem, BillEaseDocument } from '../types/document'
import { TEMPLATES, getTemplateChoice, getTemplateById, setTemplateChoice } from '../data/templates'

// ─── helpers ────────────────────────────────────────────────
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

// ─── step config ────────────────────────────────────────────
const STEPS = ['Details', 'Customer', 'My Info', 'Items', 'Payment', 'Preview']

// ─── reusable input style ───────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1.5px solid rgba(0,0,0,0.09)',
  background: 'rgba(255,255,255,0.75)',
  fontSize: '0.875rem',
  color: 'var(--charcoal)',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
  fontFamily: 'Inter, sans-serif',
}
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.72rem',
  fontWeight: 600,
  color: 'var(--charcoal-mid)',
  marginBottom: '5px',
  letterSpacing: '0.3px',
}

// ─── Field component ─────────────────────────────────────────
const Field = ({
  label, value, onChange, type = 'text', placeholder = '', rows,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; rows?: number;
}) => (
  <div>
    <label style={labelStyle}>{label}</label>
    {rows ? (
      <textarea
        rows={rows} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, resize: 'vertical' }}
      />
    ) : (
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={inputStyle}
      />
    )}
  </div>
)

// ─── Main component ──────────────────────────────────────────
const CreateBillPage = () => {
  const navigate  = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const templateParam = searchParams.get('template')
  const { documents, saveDocument } = useDocuments()
  const [step, setStep]  = useState(0)

  // Active template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    if (templateParam) return templateParam
    const stored = getTemplateChoice()
    return stored || 'tpl-receipt'
  })

  const currentTemplate = getTemplateById(selectedTemplateId)

  // Step 1 – Details
  const [billNumber, setBillNumber] = useState(() => editId || generateDocId('bill'))
  const [reference,  setReference]  = useState('')
  const [issueDate,  setIssueDate]  = useState(today)
  const [dueDate,    setDueDate]    = useState(due30)

  // Step 2 – Customer
  const [clientName,    setClientName]    = useState('')
  const [clientEmail,   setClientEmail]   = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [clientPhone,   setClientPhone]   = useState('')

  // Step 3 – My Info
  const [myName,    setMyName]    = useState('')
  const [myEmail,   setMyEmail]   = useState('')
  const [myAddress, setMyAddress] = useState('')
  const [myPhone,   setMyPhone]   = useState('')

  // Step 4 – Items
  const [items, setItems] = useState<LineItem[]>([newItem()])

  // Load sample items for this layout
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

  // Load existing document if in edit mode or prefill from template
  useEffect(() => {
    if (editId && documents.length > 0) {
      const doc = documents.find(d => d.id === editId)
      if (doc) {
        setBillNumber(doc.id)
        if (doc.templateId) setSelectedTemplateId(doc.templateId)
        if (doc.invoiceNumber) setReference(doc.invoiceNumber)
        if (doc.date) setIssueDate(doc.date)
        if (doc.dueDate) setDueDate(doc.dueDate)
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
        if (doc.items && doc.items.length > 0) setItems(doc.items)
        if (doc.taxRate !== undefined) setTaxRate(String(doc.taxRate))
        if (doc.notes) setNotes(doc.notes)
      }
    } else if (templateParam && items.length === 1 && !items[0].description) {
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

  // Step 5 – Payment
  const [taxRate,   setTaxRate]   = useState('0')
  const [notes,     setNotes]     = useState('')

  // Totals
  const subtotal  = items.reduce((s, i) => s + i.amount, 0)
  const taxAmt    = subtotal * (parseFloat(taxRate) || 0) / 100
  const total     = subtotal + taxAmt

  // ── Save to localStorage ──────────────────────────────────
  const buildDoc = (status: 'draft' | 'paid'): BillEaseDocument => ({
    id: billNumber,
    type: 'bill',
    status,
    createdAt:  new Date().toISOString(),
    updatedAt:  new Date().toISOString(),
    date:       issueDate,
    dueDate,
    billTo: { name: clientName, email: clientEmail, address: clientAddress, phone: clientPhone },
    billFrom: { name: myName, email: myEmail, address: myAddress, phone: myPhone },
    items,
    subtotal,
    taxRate:    parseFloat(taxRate) || 0,
    taxAmount:  taxAmt,
    total,
    invoiceNumber: reference,
    notes,
    templateId: selectedTemplateId,
  })

  const handleSaveDraft = () => {
    const doc = buildDoc('draft')
    saveDocument(doc)
    navigate(`/preview?id=${encodeURIComponent(doc.id)}&saved=1&status=draft`)
  }

  const handleGenerate = (downloadImmediately = false) => {
    const doc = buildDoc('paid')
    saveDocument(doc)
    // Seamless workflow: redirect straight to PDF Downloader & Ready preview
    navigate(`/preview?id=${encodeURIComponent(doc.id)}&saved=1&ready=1${downloadImmediately ? '&action=print' : ''}`)
  }

  // ── Step panels ──────────────────────────────────────────
  const stepPanels = [
    // 0 – Details
    <div key="details" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '4px' }}>Bill Details</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-soft)' }}>Set the bill number, reference, and dates.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field label="Bill Number" value={billNumber} onChange={setBillNumber} placeholder="BIL-2026-001" />
        <Field label="Reference / PO (optional)" value={reference} onChange={setReference} placeholder="PO-12345" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field label="Issue Date" value={issueDate} onChange={setIssueDate} type="date" />
        <Field label="Due Date"   value={dueDate}   onChange={setDueDate}   type="date" />
      </div>
    </div>,

    // 1 – Customer
    <div key="customer" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '4px' }}>Customer Information</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-soft)' }}>Who is this bill for?</p>
      </div>
      <Field label="Client / Company Name" value={clientName}    onChange={setClientName}    placeholder="Acme Inc." />
      <Field label="Email"                 value={clientEmail}   onChange={setClientEmail}   placeholder="billing@acme.com" />
      <Field label="Phone"                 value={clientPhone}   onChange={setClientPhone}   placeholder="+91 98765 43210" />
      <Field label="Billing Address"       value={clientAddress} onChange={setClientAddress} placeholder="123 Main Street, Mumbai 400001" rows={3} />
    </div>,

    // 2 – My Info
    <div key="myinfo" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '4px' }}>Your Information</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-soft)' }}>Your details appear on the bill as the sender.</p>
      </div>
      <Field label="Your Name / Business" value={myName}    onChange={setMyName}    placeholder="Your Business Name" />
      <Field label="Email"                value={myEmail}   onChange={setMyEmail}   placeholder="you@business.com" />
      <Field label="Phone"                value={myPhone}   onChange={setMyPhone}   placeholder="+91 98765 43210" />
      <Field label="Your Address"         value={myAddress} onChange={setMyAddress} placeholder="Your address" rows={3} />
    </div>,

    // 3 – Items
    <div key="items" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '4px' }}>Line Items</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-soft)' }}>Products or services rendered.</p>
        </div>
        <button onClick={addItem} style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '7px 14px', borderRadius: '9px', border: '1.5px solid rgba(168,213,194,0.5)',
          background: 'rgba(168,213,194,0.2)', color: '#4E8F75',
          fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
        }}>
          <Plus size={13} /> Add Row
        </button>
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 90px 80px 36px', gap: '8px', padding: '0 4px' }}>
        {['Description', 'Qty', 'Rate (₹)', 'Amount', ''].map(h => (
          <span key={h} style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--charcoal-soft)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</span>
        ))}
      </div>

      {items.map(item => (
        <div key={item.id} style={{
          display: 'grid', gridTemplateColumns: '1fr 70px 90px 80px 36px',
          gap: '8px', alignItems: 'center',
          background: 'rgba(255,255,255,0.55)', borderRadius: '12px',
          padding: '10px 12px', border: '1px solid rgba(255,255,255,0.7)',
        }}>
          <input
            style={{ ...inputStyle, padding: '8px 10px' }}
            placeholder="Service description"
            value={item.description}
            onChange={e => updateItem(item.id, 'description', e.target.value)}
          />
          <input
            style={{ ...inputStyle, padding: '8px 10px', textAlign: 'center' }}
            type="number" min="1" value={item.quantity}
            onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
          />
          <input
            style={{ ...inputStyle, padding: '8px 10px', textAlign: 'right' }}
            type="number" min="0" value={item.rate}
            onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
          />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--charcoal)', textAlign: 'right', paddingRight: '4px' }}>
            {fmt(item.amount)}
          </span>
          <button onClick={() => removeItem(item.id)} style={{
            width: '30px', height: '30px', borderRadius: '8px', border: 'none',
            background: 'rgba(186,26,26,0.08)', color: '#ba1a1a',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <Trash2 size={13} />
          </button>
        </div>
      ))}

      {/* Subtotal */}
      <div style={{ textAlign: 'right', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--charcoal-soft)', marginRight: '12px' }}>Subtotal</span>
        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--charcoal)' }}>{fmt(subtotal)}</span>
      </div>
    </div>,

    // 4 – Payment
    <div key="payment" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--charcoal)', marginBottom: '4px' }}>Payment & Tax</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-soft)' }}>Set tax rate and payment instructions.</p>
      </div>
      <Field label="Tax Rate (%)" value={taxRate} onChange={setTaxRate} type="number" placeholder="18" />
      <Field label="Payment Instructions / Notes" value={notes} onChange={setNotes} rows={4}
        placeholder="Bank name, account number, UPI ID, payment terms..." />
      <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '14px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[
          { label: 'Bill Number', value: billNumber },
          { label: 'Client',      value: clientName || '—' },
          { label: 'Total Items', value: String(items.length) },
          { label: 'Total Amount', value: fmt(total) },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--charcoal-soft)' }}>{label}</span>
            <span style={{ fontWeight: 600, color: 'var(--charcoal)' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>,
  ]

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', paddingTop: '68px', paddingBottom: '4rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' }}>

          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7BBFA5', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
                <Receipt size={12} /> Bill Builder
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--charcoal)', margin: 0 }}>
                {editId ? `Edit Bill: ${billNumber}` : 'Create New Bill'}
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={handleSaveDraft} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 18px', borderRadius: '12px', border: '1.5px solid rgba(0,0,0,0.1)',
                background: 'rgba(255,255,255,0.7)', color: 'var(--charcoal)',
                fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
              }}>
                <Save size={15} /> Save Draft & Preview
              </button>
              <button onClick={() => handleGenerate(true)} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 18px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #5B9E86, #7BBFA5)',
                color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(91,158,134,0.35)',
              }}>
                <Download size={15} /> {editId ? 'Update & Download PDF' : 'Save & Download PDF'}
              </button>
            </div>
          </div>

          {/* Step bar */}
          <div style={{
            display: 'flex', gap: '6px', marginBottom: '2rem',
            background: 'rgba(255,255,255,0.5)', borderRadius: '14px',
            padding: '6px', border: '1.5px solid rgba(255,255,255,0.7)',
            overflowX: 'auto',
          }}>
            {STEPS.map((label, i) => (
              <button key={label} onClick={() => setStep(i)} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px', border: 'none',
                background: i === step ? 'rgba(255,255,255,0.95)' : 'transparent',
                color: i === step ? 'var(--charcoal)' : i < step ? '#5B9E86' : 'var(--charcoal-soft)',
                fontWeight: i === step ? 700 : 500, fontSize: '0.825rem',
                cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                boxShadow: i === step ? '0 2px 8px rgba(0,0,0,0.07)' : 'none',
              }}>
                <span style={{
                  width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700,
                  background: i === step ? '#7BBFA5' : i < step ? 'rgba(91,158,134,0.2)' : 'rgba(0,0,0,0.07)',
                  color: i === step ? '#fff' : i < step ? '#5B9E86' : 'var(--charcoal-soft)',
                }}>
                  {i < step ? '✓' : i + 1}
                </span>
                {label}
              </button>
            ))}
          </div>

          {/* Two-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

            {/* Left – Form panel */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              {stepPanels[step]}

              {/* Navigation buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <button
                  onClick={() => setStep(s => Math.max(0, s - 1))}
                  disabled={step === 0}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '10px 18px', borderRadius: '10px',
                    border: '1.5px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.7)',
                    color: step === 0 ? '#ccc' : 'var(--charcoal)',
                    fontWeight: 600, fontSize: '0.875rem',
                    cursor: step === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ArrowLeft size={15} /> Previous
                </button>
                {step < STEPS.length - 1 ? (
                  <button
                    onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '10px 20px', borderRadius: '10px', border: 'none',
                      background: 'var(--charcoal)', color: '#fff',
                      fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                    }}
                  >
                    Next Step <ArrowRight size={15} />
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <button onClick={handleSaveDraft} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '10px 16px', borderRadius: '10px',
                      border: '1.5px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.85)',
                      color: 'var(--charcoal)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                    }}>
                      <Save size={15} /> Save Draft & Preview
                    </button>
                    <button onClick={() => handleGenerate(false)} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '10px 16px', borderRadius: '10px',
                      border: '1.5px solid #5B9E86', background: 'rgba(91,158,134,0.1)',
                      color: '#5B9E86', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                    }}>
                      <Eye size={15} /> Save & Preview
                    </button>
                    <button onClick={() => handleGenerate(true)} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '10px 18px', borderRadius: '10px', border: 'none',
                      background: 'linear-gradient(135deg, #5B9E86, #7BBFA5)', color: '#fff',
                      fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(91,158,134,0.35)',
                    }}>
                      <Download size={15} /> {editId ? 'Update & Download PDF' : 'Save & Download PDF'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right – Live A4 preview */}
            <div style={{ position: 'sticky', top: '88px' }}>
              <div style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(255,255,255,0.75)', borderRadius: '16px', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', boxShadow: '0 4px 24px rgba(91,158,134,0.14)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.6)', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--charcoal)', fontSize: '0.85rem', fontWeight: 700 }}>
                    <Eye size={15} style={{ color: '#5B9E86' }} /> Live Layout Architecture
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
                    containerId="bill-live-preview"
                    scale={0.8}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: '0.72rem', color: 'var(--charcoal-soft)', background: 'rgba(255,255,255,0.4)' }}>
                  <span>Layout: <strong>{currentTemplate?.name}</strong></span>
                  <button
                    onClick={() => loadTemplateSampleData(selectedTemplateId)}
                    style={{ background: 'none', border: 'none', color: '#5B9E86', fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
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

export default CreateBillPage
