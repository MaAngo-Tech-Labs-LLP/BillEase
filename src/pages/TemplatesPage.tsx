import React, { useState, useEffect } from 'react';
import {
  Check,
  ArrowRight,
  Eye,
  X,
  Building2,
  Receipt,
  GraduationCap,
  Stethoscope,
  Briefcase,
  Layers,
  CheckCircle2,
  Search,
} from 'lucide-react';
import {
  LayoutType,
  TemplateStyle,
  TEMPLATES,
  BILL_TEMPLATES,
  INVOICE_TEMPLATES,
  TEMPLATE_STORAGE_KEY,
  saveTemplateChoice,
  setTemplateChoice,
  getTemplateChoice,
  getTemplateById,
  ALL_CATEGORIES,
} from '../data/templateStyles';

// Re-export all requested types, data, and helper functions directly from TemplatesPage
export type { LayoutType, TemplateStyle };
export {
  TEMPLATES,
  BILL_TEMPLATES,
  INVOICE_TEMPLATES,
  TEMPLATE_STORAGE_KEY,
  saveTemplateChoice,
  setTemplateChoice,
  getTemplateChoice,
  getTemplateById,
  ALL_CATEGORIES,
};

interface TemplatesPageProps {
  onSelectTemplate: (templateId: string, docType?: 'bill' | 'invoice') => void;
  activeDocType?: 'bill' | 'invoice';
}

// Category icon mapper for rich visuals
function getCategoryIcon(category: string) {
  switch (category) {
    case 'Professional Services':
      return <Briefcase size={14} />;
    case 'Technology & SaaS':
      return <Layers size={14} />;
    case 'E-Commerce & Retail':
      return <Receipt size={14} />;
    case 'Healthcare & Wellness':
      return <Stethoscope size={14} />;
    case 'Education & Training':
      return <GraduationCap size={14} />;
    default:
      return <Building2 size={14} />;
  }
}

// Badge color classifier
function getBadgeClass(badge: string): string {
  switch (badge) {
    case 'Most Popular':
      return 'badge-popular';
    case 'Designer Pick':
      return 'badge-designer';
    case 'Retail Ready':
    case 'Fresh Look':
      return 'badge-fresh';
    case 'Creative':
      return 'badge-creative';
    case 'Clinical':
    case 'Compliant':
      return 'badge-compliant';
    case 'Executive':
      return 'badge-executive';
    case 'Scholarly':
      return 'badge-scholarly';
    case 'GST Ready':
      return 'badge-gst';
    case 'Clean Tech':
      return 'badge-designer';
    case 'Default Standard':
      return 'badge-popular';
    default:
      return '';
  }
}

