import React from 'react'
import type { BillEaseDocument } from '../types/document'
import { getTemplateById, TEMPLATES } from '../data/templates'
import type { TemplateStyle } from '../data/templates'

// ── Currency Formatter ───────────────────────────────────────
const fmt = (n: number) =>
  '₹' + (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// ── Indian Number to Words Helper ────────────────────────────
function numToWords(n: number): string {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const num = Math.floor(Math.max(0, n))
  if (num === 0) return 'Zero Rupees Only'

  function convert(num: number): string {
    if (num < 20) return a[num]
    if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + a[num % 10] : '')
    if (num < 1000) return a[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + convert(num % 100) : '')
    if (num < 100000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convert(num % 1000) : '')
    if (num < 10000000) return convert(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + convert(num % 100000) : '')
    return convert(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + convert(num % 10000000) : '')
  }
  return convert(num) + ' Rupees Only'
}

export interface DocumentRendererProps {
  doc: Partial<BillEaseDocument> & {
    items?: { id?: string; description: string; quantity: number; rate: number; amount: number }[]
  }
  templateId?: string
  scale?: number
  containerId?: string
}

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({
  doc,
  templateId,
  scale = 1,
  containerId = 'printable-a4-doc',
}) => {
  const chosenTplId = templateId || doc.templateId || 'classic-pro'
  const tpl: TemplateStyle = getTemplateById(chosenTplId) || TEMPLATES[0]
  const layout = tpl.layoutType || 'classic'

  // Document metadata fallbacks
  const docNumber = doc.invoiceNumber || doc.id || 'INV-2026-001'
  const dateStr = doc.date || new Date().toISOString().slice(0, 10)
  const dueDateStr = doc.dueDate || 'Upon Receipt'
  const myName = doc.billFrom?.name?.trim() || tpl.logoText || 'Apex Corporate Ltd.'
  const myEmail = doc.billFrom?.email?.trim() || 'billing@apexcorp.com'
  const myPhone = doc.billFrom?.phone?.trim() || '+91 98765 43210'
  const myAddress = doc.billFrom?.address?.trim() || '101 Cyber Towers, BKC, Mumbai 400051'
  const clientName = doc.billTo?.name?.trim() || tpl.sampleClient || 'Stellar Innovations Pvt. Ltd.'
  const clientEmail = doc.billTo?.email?.trim() || 'accounts@stellarinnovations.com'
  const clientPhone = doc.billTo?.phone?.trim() || '+91 98111 22334'
  const clientAddress = doc.billTo?.address?.trim() || '45 Innovation Way, Tech Corridor, Bangalore 560100'

  // Intelligent item fallback: if user has typed no real item description or rate, render realistic sample items
  const hasUserItems = Boolean(
    doc.items &&
    doc.items.length > 0 &&
    doc.items.some(i => (i.description && i.description.trim().length > 0) || Number(i.rate) > 0)
  )

  const items = hasUserItems
    ? doc.items!.map((it, idx) => ({
        id: it.id || String(idx),
        description: it.description?.trim() || (tpl.sampleItems[idx]?.desc || `Item / Service ${idx + 1}`),
        quantity: Number(it.quantity) || 1,
        rate: Number(it.rate) || 0,
        amount: Number(it.amount) > 0 ? Number(it.amount) : (Number(it.quantity) || 1) * (Number(it.rate) || 0),
      }))
    : tpl.sampleItems.map((s, idx) => ({
        id: String(idx),
        description: s.desc,
        quantity: s.qty,
        rate: s.rate,
        amount: s.qty * s.rate,
      }))

  const subtotal = doc.subtotal !== undefined && doc.subtotal > 0
    ? doc.subtotal
    : items.reduce((s, i) => s + i.amount, 0)
  const taxRate = doc.taxRate !== undefined ? doc.taxRate : 18
  const taxAmount = doc.taxAmount !== undefined && doc.taxAmount > 0
    ? doc.taxAmount
    : (subtotal * taxRate) / 100
  const total = doc.total !== undefined && doc.total > 0
    ? doc.total
    : (subtotal + taxAmount)
  const notes = doc.notes?.trim() || 'Thank you for your business! Please settle payments within the specified due date.'
  const bankDetails = doc.bankDetails?.trim() || 'Bank: HDFC Bank · A/C: 50200012345678 · IFSC: HDFC0000123 · UPI: billing@upi'

  // Base sheet style for crisp, standard A4 proportions
  const sheetStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: layout === 'receipt' ? '480px' : '820px',
    margin: '0 auto',
    background: '#FFFFFF',
    boxSizing: 'border-box',
    fontFamily: layout === 'editorial' ? `'Playfair Display', Georgia, serif` : `'Inter', -apple-system, sans-serif`,
    color: '#1F2937',
    position: 'relative',
  }

  // ════════════════════════════════════════════════════════════
  // RENDER ENGINE BY LAYOUT
  // ════════════════════════════════════════════════════════════
  const renderLayoutContent = () => {
    // ──────────────────────────────────────────────────────────
    // 1. LAYOUT: GST TAX INVOICE (Official Indian Standard)
    // ──────────────────────────────────────────────────────────
    if (layout === 'gst') {
      const cgstAmt = taxAmount / 2
      const sgstAmt = taxAmount / 2

      return (
        <div id={containerId} style={{ ...sheetStyle, padding: '2rem', border: '1.5px solid #374151', borderRadius: '4px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#4B5563' }}>
              Tax Invoice under section 31 of CGST Act & Rule 46 of CGST Rules, 2017
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#111827', letterSpacing: '0.5px', marginTop: '3px' }}>
              {tpl.docLabel || 'TAX INVOICE'}
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: tpl.accentColor, marginTop: '2px' }}>
              (Original for Recipient / Tax Compliant Document)
            </div>
          </div>

          {/* Supplier & Invoice Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid #9CA3AF', marginBottom: '1rem' }}>
            <div style={{ padding: '0.85rem 1rem', borderRight: '1px solid #9CA3AF', background: '#F9FAFB' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px' }}>Details of Supplier / Seller:</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#111827' }}>{myName}</div>
              <div style={{ fontSize: '0.75rem', color: '#4B5563', whiteSpace: 'pre-line', marginTop: '2px', lineHeight: 1.4 }}>{myAddress}</div>
              <div style={{ fontSize: '0.75rem', color: '#374151', marginTop: '4px' }}><strong>Email:</strong> {myEmail} | <strong>Phone:</strong> {myPhone}</div>
              <div style={{ fontSize: '0.75rem', color: '#111827', marginTop: '6px', padding: '4px 8px', background: '#EEF2FF', display: 'inline-block', borderRadius: '4px' }}>
                <strong>GSTIN:</strong> 27AAAAA0000A1Z5 | <strong>State:</strong> 27 - Maharashtra
              </div>
            </div>
            <div style={{ padding: '0.85rem 1rem', fontSize: '0.76rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '3px' }}>
                <span style={{ color: '#6B7280', fontWeight: 600 }}>Invoice No:</span>
                <span style={{ fontWeight: 800, color: '#111827' }}>{docNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '3px' }}>
                <span style={{ color: '#6B7280', fontWeight: 600 }}>Invoice Date:</span>
                <span style={{ fontWeight: 700 }}>{dateStr}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '3px' }}>
                <span style={{ color: '#6B7280', fontWeight: 600 }}>Due Date:</span>
                <span style={{ fontWeight: 700 }}>{dueDateStr}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '3px' }}>
                <span style={{ color: '#6B7280', fontWeight: 600 }}>Place of Supply:</span>
                <span style={{ fontWeight: 700 }}>27 - Maharashtra</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280', fontWeight: 600 }}>Reverse Charge:</span>
                <span style={{ fontWeight: 700 }}>NO</span>
              </div>
            </div>
          </div>

          {/* Billed To (Receiver) */}
          <div style={{ border: '1px solid #9CA3AF', padding: '0.85rem 1rem', marginBottom: '1rem', background: '#F9FAFB' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
              Details of Receiver / Billed to (Client):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#111827' }}>{clientName}</div>
                <div style={{ fontSize: '0.75rem', color: '#4B5563', whiteSpace: 'pre-line', marginTop: '2px', lineHeight: 1.4 }}>{clientAddress}</div>
                <div style={{ fontSize: '0.75rem', color: '#4B5563', marginTop: '2px' }}>{clientEmail} {clientPhone ? `· ${clientPhone}` : ''}</div>
              </div>
              <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Buyer GSTIN:</span>
                  <span style={{ fontWeight: 700 }}>27BBBBB9999B1Z2</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>State Code:</span>
                  <span style={{ fontWeight: 700 }}>27 (Maharashtra)</span>
                </div>
              </div>
            </div>
          </div>

          {/* GST Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #9CA3AF', marginBottom: '1rem' }}>
            <thead>
              <tr style={{ background: tpl.headerBg, color: tpl.headerText, fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 6px', border: '1px solid #9CA3AF', width: '36px', textAlign: 'center' }}>Sr.</th>
                <th style={{ padding: '8px 10px', border: '1px solid #9CA3AF', textAlign: 'left' }}>Description of Goods / Services</th>
                <th style={{ padding: '8px 6px', border: '1px solid #9CA3AF', width: '80px', textAlign: 'center' }}>HSN/SAC</th>
                <th style={{ padding: '8px 6px', border: '1px solid #9CA3AF', width: '50px', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '8px 8px', border: '1px solid #9CA3AF', width: '90px', textAlign: 'right' }}>Rate</th>
                <th style={{ padding: '8px 8px', border: '1px solid #9CA3AF', width: '95px', textAlign: 'right' }}>Taxable Val</th>
                <th style={{ padding: '8px 8px', border: '1px solid #9CA3AF', width: '100px', textAlign: 'right' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} style={{ fontSize: '0.76rem', background: idx % 2 === 1 ? '#F9FAFB' : '#FFFFFF' }}>
                  <td style={{ padding: '7px 6px', border: '1px solid #9CA3AF', textAlign: 'center', color: '#6B7280' }}>{idx + 1}</td>
                  <td style={{ padding: '7px 10px', border: '1px solid #9CA3AF', fontWeight: 600 }}>{item.description}</td>
                  <td style={{ padding: '7px 6px', border: '1px solid #9CA3AF', textAlign: 'center', color: '#6B7280' }}>998314</td>
                  <td style={{ padding: '7px 6px', border: '1px solid #9CA3AF', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '7px 8px', border: '1px solid #9CA3AF', textAlign: 'right' }}>{fmt(item.rate)}</td>
                  <td style={{ padding: '7px 8px', border: '1px solid #9CA3AF', textAlign: 'right' }}>{fmt(item.amount)}</td>
                  <td style={{ padding: '7px 8px', border: '1px solid #9CA3AF', textAlign: 'right', fontWeight: 700 }}>{fmt(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tax Breakdown Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', border: '1px solid #9CA3AF', marginBottom: '1rem' }}>
            <div style={{ padding: '0.85rem 1rem', borderRight: '1px solid #9CA3AF', fontSize: '0.74rem' }}>
              <div style={{ fontWeight: 800, color: '#111827', textTransform: 'uppercase', marginBottom: '4px' }}>Amount in Words:</div>
              <div style={{ fontStyle: 'italic', color: '#1F2937', background: '#F3F4F6', padding: '6px 10px', borderRadius: '4px', lineHeight: 1.4 }}>
                {numToWords(total)}
              </div>
              <div style={{ marginTop: '8px', color: '#4B5563' }}>
                <strong style={{ color: '#111827' }}>Bank Details:</strong> {bankDetails}
              </div>
            </div>
            <div style={{ padding: '0.85rem 1rem', fontSize: '0.76rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4B5563' }}>Total Taxable Value:</span><span style={{ fontWeight: 700 }}>{fmt(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                <span>CGST ({taxRate / 2}%):</span><span>{fmt(cgstAmt)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                <span>SGST ({taxRate / 2}%):</span><span>{fmt(sgstAmt)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #111827', paddingTop: '6px', marginTop: '4px', fontSize: '1.05rem', fontWeight: 900, color: tpl.accentColor }}>
                <span>Invoice Total:</span><span>{fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* Declaration & Signatory */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', border: '1px solid #9CA3AF', padding: '0.85rem 1rem', alignItems: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#6B7280', paddingRight: '1rem', lineHeight: 1.4 }}>
              <strong>Declaration:</strong> We declare that this invoice shows the actual price of the goods or services described and that all particulars are true and correct.
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
              <div style={{ fontWeight: 700 }}>For {myName}</div>
              <div style={{ height: '36px' }} />
              <div style={{ borderTop: '1px solid #9CA3AF', display: 'inline-block', paddingTop: '4px', minWidth: '160px', textAlign: 'center', fontWeight: 600 }}>
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      )
    }

    // ──────────────────────────────────────────────────────────
    // 2. LAYOUT: CREATIVE SIDEBAR (Left 260px banner)
    // ──────────────────────────────────────────────────────────
    if (layout === 'sidebar') {
      return (
        <div id={containerId} style={{ ...sheetStyle, display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '820px', boxShadow: '0 4px 30px rgba(0,0,0,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
          {/* Left Column Accent Sidebar */}
          <div style={{ background: tpl.headerBg, color: tpl.headerText, padding: '2.5rem 1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px' }}>{myName}</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '2px' }}>Creative Studio Deliverables</div>

              <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1.25rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>Document</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, marginTop: '2px' }}>{docNumber}</div>
                <div style={{ fontSize: '0.75rem', marginTop: '6px', opacity: 0.85 }}><strong>Date:</strong> {dateStr}</div>
                <div style={{ fontSize: '0.75rem', marginTop: '2px', opacity: 0.85 }}><strong>Due:</strong> {dueDateStr}</div>
              </div>

              <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1.25rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>From Details</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '4px', lineHeight: 1.5 }}>
                  {myEmail}<br />{myPhone}<br />{myAddress}
                </div>
              </div>

              <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1.25rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>Payment Route</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '4px', whiteSpace: 'pre-line', lineHeight: 1.4 }}>{bankDetails}</div>
              </div>
            </div>

            <div style={{ fontSize: '0.68rem', opacity: 0.65, borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem' }}>
              BillEase Creative Suite · billease.app
            </div>
          </div>

          {/* Right Main Content Area */}
          <div style={{ padding: '2.5rem 2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#FFFFFF' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `2px solid ${tpl.borderColor}`, paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px' }}>Invoiced Client:</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#111827', marginTop: '3px' }}>{clientName}</div>
                  <div style={{ fontSize: '0.76rem', color: '#6B7280', marginTop: '2px' }}>{clientEmail} · {clientPhone}</div>
                  <div style={{ fontSize: '0.76rem', color: '#6B7280', whiteSpace: 'pre-line' }}>{clientAddress}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: tpl.accentColor, letterSpacing: '1px' }}>{tpl.docLabel}</div>
                  <div style={{ fontSize: '0.76rem', color: '#6B7280', marginTop: '2px' }}>Project Fee Schedule</div>
                </div>
              </div>

              {/* Clean Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${tpl.accentColor}`, color: tpl.accentColor, fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    <th style={{ textAlign: 'left', padding: '8px 4px' }}>Project Phase / Deliverable</th>
                    <th style={{ textAlign: 'center', padding: '8px 4px', width: '50px' }}>Units</th>
                    <th style={{ textAlign: 'right', padding: '8px 4px', width: '90px' }}>Rate</th>
                    <th style={{ textAlign: 'right', padding: '8px 4px', width: '100px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6', fontSize: '0.8rem' }}>
                      <td style={{ padding: '10px 4px', color: '#1F2937', fontWeight: 600 }}>{it.description}</td>
                      <td style={{ padding: '10px 4px', textAlign: 'center', color: '#6B7280' }}>{it.quantity}</td>
                      <td style={{ padding: '10px 4px', textAlign: 'right', color: '#6B7280' }}>{fmt(it.rate)}</td>
                      <td style={{ padding: '10px 4px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>{fmt(it.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              {/* Totals Block */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <div style={{ width: '250px', background: '#F9FAFB', padding: '1rem', borderRadius: '10px', border: `1px solid ${tpl.borderColor}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#6B7280', marginBottom: '4px' }}>
                    <span>Subtotal</span><span style={{ fontWeight: 600, color: '#111827' }}>{fmt(subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#6B7280', marginBottom: '6px' }}>
                    <span>Tax ({taxRate}%)</span><span style={{ fontWeight: 600, color: '#111827' }}>{fmt(taxAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 900, color: tpl.accentColor, paddingTop: '8px', borderTop: '2px solid #E5E7EB' }}>
                    <span>Total Due</span><span>{fmt(total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ maxWidth: '400px' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase' }}>Creative Notes</div>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#6B7280', lineHeight: 1.4 }}>{notes}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: tpl.accentColor }}>★ Approved Creative Work</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // ──────────────────────────────────────────────────────────
    // 3. LAYOUT: RETAIL STORE & POS MEMO (Thermal receipt format)
    // ──────────────────────────────────────────────────────────
    if (layout === 'receipt') {
      const totalQty = items.reduce((s, i) => s + (Number(i.quantity) || 1), 0)

      return (
        <div id={containerId} style={{ ...sheetStyle, padding: '2rem', border: '1px solid #E5E7EB', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {/* Centered Store Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: tpl.accentColor, letterSpacing: '-0.5px' }}>{myName}</div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>{myAddress}</div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>Tel: {myPhone} · GSTIN: 27AABCT1234F1Z5</div>
            <div style={{ margin: '8px auto', display: 'inline-block', padding: '3px 14px', background: tpl.accentColor, color: '#fff', fontSize: '0.7rem', fontWeight: 800, borderRadius: '12px' }}>
              {tpl.docLabel}
            </div>
          </div>

          {/* Receipt Meta */}
          <div style={{ borderTop: '2px dashed #9CA3AF', borderBottom: '2px dashed #9CA3AF', padding: '0.65rem 0', margin: '0.75rem 0', fontSize: '0.76rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>Receipt #:</strong> {docNumber}</span>
              <span><strong>Date:</strong> {dateStr}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span><strong>Customer:</strong> {clientName}</span>
              <span><strong>Cashier:</strong> POS-Terminal #04</span>
            </div>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', margin: '1rem 0' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #111827', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>
                <th style={{ textAlign: 'left', padding: '6px 2px' }}>Item Description</th>
                <th style={{ textAlign: 'center', padding: '6px 2px', width: '50px' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '6px 2px', width: '75px' }}>Rate</th>
                <th style={{ textAlign: 'right', padding: '6px 2px', width: '85px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} style={{ borderBottom: '1px dashed #E5E7EB', fontSize: '0.76rem' }}>
                  <td style={{ padding: '7px 2px', fontWeight: 600 }}>{it.description}</td>
                  <td style={{ padding: '7px 2px', textAlign: 'center', color: '#6B7280' }}>{it.quantity}</td>
                  <td style={{ padding: '7px 2px', textAlign: 'right', color: '#6B7280' }}>{fmt(it.rate)}</td>
                  <td style={{ padding: '7px 2px', textAlign: 'right', fontWeight: 700 }}>{fmt(it.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Breakdown */}
          <div style={{ borderTop: '2px dashed #9CA3AF', paddingTop: '0.75rem', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#4B5563' }}>
              <span>Total Qty / Items:</span><span>{totalQty} units ({items.length} items)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', color: '#4B5563' }}>
              <span>Subtotal:</span><span>{fmt(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#4B5563' }}>
              <span>GST / VAT ({taxRate}%):</span><span>{fmt(taxAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 900, color: tpl.accentColor, borderTop: '2px solid #111827', borderBottom: '2px solid #111827', padding: '8px 0', margin: '6px 0' }}>
              <span>NET PAYABLE:</span><span>{fmt(total)}</span>
            </div>
          </div>

          {/* Barcode & Policy */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed #D1D5DB' }}>
            <div style={{ letterSpacing: '4px', fontFamily: 'monospace', fontSize: '1.2rem', color: '#374151', transform: 'scaleY(1.4)', marginBottom: '4px' }}>
              ||| | |||| | |||||| || | |||| | ||
            </div>
            <div style={{ fontSize: '0.65rem', color: '#6B7280', letterSpacing: '1px' }}>{docNumber}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginTop: '8px' }}>
              Goods once sold can be exchanged within 7 days with bill.
            </div>
            <div style={{ fontSize: '0.68rem', color: '#9CA3AF', marginTop: '2px' }}>Thank you for shopping with us! Have a wonderful day.</div>
          </div>
        </div>
      )
    }

    // ──────────────────────────────────────────────────────────
    // 4. LAYOUT: MEDICAL & CLINICAL BILL (Healthcare format)
    // ──────────────────────────────────────────────────────────
    if (layout === 'clinical') {
      return (
        <div id={containerId} style={{ ...sheetStyle, padding: '2.5rem', border: '1px solid #CBD5E1', borderRadius: '8px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `3px solid ${tpl.accentColor}`, paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: tpl.accentColor, color: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 900 }}>
                ✚
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A' }}>{myName}</div>
                <div style={{ fontSize: '0.72rem', color: tpl.accentColor, fontWeight: 700 }}>24x7 Multi-Speciality Care & Diagnostics</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Clinic Reg No: MED-MH-2026-8812 · Helplines: {myPhone}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: tpl.accentColor }}>{tpl.docLabel}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>Bill ID: {docNumber}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Date: {dateStr}</div>
            </div>
          </div>

          {/* Patient Details Rx Box */}
          <div style={{ background: '#F0FDFA', border: `1.5px solid ${tpl.borderColor}`, borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: tpl.accentColor, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
              Patient Information & Consultation Record
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontSize: '0.76rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Patient Name:</span>
                  <span style={{ fontWeight: 800, color: '#0F172A' }}>{clientName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Contact Phone:</span>
                  <span style={{ fontWeight: 600 }}>{clientPhone || '+91 98765 43210'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Address:</span>
                  <span style={{ color: '#334155' }}>{clientAddress}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Attending Doctor:</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>Dr. Rajesh Gupta, MD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Department:</span>
                  <span style={{ color: '#334155' }}>General Medicine & Diagnostics</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>UHID No:</span>
                  <span style={{ fontWeight: 700, color: tpl.accentColor }}>UHID-2026-9042</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.25rem' }}>
            <thead>
              <tr style={{ background: tpl.tableHeaderBg, color: tpl.tableHeaderText, fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', borderRadius: '4px 0 0 4px' }}>Service / Investigation / Procedure</th>
                <th style={{ padding: '8px 8px', textAlign: 'center', width: '60px' }}>Units</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', width: '95px' }}>Standard Fee</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', width: '110px', borderRadius: '0 4px 4px 0' }}>Charge (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0', fontSize: '0.78rem' }}>
                  <td style={{ padding: '9px 12px', fontWeight: 600, color: '#1E293B' }}>{it.description}</td>
                  <td style={{ padding: '9px 8px', textAlign: 'center', color: '#64748B' }}>{it.quantity}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', color: '#64748B' }}>{fmt(it.rate)}</td>
                  <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: '#0F172A' }}>{fmt(it.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bottom */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start', marginTop: '1.5rem' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748B', background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>Medical Advice & Notes:</div>
              <p style={{ margin: 0, lineHeight: 1.4 }}>{notes}</p>
              <div style={{ marginTop: '8px', fontStyle: 'italic', fontSize: '0.68rem' }}>
                * Healthcare service bills are exempt from GST under Notification No. 12/2017-Central Tax (Rate).
              </div>
            </div>
            <div>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748B', marginBottom: '4px' }}>
                  <span>Investigation Total:</span><span style={{ fontWeight: 600 }}>{fmt(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 900, color: tpl.accentColor, paddingTop: '6px', borderTop: '2px solid #CBD5E1' }}>
                  <span>Total Amount Due:</span><span>{fmt(total)}</span>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '30px' }} />
                <div style={{ borderTop: '1.5px solid #94A3B8', paddingTop: '4px', fontSize: '0.74rem', fontWeight: 700, color: '#0F172A', display: 'inline-block', minWidth: '180px' }}>
                  Attending Medical Officer Seal
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // ──────────────────────────────────────────────────────────
    // 5. LAYOUT: MODERN MINIMAL (Scandinavian high whitespace)
    // ──────────────────────────────────────────────────────────
    if (layout === 'minimal') {
      return (
        <div id={containerId} style={{ ...sheetStyle, padding: '3.5rem 3rem', minHeight: '820px', color: '#111827', boxShadow: '0 4px 30px rgba(0,0,0,0.06)', borderRadius: '8px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.8px' }}>{myName}</div>
              <div style={{ fontSize: '0.76rem', color: '#6B7280', marginTop: '4px' }}>{myEmail} · {myPhone}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1 }}>{tpl.docLabel}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6B7280', marginTop: '4px' }}>#{docNumber}</div>
            </div>
          </div>

          {/* Parties */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem', paddingBottom: '1.75rem', borderBottom: '1px solid #E5E7EB' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#9CA3AF', marginBottom: '6px' }}>Billed To</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{clientName}</div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '4px', whiteSpace: 'pre-line' }}>{clientAddress}</div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>{clientEmail}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#9CA3AF', marginBottom: '6px' }}>Timelines</div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', marginBottom: '4px' }}>Issued on: <strong style={{ color: '#111827' }}>{dateStr}</strong></div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>Payment Due: <strong style={{ color: '#111827' }}>{dueDateStr}</strong></div>
            </div>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2.5rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #111827', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ textAlign: 'left', padding: '10px 0' }}>Item Description</th>
                <th style={{ textAlign: 'center', padding: '10px 0', width: '60px' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '10px 0', width: '100px' }}>Rate</th>
                <th style={{ textAlign: 'right', padding: '10px 0', width: '120px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6', fontSize: '0.82rem' }}>
                  <td style={{ padding: '12px 0', fontWeight: 600 }}>{it.description}</td>
                  <td style={{ padding: '12px 0', textAlign: 'center', color: '#6B7280' }}>{it.quantity}</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', color: '#6B7280' }}>{fmt(it.rate)}</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 700 }}>{fmt(it.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2.5rem' }}>
            <div style={{ width: '260px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6B7280', marginBottom: '6px' }}>
                <span>Subtotal</span><span style={{ fontWeight: 600, color: '#111827' }}>{fmt(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6B7280', marginBottom: '12px' }}>
                <span>Tax ({taxRate}%)</span><span style={{ fontWeight: 600, color: '#111827' }}>{fmt(taxAmount)}</span>
              </div>
              <div style={{ background: '#111827', color: '#FFFFFF', padding: '12px 18px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Due</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>{fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#9CA3AF' }}>
            <div>{notes}</div>
            <div>Bank / UPI: <strong style={{ color: '#111827' }}>{bankDetails}</strong></div>
          </div>
        </div>
      )
    }

    // ──────────────────────────────────────────────────────────
    // 6. LAYOUT: EXECUTIVE LEGAL & ADVISORY (Editorial Serif)
    // ──────────────────────────────────────────────────────────
    if (layout === 'editorial') {
      return (
        <div id={containerId} style={{ ...sheetStyle, padding: '3rem', border: '1px solid #D1D5DB', borderRadius: '4px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: `2px solid ${tpl.accentColor}`, paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: tpl.accentColor, letterSpacing: '1px', textTransform: 'uppercase' }}>{myName}</div>
            <div style={{ fontSize: '0.78rem', fontStyle: 'italic', color: '#6B7280', marginTop: '2px' }}>Advocates, Counselors & Corporate Legal Consultants</div>
            <div style={{ fontSize: '0.74rem', color: '#4B5563', marginTop: '4px' }}>{myAddress} · Email: {myEmail} · Tel: {myPhone}</div>
          </div>

          {/* Matter Box */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', padding: '1rem 1.25rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.76rem' }}>
            <div>
              <div style={{ fontWeight: 800, textTransform: 'uppercase', color: tpl.accentColor, fontSize: '0.65rem' }}>In Re / Client Matter:</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: '2px' }}>{clientName}</div>
              <div style={{ color: '#64748B', whiteSpace: 'pre-line', marginTop: '2px' }}>{clientAddress}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px', borderLeft: '1px solid #E2E8F0', paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Statement Ref:</span>
                <span style={{ fontWeight: 800 }}>{docNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Billing Date:</span>
                <span style={{ fontWeight: 700 }}>{dateStr}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Terms:</span>
                <span style={{ fontWeight: 700 }}>Due on Presentation</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
            <thead>
              <tr style={{ background: tpl.tableHeaderBg, color: tpl.tableHeaderText, fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: `2px solid ${tpl.accentColor}` }}>Professional Service & Counsel Particulars</th>
                <th style={{ padding: '8px 8px', textAlign: 'center', width: '60px', borderBottom: `2px solid ${tpl.accentColor}` }}>Hours</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', width: '90px', borderBottom: `2px solid ${tpl.accentColor}` }}>Rate (₹)</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', width: '110px', borderBottom: `2px solid ${tpl.accentColor}` }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0', fontSize: '0.78rem' }}>
                  <td style={{ padding: '10px', color: '#1E293B' }}>{it.description}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#64748B' }}>{it.quantity}</td>
                  <td style={{ padding: '10px', textAlign: 'right', color: '#64748B' }}>{fmt(it.rate)}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#0F172A' }}>{fmt(it.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', borderTop: '1px solid #CBD5E1', paddingTop: '1.25rem' }}>
            <div style={{ fontSize: '0.74rem', color: '#4B5563' }}>
              <div style={{ fontWeight: 700, color: tpl.accentColor }}>Remittance & Wire Instructions:</div>
              <div style={{ marginTop: '3px', lineHeight: 1.4 }}>{bankDetails}</div>
              <div style={{ marginTop: '8px', fontSize: '0.68rem', color: '#9CA3AF' }}>
                CONFIDENTIALITY NOTICE: This fee statement contains confidential legal communication intended solely for the recipient.
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Counsel Fees:</span><span style={{ fontWeight: 600 }}>{fmt(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span>GST ({taxRate}%):</span><span style={{ fontWeight: 600 }}>{fmt(taxAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 900, color: tpl.accentColor, paddingTop: '8px', borderTop: `2px double ${tpl.accentColor}` }}>
                <span>TOTAL DUE:</span><span>{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // ──────────────────────────────────────────────────────────
    // 7. LAYOUT: ACADEMIC & TUITION FEE RECEIPT
    // ──────────────────────────────────────────────────────────
    if (layout === 'academic') {
      return (
        <div id={containerId} style={{ ...sheetStyle, padding: '2.5rem', border: `2px solid ${tpl.accentColor}`, borderRadius: '8px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: `2px solid ${tpl.accentColor}`, paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: tpl.accentColor, letterSpacing: '0.5px' }}>{myName}</div>
            <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#4B5563', marginTop: '2px' }}>Affiliated & Registered Higher Education Institute</div>
            <div style={{ display: 'inline-block', background: tpl.accentColor, color: '#fff', padding: '3px 14px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, marginTop: '8px' }}>
              {tpl.docLabel}
            </div>
          </div>

          {/* Student & Course Box */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', border: `1.5px solid ${tpl.borderColor || '#CBD5E1'}`, padding: '1rem 1.25rem', background: '#F8FAFC', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Student Name:</span>
                <span style={{ fontWeight: 800, color: '#0F172A' }}>{clientName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Enrollment No:</span>
                <span style={{ fontWeight: 700, color: '#334155' }}>STU-2026-0892</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Academic Term:</span>
                <span style={{ fontWeight: 700, color: '#334155' }}>2026 - 2027 (Term I)</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Receipt No:</span>
                <span style={{ fontWeight: 800, color: tpl.accentColor }}>{docNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Receipt Date:</span>
                <span style={{ fontWeight: 700, color: '#334155' }}>{dateStr}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Payment Mode:</span>
                <span style={{ fontWeight: 700, color: '#334155' }}>Online Net Banking / UPI</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
            <thead>
              <tr style={{ background: tpl.tableHeaderBg, color: tpl.tableHeaderText, fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', border: '1px solid #CBD5E1' }}>Fee Head / Program Component</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: '120px', border: '1px solid #CBD5E1' }}>Term</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', width: '130px', border: '1px solid #CBD5E1' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} style={{ fontSize: '0.78rem' }}>
                  <td style={{ padding: '9px 12px', border: '1px solid #CBD5E1', fontWeight: 600 }}>{it.description}</td>
                  <td style={{ padding: '9px 8px', border: '1px solid #CBD5E1', textAlign: 'center', color: '#64748B' }}>Semester {idx + 1}</td>
                  <td style={{ padding: '9px 14px', border: '1px solid #CBD5E1', textAlign: 'right', fontWeight: 700 }}>{fmt(it.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Academic Totals & Bursar Seal */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem', alignItems: 'start' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748B', background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>Fee Policy Notice:</div>
              <div style={{ lineHeight: 1.5 }}>Fees once paid are non-transferable. Retain this computerized receipt for enrollment validation, semester registration, and exam hall tickets.</div>
              <div style={{ marginTop: '8px', color: '#334155' }}><strong>Bank Details:</strong> {bankDetails}</div>
            </div>
            <div>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: `1px solid ${tpl.borderColor || '#CBD5E1'}`, marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B', marginBottom: '6px' }}>
                  <span>Tuition Subtotal:</span><span style={{ fontWeight: 700, color: '#0F172A' }}>{fmt(subtotal)}</span>
                </div>
                {taxAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B', marginBottom: '6px' }}>
                    <span>GST / Tax ({taxRate}%):</span><span style={{ fontWeight: 600 }}>{fmt(taxAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 900, color: tpl.accentColor, paddingTop: '8px', borderTop: `2px solid ${tpl.accentColor}` }}>
                  <span>Total Fee Paid:</span><span>{fmt(total)}</span>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '30px' }} />
                <div style={{ borderTop: '1.5px solid #64748B', paddingTop: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#0F172A', display: 'inline-block', minWidth: '180px' }}>
                  Registrar / Bursar Accounts Seal
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // ──────────────────────────────────────────────────────────
    // 8. LAYOUT: CLASSIC PROFESSIONAL (Formal Corporate Default)
    // ──────────────────────────────────────────────────────────
    return (
      <div id={containerId} style={{ ...sheetStyle, padding: '2.5rem', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.06)' }}>
        {/* Header Band */}
        <div style={{ background: tpl.headerBg, color: tpl.headerText, padding: '1.5rem 1.75rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.5px' }}>{myName}</div>
            <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '3px' }}>Corporate Billing Services</div>
            <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '6px' }}>{myEmail} · {myPhone}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>{tpl.docLabel}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px', opacity: 0.9 }}>#{docNumber}</div>
            <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '4px' }}>Date: {dateStr}</div>
          </div>
        </div>

        {/* Dual Party Cards with Equal Alignment */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ border: `1.5px solid ${tpl.borderColor}`, borderRadius: '6px', padding: '1rem', background: '#F9FAFB' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#6B7280', marginBottom: '4px' }}>Bill From</div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827' }}>{myName}</div>
            <div style={{ fontSize: '0.76rem', color: '#4B5563', whiteSpace: 'pre-line', marginTop: '3px', lineHeight: 1.4 }}>{myAddress}</div>
            <div style={{ fontSize: '0.76rem', color: '#4B5563', marginTop: '2px' }}>{myEmail}</div>
          </div>
          <div style={{ border: `1.5px solid ${tpl.borderColor}`, borderRadius: '6px', padding: '1rem', background: '#F9FAFB' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#6B7280', marginBottom: '4px' }}>Bill To</div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827' }}>{clientName}</div>
            <div style={{ fontSize: '0.76rem', color: '#4B5563', whiteSpace: 'pre-line', marginTop: '3px', lineHeight: 1.4 }}>{clientAddress}</div>
            <div style={{ fontSize: '0.76rem', color: '#4B5563', marginTop: '2px' }}>{clientEmail} {clientPhone ? `· ${clientPhone}` : ''}</div>
          </div>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
          <thead>
            <tr style={{ background: tpl.tableHeaderBg, color: tpl.tableHeaderText, fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>
              <th style={{ padding: '9px 12px', textAlign: 'left', borderRadius: '4px 0 0 4px' }}>Description of Services / Products</th>
              <th style={{ padding: '9px 8px', textAlign: 'center', width: '55px' }}>Qty</th>
              <th style={{ padding: '9px 10px', textAlign: 'right', width: '90px' }}>Rate</th>
              <th style={{ padding: '9px 12px', textAlign: 'right', width: '110px', borderRadius: '0 4px 4px 0' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx} style={{ borderBottom: `1px solid ${tpl.borderColor}`, background: idx % 2 === 1 ? '#F9FAFB' : '#FFFFFF', fontSize: '0.78rem' }}>
                <td style={{ padding: '9px 12px', fontWeight: 600 }}>{it.description}</td>
                <td style={{ padding: '9px 8px', textAlign: 'center', color: '#6B7280' }}>{it.quantity}</td>
                <td style={{ padding: '9px 10px', textAlign: 'right', color: '#6B7280' }}>{fmt(it.rate)}</td>
                <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>{fmt(it.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Block */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ fontSize: '0.74rem', color: '#4B5563' }}>
            <div style={{ fontWeight: 700, color: '#111827', textTransform: 'uppercase', marginBottom: '3px' }}>Bank & Payment Instructions:</div>
            <div style={{ whiteSpace: 'pre-line', lineHeight: 1.4 }}>{bankDetails}</div>
            <div style={{ marginTop: '8px', color: '#6B7280' }}><strong>Notes:</strong> {notes}</div>
          </div>
          <div>
            <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '6px', border: `1px solid ${tpl.borderColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#6B7280', marginBottom: '4px' }}>
                <span>Subtotal:</span><span style={{ fontWeight: 600, color: '#111827' }}>{fmt(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#6B7280', marginBottom: '6px' }}>
                <span>Tax ({taxRate}%):</span><span style={{ fontWeight: 600, color: '#111827' }}>{fmt(taxAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 900, color: tpl.accentColor, paddingTop: '8px', borderTop: `2px solid ${tpl.accentColor}` }}>
                <span>Total Due:</span><span>{fmt(total)}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
              <div style={{ height: '30px' }} />
              <div style={{ borderTop: '1px solid #9CA3AF', display: 'inline-block', paddingTop: '4px', minWidth: '160px', textAlign: 'center', fontSize: '0.72rem', fontWeight: 600 }}>
                Authorized Signature
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // SCALING WRAPPER
  // ════════════════════════════════════════════════════════════
  if (scale && scale !== 1) {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{
          width: '780px',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          flexShrink: 0,
        }}>
          {renderLayoutContent()}
        </div>
      </div>
    )
  }

  // Normal scale (Scale === 1): Natural, centered, responsive full-sheet layout
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      {renderLayoutContent()}
    </div>
  )
}

export default DocumentRenderer
