import React, { useMemo } from 'react';
import {
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  Landmark,
  Receipt,
  QrCode,
  Stethoscope,
  GraduationCap,
  Award,
  ShieldCheck,
  Scale,
  CheckCircle2,
  FileCheck2,
  FileText,
} from 'lucide-react';
import { BillDocument } from '../types';
import {
  CURRENCY_SYMBOLS,
  ACCENT_COLOR_MAP,
  DEFAULT_INVOICE_LOGO,
  normalizeTemplateId,
  getTemplateById,
} from '../data/templates';
import BillDocumentRenderer from './BillDocumentRenderer';

interface DocumentRendererProps {
  document: BillDocument;
  scale?: number;
  className?: string;
}

// Convert numbers to Indian/English words for GST invoices
function convertNumberToWords(amount: number): string {
  if (!amount || isNaN(amount)) return 'Zero';
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function numToWords(n: number): string {
    if (n === 0) return '';
    if (n < 20) return ones[n] + ' ';
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '') + ' ';
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + numToWords(n % 100);
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand ' + numToWords(n % 1000);
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh ' + numToWords(n % 100000);
    return numToWords(Math.floor(n / 10000000)) + ' Crore ' + numToWords(n % 10000000);
  }

  const integerPart = Math.floor(amount);
  const words = numToWords(integerPart).trim();
  return words ? words + ' Rupees Only' : 'Zero Rupees Only';
}