// High-fidelity Micro Preview Component rendering authentic layouts
function TemplateMicroPreview({ tpl }: { tpl: TemplateStyle }) {
  const isBill = tpl.docType === 'bill';

  // 1. SIDEBAR LAYOUT (Creative Studio Invoice or Services Bill)
  if (tpl.layoutType === 'sidebar') {
    return (
      <div className="tpl-mini-sheet" style={{ display: 'flex', flexDirection: 'row' }}>
        {/* Left Vertical Saffron Sidebar */}
        <div
          style={{
            width: '34%',
            background: tpl.headerBg,
            color: tpl.headerText,
            padding: '10px 8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, lineHeight: 1.2 }}>
              {tpl.logoText}
            </div>
            <div style={{ fontSize: '0.55rem', opacity: 0.85, marginTop: 2 }}>Creative Studio</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px', borderRadius: 4, textAlign: 'center', fontSize: '0.52rem' }}>
            Instant Pay QR
          </div>
        </div>
        {/* Right Main Charges */}
        <div style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: tpl.accentColor }}>{tpl.docLabel}</span>
            <span style={{ fontSize: '0.55rem', color: '#94a3b8' }}>{isBill ? '#BIL-2026' : '#INV-2026'}</span>
          </div>
          <div style={{ background: tpl.tableHeaderBg, padding: '2px 5px', borderRadius: 3, fontSize: '0.56rem', fontWeight: 700, color: tpl.tableHeaderText, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>{isBill ? 'Item Description' : 'Deliverable'}</span>
            <span>Amt</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#334155' }}>
              <span>Brand Identity Guidelines</span>
              <span style={{ fontWeight: 600 }}>₹35,000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#334155' }}>
              <span>3D Motion Graphics</span>
              <span style={{ fontWeight: 600 }}>₹7,500</span>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${tpl.borderColor}`, paddingTop: 3, marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', fontWeight: 800, color: tpl.totalColor }}>
            <span>{isBill ? 'Balance Due:' : 'Total:'}</span>
            <span>₹42,500</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. RECEIPT LAYOUT (Retail POS Bill)
  if (tpl.layoutType === 'receipt') {
    return (
      <div className="tpl-mini-sheet" style={{ border: `1px solid ${tpl.borderColor}`, background: '#ffffff', position: 'relative', overflow: 'hidden' }}>
        {/* Soft corner accents */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: 30, height: 30, background: '#d1fae5', opacity: 0.7, clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 24, height: 24, background: '#d1fae5', opacity: 0.7, clipPath: 'polygon(0 100%, 0 0, 100% 100%)' }} />
        
        {/* Header */}
        <div style={{ padding: '6px 8px 4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="18" height="18" viewBox="0 0 52 52" fill="none">
              <path d="M26 18C26 10 32 6 40 5C40 13 36 19 28 19" fill="#22c55e" />
              <path d="M6 13H12L16 30H39L43 17H16" stroke="#1e293b" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="19" cy="38" r="3" fill="#1e293b" />
              <circle cx="36" cy="38" r="3" fill="#1e293b" />
            </svg>
            <div>
              <div style={{ fontSize: '0.62rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>APEX CORPORATE</div>
              <div style={{ fontSize: '0.45rem', fontWeight: 800, color: '#1b4332', letterSpacing: '0.05em' }}>RETAIL &amp; WHOLESALE</div>
            </div>
          </div>
          <div style={{ fontSize: '0.44rem', color: '#64748b', textAlign: 'right' }}>
            Mumbai 400051
          </div>
        </div>

        <div style={{ padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
          {/* Dual Party Mini Boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            <div style={{ border: '1px solid #d1e7dd', borderRadius: 3, overflow: 'hidden', background: '#ffffff' }}>
              <div style={{ background: '#f2f7f4', fontSize: '0.42rem', fontWeight: 800, color: '#1b4332', padding: '1px 3px' }}>
                STORE OUTLET
              </div>
              <div style={{ padding: '2px 3px', fontSize: '0.44rem', color: '#334155' }}>
                Apex Corporate
              </div>
            </div>
            <div style={{ border: '1px solid #d1e7dd', borderRadius: 3, overflow: 'hidden', background: '#ffffff' }}>
              <div style={{ background: '#f2f7f4', fontSize: '0.42rem', fontWeight: 800, color: '#1b4332', padding: '1px 3px' }}>
                CUSTOMER
              </div>
              <div style={{ padding: '2px 3px', fontSize: '0.44rem', color: '#334155' }}>
                Stellar Innovations
              </div>
            </div>
          </div>

          {/* Mini Meta Bar */}
          <div style={{ background: '#f2f7f4', border: '1px solid #d1e7dd', borderRadius: 3, padding: '2px 4px', display: 'flex', justifyContent: 'space-between', fontSize: '0.44rem', color: '#0f172a', fontWeight: 700 }}>
            <span>BILL #5479</span>
            <span>2026-09-06</span>
            <span>CASHIER #03</span>
          </div>

          {/* Mini Table Header */}
          <div style={{ background: '#1b4332', color: '#ffffff', borderRadius: 3, padding: '2px 4px', display: 'flex', justifyContent: 'space-between', fontSize: '0.46rem', fontWeight: 800 }}>
            <span>ITEM</span>
            <span>QTY</span>
            <span>AMOUNT</span>
          </div>

          {/* Mini Table Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, fontSize: '0.45rem', color: '#1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Enterprise Consulting</span>
              <span style={{ fontWeight: 600 }}>₹50,000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Cloud Infrastructure</span>
              <span style={{ fontWeight: 600 }}>₹35,000</span>
            </div>
          </div>

          {/* Balance Due Green Box */}
          <div style={{ background: '#1b4332', color: '#ffffff', borderRadius: 3, padding: '2px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.52rem', fontWeight: 800, marginTop: 'auto' }}>
            <span>Balance Due</span>
            <span>₹89,500</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. CLINICAL LAYOUT (Medical Healthcare Bill)
  if (tpl.layoutType === 'clinical') {
    return (
      <div className="tpl-mini-sheet" style={{ border: `1px solid ${tpl.borderColor}`, background: '#ffffff', position: 'relative', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '6px 8px 4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="16" height="16" viewBox="0 0 54 54" fill="none">
              <rect x="20" y="2" width="14" height="20" rx="6" fill="#475569" />
              <rect x="2" y="20" width="20" height="14" rx="6" fill="#475569" />
              <rect x="32" y="20" width="20" height="14" rx="6" fill="#475569" />
              <rect x="20" y="32" width="14" height="20" rx="6" fill="#475569" />
              <rect x="19" y="19" width="16" height="16" fill="#475569" />
              <path d="M20 28 C20 42 29 49 44 44 C31 43 26 36 26 28 Z" fill="#dfc3ab" />
            </svg>
            <div>
              <div style={{ fontSize: '0.62rem', fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>APEX HOSPITAL</div>
              <div style={{ fontSize: '0.42rem', fontWeight: 600, color: '#475569', letterSpacing: '0.08em' }}>HEALTH • CARE • TRUST</div>
            </div>
          </div>
          <div style={{ fontSize: '0.42rem', color: '#64748b', textAlign: 'right' }}>
            Mumbai 400051
          </div>
        </div>

        <div style={{ padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
          {/* Dual Mini Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 3, padding: '2px 4px', background: '#fcfbf9' }}>
              <div style={{ fontSize: '0.46rem', fontWeight: 800, color: '#1e293b' }}>Apex Corporate</div>
              <div style={{ fontSize: '0.4rem', color: '#64748b' }}>Corporate Billing</div>
            </div>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 3, padding: '2px 4px', background: '#fcfbf9' }}>
              <div style={{ fontSize: '0.46rem', fontWeight: 800, color: '#1e293b' }}>OPD/IPD BILL #5479</div>
              <div style={{ fontSize: '0.4rem', color: '#64748b' }}>UID: PO-12345</div>
            </div>
          </div>

          {/* Mini Meta Strip */}
          <div style={{ background: '#fcfbf9', border: '1px solid #e2e8f0', borderRadius: 3, padding: '2px 4px', display: 'flex', justifyContent: 'space-between', fontSize: '0.42rem', color: '#1e293b', fontWeight: 700 }}>
            <span>BILL #5479</span>
            <span>2026-09-06</span>
            <span>STAFF #03</span>
          </div>

          {/* Mini Table Header */}
          <div style={{ background: '#52616b', color: '#ffffff', borderRadius: 3, padding: '2px 4px', display: 'flex', justifyContent: 'space-between', fontSize: '0.45rem', fontWeight: 800 }}>
            <span>PARTICULARS</span>
            <span>UNITS</span>
            <span>AMOUNT</span>
          </div>

          {/* Mini Table Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, fontSize: '0.45rem', color: '#1e293b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Architecture Consulting</span>
              <span style={{ fontWeight: 600 }}>₹50,000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Cloud Infrastructure Audit</span>
              <span style={{ fontWeight: 600 }}>₹35,000</span>
            </div>
          </div>

          {/* Balance Due Apricot Box */}
          <div style={{ background: '#dfc3ab', color: '#1e293b', borderRadius: 3, padding: '2px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.52rem', fontWeight: 900, marginTop: 'auto' }}>
            <span>Balance Due</span>
            <span>₹89,500</span>
          </div>
        </div>
      </div>
    );
  }

  // 4. GST TAX INVOICE LAYOUT
  if (tpl.layoutType === 'gst') {
    return (
      <div className="tpl-mini-sheet" style={{ border: `1px solid ${tpl.borderColor}` }}>
        <div style={{ padding: '6px 10px', background: tpl.headerBg, color: tpl.headerText, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800 }}>{tpl.logoText}</span>
          <span style={{ fontSize: '0.55rem', fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '1px 5px', borderRadius: 3 }}>
            TAX INVOICE (GST)
          </span>
        </div>
        <div style={{ padding: '6px 10px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '0.5rem', color: '#64748b', marginBottom: 4 }}>
            GSTIN: 07AAAAA0000A1Z5 | State Code: 07 (Delhi)
          </div>
          <div style={{ background: tpl.tableHeaderBg, padding: '2px 5px', borderRadius: 3, fontSize: '0.52rem', fontWeight: 700, color: tpl.tableHeaderText, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>Item (SAC)</span>
            <span>Taxable</span>
            <span>CGST+SGST</span>
          </div>
          <div style={{ fontSize: '0.53rem', color: '#334155', display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span>Architecture (998314)</span>
            <span>₹60,000</span>
            <span>18%</span>
          </div>
          <div style={{ borderTop: `1px solid ${tpl.borderColor}`, marginTop: 'auto', paddingTop: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.64rem', fontWeight: 800, color: tpl.totalColor }}>
            <span style={{ fontSize: '0.52rem', color: '#64748b' }}>Amount in Words</span>
            <span>Total: ₹70,800</span>
          </div>
        </div>
      </div>
    );
  }

  // 5. ACADEMIC TUITION BILL LAYOUT
  if (tpl.layoutType === 'academic') {
    return (
      <div className="tpl-mini-sheet" style={{ border: `1px solid ${tpl.borderColor}` }}>
        <div style={{ padding: '7px 10px', background: tpl.headerBg, color: tpl.headerText, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800 }}>{tpl.logoText}</span>
          </div>
          <span style={{ fontSize: '0.52rem', opacity: 0.9 }}>FEE BILL</span>
        </div>
        <div style={{ padding: '6px 10px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.52rem', color: '#64748b', marginBottom: 4 }}>
            <span>Student: Rahul Sharma</span>
            <span>Roll: CGA-2026-089</span>
          </div>
          <div style={{ background: tpl.tableHeaderBg, padding: '2px 5px', borderRadius: 3, fontSize: '0.54rem', fontWeight: 700, color: tpl.tableHeaderText, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>Fee Particulars</span>
            <span>Amount</span>
          </div>
          <div style={{ fontSize: '0.53rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Advanced Physics & Math Term</span>
              <span>₹22,000</span>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${tpl.borderColor}`, marginTop: 'auto', paddingTop: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.5rem', color: '#283593', fontWeight: 700 }}>[SEAL: Registrar]</span>
            <span style={{ fontSize: '0.64rem', fontWeight: 800, color: tpl.totalColor }}>Total: ₹30,000</span>
          </div>
        </div>
      </div>
    );
  }

  // 6. APEX CORPORATE STANDARD BILL / DEDICATED BILL MODEL
  if (isBill) {
    return (
      <div className="tpl-mini-sheet" style={{ border: `1px solid ${tpl.borderColor}` }}>
        <div
          className="tpl-mini-header-bar"
          style={{
            background: tpl.headerBg,
            color: tpl.headerText,
          }}
        >
          <span className="tpl-mini-brand-name">{tpl.logoText}</span>
          <span className="tpl-mini-doc-label">BILL #BIL-2026</span>
        </div>

        <div className="tpl-mini-body">
          {/* Dual Party Mini Boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 2 }}>
            <div style={{ background: '#f8faff', border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 5px', fontSize: '0.52rem' }}>
              <span style={{ color: tpl.accentColor, fontWeight: 700 }}>FROM: </span>
              <span style={{ color: '#1e293b' }}>Apex Corp</span>
            </div>
            <div style={{ background: '#f8faff', border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 5px', fontSize: '0.52rem' }}>
              <span style={{ color: tpl.accentColor, fontWeight: 700 }}>TO: </span>
              <span style={{ color: '#1e293b' }}>Stellar Ltd</span>
            </div>
          </div>

          <div className="tpl-mini-table-header" style={{ background: tpl.tableHeaderBg, color: tpl.tableHeaderText }}>
            <span>Item</span>
            <span>Qty</span>
            <span>Tax</span>
            <span>Amount</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
            <div className="tpl-mini-table-row" style={{ background: 'rgba(0,0,0,0.02)' }}>
              <span style={{ color: '#1e293b' }}>{tpl.sampleItems[0]?.desc.slice(0, 20)}...</span>
              <span style={{ color: '#64748b' }}>{tpl.sampleItems[0]?.qty}</span>
              <span style={{ color: '#64748b' }}>18%</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                ₹{(tpl.sampleItems[0]?.rate * tpl.sampleItems[0]?.qty).toLocaleString('en-IN')}
              </span>
            </div>
            {tpl.sampleItems[1] && (
              <div className="tpl-mini-table-row">
                <span style={{ color: '#1e293b' }}>{tpl.sampleItems[1]?.desc.slice(0, 20)}...</span>
                <span style={{ color: '#64748b' }}>{tpl.sampleItems[1]?.qty}</span>
                <span style={{ color: '#64748b' }}>18%</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>
                  ₹{(tpl.sampleItems[1]?.rate * tpl.sampleItems[1]?.qty).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          <div className="tpl-mini-bottom-strip" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.52rem', color: '#10b981', fontWeight: 600 }}>
              Payment: Bank Transfer
            </span>
            <span style={{ color: tpl.totalColor, fontWeight: 800 }}>
              Balance Due: ₹
              {tpl.sampleItems
                .reduce((sum, it) => sum + it.qty * it.rate, 0)
                .toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 7. STANDARD INVOICE MODEL (classic-pro, modern-minimal, editorial)
  const isMinimal = tpl.layoutType === 'minimal';
  return (
    <div className="tpl-mini-sheet" style={{ border: `1px solid ${tpl.borderColor}` }}>
      <div
        className="tpl-mini-header-bar"
        style={{
          background: tpl.headerBg,
          color: tpl.headerText,
          borderBottom: isMinimal ? '1px solid #e2e8f0' : 'none',
        }}
      >
        <span className="tpl-mini-brand-name">{tpl.logoText}</span>
        <span className="tpl-mini-doc-label">{tpl.docLabel}</span>
      </div>

      <div className="tpl-mini-body">
        <div className="tpl-mini-table-header" style={{ background: tpl.tableHeaderBg, color: tpl.tableHeaderText }}>
          <span>Description</span>
          <span>Qty</span>
          <span>Total</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
          <div className="tpl-mini-table-row" style={{ background: isMinimal ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
            <span style={{ color: '#1e293b' }}>{tpl.sampleItems[0]?.desc.slice(0, 24)}...</span>
            <span style={{ color: '#64748b' }}>{tpl.sampleItems[0]?.qty}</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>
              ₹{(tpl.sampleItems[0]?.rate * tpl.sampleItems[0]?.qty).toLocaleString('en-IN')}
            </span>
          </div>
          {tpl.sampleItems[1] && (
            <div className="tpl-mini-table-row" style={{ background: isMinimal ? 'transparent' : '#ffffff' }}>
              <span style={{ color: '#1e293b' }}>{tpl.sampleItems[1]?.desc.slice(0, 24)}...</span>
              <span style={{ color: '#64748b' }}>{tpl.sampleItems[1]?.qty}</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                ₹{(tpl.sampleItems[1]?.rate * tpl.sampleItems[1]?.qty).toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>

        <div className="tpl-mini-bottom-strip">
          <span style={{ fontSize: '0.58rem', color: '#64748b' }}>
            Client: {tpl.sampleClient.slice(0, 20)}...
          </span>
          <span style={{ color: tpl.totalColor }}>
            Total Due: ₹
            {tpl.sampleItems
              .reduce((sum, it) => sum + it.qty * it.rate, 0)
              .toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage({
  onSelectTemplate,
  activeDocType = 'bill',
}: TemplatesPageProps) {
  const [activeTemplateId, setActiveTemplateId] = useState<string>(() => {
    return getTemplateChoice() || 'apex-corporate-bill';
  });
  const [previewModalTpl, setPreviewModalTpl] = useState<TemplateStyle | null>(null);

  // Tab Filtering: All / Bill Templates / Invoice Templates
  const [docTypeFilter, setDocTypeFilter] = useState<'all' | 'bill' | 'invoice'>(activeDocType || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync active choice if changes in localStorage
  useEffect(() => {
    const stored = getTemplateChoice();
    if (stored) {
      setActiveTemplateId(stored);
    }
  }, []);

  // Update tab filter when activeDocType changes from outside navigation
  useEffect(() => {
    if (activeDocType) {
      setDocTypeFilter(activeDocType);
    }
  }, [activeDocType]);

  const handleApplyTemplate = (tpl: TemplateStyle, explicitType?: 'bill' | 'invoice') => {
    saveTemplateChoice(tpl.id);
    setActiveTemplateId(tpl.id);
    // Explicitly target the template's designated document type ('bill' or 'invoice')
    const targetType = explicitType || (tpl.docType === 'bill' ? 'bill' : 'invoice');
    onSelectTemplate(tpl.id, targetType);
  };

  // Counts for tabs
  const billCount = TEMPLATES.filter((t) => t.docType === 'bill').length;
  const invoiceCount = TEMPLATES.filter((t) => t.docType === 'invoice').length;
  const totalCount = TEMPLATES.length;

  // Filter templates based on tab, category, and search query
  const filteredTemplates = TEMPLATES.filter((tpl) => {
    // 1. DocType filter
    if (docTypeFilter !== 'all' && tpl.docType !== docTypeFilter) {
      return false;
    }
    // 2. Category filter
    if (selectedCategory !== 'All Categories' && tpl.category !== selectedCategory) {
      return false;
    }
    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tpl.name.toLowerCase().includes(q);
      const matchDesc = tpl.description.toLowerCase().includes(q);
      const matchTags = tpl.tags.some((t) => t.toLowerCase().includes(q));
      const matchCat = tpl.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchTags && !matchCat) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="templates-page-wrapper">
      {/* Hero Header */}
      <header className="templates-hero-header">
        <h1 className="templates-hero-title">Document Templates Gallery</h1>
        <p className="templates-hero-subtitle">
          Choose from professionally designed layout themes optimized specifically for <strong>Bills</strong> and <strong>Invoices</strong>.
          Every template provides print compliance, digital sharing, and statutory alignment.
        </p>
      </header>

      {/* Top Filter & Search Controls */}
      <div className="templates-controls-bar" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* DocType Switcher (All / Bill Templates / Invoice Templates) */}
          <div className="templates-type-switcher" role="tablist">
            <button
              type="button"
              role="tab"
              className={`type-switch-btn ${docTypeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setDocTypeFilter('all')}
            >
              All Templates ({totalCount})
            </button>
            <button
              type="button"
              role="tab"
              className={`type-switch-btn ${docTypeFilter === 'bill' ? 'active' : ''}`}
              onClick={() => setDocTypeFilter('bill')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Receipt size={14} style={{ color: docTypeFilter === 'bill' ? '#10b981' : undefined }} />
              <span>Bill Templates ({billCount})</span>
            </button>
            <button
              type="button"
              role="tab"
              className={`type-switch-btn ${docTypeFilter === 'invoice' ? 'active' : ''}`}
              onClick={() => setDocTypeFilter('invoice')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Layers size={14} style={{ color: docTypeFilter === 'invoice' ? '#2563eb' : undefined }} />
              <span>Invoice Templates ({invoiceCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="templates-search-box" style={{ maxWidth: '380px' }}>
            <Search size={16} className="templates-search-icon" />
            <input
              type="text"
              className="templates-search-input"
              placeholder="Search templates by name, style, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="templates-search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="templates-categories-bar">
          {ALL_CATEGORIES.map((cat) => {
            const count = cat === 'All Categories'
              ? TEMPLATES.filter((t) => docTypeFilter === 'all' || t.docType === docTypeFilter).length
              : TEMPLATES.filter((t) => (docTypeFilter === 'all' || t.docType === docTypeFilter) && t.category === cat).length;
            if (cat !== 'All Categories' && count === 0) return null;
            return (
              <button
                key={cat}
                type="button"
                className={`category-filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
                <span className="category-pill-count">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="templates-cards-grid">
        {filteredTemplates.map((tpl) => {
          const isCurrentlyActive = activeTemplateId === tpl.id;
          const isBill = tpl.docType === 'bill';

          return (
            <article
              key={tpl.id}
              className={`tpl-card ${isCurrentlyActive ? 'active-tpl' : ''}`}
            >
              {/* Content Section (ABOVE) */}
              <div className="tpl-card-content">
                <div>
                  {/* Meta Row: Category, DocType, Badge */}
                  <div className="tpl-meta-tags-row">
                    <span className="tpl-category-tag">
                      {tpl.categoryTag}
                    </span>
                    <span className={`tpl-doctype-pill ${isBill ? 'pill-bill' : 'pill-invoice'}`}>
                      {isBill ? 'Bill Template' : 'Invoice Template'}
                    </span>
                    <span className={`tpl-badge-pill-inline ${getBadgeClass(tpl.badge)}`}>
                      {tpl.badge}
                    </span>
                    {isCurrentlyActive && (
                      <span className="active-indicator-tag-inline">
                        <Check size={11} />
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h2 className="tpl-card-title">{tpl.name}</h2>
                  <p className="tpl-card-desc">{tpl.description}</p>

                  {/* Sample Client Info */}
                  <div className="tpl-sample-client-strip">
                    <Building2 size={13} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {isBill ? 'Customer / Client: ' : 'Billed To: '}
                      <strong>{tpl.sampleClient}</strong>
                    </span>
                  </div>

                  {/* Tag Chips */}
                  <div className="tpl-tags-list">
                    {tpl.tags.map((tag) => (
                      <span key={tag} className="tpl-tag-chip">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Visual Preview Box (BELOW the Description) */}
                <div
                  className="tpl-card-preview-box"
                  title="Click to view full layout specifications"
                  onClick={() => setPreviewModalTpl(tpl)}
                  style={{ cursor: 'pointer' }}
                >
                  <TemplateMicroPreview tpl={tpl} />
                </div>

                {/* Action Buttons */}
                <div className="tpl-card-actions">
                  <button
                    type="button"
                    className={`btn-use-tpl ${isCurrentlyActive ? 'btn-already-active' : ''} ${isBill ? 'btn-bill-action' : 'btn-invoice-action'}`}
                    onClick={() => handleApplyTemplate(tpl)}
                  >
                    {isCurrentlyActive ? (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Active {isBill ? 'Bill' : 'Invoice'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isBill ? 'Use in Create Bill' : 'Use in Create Invoice'}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn-preview-tpl-sample"
                    title="Inspect Sample Items & Layout Specs"
                    onClick={() => setPreviewModalTpl(tpl)}
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Sample Details Modal */}
      {previewModalTpl && (
        <div className="tpl-modal-backdrop" onClick={() => setPreviewModalTpl(null)}>
          <div className="tpl-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="tpl-modal-header">
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: previewModalTpl.docType === 'bill' ? '#10b981' : '#2563eb', textTransform: 'uppercase' }}>
                  {previewModalTpl.docType === 'bill' ? 'Bill Template' : 'Invoice Template'} • {previewModalTpl.category}
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '2px 0 0', color: '#0f172a' }}>
                  {previewModalTpl.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalTpl(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="tpl-modal-body">
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 4, color: '#1e293b' }}>
                  Layout &amp; Styling Specifications
                </h4>
                <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5 }}>
                  {previewModalTpl.description}
                </p>
              </div>

              {/* Color Swatch Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Palette Tokens:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: previewModalTpl.accentColor, border: '1px solid rgba(0,0,0,0.1)' }} />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Accent ({previewModalTpl.accentColor})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: previewModalTpl.headerBg, border: '1px solid rgba(0,0,0,0.1)' }} />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Header</span>
                  </div>
                </div>
              </div>

              {/* Sample Items Table */}
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 4, color: '#1e293b' }}>
                  {previewModalTpl.docType === 'bill' ? 'Sample Bill Items:' : 'Sample Deliverables:'}
                </h4>
                <table className="tpl-modal-items-table">
                  <thead>
                    <tr>
                      <th>{previewModalTpl.docType === 'bill' ? 'Service / Product' : 'Deliverable / Service'}</th>
                      <th style={{ width: 60, textAlign: 'center' }}>Qty</th>
                      <th style={{ width: 100, textAlign: 'right' }}>Rate</th>
                      <th style={{ width: 110, textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewModalTpl.sampleItems.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.desc}</td>
                        <td style={{ textAlign: 'center' }}>{item.qty}</td>
                        <td style={{ textAlign: 'right' }}>₹{item.rate.toLocaleString('en-IN')}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          ₹{(item.qty * item.rate).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Client & Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {previewModalTpl.tags.map((tag) => (
                  <span key={tag} className="tpl-tag-chip" style={{ fontSize: '0.76rem', padding: '3px 9px' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="tpl-modal-footer">
              <button
                type="button"
                style={{ padding: '0.6rem 1rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', color: '#475569' }}
                onClick={() => setPreviewModalTpl(null)}
              >
                Close Preview
              </button>
              <button
                type="button"
                className={`btn-use-tpl ${previewModalTpl.docType === 'bill' ? 'btn-bill-action' : 'btn-invoice-action'}`}
                style={{ padding: '0.6rem 1.4rem' }}
                onClick={() => {
                  handleApplyTemplate(previewModalTpl);
                  setPreviewModalTpl(null);
                }}
              >
                <span>Apply to {previewModalTpl.docType === 'bill' ? 'Create Bill' : 'Create Invoice'}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
