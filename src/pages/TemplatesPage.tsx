import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutTemplate, Eye, X, Receipt, FileText, CheckCircle2, Star, Sparkles } from 'lucide-react'
import Navbar from '../components/Navbar'
import { TEMPLATES, ALL_CATEGORIES, saveTemplateChoice } from '../data/templates'
import type { TemplateStyle } from '../data/templates'
import DocumentRenderer from '../components/DocumentRenderer'

// ── Sample Document Generator for realistic preview ───────────
const sampleDocForTemplate = (t: TemplateStyle) => ({
  id: t.id === 'gst-tax-invoice' ? 'GST/2026/041' : t.id === 'bold-emerald' ? 'REC-88421' : t.id === 'medical-clinical' ? 'CLIN-2026-9042' : 'INV-2026-0089',
  type: (t.docType === 'bill' ? 'bill' : 'invoice') as 'bill' | 'invoice',
  date: '2026-09-06',
  dueDate: '2026-10-06',
  invoiceNumber: t.id === 'gst-tax-invoice' ? 'GST/2026/041' : t.id === 'bold-emerald' ? 'REC-88421' : 'INV-2026-0089',
  billFrom: {
    name: t.logoText,
    email: 'contact@' + t.logoText.toLowerCase().replace(/[^a-z]/g, '') + '.com',
    phone: '+91 98765 43210',
    address: '101 Cyber Towers, BKC, Mumbai 400051',
  },
  billTo: {
    name: t.sampleClient,
    email: 'accounts@client.com',
    phone: '+91 91234 56789',
    address: '45 Innovation Way, Bangalore 560100',
  },
  items: t.sampleItems.map((s, idx) => ({
    id: String(idx),
    description: s.desc,
    quantity: s.qty,
    rate: s.rate,
    amount: s.qty * s.rate,
  })),
  subtotal: t.sampleItems.reduce((acc, i) => acc + i.qty * i.rate, 0),
  taxRate: 18,
  taxAmount: Math.round(t.sampleItems.reduce((acc, i) => acc + i.qty * i.rate, 0) * 0.18),
  total: Math.round(t.sampleItems.reduce((acc, i) => acc + i.qty * i.rate, 0) * 1.18),
  templateId: t.id,
  bankDetails: 'Bank: HDFC Bank · A/C: 50200012345678 · IFSC: HDFC0000123 · UPI: pay@upi',
  notes: 'Thank you for your valued business! Payments are due within 30 days of invoice date.',
})