export default function DocumentRenderer({
  document,
  scale = 1,
  className = '',
}: DocumentRendererProps) {
  if (document.type === 'bill') {
    return <BillDocumentRenderer document={document} scale={scale} className={className} />;
  }

  const currencySymbol = CURRENCY_SYMBOLS[document.currency] || '₹';

  // Calculate totals
  const { subtotal, discountAmount, taxAmount, totalAmount } = useMemo(() => {
    const sub = document.items.reduce(
      (acc, it) => acc + (Number(it.qty) || 0) * (Number(it.rate) || 0),
      0
    );
    const disc = Math.min(sub, Math.max(0, Number(document.discount) || 0));
    const taxableBase = Math.max(0, sub - disc);
    const tax = (taxableBase * Math.max(0, Number(document.taxRate) || 0)) / 100;
    const tot = taxableBase + tax;
    return {
      subtotal: sub,
      discountAmount: disc,
      taxAmount: tax,
      totalAmount: tot,
    };
  }, [document.items, document.discount, document.taxRate]);

  // Formatter respecting INR and international numbers
  const formatAmount = (val: number) => {
    const locale = document.currency === 'INR' ? 'en-IN' : 'en-US';
    return Number(val || 0).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Identify active template & layout type
  const normTemplateId = normalizeTemplateId(document.template);
  const tplStyle = getTemplateById(normTemplateId);
  const layout = tplStyle?.layoutType || 'classic';

  const accentHex = tplStyle?.accentColor || ACCENT_COLOR_MAP[document.accent] || '#1e3a8a';
  const isInvoice = document.type === 'invoice';
  const docHeading = isInvoice ? 'INVOICE' : 'BILL';

  // Sender fallback details
  const senderName = document.senderName || tplStyle?.logoText || (isInvoice ? 'Studio Pulse' : 'Apex Corporate');
  const senderTagline = document.senderTagline || (isInvoice ? 'Technology & Enterprise AI Solutions' : 'Corporate Billing Services');
  const senderEmail = document.senderEmail || (isInvoice ? 'billing@studiopulse.design' : 'billing@apexcorp.com');
  const senderPhone = document.senderPhone || '+91 98765 43210';
  const senderAddress = document.senderAddress || (isInvoice ? '74 Nordic Creative Park, Indiranagar 100ft Rd, Bengaluru 560038' : '101 Cyber Towers, BKC, Mumbai 400051');
  const senderLogo = document.senderLogo || (document as any).logo || (isInvoice ? DEFAULT_INVOICE_LOGO : '');

  // Client fallback details
  const clientName = document.clientName || tplStyle?.sampleClient || (isInvoice ? 'NovaTech AI Solutions Inc.' : 'Stellar Innovations Pvt. Ltd.');
  const clientAddress = document.clientAddress || (isInvoice ? 'Tower 4, Level 11, TechPark SEZ, Outer Ring Road, Bengaluru 560103' : '45 Innovation Way, Tech Corridor, Bangalore 560100');
  const clientEmail = document.clientEmail || (isInvoice ? 'finance@novatech-ai.com' : 'accounts@stellarinnovations.com');
  const clientPhone = document.clientPhone || '+91 98765 43210';
  const paymentTerms = document.paymentTerms || 'Net 30';

  const bankRows = useMemo(() => {
    const raw = document.paymentNotes?.trim();
    if (!raw) {
      return [
        { label: 'Bank Name', value: 'HDFC Bank Ltd.' },
        { label: 'Account Number', value: isInvoice ? '50200012345678' : '50200084920194' },
        { label: 'IFSC Code', value: isInvoice ? 'HDFC0000123' : 'HDFC0001234' },
        { label: isInvoice ? 'UPI ID' : 'Branch', value: isInvoice ? 'billing@upi' : 'BKC Premier Mumbai' },
      ];
    }
    return raw
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
          return {
            label: line.slice(0, colonIdx).trim(),
            value: line.slice(colonIdx + 1).trim(),
          };
        }
        if (/bank|ltd|corp|inc/i.test(line)) {
          return { label: 'Bank Name', value: line.trim() };
        }
        return { label: '', value: line.trim() };
      });
  }, [document.paymentNotes, isInvoice]);

  // Dedicated 52 × 52px Business Logo Renderer for Invoice Headers (Left Position)
  const renderBusinessLogo = (customLogo?: string, altText?: string, isDarkBg: boolean = false) => {
    const logoUrl = customLogo || senderLogo || (isInvoice ? DEFAULT_INVOICE_LOGO : '');
    if (logoUrl) {
      return (
        <div
          style={{
            width: 52,
            height: 52,
            minWidth: 52,
            minHeight: 52,
            borderRadius: 10,
            overflow: 'hidden',
            border: isDarkBg ? '1.5px solid rgba(255,255,255,0.28)' : '1.5px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDarkBg ? 'rgba(255,255,255,0.96)' : '#ffffff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            flexShrink: 0,
          }}
        >
          <img
            src={logoUrl}
            alt={altText || senderName || 'Business Logo'}
            style={{
              maxWidth: 52,
              maxHeight: 52,
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      );
    }

    const initials = (senderName || 'SP')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'SP';

    return (
      <div
        style={{
          width: 52,
          height: 52,
          minWidth: 52,
          minHeight: 52,
          borderRadius: 10,
          background: isDarkBg ? 'rgba(255,255,255,0.18)' : '#ede9fe',
          border: isDarkBg ? '1.5px solid rgba(255,255,255,0.32)' : '1.5px solid #ddd6fe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isDarkBg ? '#ffffff' : '#6E5CB6',
          fontWeight: 800,
          fontSize: '1.05rem',
          letterSpacing: '0.04em',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          flexShrink: 0,
        }}
        title="Business Logo"
      >
        {initials}
      </div>
    );
  };

  // Status Badge Pill Renderer
  const renderStatusBadge = (statusStr?: string) => {
    const st = (statusStr || document.status || 'unpaid').toLowerCase();
    let bg = '#fef2f2';
    let text = '#dc2626';
    let border = '#fecaca';
    let label = 'UNPAID';

    if (st === 'paid') {
      bg = '#ecfdf5';
      text = '#059669';
      border = '#a7f3d0';
      label = 'PAID';
    } else if (st === 'pending') {
      bg = '#fffbeb';
      text = '#d97706';
      border = '#fde68a';
      label = 'PENDING';
    } else if (st === 'draft') {
      bg = '#f1f5f9';
      text = '#475569';
      border = '#cbd5e1';
      label = 'DRAFT';
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 8px',
          borderRadius: '9999px',
          fontSize: '0.64rem',
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          background: bg,
          color: text,
          border: `1px solid ${border}`,
        }}
      >
        {label}
      </span>
    );
  };

  const formatHeaderDate = (d?: string) => {
    if (!d) return '2026-09-06';
    const match = d.match(/^(\d{2})[-/.](\d{2})[-/.](\d{4})$/);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`;
    }
    return d;
  };

  const formatDisplayDate = (d?: string) => {
    if (!d) return '8 Sept 2026';
    const trimmed = d.trim();
    const dmy = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (dmy) {
      const day = parseInt(dmy[1], 10);
      const mIdx = parseInt(dmy[2], 10) - 1;
      const yr = dmy[3];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
      return `${day} ${months[mIdx] || ''} ${yr}`;
    }
    const ymd = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (ymd) {
      const yr = ymd[1];
      const mIdx = parseInt(ymd[2], 10) - 1;
      const day = parseInt(ymd[3], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
      return `${day} ${months[mIdx] || ''} ${yr}`;
    }
    return d;
  };

  // =========================================================================
  // 1. RETAIL STORE & POS BILL (layout === 'receipt', id: 'bold-emerald')
  // =========================================================================
  if (layout === 'receipt') {
    return (
      <div
        className={`a4-paper-sheet tpl-receipt ${className}`}
        id="printable-bill-canvas"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          '--builder-accent': accentHex,
        } as React.CSSProperties}
      >
        {/* Left-aligned Store Header with 52x52 Logo on Left */}
        <div className="receipt-header-box" style={{ background: tplStyle?.headerBg || '#00695C', display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px', textAlign: 'left', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ marginTop: '2px', flexShrink: 0 }}>
            {renderBusinessLogo(senderLogo, senderName, true)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="receipt-header-title" style={{ textAlign: 'left', wordBreak: 'break-word' }}>{senderName}</div>
            <div className="receipt-header-sub" style={{ textAlign: 'left', wordBreak: 'break-word' }}>{senderTagline || 'Retail Store & POS Billing'}</div>
            <div style={{ fontSize: '0.74rem', opacity: 0.88, marginTop: 4, wordBreak: 'break-word' }}>
              {senderAddress} | Ph: {senderPhone}
            </div>
            {document.senderTaxNumber && (
              <div style={{ fontSize: '0.72rem', opacity: 0.95, marginTop: 2, fontWeight: 700 }}>
                GSTIN: {document.senderTaxNumber}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {renderStatusBadge(document.status)}
          </div>
        </div>

        {/* POS Metadata Strip */}
        <div className="receipt-meta-strip" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px 12px', padding: '10px 14px', width: '100%', boxSizing: 'border-box' }}>
          <span>{isInvoice ? 'INVOICE' : 'RECEIPT'}: <strong>#{document.billNumber || 'INV-2026-1817'}</strong></span>
          <span>DATE: <strong>{formatHeaderDate(document.issueDate)}</strong></span>
          {document.dueDate && <span>DUE: <strong>{formatHeaderDate(document.dueDate)}</strong></span>}
          <span>TERMS: <strong>{paymentTerms}</strong></span>
        </div>

        {/* Customer Strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '0.82rem', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', color: '#1e293b', width: '100%', boxSizing: 'border-box', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#004d40', textTransform: 'uppercase', letterSpacing: '0.05em' }}>BILLED TO:</span>
            <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0f172a', marginTop: 2, wordBreak: 'break-word' }}>{clientName}</div>
            {clientAddress && <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 2, whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{clientAddress}</div>}
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.74rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
            {clientPhone && <div>Ph: <strong>{clientPhone}</strong></div>}
            {clientEmail && <div>{clientEmail}</div>}
            {document.clientTaxNumber && <div style={{ fontWeight: 700, color: '#004d40' }}>GSTIN: {document.clientTaxNumber}</div>}
          </div>
        </div>

        {/* Items Table with Dashed Borders */}
        <div className="a4-table-wrapper" style={{ margin: 0 }}>
          <table className="a4-items-table receipt-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ width: '52%', textAlign: 'left', padding: '10px 12px' }}>PARTICULARS</th>
                <th style={{ width: '14%', textAlign: 'center', padding: '10px 8px' }}>QTY</th>
                <th style={{ width: '17%', textAlign: 'right', padding: '10px 12px' }}>RATE</th>
                <th style={{ width: '17%', textAlign: 'right', padding: '10px 12px' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {document.items.map((item) => {
                const itemAmt = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                return (
                  <tr key={item.id}>
                    <td className="cell-desc" style={{ textAlign: 'left', padding: '10px 12px' }}>{item.description || 'Item'}</td>
                    <td className="cell-qty" style={{ textAlign: 'center', padding: '10px 8px', fontVariantNumeric: 'tabular-nums' }}>{item.qty}</td>
                    <td className="cell-rate" style={{ textAlign: 'right', padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(item.rate)}</td>
                    <td className="cell-amount" style={{ textAlign: 'right', padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(itemAmt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Section: Symmetrical 2-Column Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'start', marginTop: 'auto', paddingTop: '4px' }}>
          {/* Left: Bank & Settlement */}
          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 8, border: '1px dashed #cbd5e1', fontSize: '0.78rem' }}>
            <div style={{ fontWeight: 800, color: '#004d40', marginBottom: 6, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
              Payment &amp; Settlement Details
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, color: '#334155' }}>
              {bankRows.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>{r.label || 'Info'}:</span>
                  <strong style={{ color: '#0f172a' }}>{r.value}</strong>
                </div>
              ))}
            </div>
            {document.notes && (
              <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px dashed #cbd5e1', fontSize: '0.72rem', color: '#64748b' }}>
                <strong style={{ color: '#004d40' }}>Note: </strong>{document.notes}
              </div>
            )}
          </div>

          {/* Right: Totals Summary Card & Signature */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.80rem', display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Subtotal:</span>
                <strong style={{ color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(subtotal)}</strong>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                  <span>Discount:</span>
                  <strong style={{ fontVariantNumeric: 'tabular-nums' }}>-{currencySymbol}{formatAmount(discountAmount)}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Tax ({document.taxRate || 0}%):</span>
                <strong style={{ color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(taxAmount)}</strong>
              </div>
              <div style={{ borderTop: '1.5px dashed #00695c', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, color: tplStyle?.totalColor || '#004d40', fontSize: '1.1rem' }}>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Net Payable:</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(totalAmount)}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <div style={{ borderBottom: '1px solid #cbd5e1', width: 150, margin: '0 auto 4px' }} />
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Authorized Signatory</div>
            </div>
          </div>
        </div>

        {/* Authentic Barcode Strip */}
        <div className="receipt-barcode-wrap" style={{ marginTop: '12px' }}>
          <div className="receipt-barcode-bars">
            {[1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 2, 3, 1, 2].map((w, i) => (
              <div key={i} style={{ width: w * 2, height: '100%', background: '#0f172a' }} />
            ))}
          </div>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.18em', color: '#64748b', fontWeight: 600 }}>
            *{(document.billNumber || 'INV-2026-1817').replace(/\s+/g, '')}*
          </span>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Thank you for your business!</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. CREATIVE STUDIO SIDEBAR (layout === 'sidebar', id: 'warm-saffron')
  // =========================================================================
  if (layout === 'sidebar') {
    return (
      <div
        className={`a4-paper-sheet tpl-sidebar ${className}`}
        id="printable-bill-canvas"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          '--builder-accent': accentHex,
        } as React.CSSProperties}
      >
        <div className="tpl-sidebar-grid">
          {/* Left Vertical Brand Column with 52x52 Logo at Top-Left */}
          <div className="tpl-sidebar-left" style={{ background: tplStyle?.headerBg ? `linear-gradient(180deg, ${tplStyle.headerBg} 0%, #bf360c 100%)` : undefined }}>
            <div className="tpl-sidebar-brand">
              <div style={{ marginBottom: 14 }}>
                {renderBusinessLogo(senderLogo, senderName, true)}
              </div>
              <h3>{senderName}</h3>
              <p>{senderTagline || 'Creative Media & Production Studio'}</p>
              <div style={{ fontSize: '0.76rem', opacity: 0.92, marginTop: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span>{senderEmail}</span>
                <span>{senderPhone}</span>
                <span style={{ marginTop: 2 }}>{senderAddress}</span>
                {document.senderTaxNumber && (
                  <span style={{ fontWeight: 700, marginTop: 4, background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: 4 }}>
                    GSTIN: {document.senderTaxNumber}
                  </span>
                )}
              </div>
            </div>

            {/* Bank details inside sidebar */}
            <div style={{ background: 'rgba(255,255,255,0.14)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
                Payment Transfer
              </div>
              <div style={{ fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: 3, opacity: 0.95 }}>
                {bankRows.slice(0, 4).map((r, i) => (
                  <div key={i}>
                    {r.label ? <strong>{r.label}: </strong> : null}
                    {r.value}
                  </div>
                ))}
              </div>
            </div>

            {/* Instant Pay QR Badge */}
            <div style={{ background: 'rgba(255,255,255,0.18)', border: '1px dashed rgba(255,255,255,0.4)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
              <QrCode size={36} style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: '0.7rem', fontWeight: 700 }}>Scan to Settle Online</div>
              <div style={{ fontSize: '0.62rem', opacity: 0.85 }}>Instant UPI &amp; Direct Bank</div>
            </div>
          </div>

          {/* Right Main Charges Breakdown */}
          <div className="tpl-sidebar-right" style={{ flex: 1, minWidth: 0, boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #fed7aa', paddingBottom: 14, gap: 12, width: '100%', boxSizing: 'border-box' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: tplStyle?.accentColor || '#e65100', margin: 0, wordBreak: 'break-word' }}>
                    {docHeading}
                  </h2>
                  {renderStatusBadge(document.status)}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginTop: 2, wordBreak: 'break-word' }}>
                  #{document.billNumber || 'INV-2026-1817'}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b', flexShrink: 0 }}>
                <div>Date: <strong>{formatHeaderDate(document.issueDate)}</strong></div>
                {document.dueDate && <div>Due: <strong>{formatHeaderDate(document.dueDate)}</strong></div>}
                <div>Terms: <strong>{paymentTerms}</strong></div>
              </div>
            </div>

            {/* Client Card */}
            <div style={{ background: '#fffaf5', border: '1px solid #fed7aa', borderRadius: 8, padding: '12px 14px', fontSize: '0.82rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#e65100', textTransform: 'uppercase' }}>Billed To:</span>
              <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0f172a', marginTop: 2 }}>{clientName}</div>
              <div style={{ color: '#475569', whiteSpace: 'pre-line', marginTop: 2 }}>{clientAddress}</div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {clientEmail && <span>{clientEmail}</span>}
                {clientPhone && <span>Ph: {clientPhone}</span>}
                {document.clientTaxNumber && <span>GSTIN: {document.clientTaxNumber}</span>}
              </div>
            </div>

            {/* Items Table */}
            <div className="a4-table-wrapper" style={{ margin: 0 }}>
              <table className="a4-items-table sidebar-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ width: '52%', textAlign: 'left', padding: '10px 12px' }}>DELIVERABLE</th>
                    <th style={{ width: '14%', textAlign: 'center', padding: '10px 8px' }}>QTY</th>
                    <th style={{ width: '17%', textAlign: 'right', padding: '10px 12px' }}>RATE</th>
                    <th style={{ width: '17%', textAlign: 'right', padding: '10px 12px' }}>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {document.items.map((item) => (
                    <tr key={item.id}>
                      <td className="cell-desc" style={{ textAlign: 'left', padding: '10px 12px' }}>{item.description || 'Item'}</td>
                      <td className="cell-qty" style={{ textAlign: 'center', padding: '10px 8px', fontVariantNumeric: 'tabular-nums' }}>{item.qty}</td>
                      <td className="cell-rate" style={{ textAlign: 'right', padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(item.rate)}</td>
                      <td className="cell-amount" style={{ textAlign: 'right', padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount((Number(item.qty) || 0) * (Number(item.rate) || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals & Notes Symmetrical Split */}
            <div style={{ marginTop: 'auto', borderTop: '2px solid #fed7aa', paddingTop: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
                {/* Left: Customer Notes / Terms */}
                <div>
                  {document.notes ? (
                    <div style={{ background: '#fffaf5', border: '1px solid #fed7aa', borderRadius: 6, padding: '10px 12px', fontSize: '0.74rem', color: '#7c2d12' }}>
                      <strong style={{ display: 'block', marginBottom: 3, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em' }}>Deliverable Notes:</strong>
                      <span style={{ whiteSpace: 'pre-line' }}>{document.notes}</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.72rem', color: '#9a3412', fontStyle: 'italic', background: '#fffaf5', border: '1px solid #fed7aa', borderRadius: 6, padding: '10px 12px' }}>
                      Thank you for partnering with {senderName}.
                    </div>
                  )}
                  <div style={{ marginTop: 10, fontSize: '0.70rem', color: '#64748b' }}>
                    Payment Terms: <strong>{paymentTerms}</strong> · Due: <strong>{formatHeaderDate(document.dueDate)}</strong>
                  </div>
                </div>

                {/* Right: Totals Summary Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ background: '#fffaf5', border: '1px solid #fed7aa', borderRadius: 8, padding: '10px 14px', fontSize: '0.80rem', display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Subtotal:</span>
                      <strong style={{ color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(subtotal)}</strong>
                    </div>
                    {discountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                        <span>Discount:</span>
                        <strong style={{ fontVariantNumeric: 'tabular-nums' }}>-{currencySymbol}{formatAmount(discountAmount)}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Tax ({document.taxRate || 0}%):</span>
                      <strong style={{ color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(taxAmount)}</strong>
                    </div>
                    <div style={{ borderTop: '1.5px solid #fed7aa', margin: '4px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, color: tplStyle?.totalColor || '#e65100', fontSize: '1.1rem' }}>
                      <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Due:</span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(totalAmount)}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: 2 }}>
                    <div style={{ borderBottom: '1px solid #fed7aa', width: 150, margin: '0 auto 4px' }} />
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Authorized Signatory</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. MEDICAL & CLINICAL BILL (layout === 'clinical', id: 'medical-clinical')
  // =========================================================================
  if (layout === 'clinical') {
    return (
      <div
        className={`a4-paper-sheet tpl-clinical ${className}`}
        id="printable-bill-canvas"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          '--builder-accent': accentHex,
        } as React.CSSProperties}
      >
        {/* Healthcare Header with 52x52 Logo on Left */}
        <div className="clinical-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0 }}>
            <div style={{ flexShrink: 0, marginTop: 2 }}>
              {renderBusinessLogo(senderLogo, senderName)}
            </div>
            <span className="clinical-rx-badge" style={{ flexShrink: 0 }}>℞</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#00838f', margin: 0, wordBreak: 'break-word' }}>
                {senderName}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0', wordBreak: 'break-word' }}>
                {senderTagline || 'Multi-Specialty Clinic & Diagnostic Centre'}
              </p>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2, wordBreak: 'break-word' }}>
                {senderAddress} | Ph: {senderPhone}
              </div>
              {document.senderTaxNumber && (
                <div style={{ fontSize: '0.70rem', color: '#00838f', fontWeight: 700, marginTop: 2 }}>
                  CLINIC REG / GSTIN: {document.senderTaxNumber}
                </div>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#00838f', background: '#e0f7fa', padding: '4px 10px', borderRadius: 6, display: 'inline-block' }}>
                OFFICIAL RECORD
              </div>
              {renderStatusBadge(document.status)}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
              Bill #{document.billNumber || 'INV-2026-1817'}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
              Date: {formatHeaderDate(document.issueDate)}
            </div>
            {document.dueDate && (
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Due: {formatHeaderDate(document.dueDate)}
              </div>
            )}
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Terms: <strong>{paymentTerms}</strong>
            </div>
          </div>
        </div>

        {/* Patient / Client Details Box */}
        <div className="clinical-patient-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#e0f7fa', border: '1px solid #80deea', borderRadius: 10, padding: '14px 18px', fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: '#00696f', fontWeight: 800, fontSize: '0.70rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>PATIENT / CLIENT:</span>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.96rem', marginTop: 2 }}>{clientName}</div>
            {clientAddress && <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: 2, whiteSpace: 'pre-line' }}>{clientAddress}</div>}
          </div>
          <div>
            <span style={{ color: '#00696f', fontWeight: 800, fontSize: '0.70rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>CLINICAL RECORD &amp; TERMS:</span>
            <div style={{ fontSize: '0.76rem', color: '#0f172a', marginTop: 2 }}>
              Ref: <strong>#{document.billNumber || 'MED-2026'}</strong> · Terms: <strong>{paymentTerms}</strong>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: 2 }}>
              {[clientPhone, clientEmail].filter(Boolean).join(' · ')}
            </div>
            {document.clientTaxNumber && (
              <div style={{ fontSize: '0.72rem', color: '#00696f', fontWeight: 600, marginTop: 2 }}>
                Patient ID / UID: {document.clientTaxNumber}
              </div>
            )}
          </div>
        </div>

        {/* Medical Services Table */}
        <div className="a4-table-wrapper" style={{ margin: 0 }}>
          <table className="a4-items-table clinical-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ width: '52%', textAlign: 'left', padding: '10px 12px' }}>SERVICE / INVESTIGATION / CONSULTATION</th>
                <th style={{ width: '14%', textAlign: 'center', padding: '10px 8px' }}>UNITS</th>
                <th style={{ width: '17%', textAlign: 'right', padding: '10px 12px' }}>FEE</th>
                <th style={{ width: '17%', textAlign: 'right', padding: '10px 12px' }}>NET AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {document.items.map((item) => (
                <tr key={item.id}>
                  <td className="cell-desc" style={{ textAlign: 'left', padding: '10px 12px' }}>{item.description || 'Consultation'}</td>
                  <td className="cell-qty" style={{ textAlign: 'center', padding: '10px 8px', fontVariantNumeric: 'tabular-nums' }}>{item.qty}</td>
                  <td className="cell-rate" style={{ textAlign: 'right', padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(item.rate)}</td>
                  <td className="cell-amount" style={{ textAlign: 'right', padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount((Number(item.qty) || 0) * (Number(item.rate) || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Section: Left Remittance & Notes, Right Charges & Attending Physician */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'start', marginTop: 'auto', paddingTop: 16, borderTop: '2px solid #80deea' }}>
          {/* Left: Hospital Remittance & Patient Notes */}
          <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: 8, padding: '12px 14px', fontSize: '0.78rem' }}>
            <div style={{ fontWeight: 800, color: '#00696f', marginBottom: 6, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Hospital &amp; Clinical Remittance
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, color: '#334155' }}>
              {bankRows.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>{r.label || 'Details'}:</span>
                  <strong style={{ color: '#0f172a' }}>{r.value}</strong>
                </div>
              ))}
            </div>
            {document.notes && (
              <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px dashed #99f6e4', fontSize: '0.72rem', color: '#0f766e' }}>
                <strong>Clinical Notes: </strong>{document.notes}
              </div>
            )}
          </div>

          {/* Right: Charges Breakdown & Physician Signature */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: 8, padding: '12px 14px', fontSize: '0.80rem', display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Subtotal:</span>
                <strong style={{ color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(subtotal)}</strong>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                  <span>Discount:</span>
                  <strong style={{ fontVariantNumeric: 'tabular-nums' }}>-{currencySymbol}{formatAmount(discountAmount)}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Tax / Cess ({document.taxRate || 0}%):</span>
                <strong style={{ color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(taxAmount)}</strong>
              </div>
              <div style={{ borderTop: '1.5px solid #80deea', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, color: '#00838f', fontSize: '1.15rem' }}>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Payable:</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(totalAmount)}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: '#00838f', fontSize: '0.72rem', fontWeight: 700, marginBottom: 4 }}>
                <Stethoscope size={14} />
                <span>Attending Medical Officer</span>
              </div>
              <div style={{ borderBottom: '1px solid #94a3b8', width: 170, margin: '0 auto 4px' }} />
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Signature &amp; Clinical Stamp</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. EXECUTIVE LEGAL & ADVISORY (layout === 'editorial', id: 'corporate-navy')
  // =========================================================================
  if (layout === 'editorial') {
    return (
      <div
        className={`a4-paper-sheet tpl-editorial ${className}`}
        id="printable-bill-canvas"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          '--builder-accent': accentHex,
        } as React.CSSProperties}
      >
        {/* Formal Navy Header Bar with 52x52 Logo on Left */}
        <div className="editorial-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 20px', gap: 16, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0 }}>
            <div style={{ flexShrink: 0, marginTop: 2 }}>
              {renderBusinessLogo(senderLogo, senderName, true)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 700, margin: 0, letterSpacing: '0.02em', color: '#ffffff', wordBreak: 'break-word' }}>
                {senderName}
              </h2>
              <div style={{ fontSize: '0.78rem', opacity: 0.88, marginTop: 3, fontFamily: 'sans-serif', color: '#e2e8f0', wordBreak: 'break-word' }}>
                {senderTagline || 'Technology & Enterprise Solutions'}
              </div>
              <div style={{ fontSize: '0.72rem', opacity: 0.82, marginTop: 2, fontFamily: 'sans-serif', color: '#cbd5e1', wordBreak: 'break-word' }}>
                {[senderAddress, senderPhone, senderEmail].filter(Boolean).join(' · ')}
              </div>
              {document.senderTaxNumber && (
                <div style={{ fontSize: '0.70rem', color: '#93c5fd', marginTop: 2, fontFamily: 'sans-serif', fontWeight: 600 }}>
                  GSTIN / PAN: {document.senderTaxNumber}
                </div>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontFamily: 'sans-serif', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.06em', color: '#ffffff' }}>
                {docHeading}
              </span>
              {renderStatusBadge(document.status)}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9, color: '#e2e8f0' }}>
              Ref #{document.billNumber || 'INV-2026-1817'}
            </div>
            <div style={{ fontSize: '0.74rem', opacity: 0.8, color: '#cbd5e1' }}>
              Date: {formatHeaderDate(document.issueDate)}
            </div>
            {document.dueDate && (
              <div style={{ fontSize: '0.74rem', opacity: 0.8, color: '#cbd5e1' }}>
                Due: {formatHeaderDate(document.dueDate)}
              </div>
            )}
            <div style={{ fontSize: '0.74rem', opacity: 0.8, color: '#cbd5e1' }}>
              Terms: <strong>{paymentTerms}</strong>
            </div>
          </div>
        </div>

        {/* Dynamic Client & Matter Reference Box */}
        <div className="editorial-matter-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', borderLeft: '4px solid #0d2137', borderRadius: '0 8px 8px 0', padding: '14px 18px', fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.70rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Client:</span>
            <strong style={{ color: '#0f172a', fontSize: '0.96rem' }}>{clientName}</strong>
            <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 2 }}>{clientAddress}</div>
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.70rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Contact &amp; Tax ID:</span>
            <span style={{ color: '#0d2137', fontWeight: 600 }}>{[clientEmail, clientPhone].filter(Boolean).join(' · ')}</span>
            {document.clientTaxNumber && (
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>GSTIN: <strong>{document.clientTaxNumber}</strong></div>
            )}
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.70rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Payment Terms:</span>
            <strong style={{ color: '#0d2137' }}>{paymentTerms}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.70rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>Matter / PO Ref:</span>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{document.poNumber ? `#${document.poNumber}` : `#${document.billNumber || 'INV-2026'}`}</span>
          </div>
        </div>

        {/* Legal Items Table */}
        <div className="a4-table-wrapper" style={{ margin: 0 }}>
          <table className="a4-items-table editorial-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ width: '52%', textAlign: 'left', padding: '10px 12px' }}>PROFESSIONAL SERVICES &amp; COUNSEL</th>
                <th style={{ width: '14%', textAlign: 'center', padding: '10px 8px' }}>HOURS/QTY</th>
                <th style={{ width: '17%', textAlign: 'right', padding: '10px 12px' }}>RATE</th>
                <th style={{ width: '17%', textAlign: 'right', padding: '10px 12px' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {document.items.map((item) => (
                <tr key={item.id}>
                  <td className="cell-desc" style={{ textAlign: 'left', padding: '10px 12px', fontFamily: 'sans-serif' }}>{item.description || 'Professional Services'}</td>
                  <td className="cell-qty" style={{ textAlign: 'center', padding: '10px 8px', fontFamily: 'sans-serif', fontVariantNumeric: 'tabular-nums' }}>{item.qty}</td>
                  <td className="cell-rate" style={{ textAlign: 'right', padding: '10px 12px', fontFamily: 'sans-serif', fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(item.rate)}</td>
                  <td className="cell-amount" style={{ textAlign: 'right', padding: '10px 12px', fontFamily: 'sans-serif', fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount((Number(item.qty) || 0) * (Number(item.rate) || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Trust Account Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start', marginTop: 'auto', borderTop: '2px solid #0d2137', paddingTop: 16 }}>
          {/* Left: Escrow / Wire Instructions */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 16px', fontSize: '0.78rem', fontFamily: 'sans-serif' }}>
            <div style={{ fontWeight: 800, color: '#0d2137', marginBottom: 8, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ESCROW &amp; WIRE INSTRUCTIONS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, color: '#334155' }}>
              {bankRows.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>{r.label || 'Wire'}:</span>
                  <strong style={{ color: '#0f172a' }}>{r.value}</strong>
                </div>
              ))}
            </div>
            {document.notes && (
              <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #e2e8f0', fontSize: '0.72rem', color: '#475569' }}>
                <strong style={{ color: '#0d2137' }}>Counsel Notes: </strong>{document.notes}
              </div>
            )}
          </div>

          {/* Right: Fee Summary Card & Partner Signature */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'sans-serif' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '12px 16px', fontSize: '0.80rem', display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Subtotal</span>
                <strong style={{ color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(subtotal)}</strong>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                  <span>Discount / Retainer Credit</span>
                  <strong style={{ fontVariantNumeric: 'tabular-nums' }}>-{currencySymbol}{formatAmount(discountAmount)}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Tax ({document.taxRate || 0}%)</span>
                <strong style={{ color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(taxAmount)}</strong>
              </div>
              <div style={{ borderTop: '1.5px solid #0d2137', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, color: '#0d2137', fontSize: '1.15rem' }}>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Fee Due:</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(totalAmount)}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <div style={{ borderBottom: '1px solid #94a3b8', width: 180, margin: '0 auto 4px' }} />
              <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600 }}>Authorized Partner Signature</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. ACADEMY & TUITION FEE RECEIPT (layout === 'academic', id: 'academia-blue')
  // =========================================================================
  if (layout === 'academic') {
    return (
      <div
        className={`a4-paper-sheet tpl-academic ${className}`}
        id="printable-bill-canvas"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          '--builder-accent': accentHex,
          position: 'relative',
          overflow: 'hidden',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: '30px 38px 24px 38px',
          minHeight: 1080,
          maxWidth: 800,
          margin: '0 auto',
          boxSizing: 'border-box',
          border: '1.5px solid #C7D2FE',
          borderRadius: 12,
        } as React.CSSProperties}
      >
        {/* Royal Academia Blue Header with Gold Accent */}
        <div
          className="academic-header"
          style={{
            background: 'linear-gradient(135deg, #1E2B69 0%, #283593 100%)',
            borderBottom: '3px solid #E2B93B',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderRadius: 8,
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(40,53,147,0.18)',
            gap: 16,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0 }}>
            <div style={{ flexShrink: 0, marginTop: 2 }}>
              {renderBusinessLogo(senderLogo, senderName, true)}
            </div>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.12)',
                border: '1.5px solid #E2B93B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <GraduationCap size={28} color="#E2B93B" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#FFFFFF', letterSpacing: '0.02em', lineHeight: 1.2, wordBreak: 'break-word' }}>
                {senderName || 'Cambridge Global Academy'}
              </h2>
              <div style={{ fontSize: '0.74rem', color: '#FCD34D', fontWeight: 700, fontStyle: 'italic', marginTop: 3 }}>
                {senderTagline || 'Academic Affairs & Bursar Office'}
              </div>
              <div style={{ fontSize: '0.70rem', color: '#CBD5E1', marginTop: 2, wordBreak: 'break-word' }}>
                {[senderAddress, senderPhone].filter(Boolean).join(' · ')}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
              <div
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  color: '#1E2B69',
                  background: '#E2B93B',
                  padding: '3px 10px',
                  borderRadius: 4,
                  display: 'inline-block',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                AUTUMN SEMESTER 2026-27
              </div>
              {renderStatusBadge(document.status)}
            </div>
            <div style={{ fontSize: '0.94rem', fontWeight: 900, letterSpacing: '0.02em', color: '#FFFFFF' }}>
              OFFICIAL FEE RECEIPT #{document.billNumber || 'REC-2026-089'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>
              Date: <strong>{formatHeaderDate(document.issueDate) || '2026-09-06'}</strong>
            </div>
            {document.dueDate && (
              <div style={{ fontSize: '0.70rem', color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
                Due: <strong>{formatHeaderDate(document.dueDate)}</strong>
              </div>
            )}
            <div style={{ fontSize: '0.70rem', color: '#FCD34D', marginTop: 2 }}>
              Terms: <strong>{paymentTerms}</strong>
            </div>
          </div>
        </div>

        {/* Symmetrical Dual Information Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'stretch' }}>
          <div
            style={{
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: 8,
              padding: '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <div>
              <div style={{ color: '#283593', fontWeight: 800, fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building2 size={13} color="#283593" />
                <span>ACADEMIC INSTITUTION / BURSAR</span>
              </div>
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.94rem', marginTop: 4 }}>
                {senderName}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: 2 }}>
                {senderAddress}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#283593', fontWeight: 600, marginTop: 2 }}>
                {[senderEmail, senderPhone].filter(Boolean).join(' · ')}
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1E293B', marginTop: 10, paddingTop: 4, borderTop: '1px solid #E2E8F0' }}>
              INST REG / GSTIN: {document.senderTaxNumber || '27AABCA1234F1Z9'}
            </div>
          </div>

          <div
            style={{
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: 8,
              padding: '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <div>
              <div style={{ color: '#283593', fontWeight: 800, fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={13} color="#283593" />
                <span>STUDENT &amp; ENROLMENT PARTICULARS</span>
              </div>
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.94rem', marginTop: 4 }}>
                {clientName}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: 2 }}>
                {clientAddress}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#283593', fontWeight: 600, marginTop: 2 }}>
                {[clientEmail, clientPhone].filter(Boolean).join(' · ')}
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1E293B', marginTop: 10, paddingTop: 4, borderTop: '1px solid #E2E8F0' }}>
              ENROLMENT REF: #{document.billNumber || 'CGA-2026-089'} · Terms: {paymentTerms}
            </div>
          </div>
        </div>

        {/* Fee Particulars Table */}
        <div style={{ border: '1.5px solid #283593', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#283593', color: '#FFFFFF' }}>
                <th style={{ width: '52%', textAlign: 'left', padding: '11px 14px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  FEE PARTICULARS / HEAD
                </th>
                <th style={{ width: '14%', textAlign: 'center', padding: '11px 8px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  TERMS
                </th>
                <th style={{ width: '16%', textAlign: 'right', padding: '11px 10px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  FEE RATE
                </th>
                <th style={{ width: '18%', textAlign: 'right', padding: '11px 14px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  NET AMOUNT
                </th>
              </tr>
            </thead>
            <tbody>
              {document.items.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0', background: idx % 2 === 1 ? '#F8FAFC' : '#FFFFFF' }}>
                  <td style={{ textAlign: 'left', padding: '11px 14px', fontWeight: 700, color: '#0F172A', fontSize: '0.82rem' }}>
                    {item.description || 'Academic Fee'}
                  </td>
                  <td style={{ textAlign: 'center', padding: '11px 8px', fontWeight: 600, fontSize: '0.80rem', color: '#334155' }}>
                    {item.qty}
                  </td>
                  <td style={{ textAlign: 'right', padding: '11px 10px', fontVariantNumeric: 'tabular-nums', fontSize: '0.80rem', color: '#334155' }}>
                    {currencySymbol}{formatAmount(item.rate)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '11px 14px', fontWeight: 800, color: '#283593', fontVariantNumeric: 'tabular-nums', fontSize: '0.84rem' }}>
                    {currencySymbol}{formatAmount((Number(item.qty) || 0) * (Number(item.rate) || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Seal & Registrar Stamp */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'start', marginTop: 'auto', borderTop: '1.5px solid #283593', paddingTop: 14 }}>
          {/* Left: Official Seal & Fee Remittance Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                border: '1.5px dashed #283593',
                borderRadius: 6,
                padding: '8px 12px',
                color: '#283593',
                fontSize: '0.72rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#EEF2FF',
              }}
            >
              <Award size={18} color="#283593" />
              <span>[OFFICIAL SEAL: Bursar &amp; Accounts Registry - Verified]</span>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: '0.76rem' }}>
              <div style={{ fontWeight: 800, color: '#283593', marginBottom: 4, textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                Bank &amp; Fee Remittance Details
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, color: '#334155' }}>
                {bankRows.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>{r.label || 'Account'}:</span>
                    <strong style={{ color: '#0f172a' }}>{r.value}</strong>
                  </div>
                ))}
              </div>
              {document.notes && (
                <div style={{ marginTop: 6, paddingTop: 4, borderTop: '1px dashed #cbd5e1', fontSize: '0.70rem', color: '#475569' }}>
                  <strong>Notes: </strong>{document.notes}
                </div>
              )}
            </div>
          </div>

          {/* Right: Fee Summary & Registrar Signature */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: '#f8fafc', border: '1px solid #c7d2fe', borderRadius: 8, padding: '12px 14px', fontSize: '0.80rem', display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Tuition Subtotal:</span>
                <strong style={{ color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(subtotal)}</strong>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                  <span>Scholarship / Concession:</span>
                  <strong style={{ fontVariantNumeric: 'tabular-nums' }}>-{currencySymbol}{formatAmount(discountAmount)}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>University Cess / Tax ({document.taxRate || 0}%):</span>
                <strong style={{ color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(taxAmount)}</strong>
              </div>
              <div style={{ borderTop: '1.5px solid #283593', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 900, color: '#283593', fontSize: '1.2rem' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Net Tuition Due:</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(totalAmount)}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <div style={{ borderBottom: '1px solid #9fa8da', width: 180, margin: '0 auto 4px' }} />
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Registrar Authorized Signature</div>
            </div>
          </div>
        </div>

        {/* Footnote Motto */}
        <div
          style={{
            paddingTop: 6,
            textAlign: 'center',
            borderTop: '1px dashed #CBD5E1',
            fontSize: '0.64rem',
            color: '#64748B',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          VERITAS &nbsp;•&nbsp; VIRTUS &nbsp;•&nbsp; EXCELLENTIA &nbsp;•&nbsp; OFFICIAL ACADEMIC RECORD
        </div>
      </div>
    );
  }

  // =========================================================================
  // 6. INDIAN GST TAX INVOICE (layout === 'gst', id: 'gst-tax-invoice')
  // =========================================================================
  if (layout === 'gst') {
    const halfTaxRate = (Number(document.taxRate) || 0) / 2;
    const halfTaxAmt = taxAmount / 2;

    return (
      <div
        className={`a4-paper-sheet tpl-gst ${className}`}
        id="printable-bill-canvas"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          '--builder-accent': accentHex,
        } as React.CSSProperties}
      >
        {/* Statutory GST Maroon Header with 52x52 Logo on Left */}
        <div className="gst-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 20px', gap: 16, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0 }}>
            <div style={{ flexShrink: 0, marginTop: 2 }}>
              {renderBusinessLogo(senderLogo, senderName, true)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, wordBreak: 'break-word' }}>
                {senderName}
              </h2>
              <div style={{ fontSize: '0.78rem', opacity: 0.95, marginTop: 3 }}>
                GSTIN: <strong>{document.senderTaxNumber || '22AAAAA0000A1Z5'}</strong> | State: 29 (Karnataka)
              </div>
              <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: 2, wordBreak: 'break-word' }}>
                {[senderEmail, senderPhone].filter(Boolean).join(' · ')}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                TAX INVOICE (GST)
              </span>
              {renderStatusBadge(document.status)}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
              Invoice #{document.billNumber || 'INV-2026-1817'}
            </div>
            <div style={{ fontSize: '0.74rem', opacity: 0.85 }}>
              Date: {formatHeaderDate(document.issueDate)}
            </div>
            {document.dueDate && (
              <div style={{ fontSize: '0.74rem', opacity: 0.85 }}>
                Due: {formatHeaderDate(document.dueDate)}
              </div>
            )}
            <div style={{ fontSize: '0.74rem', opacity: 0.85 }}>
              Terms: <strong>{paymentTerms}</strong>
            </div>
          </div>
        </div>

        {/* GST Parties Grid */}
        <div className="gst-parties-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'stretch' }}>
          <div className="gst-party-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#880e4f', marginBottom: 2, fontSize: '0.70rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>DETAILS OF SUPPLIER:</div>
              <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#0f172a' }}>{senderName}</div>
              <div style={{ color: '#475569', fontSize: '0.76rem', whiteSpace: 'pre-line', marginTop: 2 }}>{senderAddress}</div>
              <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: 2 }}>
                {[senderEmail, senderPhone].filter(Boolean).join(' · ')}
              </div>
            </div>
            <div style={{ marginTop: 8, paddingTop: 4, borderTop: '1px solid #fbcfe8', fontSize: '0.76rem' }}>
              GSTIN: <strong>{document.senderTaxNumber || '22AAAAA0000A1Z5'}</strong>
            </div>
          </div>
          <div className="gst-party-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#880e4f', marginBottom: 2, fontSize: '0.70rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>DETAILS OF RECIPIENT (BILLED TO):</div>
              <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#0f172a' }}>{clientName}</div>
              <div style={{ color: '#475569', fontSize: '0.76rem', whiteSpace: 'pre-line', marginTop: 2 }}>{clientAddress}</div>
              <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: 2 }}>
                {[clientEmail, clientPhone].filter(Boolean).join(' · ')}
              </div>
            </div>
            <div style={{ marginTop: 8, paddingTop: 4, borderTop: '1px solid #fbcfe8', fontSize: '0.76rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>GSTIN: <strong>{document.clientTaxNumber || '29AAAAA0000A1Z5'}</strong></span>
              <span>Terms: <strong>{paymentTerms}</strong></span>
            </div>
          </div>
        </div>

        {/* Items Table with HSN/SAC Column */}
        <div className="a4-table-wrapper" style={{ margin: 0 }}>
          <table className="a4-items-table gst-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ width: '45%', textAlign: 'left', padding: '10px 12px' }}>DESCRIPTION OF GOODS / SERVICES</th>
                <th style={{ width: '15%', textAlign: 'center', padding: '10px 8px' }}>HSN/SAC</th>
                <th style={{ width: '10%', textAlign: 'center', padding: '10px 8px' }}>QTY</th>
                <th style={{ width: '15%', textAlign: 'right', padding: '10px 12px' }}>RATE</th>
                <th style={{ width: '15%', textAlign: 'right', padding: '10px 12px' }}>TAXABLE AMT</th>
              </tr>
            </thead>
            <tbody>
              {document.items.map((item, idx) => (
                <tr key={item.id}>
                  <td className="cell-desc" style={{ textAlign: 'left', padding: '10px 12px' }}>{item.description || 'Service Deliverable'}</td>
                  <td style={{ textAlign: 'center', fontSize: '0.76rem', color: '#64748b', padding: '10px 8px' }}>
                    {idx % 2 === 0 ? '998314' : '998315'}
                  </td>
                  <td className="cell-qty" style={{ textAlign: 'center', padding: '10px 8px', fontVariantNumeric: 'tabular-nums' }}>{item.qty}</td>
                  <td className="cell-rate" style={{ textAlign: 'right', padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(item.rate)}</td>
                  <td className="cell-amount" style={{ textAlign: 'right', padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount((Number(item.qty) || 0) * (Number(item.rate) || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GST Split & Amount in Words */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginTop: 'auto', borderTop: '2px solid #880e4f', paddingTop: 14 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="gst-words-box" style={{ margin: 0, padding: '10px 14px' }}>
              <strong>Amount in Words: </strong>
              <span>{convertNumberToWords(totalAmount)}</span>
            </div>

            {/* Structured Bank & UPI details */}
            <div style={{ background: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: 8, padding: '10px 14px', fontSize: '0.74rem' }}>
              <div style={{ fontWeight: 800, color: '#880e4f', marginBottom: 4, fontSize: '0.70rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Bank &amp; Electronic Settlement Details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', color: '#334155' }}>
                {bankRows.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>{r.label || 'Bank'}:</span>
                    <strong style={{ color: '#0f172a' }}>{r.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            {document.notes && (
              <div style={{ fontSize: '0.72rem', color: '#64748b', background: '#f8fafc', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#880e4f' }}>Note: </strong>{document.notes}
              </div>
            )}
            <div style={{ fontSize: '0.68rem', color: '#64748b', lineHeight: 1.35 }}>
              Declaration: We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct.
            </div>
          </div>

          <div style={{ width: 260, fontSize: '0.80rem', display: 'flex', flexDirection: 'column', gap: 6, background: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: 8, padding: '12px 14px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Taxable Value:</span>
              <strong style={{ color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(subtotal - discountAmount)}</strong>
            </div>
            {taxAmount > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>CGST ({halfTaxRate.toFixed(1)}%):</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums', color: '#0f172a', fontWeight: 600 }}>{currencySymbol}{formatAmount(halfTaxAmt)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>SGST ({halfTaxRate.toFixed(1)}%):</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums', color: '#0f172a', fontWeight: 600 }}>{currencySymbol}{formatAmount(halfTaxAmt)}</span>
                </div>
              </>
            )}
            <div style={{ borderTop: '1.5px solid #880e4f', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.15rem', fontWeight: 800, color: '#880e4f' }}>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Invoice:</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{currencySymbol}{formatAmount(totalAmount)}</span>
            </div>
            <div style={{ marginTop: 12, borderTop: '1px solid #cbd5e1', paddingTop: 4, textAlign: 'center', fontSize: '0.70rem', color: '#64748b' }}>
              Authorized Signatory &amp; Stamp
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 7. MODERN MINIMAL (layout === 'minimal', id: 'modern-minimal')
  // =========================================================================
  if (layout === 'minimal') {
    return (
      <div
        className={`a4-paper-sheet tpl-minimal ${className}`}
        id="printable-bill-canvas"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          '--builder-accent': accentHex,
          position: 'relative',
          overflow: 'hidden',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 1080,
          maxWidth: 800,
          margin: '0 auto',
          boxSizing: 'border-box',
          padding: '38px 42px',
          gap: '24px',
          color: '#111827',
          boxShadow: '0 4px 30px rgba(0,0,0,0.06)',
          borderRadius: '12px',
        } as React.CSSProperties}
      >
        {/* Header with 52x52 Logo on Left */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: 0 }}>
            <div style={{ marginTop: '2px', flexShrink: 0 }}>
              {renderBusinessLogo(senderLogo, senderName)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.5px', color: '#111827', lineHeight: 1.15, wordBreak: 'break-word' }}>
                {senderName}
              </div>
              {senderTagline && (
                <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '3px', wordBreak: 'break-word' }}>
                  {senderTagline}
                </div>
              )}
              <div style={{ fontSize: '0.74rem', color: '#4B5563', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px 12px', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={12} color="#6B7280" />
                  <span>{senderEmail}</span>
                </span>
                {senderPhone && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={12} color="#6B7280" />
                    <span>{senderPhone}</span>
                  </span>
                )}
              </div>
              {senderAddress && (
                <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '3px', maxWidth: '340px', lineHeight: 1.35, wordBreak: 'break-word' }}>
                  {senderAddress}
                </div>
              )}
              {document.senderTaxNumber && (
                <div style={{ fontSize: '0.72rem', color: '#111827', marginTop: '4px', fontWeight: 700 }}>
                  GSTIN / PAN: {document.senderTaxNumber}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1, color: '#111827' }}>
                {docHeading}
              </span>
              {renderStatusBadge(document.status)}
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#4B5563' }}>
              #{document.billNumber || 'INV-2026-1817'}
            </div>
            {document.poNumber && (
              <div style={{ fontSize: '0.74rem', color: '#6B7280', marginTop: '3px' }}>
                PO: #{document.poNumber}
              </div>
            )}
          </div>
        </div>

        {/* Parties & Timelines */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '24px',
            padding: '16px 0',
            borderTop: '1px solid #E5E7EB',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <div>
            <div style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: '6px' }}>
              BILLED TO
            </div>
            <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#111827' }}>
              {clientName}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#4B5563', marginTop: '4px', whiteSpace: 'pre-line', lineHeight: 1.45 }}>
              {clientAddress}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#4B5563', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {clientEmail && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Mail size={12} color="#6B7280" />
                  {clientEmail}
                </span>
              )}
              {clientPhone && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Phone size={12} color="#6B7280" />
                  {clientPhone}
                </span>
              )}
              {document.clientTaxNumber && (
                <span style={{ fontWeight: 600, color: '#111827' }}>
                  GSTIN / Tax ID: {document.clientTaxNumber}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: '8px' }}>
              INVOICE TIMELINES &amp; TERMS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '230px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6B7280' }}>Issue Date:</span>
                <strong style={{ color: '#111827' }}>{formatDisplayDate(document.issueDate)}</strong>
              </div>
              {document.dueDate && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6B7280' }}>Payment Due:</span>
                  <strong style={{ color: '#dc2626' }}>{formatDisplayDate(document.dueDate)}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6B7280' }}>Payment Terms:</span>
                <strong style={{ color: '#111827' }}>{paymentTerms}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ width: '100%', overflow: 'hidden' }}>
          <table className="a4-items-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderTop: '2px solid #111827', borderBottom: '2px solid #111827', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#111827' }}>
                <th style={{ textAlign: 'center', padding: '10px 6px', width: '6%' }}>#</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', width: '50%' }}>ITEM DESCRIPTION</th>
                <th style={{ textAlign: 'center', padding: '10px 6px', width: '12%' }}>QTY</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', width: '16%' }}>RATE ({currencySymbol})</th>
                <th style={{ textAlign: 'right', padding: '10px 12px', width: '16%' }}>AMOUNT ({currencySymbol})</th>
              </tr>
            </thead>
            <tbody>
              {document.items.map((it, idx) => {
                const amt = (Number(it.qty) || 0) * (Number(it.rate) || 0);
                return (
                  <tr key={it.id || idx} style={{ borderBottom: '1px solid #F3F4F6', fontSize: '0.82rem' }}>
                    <td style={{ padding: '12px 6px', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '12px 12px', textAlign: 'left', fontWeight: 600, color: '#111827' }}>
                      {it.description || 'Untitled Item'}
                    </td>
                    <td style={{ padding: '12px 6px', textAlign: 'center', color: '#4B5563', fontVariantNumeric: 'tabular-nums' }}>
                      {it.qty}
                    </td>
                    <td style={{ padding: '12px 12px', textAlign: 'right', color: '#4B5563', fontVariantNumeric: 'tabular-nums' }}>
                      {currencySymbol}{formatAmount(it.rate)}
                    </td>
                    <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 700, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>
                      {currencySymbol}{formatAmount(amt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Section: Left (Bank details + Notes) and Right (Totals + Signature) */}
        <div
          style={{
            marginTop: 'auto',
            display: 'grid',
            gridTemplateColumns: '1.15fr 1fr',
            gap: '24px',
            alignItems: 'start',
            paddingTop: '8px',
          }}
        >
          {/* Left Column: Settlement & Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                background: '#F9FAFB',
                padding: '12px 14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Landmark size={14} color="#374151" />
                <span>BANK &amp; PAYMENT SETTLEMENT</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px', fontSize: '0.74rem' }}>
                {bankRows.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: 110, color: '#6B7280', flexShrink: 0 }}>{r.label || 'Note'}</span>
                    <span style={{ width: 14, color: '#9CA3AF', textAlign: 'center' }}>:</span>
                    <span style={{ color: '#111827', fontWeight: 600 }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {document.notes && (
              <div
                style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  padding: '10px 14px',
                }}
              >
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Customer Notes &amp; Terms
                </div>
                <div style={{ fontSize: '0.74rem', color: '#4B5563', lineHeight: 1.45, whiteSpace: 'pre-line' }}>
                  {document.notes}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Totals Summary & Authorized Signature */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                background: '#FFFFFF',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#4B5563' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>
                  {currencySymbol}{formatAmount(subtotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#DC2626' }}>
                  <span>Discount</span>
                  <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    -{currencySymbol}{formatAmount(discountAmount)}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#4B5563' }}>
                <span>Tax ({document.taxRate || 0}%)</span>
                <span style={{ fontWeight: 600, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>
                  {currencySymbol}{formatAmount(taxAmount)}
                </span>
              </div>

              <div style={{ borderTop: '1.5px solid #E5E7EB', margin: '4px 0' }} />

              <div
                style={{
                  background: '#111827',
                  color: '#FFFFFF',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.85, fontWeight: 700 }}>
                  TOTAL DUE
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
                  {currencySymbol}{formatAmount(totalAmount)}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <div style={{ borderBottom: '1px solid #CBD5E1', width: '160px', margin: '0 auto 6px' }} />
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 8. CLASSIC PROFESSIONAL (layout === 'classic', id: 'classic-pro', or fallback)
  // =========================================================================
  return (
    <div
      className={`a4-paper-sheet tpl-classic ${className}`}
      id="printable-bill-canvas"
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
        '--builder-accent': accentHex,
      } as React.CSSProperties}
    >
      {/* Classic Corporate Header */}
      <div className="a4-tpl-classic-header" style={{ width: '100%', boxSizing: 'border-box', padding: '20px 22px', gap: '16px' }}>
        <div className="a4-classic-left" style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: 0 }}>
          <div style={{ marginTop: '2px', flexShrink: 0 }}>
            {renderBusinessLogo(senderLogo, senderName, true)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="a4-classic-company" style={{ wordBreak: 'break-word' }}>{senderName}</h2>
            {senderTagline && <p className="a4-classic-tagline" style={{ wordBreak: 'break-word' }}>{senderTagline}</p>}
            <div className="a4-classic-contact" style={{ display: 'flex', alignItems: 'center', gap: '6px 12px', flexWrap: 'wrap', marginTop: '8px' }}>
              <span className="contact-item">
                <Mail size={12} />
                <span>{senderEmail}</span>
              </span>
              {senderPhone && (
                <span className="contact-item">
                  <Phone size={12} />
                  <span>{senderPhone}</span>
                </span>
              )}
              {document.senderTaxNumber && (
                <span className="contact-item">
                  <FileText size={12} />
                  <span>GSTIN: {document.senderTaxNumber}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="a4-classic-right" style={{ flexShrink: 0, textAlign: 'right', minWidth: '175px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <h3 className="a4-classic-title" style={{ margin: 0 }}>{docHeading}</h3>
            {renderStatusBadge(document.status)}
          </div>
          <p className="a4-classic-code">#{document.billNumber || (isInvoice ? 'INV-2026-0042' : 'BL-2026-5479')}</p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', marginTop: '6px' }}>
            <p className="a4-classic-date" style={{ margin: 0 }}>
              <Calendar size={12} />
              <span>Date: {formatHeaderDate(document.issueDate)}</span>
            </p>
            {document.dueDate && (
              <p className="a4-classic-date" style={{ margin: 0, color: '#fca5a5' }}>
                <Calendar size={12} color="#fca5a5" />
                <span>Due Date: {formatHeaderDate(document.dueDate)}</span>
              </p>
            )}
            {paymentTerms && (
              <p className="a4-classic-date" style={{ margin: 0, color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.74rem' }}>
                <FileText size={12} />
                <span>Terms: {paymentTerms}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Address Cards Grid */}
      <div className="a4-classic-address-grid">
        <div className="a4-classic-addr-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
          <div>
            <div className="a4-addr-label">
              <Building2 size={15} color="#2563eb" />
              <span>{isInvoice ? 'INVOICE FROM' : 'BILL FROM'}</span>
            </div>
            <div className="a4-addr-name">{senderName}</div>
            <div className="a4-addr-text">{senderAddress}</div>
          </div>
          <div className="a4-addr-meta" style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #dbeafe' }}>
            <span className="addr-meta-row">
              <Mail size={13} />
              <span>{senderEmail}</span>
            </span>
            {senderPhone && (
              <span className="addr-meta-row">
                <Phone size={13} />
                <span>{senderPhone}</span>
              </span>
            )}
            {document.senderTaxNumber && (
              <span className="addr-meta-row">
                <FileText size={13} />
                <span>GSTIN / PAN: {document.senderTaxNumber}</span>
              </span>
            )}
          </div>
        </div>
        <div className="a4-classic-addr-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
          <div>
            <div className="a4-addr-label">
              <User size={15} color="#2563eb" />
              <span>{isInvoice ? 'BILLED TO' : 'BILL TO'}</span>
            </div>
            <div className="a4-addr-name">{clientName}</div>
            <div className="a4-addr-text">{clientAddress}</div>
          </div>
          <div className="a4-addr-meta" style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #dbeafe' }}>
            <span className="addr-meta-row">
              <Mail size={13} />
              <span>{clientEmail}</span>
            </span>
            {clientPhone && (
              <span className="addr-meta-row">
                <Phone size={13} />
                <span>{clientPhone}</span>
              </span>
            )}
            {document.clientTaxNumber && (
              <span className="addr-meta-row">
                <FileText size={13} />
                <span>GSTIN / Tax ID: {document.clientTaxNumber}</span>
              </span>
            )}
            {paymentTerms && (
              <span className="addr-meta-row" style={{ color: '#2563eb', fontWeight: 600 }}>
                <FileText size={13} />
                <span>Terms: {paymentTerms}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="a4-table-wrapper">
        <table className="a4-items-table a4-classic-table">
          <thead>
            <tr>
              <th style={{ width: '55%', textAlign: 'left', padding: '10px 12px' }}>DESCRIPTION OF SERVICES / PRODUCTS</th>
              <th style={{ width: '15%', textAlign: 'center', padding: '10px 8px' }}>QTY</th>
              <th style={{ width: '15%', textAlign: 'right', padding: '10px 12px' }}>RATE</th>
              <th style={{ width: '15%', textAlign: 'right', padding: '10px 12px' }}>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {document.items.map((item) => {
              const itemAmt = (Number(item.qty) || 0) * (Number(item.rate) || 0);
              return (
                <tr key={item.id}>
                  <td className="cell-desc" style={{ textAlign: 'left', padding: '10px 12px' }}>{item.description || 'Untitled Item'}</td>
                  <td className="cell-qty" style={{ textAlign: 'center', padding: '10px 8px', fontVariantNumeric: 'tabular-nums' }}>{item.qty}</td>
                  <td className="cell-rate" style={{ textAlign: 'right', padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>
                    {currencySymbol}{formatAmount(item.rate)}
                  </td>
                  <td className="cell-amount" style={{ textAlign: 'right', padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>
                    {currencySymbol}{formatAmount(itemAmt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom section: Totals and Payment notes */}
      <div className="a4-footer-wrapper">
        <div className="a4-bottom-grid">
          {/* Left: Payment instructions */}
          <div className="a4-bottom-notes-section">
            <div className="a4-notes-card">
              <div className="a4-notes-card-header">
                <Landmark size={18} color="#1e40af" />
                <span className="a4-notes-header-text">BANK &amp; PAYMENT INSTRUCTIONS</span>
              </div>
              <div className="a4-bank-details-grid">
                {bankRows.map((row, i) => (
                  <div key={i} className="bank-detail-row">
                    {row.label ? (
                      <>
                        <span className="bank-k">{row.label}</span>
                        <span className="bank-colon">:</span>
                        <span className="bank-v">{row.value}</span>
                      </>
                    ) : (
                      <span className="bank-v full-line">{row.value}</span>
                    )}
                  </div>
                ))}
              </div>
              {document.notes && (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #bfdbfe' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', marginBottom: '3px' }}>
                    Customer Notes
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                    {document.notes}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Totals Area */}
          <div className="a4-totals-area">
            <div className="a4-totals-card">
              <div className="a4-totals-card-line">
                <span className="totals-card-k">Subtotal:</span>
                <span className="totals-card-v">
                  {currencySymbol}{formatAmount(subtotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="a4-totals-card-line discount">
                  <span className="totals-card-k">Discount:</span>
                  <span className="totals-card-v">
                    -{currencySymbol}{formatAmount(discountAmount)}
                  </span>
                </div>
              )}

              <div className="a4-totals-card-line">
                <span className="totals-card-k">Tax ({document.taxRate || 0}%):</span>
                <span className="totals-card-v">
                  {currencySymbol}{formatAmount(taxAmount)}
                </span>
              </div>

              <div
                className="a4-totals-card-divider"
                style={{ borderColor: '#93c5fd' }}
              />

              <div
                className="a4-totals-card-due"
                style={{ color: '#103289' }}
              >
                <span className="due-label">Total Due:</span>
                <span className="due-amount">
                  {currencySymbol}{formatAmount(totalAmount)}
                </span>
              </div>
            </div>

            {/* Authorized Signature */}
            <div className="a4-signature-block">
              <div className="a4-signature-line" />
              <div className="a4-signature-label">Authorized Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
