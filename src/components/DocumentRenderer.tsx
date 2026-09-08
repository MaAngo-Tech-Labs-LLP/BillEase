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
} from 'lucide-react';
import { BillDocument } from '../types';
import {
  CURRENCY_SYMBOLS,
  ACCENT_COLOR_MAP,
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
  const senderName = document.senderName || tplStyle?.logoText || 'Apex Corporate';
  const senderTagline = document.senderTagline || 'Corporate Billing Services';
  const senderEmail = document.senderEmail || 'billing@apexcorp.com';
  const senderPhone = document.senderPhone || '+91 98765 43210';
  const senderAddress = document.senderAddress || '101 Cyber Towers, BKC, Mumbai 400051';

  // Client fallback details
  const clientName = document.clientName || tplStyle?.sampleClient || 'Stellar Innovations Pvt. Ltd.';
  const clientAddress = document.clientAddress || '45 Innovation Way, Tech Corridor, Bangalore 560100';
  const clientEmail = document.clientEmail || 'accounts@stellarinnovations.com';
  const clientPhone = document.clientPhone || '+91 98111 22334';

  const bankRows = useMemo(() => {
    const raw = document.paymentNotes?.trim();
    if (!raw || raw.includes('billing@upi') || raw.includes('50200012345678')) {
      return [
        { label: 'Bank Name', value: 'HDFC Bank Ltd.' },
        { label: 'Account Number', value: '50200084920194' },
        { label: 'IFSC Code', value: 'HDFC0001234' },
        { label: 'Branch', value: 'BKC Premier Mumbai' },
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
  }, [document.paymentNotes]);

  const formatHeaderDate = (d?: string) => {
    if (!d) return '2026-09-06';
    const match = d.match(/^(\d{2})[-/.](\d{2})[-/.](\d{4})$/);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`;
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
        {/* Centered Store Header */}
        <div className="receipt-header-box" style={{ background: tplStyle?.headerBg || '#00695C' }}>
          <div className="receipt-header-title">{senderName}</div>
          <div className="receipt-header-sub">{senderTagline || 'Retail Store & POS Billing'}</div>
          <div style={{ fontSize: '0.74rem', opacity: 0.85, marginTop: 4 }}>
            {senderAddress} | Ph: {senderPhone}
          </div>
        </div>

        {/* POS Metadata Strip */}
        <div className="receipt-meta-strip">
          <span>POS COUNTER: #01</span>
          <span>CASHIER: STAFF</span>
          <span>RECEIPT: #{document.billNumber || 'POS-2026-001'}</span>
          <span>DATE: {formatHeaderDate(document.issueDate)}</span>
        </div>

        {/* Customer Strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0 4px', color: '#1e293b' }}>
          <span>CUSTOMER: <strong>{clientName}</strong></span>
          {clientPhone && <span>PHONE: {clientPhone}</span>}
        </div>

        {/* Items Table with Dashed Borders */}
        <div className="a4-table-wrapper" style={{ marginTop: '0.85rem' }}>
          <table className="a4-items-table receipt-table">
            <thead>
              <tr>
                <th style={{ width: '55%' }}>PARTICULARS</th>
                <th style={{ width: '15%', textAlign: 'right' }}>QTY</th>
                <th style={{ width: '15%', textAlign: 'right' }}>RATE</th>
                <th style={{ width: '15%', textAlign: 'right' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {document.items.map((item) => {
                const itemAmt = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                return (
                  <tr key={item.id}>
                    <td className="cell-desc">{item.description || 'Item'}</td>
                    <td className="cell-qty">{item.qty}</td>
                    <td className="cell-rate">{currencySymbol}{formatAmount(item.rate)}</td>
                    <td className="cell-amount">{currencySymbol}{formatAmount(itemAmt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Net Payable Box */}
        <div className="receipt-total-highlight" style={{ borderColor: tplStyle?.accentColor || '#00695C', color: tplStyle?.totalColor || '#00695C' }}>
          <span>NET PAYABLE AMOUNT:</span>
          <span>{currencySymbol}{formatAmount(totalAmount)}</span>
        </div>

        {/* Payment & Settlement Notes */}
        <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '1rem', background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
          <div style={{ fontWeight: 700, marginBottom: 4, color: '#0f172a' }}>COUNTER PAYMENT NOTES:</div>
          <div>{document.paymentNotes || 'Settled at billing counter via UPI / Card.'}</div>
        </div>

        {/* Authentic Barcode Strip */}
        <div className="receipt-barcode-wrap">
          <div className="receipt-barcode-bars">
            {[1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 2, 3, 1, 2].map((w, i) => (
              <div key={i} style={{ width: w * 2, height: '100%', background: '#0f172a' }} />
            ))}
          </div>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.18em', color: '#64748b', fontWeight: 600 }}>
            *BIL-{(document.billNumber || '2026-9420').replace(/\s+/g, '')}*
          </span>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Thank you for shopping with us!</span>
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
          {/* Left Vertical Brand Column */}
          <div className="tpl-sidebar-left" style={{ background: tplStyle?.headerBg ? `linear-gradient(180deg, ${tplStyle.headerBg} 0%, #bf360c 100%)` : undefined }}>
            <div className="tpl-sidebar-brand">
              <h3>{senderName}</h3>
              <p>{senderTagline || 'Creative Media & Production Studio'}</p>
              <div style={{ fontSize: '0.76rem', opacity: 0.9, marginTop: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span>{senderEmail}</span>
                <span>{senderPhone}</span>
                <span style={{ marginTop: 4 }}>{senderAddress}</span>
              </div>
            </div>

            {/* Bank details inside sidebar */}
            <div style={{ background: 'rgba(255,255,255,0.14)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
                Payment Transfer
              </div>
              <div style={{ fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: 3, opacity: 0.95 }}>
                {bankRows.slice(0, 3).map((r, i) => (
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
          <div className="tpl-sidebar-right">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #fed7aa', paddingBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: tplStyle?.accentColor || '#e65100', margin: 0 }}>
                  {docHeading}
                </h2>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginTop: 2 }}>
                  #{document.billNumber || 'INV-2026'}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>
                <div>Date: <strong>{formatHeaderDate(document.issueDate)}</strong></div>
                {document.dueDate && <div>Due: <strong>{formatHeaderDate(document.dueDate)}</strong></div>}
              </div>
            </div>

            {/* Client Card */}
            <div style={{ background: '#fffaf5', border: '1px solid #fed7aa', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#e65100', textTransform: 'uppercase' }}>Billed To:</span>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginTop: 2 }}>{clientName}</div>
              <div style={{ color: '#475569', whiteSpace: 'pre-line', marginTop: 2 }}>{clientAddress}</div>
            </div>

            {/* Items Table */}
            <div className="a4-table-wrapper" style={{ margin: 0 }}>
              <table className="a4-items-table sidebar-table">
                <thead>
                  <tr>
                    <th style={{ width: '55%' }}>DELIVERABLE</th>
                    <th style={{ width: '15%', textAlign: 'right' }}>QTY</th>
                    <th style={{ width: '15%', textAlign: 'right' }}>RATE</th>
                    <th style={{ width: '15%', textAlign: 'right' }}>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {document.items.map((item) => (
                    <tr key={item.id}>
                      <td className="cell-desc">{item.description || 'Item'}</td>
                      <td className="cell-qty">{item.qty}</td>
                      <td className="cell-rate">{currencySymbol}{formatAmount(item.rate)}</td>
                      <td className="cell-amount">{currencySymbol}{formatAmount((Number(item.qty) || 0) * (Number(item.rate) || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div style={{ marginTop: 'auto', borderTop: '2px solid #fed7aa', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Total Items: {document.items.length}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: tplStyle?.totalColor || '#e65100' }}>
                Total: {currencySymbol}{formatAmount(totalAmount)}
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
        {/* Healthcare Header with Rx Symbol */}
        <div className="clinical-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="clinical-rx-badge">℞</span>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#00838f', margin: 0 }}>
                {senderName}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>
                {senderTagline || 'Multi-Specialty Clinic & Diagnostic Centre'}
              </p>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>
                {senderAddress} | Ph: {senderPhone}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#00838f', background: '#e0f7fa', padding: '4px 10px', borderRadius: 6, display: 'inline-block' }}>
              CLINIC REG #MED-4029
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
              Bill #{document.billNumber || 'MED-2026'}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
              Date: {formatHeaderDate(document.issueDate)}
            </div>
          </div>
        </div>

        {/* Patient Details Box */}
        <div className="clinical-patient-card">
          <div>
            <span style={{ color: '#00696f', fontWeight: 700 }}>Patient Name: </span>
            <strong style={{ color: '#0f172a' }}>{clientName}</strong>
          </div>
          <div>
            <span style={{ color: '#00696f', fontWeight: 700 }}>Age / Gender: </span>
            <span>42 Yrs / Male</span>
          </div>
          <div>
            <span style={{ color: '#00696f', fontWeight: 700 }}>OPD / UHID: </span>
            <span>#{document.billNumber || 'UHID-9821'}</span>
          </div>
          <div>
            <span style={{ color: '#00696f', fontWeight: 700 }}>Department: </span>
            <span>General &amp; Specialty Care</span>
          </div>
        </div>

        {/* Medical Services Table */}
        <div className="a4-table-wrapper">
          <table className="a4-items-table clinical-table">
            <thead>
              <tr>
                <th style={{ width: '55%' }}>SERVICE / INVESTIGATION / CONSULTATION</th>
                <th style={{ width: '15%', textAlign: 'right' }}>UNITS</th>
                <th style={{ width: '15%', textAlign: 'right' }}>FEE</th>
                <th style={{ width: '15%', textAlign: 'right' }}>NET AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {document.items.map((item) => (
                <tr key={item.id}>
                  <td className="cell-desc">{item.description || 'Consultation'}</td>
                  <td className="cell-qty">{item.qty}</td>
                  <td className="cell-rate">{currencySymbol}{formatAmount(item.rate)}</td>
                  <td className="cell-amount">{currencySymbol}{formatAmount((Number(item.qty) || 0) * (Number(item.rate) || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: 16, borderTop: '2px solid #80deea' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#00838f', fontSize: '0.8rem', fontWeight: 700 }}>
              <Stethoscope size={16} />
              <span>Attending Physician / Authorized Medical Officer</span>
            </div>
            <div style={{ height: 36, borderBottom: '1px solid #94a3b8', width: 220, marginTop: 10 }} />
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>Signature &amp; Stamp</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Patient Payable:</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#00838f' }}>
              {currencySymbol}{formatAmount(totalAmount)}
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
        {/* Formal Navy Header Bar */}
        <div className="editorial-header">
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700, margin: 0, letterSpacing: '0.02em' }}>
              {senderName}
            </h2>
            <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: 4, fontFamily: 'sans-serif' }}>
              {senderTagline || 'Attorneys & Legal Advisory LLP'}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontFamily: 'sans-serif' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.06em' }}>
              {docHeading}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
              Ref #{document.billNumber || 'LEGAL-2026-089'}
            </div>
            <div style={{ fontSize: '0.74rem', opacity: 0.8 }}>
              Date: {formatHeaderDate(document.issueDate)}
            </div>
          </div>
        </div>

        {/* Matter Reference Box */}
        <div className="editorial-matter-card">
          <div>
            <span style={{ color: '#64748b' }}>Client: </span>
            <strong style={{ color: '#0f172a' }}>{clientName}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Matter Reference: </span>
            <strong style={{ color: '#0d2137' }}>#CORP-2026-ADV</strong>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Billing Model: </span>
            <span>Retainer &amp; Advisory Hours</span>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Lead Partner: </span>
            <span>Senior Managing Partner</span>
          </div>
        </div>

        {/* Legal Items Table */}
        <div className="a4-table-wrapper">
          <table className="a4-items-table editorial-table">
            <thead>
              <tr>
                <th style={{ width: '55%' }}>PROFESSIONAL SERVICES &amp; COUNSEL</th>
                <th style={{ width: '15%', textAlign: 'right' }}>HOURS/QTY</th>
                <th style={{ width: '15%', textAlign: 'right' }}>RATE</th>
                <th style={{ width: '15%', textAlign: 'right' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {document.items.map((item) => (
                <tr key={item.id}>
                  <td className="cell-desc" style={{ fontFamily: 'sans-serif' }}>{item.description || 'Legal Advisory'}</td>
                  <td className="cell-qty" style={{ fontFamily: 'sans-serif' }}>{item.qty}</td>
                  <td className="cell-rate" style={{ fontFamily: 'sans-serif' }}>{currencySymbol}{formatAmount(item.rate)}</td>
                  <td className="cell-amount" style={{ fontFamily: 'sans-serif' }}>{currencySymbol}{formatAmount((Number(item.qty) || 0) * (Number(item.rate) || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Trust Account */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 'auto', borderTop: '2px solid #0d2137', paddingTop: 16 }}>
          <div style={{ fontSize: '0.78rem', color: '#475569', maxWidth: 360, fontFamily: 'sans-serif' }}>
            <div style={{ fontWeight: 700, color: '#0d2137', marginBottom: 4 }}>ESCROW / WIRE INSTRUCTIONS:</div>
            <div>{document.paymentNotes || 'Remit to Firm Trust Account #50200084920194 at HDFC Bank Ltd.'}</div>
          </div>
          <div style={{ textAlign: 'right', fontFamily: 'sans-serif' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Fee Due:</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0d2137' }}>
              {currencySymbol}{formatAmount(totalAmount)}
            </div>
            <div style={{ marginTop: 16, borderTop: '1px solid #94a3b8', width: 180, marginLeft: 'auto', paddingTop: 4, fontSize: '0.72rem', color: '#64748b' }}>
              Authorized Partner Signature
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
            padding: '16px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: 8,
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(40,53,147,0.18)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#FFFFFF', letterSpacing: '0.02em', lineHeight: 1.2 }}>
                {senderName || 'Cambridge Global Academy'}
              </h2>
              <div style={{ fontSize: '0.74rem', color: '#FCD34D', fontWeight: 700, fontStyle: 'italic', marginTop: 3 }}>
                {senderTagline || 'Academic Affairs & Bursar Office'}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
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
            <div style={{ fontSize: '0.94rem', fontWeight: 900, letterSpacing: '0.02em', color: '#FFFFFF', marginTop: 5 }}>
              OFFICIAL FEE RECEIPT #{document.billNumber || 'REC-2026-089'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.9)', marginTop: 3 }}>
              Date: <strong>{formatHeaderDate(document.issueDate) || '2026-09-06'}</strong>
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
                {senderName || 'Cambridge Global Academy'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#283593', fontWeight: 600, marginTop: 2 }}>
                Affiliation: UGC / AICTE Recognized Inst-9428
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1E293B', marginTop: 10, paddingTop: 4, borderTop: '1px solid #E2E8F0' }}>
              INST REG: 27AABCA1234F1Z9
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
                {clientName || 'Rahul Sharma'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#283593', fontWeight: 600, marginTop: 2 }}>
                Higher Secondary Academic Program • Batch 2026-27
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1E293B', marginTop: 10, paddingTop: 4, borderTop: '1px solid #E2E8F0' }}>
              ENROLMENT REF: #CGA-2026-089
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', borderTop: '1.5px solid #283593', paddingTop: 14 }}>
          <div
            style={{
              border: '1.5px dashed #283593',
              borderRadius: 6,
              padding: '8px 14px',
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
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Total Tuition Fee Amount:</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#283593', fontVariantNumeric: 'tabular-nums' }}>
              {currencySymbol}{formatAmount(totalAmount)}
            </div>
            <div style={{ marginTop: 12, borderTop: '1px solid #9FA8DA', width: 180, marginLeft: 'auto', paddingTop: 4, fontSize: '0.70rem', color: '#64748B', fontWeight: 600 }}>
              Registrar Authorized Signature
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
        {/* Statutory GST Maroon Header */}
        <div className="gst-header">
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0 }}>
              {senderName}
            </h2>
            <div style={{ fontSize: '0.78rem', opacity: 0.9, marginTop: 2 }}>
              GSTIN: 27AABCU9603R1ZM | State: 27 (Maharashtra)
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.04em' }}>
              TAX INVOICE (GST)
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
              Invoice #{document.billNumber || 'GST-2026-089'}
            </div>
            <div style={{ fontSize: '0.74rem', opacity: 0.85 }}>
              Date: {formatHeaderDate(document.issueDate)}
            </div>
          </div>
        </div>

        {/* GST Parties Grid */}
        <div className="gst-parties-grid">
          <div className="gst-party-card">
            <div style={{ fontWeight: 700, color: '#880e4f', marginBottom: 2 }}>DETAILS OF SUPPLIER:</div>
            <div style={{ fontWeight: 600 }}>{senderName}</div>
            <div style={{ color: '#475569', fontSize: '0.76rem' }}>{senderAddress}</div>
            <div style={{ marginTop: 4, fontSize: '0.76rem' }}>GSTIN: <strong>27AABCU9603R1ZM</strong></div>
          </div>
          <div className="gst-party-card">
            <div style={{ fontWeight: 700, color: '#880e4f', marginBottom: 2 }}>DETAILS OF RECIPIENT (BILLED TO):</div>
            <div style={{ fontWeight: 600 }}>{clientName}</div>
            <div style={{ color: '#475569', fontSize: '0.76rem' }}>{clientAddress}</div>
            <div style={{ marginTop: 4, fontSize: '0.76rem' }}>GSTIN: <strong>29AABCU9603R1ZN</strong></div>
          </div>
        </div>

        {/* Items Table with HSN/SAC Column */}
        <div className="a4-table-wrapper">
          <table className="a4-items-table gst-table">
            <thead>
              <tr>
                <th style={{ width: '45%' }}>DESCRIPTION OF GOODS / SERVICES</th>
                <th style={{ width: '15%', textAlign: 'center' }}>HSN/SAC</th>
                <th style={{ width: '10%', textAlign: 'right' }}>QTY</th>
                <th style={{ width: '15%', textAlign: 'right' }}>RATE</th>
                <th style={{ width: '15%', textAlign: 'right' }}>TAXABLE AMT</th>
              </tr>
            </thead>
            <tbody>
              {document.items.map((item, idx) => (
                <tr key={item.id}>
                  <td className="cell-desc">{item.description || 'Service Deliverable'}</td>
                  <td style={{ textAlign: 'center', fontSize: '0.76rem', color: '#64748b' }}>
                    {idx % 2 === 0 ? '998314' : '998315'}
                  </td>
                  <td className="cell-qty">{item.qty}</td>
                  <td className="cell-rate">{currencySymbol}{formatAmount(item.rate)}</td>
                  <td className="cell-amount">{currencySymbol}{formatAmount((Number(item.qty) || 0) * (Number(item.rate) || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GST Split & Amount in Words */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginTop: 'auto', borderTop: '2px solid #880e4f', paddingTop: 12 }}>
          <div style={{ flex: 1 }}>
            <div className="gst-words-box">
              <strong>Amount in Words: </strong>
              <span>{convertNumberToWords(totalAmount)}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 8 }}>
              Declaration: We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct.
            </div>
          </div>

          <div style={{ width: 250, fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Taxable Value:</span>
              <strong>{currencySymbol}{formatAmount(subtotal - discountAmount)}</strong>
            </div>
            {taxAmount > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>CGST ({halfTaxRate.toFixed(1)}%):</span>
                  <span>{currencySymbol}{formatAmount(halfTaxAmt)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>SGST ({halfTaxRate.toFixed(1)}%):</span>
                  <span>{currencySymbol}{formatAmount(halfTaxAmt)}</span>
                </div>
              </>
            )}
            <div style={{ borderTop: '1.5px solid #880e4f', paddingTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, color: '#880e4f' }}>
              <span>Total Invoice:</span>
              <span>{currencySymbol}{formatAmount(totalAmount)}</span>
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
          gap: 16,
          padding: '30px 38px 24px 38px',
          minHeight: 1080,
          maxWidth: 800,
          margin: '0 auto',
          boxSizing: 'border-box',
          border: '1.5px solid #E2E8F0',
          borderRadius: 12,
        } as React.CSSProperties}
      >
        {/* Scandinavian Tech Modern Header */}
        <div
          className="a4-tpl-minimal-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #0F172A',
            paddingBottom: 14,
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <span
                style={{
                  background: '#F1F5F9',
                  color: '#0F172A',
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 4,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                ● VERIFIED DIGITAL INVOICE
              </span>
            </div>
            <h1
              style={{
                fontSize: '1.50rem',
                fontWeight: 900,
                color: '#0F172A',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              {senderName || 'Kronos Cloud Systems'}
            </h1>
            <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: 3, fontWeight: 500 }}>
              {senderTagline || 'Enterprise Cloud & Infrastructure Architecture'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: 4, lineHeight: 1.4 }}>
              {[senderAddress, senderPhone && `Ph: ${senderPhone}`, senderEmail].filter(Boolean).join('  •  ')}
            </div>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div
              style={{
                background: '#0F172A',
                color: '#FFFFFF',
                padding: '4px 14px',
                borderRadius: 9999,
                fontSize: '0.78rem',
                fontWeight: 900,
                display: 'inline-block',
                letterSpacing: '0.03em',
                boxShadow: '0 2px 6px rgba(15,23,42,0.15)',
              }}
            >
              INVOICE #{document.billNumber || 'INV-2026-001'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 5 }}>
              Issue Date: <strong>{formatHeaderDate(document.issueDate) || '2026-09-06'}</strong>
            </div>
            {document.dueDate && (
              <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: 1 }}>
                Payment Due: <strong>{formatHeaderDate(document.dueDate)}</strong>
              </div>
            )}
            {document.poNumber && (
              <div style={{ fontSize: '0.70rem', color: '#0F172A', fontWeight: 700, marginTop: 2 }}>
                Ref / PO: <strong>{document.poNumber}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Symmetrical Dual Party Information Cards */}
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
              <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                01. ISSUED FROM
              </div>
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.94rem', marginTop: 4 }}>
                {senderName || 'Kronos Cloud Systems'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>
                {senderAddress || '101 Cyber Towers, Tech Corridor, Bangalore 560100'}
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', marginTop: 10, paddingTop: 4, borderTop: '1px solid #E2E8F0' }}>
              TAX / GSTIN: 27AABCA1234F1Z9
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
              <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                02. INVOICED TO
              </div>
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.94rem', marginTop: 4 }}>
                {clientName || 'Linear Labs Global Inc.'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>
                {clientAddress || '45 Innovation Way, Tech Park, Bangalore 560100'}
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', marginTop: 10, paddingTop: 4, borderTop: '1px solid #E2E8F0' }}>
              CLIENT REF: {document.poNumber || 'PO-12345'}
            </div>
          </div>
        </div>

        {/* Floating Minimalist Table */}
        <div style={{ border: '1.5px solid #0F172A', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0F172A', color: '#FFFFFF' }}>
                <th style={{ width: '50%', textAlign: 'left', padding: '11px 14px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  DESCRIPTION
                </th>
                <th style={{ width: '14%', textAlign: 'center', padding: '11px 8px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  QTY
                </th>
                <th style={{ width: '16%', textAlign: 'right', padding: '11px 10px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  RATE
                </th>
                <th style={{ width: '20%', textAlign: 'right', padding: '11px 14px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  AMOUNT
                </th>
              </tr>
            </thead>
            <tbody>
              {document.items.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0', background: idx % 2 === 1 ? '#F8FAFC' : '#FFFFFF' }}>
                  <td style={{ textAlign: 'left', padding: '11px 14px', fontWeight: 700, color: '#0F172A', fontSize: '0.82rem' }}>
                    {item.description}
                  </td>
                  <td style={{ textAlign: 'center', padding: '11px 8px', fontWeight: 600, fontSize: '0.80rem', color: '#334155' }}>
                    {item.qty}
                  </td>
                  <td style={{ textAlign: 'right', padding: '11px 10px', fontVariantNumeric: 'tabular-nums', fontSize: '0.80rem', color: '#334155' }}>
                    {currencySymbol}{formatAmount(item.rate)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '11px 14px', fontWeight: 800, color: '#0F172A', fontVariantNumeric: 'tabular-nums', fontSize: '0.84rem' }}>
                    {currencySymbol}{formatAmount((Number(item.qty) || 0) * (Number(item.rate) || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Minimal Bottom Section */}
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 14 }}>
          <div style={{ fontSize: '0.74rem', color: '#64748B', maxWidth: 360 }}>
            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>
              PAYMENT TERMS &amp; INSTRUCTIONS:
            </div>
            <div>{document.paymentNotes || 'Wire transfer to primary bank account as per agreed terms.'}</div>
          </div>
          <div
            style={{
              background: '#0F172A',
              color: '#FFFFFF',
              padding: '12px 20px',
              borderRadius: 8,
              minWidth: 230,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(15,23,42,0.18)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.64rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                TOTAL DUE
              </div>
              <div style={{ fontSize: '0.80rem', fontWeight: 700 }}>Settlement Amount</div>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FDE047', fontVariantNumeric: 'tabular-nums' }}>
              {currencySymbol}{formatAmount(totalAmount)}
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
          ORIGINAL FOR RECIPIENT &nbsp;•&nbsp; DIGITALLY GENERATED &amp; AUTHENTICATED
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
      <div className="a4-tpl-classic-header">
        <div className="a4-classic-left">
          <h2 className="a4-classic-company">{senderName}</h2>
          {senderTagline && <p className="a4-classic-tagline">{senderTagline}</p>}
          <div className="a4-classic-contact">
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
          </div>
        </div>
        <div className="a4-classic-right">
          <h3 className="a4-classic-title">{docHeading}</h3>
          <p className="a4-classic-code">#{document.billNumber || 'BL-2026-5479'}</p>
          <p className="a4-classic-date">
            <Calendar size={12} />
            <span>Date: {formatHeaderDate(document.issueDate)}</span>
          </p>
        </div>
      </div>

      {/* Address Cards Grid */}
      <div className="a4-classic-address-grid">
        <div className="a4-classic-addr-card">
          <div className="a4-addr-label">
            <Building2 size={15} color="#2563eb" />
            <span>BILL FROM</span>
          </div>
          <div className="a4-addr-name">{senderName}</div>
          <div className="a4-addr-text">{senderAddress}</div>
          <div className="a4-addr-meta">
            <span className="addr-meta-row">
              <Mail size={13} />
              <span>{senderEmail}</span>
            </span>
          </div>
        </div>
        <div className="a4-classic-addr-card">
          <div className="a4-addr-label">
            <User size={15} color="#2563eb" />
            <span>BILL TO</span>
          </div>
          <div className="a4-addr-name">{clientName}</div>
          <div className="a4-addr-text">{clientAddress}</div>
          <div className="a4-addr-meta">
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
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="a4-table-wrapper">
        <table className="a4-items-table a4-classic-table">
          <thead>
            <tr>
              <th style={{ width: '55%' }}>DESCRIPTION OF SERVICES / PRODUCTS</th>
              <th style={{ width: '15%', textAlign: 'right' }}>QTY</th>
              <th style={{ width: '15%', textAlign: 'right' }}>RATE</th>
              <th style={{ width: '15%', textAlign: 'right' }}>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {document.items.map((item) => {
              const itemAmt = (Number(item.qty) || 0) * (Number(item.rate) || 0);
              return (
                <tr key={item.id}>
                  <td className="cell-desc">{item.description || 'Untitled Item'}</td>
                  <td className="cell-qty">{item.qty}</td>
                  <td className="cell-rate">
                    {currencySymbol}{formatAmount(item.rate)}
                  </td>
                  <td className="cell-amount">
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