// ── Full Preview Modal with Real Layout ────────────────────────
const PreviewModal = ({
  t,
  onClose,
  onUse,
}: {
  t: TemplateStyle
  onClose: () => void
  onUse: (docType: 'invoice' | 'bill') => void
}) => (
  <div
    style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', overflowY: 'auto',
    }}
    onClick={e => e.target === e.currentTarget && onClose()}
  >
    <div
      style={{
        background: '#FFFFFF', borderRadius: '24px', maxWidth: '1080px', width: '100%',
        boxShadow: '0 32px 100px rgba(0,0,0,0.35)', border: '1.5px solid rgba(255,255,255,0.85)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: '90vh',
      }}
    >
      {/* Modal header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 2rem', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.accentColor }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#111827' }}>{t.name}</span>
              <span style={{ background: `${t.accentColor}18`, color: t.accentColor, fontSize: '0.7rem', fontWeight: 800, padding: '2px 9px', borderRadius: '6px' }}>
                {t.categoryTag}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
              Architecture: <strong style={{ color: '#111827', textTransform: 'capitalize' }}>{t.layoutType} Layout</strong> · Fully customizable in builder
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: '34px', height: '34px', borderRadius: '10px',
            border: '1.5px solid #E5E7EB', background: '#fff',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Modal body — two column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 0, overflow: 'hidden', flex: 1 }}>
        {/* Left: actual document preview in scrollable container */}
        <div
          style={{
            padding: '2rem', background: '#EEF0F2',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            overflowY: 'auto', maxHeight: 'calc(90vh - 80px)',
          }}
        >
          <div style={{ width: '100%', maxWidth: '580px', boxShadow: '0 12px 48px rgba(0,0,0,0.14)', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
            <DocumentRenderer
              doc={sampleDocForTemplate(t)}
              templateId={t.id}
              scale={0.72}
              containerId={`modal-prev-${t.id}`}
            />
          </div>
        </div>

        {/* Right: template info and direct edit triggers */}
        <div
          style={{
            padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
            borderLeft: '1px solid #E5E7EB', background: '#FFFFFF', overflowY: 'auto',
          }}
        >
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#9CA3AF', marginBottom: '4px' }}>Layout Type</div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#111827', textTransform: 'capitalize' }}>
              {t.layoutType} Layout Structure
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#9CA3AF', marginBottom: '4px' }}>Description</div>
            <div style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.6 }}>{t.description}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#9CA3AF', marginBottom: '8px' }}>Real Template Highlights</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {t.tags.map(tag => (
                <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: '#1F2937' }}>
                  <CheckCircle2 size={15} color={t.accentColor} />
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => onUse('invoice')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '13px', borderRadius: '12px', border: 'none',
                background: t.accentColor, color: '#fff',
                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                boxShadow: `0 4px 16px ${t.accentColor}40`,
              }}
            >
              <FileText size={16} /> Edit & Create Invoice with this Template
            </button>
            <button
              onClick={() => onUse('bill')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px', borderRadius: '12px', border: `1.5px solid ${t.accentColor}`,
                background: 'rgba(255,255,255,0.9)', color: t.accentColor,
                fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
              }}
            >
              <Receipt size={16} /> Edit & Create Bill with this Template
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// ── Template Card with Real Layout Preview Thumbnail ───────────
const TemplateCard = ({
  t,
  onPreview,
  onUse,
}: {
  t: TemplateStyle
  onPreview: () => void
  onUse: () => void
}) => {
  return (
    <div
      className="glass-card"
      style={{
        display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease', cursor: 'default',
        borderRadius: '16px', background: '#fff', border: '1.5px solid rgba(0,0,0,0.06)',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = ''
      }}
    >
      {/* Real document preview thumbnail container */}
      <div
        onClick={onPreview}
        style={{
          width: '100%', height: '300px', background: '#F8F9FA',
          overflow: 'hidden', cursor: 'pointer', position: 'relative',
          display: 'flex', justifyContent: 'center', borderBottom: '1px solid #E5E7EB',
        }}
      >
        <div style={{ width: '220px', height: '300px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
          <DocumentRenderer
            doc={sampleDocForTemplate(t)}
            templateId={t.id}
            scale={0.28}
            containerId={`thumb-${t.id}`}
          />
        </div>

        {/* Hover overlay */}
        <div
          className="card-preview-overlay"
          style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.96)', borderRadius: '12px', padding: '9px 18px',
              display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.8rem',
              color: '#111827', opacity: 0, transition: 'opacity 0.2s', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
            className="preview-label"
          >
            <Eye size={15} /> Full Real Preview
          </div>
        </div>

        {/* Category badge */}
        <span
          style={{
            position: 'absolute', top: '10px', right: '10px',
            background: t.accentColor, color: '#fff',
            fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.6px', padding: '3px 10px', borderRadius: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {t.categoryTag}
        </span>

        {/* Badge bottom */}
        <span
          style={{
            position: 'absolute', bottom: '10px', left: '10px',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            color: '#fff', fontSize: '0.62rem', fontWeight: 700, padding: '3px 9px', borderRadius: '6px',
          }}
        >
          {t.layoutType.toUpperCase()} ARCHITECTURE
        </span>
      </div>

      {/* Card info */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--charcoal)', margin: 0 }}>{t.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: t.accentColor, flexShrink: 0 }} />
            {t.docType === 'bill' ? <Receipt size={12} color={t.accentColor} /> : <FileText size={12} color={t.accentColor} />}
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--charcoal-soft)', lineHeight: 1.5, marginBottom: '0.875rem', flex: 1 }}>
          {t.description.slice(0, 105)}...
        </p>

        {/* Feature tags */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {t.tags.map(tag => (
            <span
              key={tag}
              style={{
                padding: '2px 8px', background: `${t.accentColor}14`,
                borderRadius: '5px', fontSize: '0.65rem', fontWeight: 700, color: t.accentColor,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '0.875rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <button
            onClick={onPreview}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              padding: '9px', borderRadius: '10px', border: '1.5px solid rgba(0,0,0,0.1)',
              background: 'rgba(255,255,255,0.8)', color: 'var(--charcoal)', fontWeight: 600, fontSize: '0.78rem',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <Eye size={14} /> Preview
          </button>
          <button
            onClick={onUse}
            style={{
              flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              padding: '9px', borderRadius: '10px', border: 'none',
              background: t.accentColor, color: '#fff', fontWeight: 700, fontSize: '0.78rem',
              cursor: 'pointer', boxShadow: `0 3px 10px ${t.accentColor}40`, transition: 'all 0.15s',
            }}
          >
            <Sparkles size={14} /> Use & Edit
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────
const TemplatesPage = () => {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('All Categories')
  const [previewTpl, setPreviewTpl] = useState<TemplateStyle | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'bills' | 'invoices'>('all')

  const filtered = TEMPLATES.filter(t => {
    const catOk = activeCategory === 'All Categories' || t.category === activeCategory
    const tabOk =
      activeTab === 'all' ||
      (activeTab === 'bills' && t.docType === 'bill') ||
      (activeTab === 'invoices' && t.docType === 'invoice')
    return catOk && tabOk
  })

  const handleUseTemplate = (t: TemplateStyle, targetType?: 'invoice' | 'bill') => {
    saveTemplateChoice(t.id)
    setPreviewTpl(null)
    const docType = targetType || (t.docType === 'bill' ? 'bill' : 'invoice')
    navigate(docType === 'bill' ? `/create-bill?template=${t.id}` : `/create-invoice?template=${t.id}`)
  }

  return (
    <>
      <Navbar />
      {previewTpl && (
        <PreviewModal
          t={previewTpl}
          onClose={() => setPreviewTpl(null)}
          onUse={targetType => handleUseTemplate(previewTpl, targetType)}
        />
      )}

      <main style={{ minHeight: '100vh', paddingTop: '68px', paddingBottom: '5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem',
            }}
          >
            <div style={{ maxWidth: '620px' }}>
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', color: '#5B9E86',
                  fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px',
                }}
              >
                <LayoutTemplate size={13} /> Real Architectural Templates
              </div>
              <h1
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.75px',
                  color: 'var(--charcoal)', lineHeight: 1.15, marginBottom: '0.75rem',
                }}
              >
                Invoice & Bill Templates
              </h1>
              <p style={{ fontSize: '1rem', color: 'var(--charcoal-soft)', lineHeight: 1.6 }}>
                8 distinct real-world layouts — from official Indian GST tax invoices and clinic receipts to creative sidebars and modern minimal formats. Select any template to preview and edit live.
              </p>
            </div>
            {/* Tab switcher */}
            <div
              style={{
                display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.65)',
                borderRadius: '12px', padding: '4px', border: '1.5px solid rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)',
              }}
            >
              {(['all', 'bills', 'invoices'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 18px', borderRadius: '9px', border: 'none',
                    fontWeight: 600, fontSize: '0.825rem', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
                    background: activeTab === tab ? 'rgba(255,255,255,0.95)' : 'transparent',
                    color: activeTab === tab ? 'var(--charcoal)' : 'var(--charcoal-soft)',
                    boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.07)' : 'none',
                  }}
                >
                  {tab === 'all'
                    ? `All (${TEMPLATES.length})`
                    : tab === 'bills'
                    ? `Bills (${TEMPLATES.filter(t => t.docType === 'bill').length})`
                    : `Invoices (${TEMPLATES.filter(t => t.docType === 'invoice').length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div
            style={{
              display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '0.5rem',
              marginBottom: '2rem', scrollbarWidth: 'none',
            }}
          >
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '8px 16px', borderRadius: '20px', border: 'none',
                  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                  background: activeCategory === cat ? 'var(--charcoal)' : 'rgba(255,255,255,0.65)',
                  color: activeCategory === cat ? '#fff' : 'var(--charcoal-mid)',
                  boxShadow: activeCategory === cat ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                {cat === 'All Categories' ? '✦ All Templates' : cat}
              </button>
            ))}
          </div>

          {/* Template Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.75rem' }}>
            {filtered.map(t => (
              <TemplateCard
                key={t.id}
                t={t}
                onPreview={() => setPreviewTpl(t)}
                onUse={() => handleUseTemplate(t)}
              />
            ))}
          </div>

          {/* Bottom Banner */}
          <div
            style={{
              marginTop: '4rem', padding: '2.5rem', borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(91,158,134,0.15), rgba(110,92,182,0.15))',
              border: '1.5px solid rgba(255,255,255,0.85)', textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#5B9E86', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px' }}>
              <Star size={15} /> All Templates 100% Free & Built-In
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--charcoal)', marginBottom: '0.75rem' }}>
              Need a custom layout for your workflow?
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--charcoal-soft)', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              Every template is completely editable. You can adjust lines, customer info, taxes, and payment instructions right in the builder.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/create-invoice')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '12px 24px', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #6E5CB6, #9B8FD4)', color: '#fff',
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(110,92,182,0.3)',
                }}
              >
                <FileText size={16} /> Open Invoice Builder
              </button>
              <button
                onClick={() => navigate('/create-bill')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '12px 24px', borderRadius: '12px', border: '1.5px solid rgba(0,0,0,0.1)',
                  background: 'rgba(255,255,255,0.85)', color: 'var(--charcoal)',
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                }}
              >
                <Receipt size={16} /> Open Bill Builder
              </button>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .card-preview-overlay:hover {
          background: rgba(0,0,0,0.4) !important;
        }
        .card-preview-overlay:hover .preview-label {
          opacity: 1 !important;
        }
      `}</style>
    </>
  )
}

export default TemplatesPage
