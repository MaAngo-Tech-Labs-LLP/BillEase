import React from 'react';
import {
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  Landmark,
  FileText,
  ShieldCheck,
  Globe,
  Truck,
  CreditCard,
  QrCode,
  Receipt,
  Stethoscope,
  GraduationCap,
  Award,
  CheckCircle2,
  Scissors,
  Activity,
  Sparkles,
  Clock,
  BadgeCheck,
  Calculator,
  MapPin,
  Store,
  UserCheck,
  Check,
} from 'lucide-react';
import { BillDocument, DocumentItem } from '../types';
import {
  CURRENCY_SYMBOLS,
  ACCENT_COLOR_MAP,
  normalizeTemplateId,
  getTemplateById,
} from '../data/templates';
import { calculateBillTotals, formatCurrencyAmount } from '../utils/billCalculations';

interface BillDocumentRendererProps {
  document: BillDocument;
  scale?: number;
  className?: string;
}

export default function BillDocumentRenderer({
  document,
  scale = 1,
  className = '',
}: BillDocumentRendererProps) {
  const currencySymbol = CURRENCY_SYMBOLS[document.currency] || '₹';

  // Standalone Real-time Calculation Engine
  const calc = calculateBillTotals(document);

  const formatAmount = (val: number) => {
    return formatCurrencyAmount(val, document.currency);
  };

  const formatHeaderDate = (d?: string) => {
    if (!d) return '2026-09-06';
    const match = d.match(/^(\d{2})[-/.](\d{2})[-/.](\d{4})$/);
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`;
    }
    return d;
  };

  const rawBillNum = document.billNumber || 'BILL-2026-5479';
  const cleanBillNum = rawBillNum.startsWith('#') ? rawBillNum.slice(1) : rawBillNum;

  const normTemplateId = normalizeTemplateId(document.template, 'bill');
  const tplStyle = getTemplateById(normTemplateId) || getTemplateById('apex-corporate-bill');
  const layout = tplStyle?.layoutType || 'classic';

  const accentHex = tplStyle?.accentColor || ACCENT_COLOR_MAP[document.accent] || '#1A237E';
  const headerBg = tplStyle?.headerBg || '#1A237E';
  const headerText = tplStyle?.headerText || '#FFFFFF';
  const tableHeaderBg = tplStyle?.tableHeaderBg || '#E8EAF6';
  const tableHeaderText = tplStyle?.tableHeaderText || '#1A237E';
  const totalColor = tplStyle?.totalColor || accentHex;
  const borderColor = tplStyle?.borderColor || '#C5CAE9';

  const billTaxRate = typeof document.taxRate === 'number' ? document.taxRate : Number(document.taxRate) || 0;

  const getItemTaxDisplay = (item: DocumentItem) => {
    if (item.taxRate !== undefined && item.taxRate !== null && !isNaN(Number(item.taxRate))) {
      return `${Number(item.taxRate)}%`;
    }
    return billTaxRate > 0 ? `${billTaxRate}%` : '0%';
  };

  // 1. Business Details (BILL FROM)
  const senderName = document.senderName || 'Apex Corporate';
  const senderTagline = document.senderTagline || 'Corporate Billing Services';
  const senderAddress = document.senderAddress || '';
  const senderPhone = document.senderPhone || '';
  const senderEmail = document.senderEmail || '';
  const senderWebsite = document.senderWebsite || '';
  const senderTaxNumber = document.senderTaxNumber || '';
  const senderLogo = document.senderLogo || (document as any).logo || '';

  // 2. Customer Details (BILL TO)
  const clientName = document.clientName || 'Stellar Innovations Pvt. Ltd.';
  const clientCompany = document.clientCompany || '';
  const clientAddress = document.clientAddress || '';
  const shippingAddress =
    !document.shippingSameAsBilling && document.shippingAddress ? document.shippingAddress : '';
  const clientPhone = document.clientPhone || '';
  const clientEmail = document.clientEmail || '';
  const clientTaxNumber = document.clientTaxNumber || '';

  // 3. Payment & Bank Information
  const hasBankDetails = Boolean(
    document.bankName || document.accountNumber || document.ifscCode || document.branch || document.upiId
  );

  const isDuplicateBankInfo = Boolean(
    document.paymentNotes &&
      (document.paymentNotes.toLowerCase().includes('account') ||
        document.paymentNotes.toLowerCase().includes('ifsc') ||
        document.paymentNotes.toLowerCase().includes('bank') ||
        document.paymentNotes.toLowerCase().includes('branch') ||
        document.paymentNotes.toLowerCase().includes('remit') ||
        (document.accountNumber && document.paymentNotes.includes(document.accountNumber)))
  );

  const cleanPaymentInstructions = isDuplicateBankInfo ? '' : (document.paymentNotes || '').trim();

  const totalItemsCount = document.items.length;
  const totalUnitsCount = document.items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);

  const sharedCanvasStyle: React.CSSProperties = {
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top center',
    '--builder-accent': accentHex,
    '--tpl-header-bg': headerBg,
    '--tpl-header-text': headerText,
    '--tpl-tbl-header-bg': tableHeaderBg,
    '--tpl-tbl-header-text': tableHeaderText,
    '--tpl-total-color': totalColor,
    '--tpl-border': borderColor,
  } as React.CSSProperties;

  // =========================================================================
  // 1. RETAIL STORE & POS BILL (layout === 'receipt', id: 'bold-emerald')
  // =========================================================================
  if (layout === 'receipt') {
    return (
      <div
        className={`a4-paper-sheet tpl-receipt bill-document-sheet ${className}`}
        id="printable-bill-canvas"
        style={{
          ...sharedCanvasStyle,
          position: 'relative',
          overflow: 'hidden',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: '32px 36px 28px 36px',
          minHeight: 1080,
          maxWidth: 800,
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Right Decorative Geometric Accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 120,
            height: 120,
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 0,
          }}
        >
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <path d="M0 0 L120 0 L120 120 Z" fill="#d1fae5" opacity="0.65" />
          </svg>
        </div>

        {/* Bottom Left Decorative Geometric Accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 100,
            height: 100,
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 0,
          }}
        >
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            <path d="M0 100 L0 0 L100 100 Z" fill="#d1fae5" opacity="0.65" />
          </svg>
        </div>

        {/* 1. RETAIL & WHOLESALE BRAND HEADER */}
        <div
          className="receipt-header-row"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            position: 'relative',
            zIndex: 1,
            gap: 20,
            paddingBottom: 2,
          }}
        >
          {/* Left: Shopping Cart Logo with Green Leaves + Titles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {senderLogo ? (
              <div
                style={{
                  width: 52,
                  height: 52,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <img
                  src={senderLogo}
                  alt={senderName}
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
            ) : (
              <div
                style={{
                  width: 52,
                  height: 52,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                }}
              >
                {/* Light grey image icon */}
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
            )}
            <div>
              <h1 style={{ color: '#1e293b', fontSize: '1.65rem', fontWeight: 900, margin: 0, letterSpacing: '0.02em', lineHeight: 1.15 }}>
                {senderName || 'APEX CORPORATE'}
              </h1>
              <div style={{ color: '#1b4332', fontSize: '0.84rem', fontWeight: 800, letterSpacing: '0.14em', marginTop: 4 }}>
                {senderTagline ? senderTagline.toUpperCase() : 'RETAIL & WHOLESALE'}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.76rem', marginTop: 3, fontWeight: 500 }}>
                Quality Products &nbsp;|&nbsp; Better Everyday
              </div>
            </div>
          </div>

          {/* Right: Contact Information */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, textAlign: 'right', fontSize: '0.76rem', color: '#334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'flex-end' }}>
              <MapPin size={13} color="#1b4332" />
              <span>{senderAddress || '101 Cyber Towers, BKC, Mumbai 400051'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'flex-end' }}>
              <Phone size={13} color="#1b4332" />
              <span>{senderPhone || '+91 98765 43210'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'flex-end' }}>
              <Mail size={13} color="#1b4332" />
              <span>{senderEmail || 'billing@apexcorp.com'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'flex-end' }}>
              <Globe size={13} color="#1b4332" />
              <span>{senderWebsite || 'www.apexcorp.com'}</span>
            </div>
          </div>
        </div>

        {/* 2. DUAL PARTY CARDS (STORE OUTLET & CUSTOMER) */}
        <div className="bill-parties-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, position: 'relative', zIndex: 1 }}>
          {/* Left: Store Outlet / Issued By */}
          <div style={{ border: '1px solid #d1e7dd', borderRadius: 8, background: '#ffffff', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#f2f7f4', borderBottom: '1px solid #d1e7dd', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Store size={15} color="#1b4332" />
              <span style={{ color: '#1b4332', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.06em' }}>
                STORE OUTLET / ISSUED BY
              </span>
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 5, fontSize: '0.76rem', flex: 1 }}>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem', marginBottom: 2 }}>{senderName || 'Apex Corporate'}</div>
              <div style={{ color: '#334155', lineHeight: 1.45 }}>{senderAddress || '101 Cyber Towers, BKC, Mumbai 400051'}</div>
              <div style={{ color: '#334155', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Phone size={12} color="#1b4332" /> {senderPhone || '+91 98765 43210'}
              </div>
              <div style={{ color: '#334155', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Mail size={12} color="#1b4332" /> {senderEmail || 'billing@apexcorp.com'}
              </div>
              <div style={{ color: '#334155', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Globe size={12} color="#1b4332" /> {senderWebsite || 'www.apexcorp.com'}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.76rem', marginTop: 4, color: '#0f172a' }}>
                GSTIN / Tax: <span style={{ color: '#1d4ed8', fontWeight: 800 }}>{senderTaxNumber || '27AABCA1234F1Z9'}</span>
              </div>
            </div>
          </div>

          {/* Right: Customer / Billed To */}
          <div style={{ border: '1px solid #d1e7dd', borderRadius: 8, background: '#ffffff', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#f2f7f4', borderBottom: '1px solid #d1e7dd', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={15} color="#1b4332" />
              <span style={{ color: '#1b4332', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.06em' }}>
                CUSTOMER / BILLED TO
              </span>
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 5, fontSize: '0.76rem', flex: 1 }}>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem', marginBottom: 2 }}>{clientName || 'Stellar Innovations Pvt. Ltd.'}</div>
              <div style={{ color: '#334155', lineHeight: 1.45 }}>
                {clientAddress || '45 Innovation Way, Tech Corridor, Bangalore 560100'}
              </div>
              <div style={{ color: '#334155', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Mail size={12} color="#1b4332" /> {clientEmail || 'accounts@stellarinnovations.com'}
              </div>
              <div style={{ color: '#334155', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Phone size={12} color="#1b4332" /> {clientPhone || '+91 98111 22334'}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.76rem', marginTop: 4, color: '#0f172a' }}>
                GSTIN / Tax: <span style={{ color: '#0f172a', fontWeight: 800 }}>{clientTaxNumber || '29AABCS5678G1Z2'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. POS TRANSACTION META BAR */}
        <div
          style={{
            background: '#f2f7f4',
            border: '1px solid #d1e7dd',
            borderRadius: 8,
            padding: '10px 16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* 1. BILL # */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderRight: '1px solid #d1e7dd', paddingRight: 12 }}>
            <FileText size={16} color="#1b4332" />
            <div>
              <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>BILL #</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginTop: 1 }}>#{cleanBillNum}</div>
            </div>
          </div>

          {/* 2. DATE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderRight: '1px solid #d1e7dd', paddingLeft: 14, paddingRight: 12 }}>
            <Calendar size={16} color="#1b4332" />
            <div>
              <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>DATE</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginTop: 1 }}>{formatHeaderDate(document.issueDate)}</div>
            </div>
          </div>

          {/* 3. REF / PO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderRight: '1px solid #d1e7dd', paddingLeft: 14, paddingRight: 12 }}>
            <Receipt size={16} color="#1b4332" />
            <div>
              <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>REF / PO</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginTop: 1 }}>{document.poNumber || 'PO-12345'}</div>
            </div>
          </div>

          {/* 4. CASHIER */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 14 }}>
            <UserCheck size={16} color="#1b4332" />
            <div>
              <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>CASHIER</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginTop: 1 }}>STAFF #03</div>
            </div>
          </div>
        </div>

        {/* 4. ITEMS TABLE */}
        <div style={{ border: '1px solid #d1e7dd', borderRadius: 8, overflow: 'hidden', margin: 0, position: 'relative', zIndex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#1b4332', color: '#ffffff' }}>
                <th style={{ width: '6%', textAlign: 'center', padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em' }}>
                  #
                </th>
                <th style={{ width: '44%', textAlign: 'left', padding: '10px 14px', fontSize: '0.74rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em' }}>
                  PARTICULARS / ITEM DESCRIPTION
                </th>
                <th style={{ width: '10%', textAlign: 'center', padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em' }}>
                  QTY
                </th>
                <th style={{ width: '14%', textAlign: 'center', padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em' }}>
                  RATE ({currencySymbol})
                </th>
                <th style={{ width: '10%', textAlign: 'center', padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em' }}>
                  TAX (%)
                </th>
                <th style={{ width: '16%', textAlign: 'right', padding: '10px 14px', fontSize: '0.74rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em' }}>
                  AMOUNT ({currencySymbol})
                </th>
              </tr>
            </thead>
            <tbody>
              {document.items.map((item, idx) => {
                const itemAmt = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                const isLast = idx === document.items.length - 1;
                return (
                  <tr key={item.id} style={{ borderBottom: isLast ? 'none' : '1px solid #eef2f0', background: '#ffffff' }}>
                    <td style={{ textAlign: 'center', padding: '12px 8px', fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>
                      {idx + 1}
                    </td>
                    <td style={{ textAlign: 'left', padding: '12px 14px', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                      {item.name || item.description || 'Untitled Item'}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px 8px', fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>
                      {item.qty}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px 8px', fontSize: '0.78rem', fontWeight: 600, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                      {currencySymbol}{formatAmount(item.rate)}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px 8px', fontSize: '0.76rem', color: '#0f172a' }}>
                      {getItemTaxDisplay(item)}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 14px', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                      {currencySymbol}{formatAmount(itemAmt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 5. PAYMENT INFORMATION & TOTALS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.18fr 1fr', gap: 16, alignItems: 'stretch', position: 'relative', zIndex: 1 }}>
          {/* Left: Payment Information */}
          <div style={{ border: '1px solid #d1e7dd', borderRadius: 8, background: '#ffffff', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#f2f7f4', borderBottom: '1px solid #d1e7dd', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={15} color="#1b4332" />
              <span style={{ color: '#1b4332', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.06em' }}>
                PAYMENT INFORMATION
              </span>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.76rem', flex: 1, justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 120, color: '#475569', flexShrink: 0, fontWeight: 500 }}>Bank Name</span>
                <span style={{ width: 18, color: '#64748b', textAlign: 'center' }}>:</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>{document.bankName || 'HDFC Bank Ltd.'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 120, color: '#475569', flexShrink: 0, fontWeight: 500 }}>Account Number</span>
                <span style={{ width: 18, color: '#64748b', textAlign: 'center' }}>:</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>{document.accountNumber || '50200084920194'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 120, color: '#475569', flexShrink: 0, fontWeight: 500 }}>IFSC Code</span>
                <span style={{ width: 18, color: '#64748b', textAlign: 'center' }}>:</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>{document.ifscCode || 'HDFC0001234'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 120, color: '#475569', flexShrink: 0, fontWeight: 500 }}>Branch</span>
                <span style={{ width: 18, color: '#64748b', textAlign: 'center' }}>:</span>
                <span style={{ color: '#0f172a', fontWeight: 500 }}>{document.branch || 'BKC Premier Mumbai'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 120, color: '#475569', flexShrink: 0, fontWeight: 500 }}>UPI ID</span>
                <span style={{ width: 18, color: '#64748b', textAlign: 'center' }}>:</span>
                <span style={{ color: '#1b4332', fontWeight: 800 }}>{document.upiId || 'apexcorp@hdfcbank'}</span>
              </div>
            </div>
          </div>

          {/* Right: Totals & Balance Due */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, padding: '4px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Subtotal</span>
              <span style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                {currencySymbol}{formatAmount(calc.subtotal)}
              </span>
            </div>

            {calc.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', color: '#059669' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Discount</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  -{currencySymbol}{formatAmount(calc.discountAmount)}
                </span>
              </div>
            )}

            {calc.taxAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                <span style={{ fontSize: '0.84rem', color: '#475569' }}>Tax ({billTaxRate}%)</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                  {currencySymbol}{formatAmount(calc.taxAmount)}
                </span>
              </div>
            )}

            {calc.additionalCharges > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                <span style={{ fontSize: '0.84rem', color: '#475569' }}>Additional Charges</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                  {currencySymbol}{formatAmount(calc.additionalCharges)}
                </span>
              </div>
            )}

            <div style={{ borderTop: '1px solid #e2e8f0', margin: '3px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
              <span style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>Total Bill Amount</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1b4332', fontVariantNumeric: 'tabular-nums' }}>
                {currencySymbol}{formatAmount(calc.grandTotal)}
              </span>
            </div>

            {calc.amountPaid > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', color: '#64748b' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Amount Paid</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  {currencySymbol}{formatAmount(calc.amountPaid)}
                </span>
              </div>
            )}

            <div
              style={{
                backgroundColor: '#1b4332',
                borderRadius: 8,
                padding: '11px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 2,
              }}
            >
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>Balance Due</span>
              <span style={{ fontSize: '1.22rem', fontWeight: 900, color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                {currencySymbol}{formatAmount(calc.balanceDue)}
              </span>
            </div>
          </div>
        </div>

        {/* 6. NOTES & TERMS + BARCODE STRIP */}
        <div
          style={{
            background: '#f2f7f4',
            border: '1px solid #d1e7dd',
            borderRadius: 8,
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
            gap: 16,
          }}
        >
          {/* Left: Notes & Terms */}
          <div style={{ flex: 1, paddingRight: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
              <FileText size={15} color="#1b4332" />
              <span style={{ color: '#1b4332', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.06em' }}>
                NOTES &amp; TERMS
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#334155', lineHeight: 1.45 }}>
              <div style={{ fontWeight: 600 }}>{document.notes || 'Thank you for your business.'}</div>
              <div style={{ color: '#64748b', marginTop: 2 }}>
                Terms: {document.termsAndConditions || 'Goods/services are subject to the agreed terms.'}
              </div>
            </div>
          </div>

          {/* Right: Barcode Strip */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <svg width="145" height="28" viewBox="0 0 140 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="0" width="2.5" height="26" fill="#1e293b" />
              <rect x="6" y="0" width="3.5" height="26" fill="#1e293b" />
              <rect x="11" y="0" width="1.5" height="26" fill="#1e293b" />
              <rect x="14" y="0" width="3" height="26" fill="#1e293b" />
              <rect x="19" y="0" width="2" height="26" fill="#1e293b" />
              <rect x="23" y="0" width="4.5" height="26" fill="#1e293b" />
              <rect x="29.5" y="0" width="2" height="26" fill="#1e293b" />
              <rect x="33" y="0" width="1.5" height="26" fill="#1e293b" />
              <rect x="36" y="0" width="4" height="26" fill="#1e293b" />
              <rect x="42" y="0" width="2" height="26" fill="#1e293b" />
              <rect x="46" y="0" width="1.5" height="26" fill="#1e293b" />
              <rect x="49" y="0" width="3" height="26" fill="#1e293b" />
              <rect x="54" y="0" width="2.5" height="26" fill="#1e293b" />
              <rect x="58.5" y="0" width="4" height="26" fill="#1e293b" />
              <rect x="64.5" y="0" width="2" height="26" fill="#1e293b" />
              <rect x="68" y="0" width="3" height="26" fill="#1e293b" />
              <rect x="73" y="0" width="1.5" height="26" fill="#1e293b" />
              <rect x="76" y="0" width="4.5" height="26" fill="#1e293b" />
              <rect x="82.5" y="0" width="2" height="26" fill="#1e293b" />
              <rect x="86" y="0" width="3" height="26" fill="#1e293b" />
              <rect x="91" y="0" width="1.5" height="26" fill="#1e293b" />
              <rect x="94.5" y="0" width="4" height="26" fill="#1e293b" />
              <rect x="100.5" y="0" width="2" height="26" fill="#1e293b" />
              <rect x="104.5" y="0" width="3" height="26" fill="#1e293b" />
              <rect x="109.5" y="0" width="1.5" height="26" fill="#1e293b" />
              <rect x="113" y="0" width="4" height="26" fill="#1e293b" />
              <rect x="119" y="0" width="2" height="26" fill="#1e293b" />
              <rect x="123" y="0" width="4.5" height="26" fill="#1e293b" />
              <rect x="129.5" y="0" width="2" height="26" fill="#1e293b" />
              <rect x="133.5" y="0" width="2.5" height="26" fill="#1e293b" />
            </svg>
            <div style={{ fontSize: '0.68rem', color: '#0f172a', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.08em', marginTop: 4 }}>
              *{cleanBillNum}*
            </div>
          </div>
        </div>

        {/* 7. FOOTER & AUTHORIZED SIGNATORY */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%',
            marginTop: 'auto',
            paddingTop: 16,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Left: Authorized Signatory */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={16} color="#1b4332" strokeWidth={3} />
            </div>
            <div>
              {document.signature && (
                <img src={document.signature} alt="Sign" style={{ maxHeight: 32, maxWidth: 110, objectFit: 'contain', marginBottom: 2 }} />
              )}
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>Authorized Signatory</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{senderName || 'Apex Corporate'}</div>
            </div>
          </div>

          {/* Right: Thank You! For Your Business */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Caveat', 'Playball', 'Brush Script MT', cursive", fontSize: '2.1rem', color: '#1b4332', lineHeight: 1, letterSpacing: '0.02em' }}>
              Thank You!
            </div>
            <div style={{ fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.18em', color: '#64748b', textTransform: 'uppercase', marginTop: 4 }}>
              FOR YOUR BUSINESS
            </div>
          </div>
        </div>

        {/* Bottom A4 Standard Format tag */}
        <div style={{ fontSize: '0.64rem', color: '#94a3b8', textAlign: 'center', width: '100%', marginTop: 8, position: 'relative', zIndex: 1 }}>
          Format: A4 Standard (210 x 297 mm)
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. MEDICAL & HEALTHCARE CLINICAL BILL (layout === 'clinical', id: 'medical-clinical')
  // =========================================================================
  if (layout === 'clinical') {
    const clinicalItems = document.items.length > 0 ? document.items : [
      { id: '1', name: 'Enterprise Architecture Consulting', description: '', qty: 20, rate: 2500, taxRate: 0 },
      { id: '2', name: 'Cloud Infrastructure Audit & Hardening', description: '', qty: 10, rate: 3500, taxRate: 0 },
      { id: '3', name: 'Executive Stakeholder Presentation', description: '', qty: 3, rate: 1500, taxRate: 0 },
    ];

    const cleanBillId = cleanBillNum.replace(/^(BL|BILL|BIL)[-_ ]*/i, '') || '2026-5479';
    const displayBillId = cleanBillId;

    return (
      <div
        className={`a4-paper-sheet tpl-clinical bill-document-sheet ${className}`}
        id="printable-bill-canvas"
        style={{
          ...sharedCanvasStyle,
          position: 'relative',
          overflow: 'hidden',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          padding: '32px 38px 24px 38px',
          minHeight: 1080,
          maxWidth: 800,
          margin: '0 auto',
          boxSizing: 'border-box',
          fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* Bottom Left Fluid Organic Wave Decorative Accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 240,
            height: 110,
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 0,
          }}
        >
          <svg width="240" height="110" viewBox="0 0 240 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M-20 110 C35 108 65 72 120 70 C175 68 195 96 250 110 Z"
              fill="#eddcd1"
              opacity="0.85"
            />
            <path
              d="M-20 110 C25 96 55 84 95 84 C140 84 170 102 215 110 Z"
              fill="#f4ede6"
            />
            <path
              d="M-20 110 C15 102 40 93 70 93 C105 93 130 105 165 110 Z"
              fill="#e8edf2"
              opacity="0.75"
            />
          </svg>
        </div>

        {/* 1. Hospital Header Section */}
        <div
          className="clinical-header"
          style={{
            borderBottom: '1px solid #cbd5e1',
            paddingBottom: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Left: 4-Quadrant Clinical Cross Logo + Brand Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {senderLogo ? (
              <div
                style={{
                  width: 50,
                  height: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={senderLogo}
                  alt={senderName}
                  style={{
                    maxWidth: 50,
                    maxHeight: 50,
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>
            ) : (
              <div style={{ flexShrink: 0 }}>
                <svg width="50" height="50" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Top Arm */}
                  <rect x="20" y="2" width="14" height="20" rx="6" fill="#475569" />
                  {/* Left Arm */}
                  <rect x="2" y="20" width="20" height="14" rx="6" fill="#475569" />
                  {/* Right Arm */}
                  <rect x="32" y="20" width="20" height="14" rx="6" fill="#475569" />
                  {/* Bottom Arm */}
                  <rect x="20" y="32" width="14" height="20" rx="6" fill="#475569" />
                  {/* Core Junction */}
                  <rect x="19" y="19" width="16" height="16" fill="#475569" />
                  {/* Warm Apricot Swoosh / Crescent */}
                  <path
                    d="M20 28 C20 42 29 49 44 44 C31 43 26 36 26 28 Z"
                    fill="#dfc3ab"
                  />
                  <path
                    d="M20 28 C20 38 27 46 41 40 C30 40 25 34 25 28 Z"
                    fill="#cda58a"
                  />
                </svg>
              </div>
            )}

            <div>
              <h1
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: '#1e293b',
                  margin: 0,
                  letterSpacing: '0.04em',
                  lineHeight: 1.15,
                  textTransform: 'uppercase',
                }}
              >
                {senderName === 'Apex Corporate' ? 'APEX HOSPITAL' : senderName.toUpperCase()}
              </h1>
              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  letterSpacing: '0.24em',
                  color: '#475569',
                  marginTop: 4,
                  textTransform: 'uppercase',
                }}
              >
                HEALTH &nbsp;•&nbsp; CARE &nbsp;•&nbsp; TRUST
              </div>
            </div>
          </div>

          {/* Right: Contact Information Stack */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              fontSize: '0.74rem',
              color: '#475569',
              textAlign: 'left',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={13} color="#475569" style={{ flexShrink: 0 }} />
              <span>{senderAddress || '101 Cyber Towers, BKC, Mumbai 400051'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={13} color="#475569" style={{ flexShrink: 0 }} />
              <span>{senderPhone || '+91 98765 43210'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={13} color="#475569" style={{ flexShrink: 0 }} />
              <span>{senderEmail || 'billing@apexcorp.com'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={13} color="#475569" style={{ flexShrink: 0 }} />
              <span>{senderWebsite || 'www.apexcorp.com'}</span>
            </div>
          </div>
        </div>

        {/* 2. Dual Provider & Bill Details Cards (Symmetrical Grid) */}
        <div
          className="clinical-dual-cards"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            alignItems: 'stretch',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Left Card: Provider / Corporate Billing Service */}
          <div
            style={{
              background: '#fcfbf9',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Building2 size={19} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.96rem', lineHeight: 1.2 }}>
                    {senderName || 'Apex Corporate'}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 2 }}>
                    {senderTagline || 'Corporate Billing Services'}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 10, lineHeight: 1.45 }}>
                {senderAddress || '101 Cyber Towers, BKC, Mumbai 400051'} &nbsp;|&nbsp; Offc. Dept. - {senderPhone || '+91 98765 43210'}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#475569', marginTop: 5 }}>
                <Mail size={12} color="#475569" style={{ flexShrink: 0 }} />
                <span>{senderEmail || 'billing@apexcorp.com'}</span>
              </div>
            </div>

            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#1e293b', marginTop: 8, paddingTop: 2 }}>
              GSTIN / Tax: {senderTaxNumber || '27AABCA1234F1Z9'}
            </div>
          </div>

          {/* Right Card: Bill Identification & Case Particulars */}
          <div
            style={{
              background: '#fcfbf9',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.94rem',
                  fontWeight: 800,
                  color: '#1e293b',
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                }}
              >
                OPD / IPD BILL # BL-{cleanBillId}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8, fontSize: '0.74rem', color: '#475569' }}>
                <div>Date: {formatHeaderDate(document.issueDate) || '2026-09-06'}</div>
                <div>Time: 10:45 AM</div>
              </div>
            </div>

            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#1e293b', marginTop: 8, paddingTop: 2 }}>
              CASE/S / UID: {document.poNumber || 'PO-12345'}
            </div>
          </div>
        </div>

        {/* 3. 4-Segment Transaction Meta Strip */}
        <div
          style={{
            background: '#fcfbf9',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '12px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Segment 1: Bill # */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={18} color="#64748b" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.08em' }}>
                BILL #
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1e293b', marginTop: 2 }}>
                BILL-{cleanBillId}
              </div>
            </div>
          </div>

          {/* Segment 2: Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calendar size={18} color="#64748b" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.08em' }}>
                DATE
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1e293b', marginTop: 2 }}>
                {formatHeaderDate(document.issueDate) || '2026-09-06'}
              </div>
            </div>
          </div>

          {/* Segment 3: Ref / PO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={18} color="#64748b" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.08em' }}>
                REF. / PO
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1e293b', marginTop: 2 }}>
                {document.poNumber || 'PO-12345'}
              </div>
            </div>
          </div>

          {/* Segment 4: Cashier */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <User size={18} color="#64748b" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.08em' }}>
                CASHIER
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1e293b', marginTop: 2 }}>
                STAFF #03
              </div>
            </div>
          </div>
        </div>

        {/* 4. Table of Particulars / Procedures */}
        <div
          style={{
            border: '1px solid #cbd5e1',
            borderRadius: 6,
            overflow: 'hidden',
            background: '#ffffff',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#52616b', color: '#ffffff' }}>
                <th
                  style={{
                    width: '6%',
                    textAlign: 'center',
                    padding: '11px 8px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  #
                </th>
                <th
                  style={{
                    width: '44%',
                    textAlign: 'left',
                    padding: '11px 16px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  PARTICULARS / ITEM DESCRIPTION
                </th>
                <th
                  style={{
                    width: '10%',
                    textAlign: 'center',
                    padding: '11px 8px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  UNITS
                </th>
                <th
                  style={{
                    width: '14%',
                    textAlign: 'center',
                    padding: '11px 10px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  TARIFF
                </th>
                <th
                  style={{
                    width: '10%',
                    textAlign: 'center',
                    padding: '11px 8px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    borderRight: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  TAX
                </th>
                <th
                  style={{
                    width: '16%',
                    textAlign: 'right',
                    padding: '11px 16px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                  }}
                >
                  NET CHARGES
                </th>
              </tr>
            </thead>
            <tbody>
              {clinicalItems.map((item, idx) => {
                const itemQty = Number(item.qty) || 0;
                const itemRate = Number(item.rate) || 0;
                const itemAmt = itemQty * itemRate;
                const isLast = idx === clinicalItems.length - 1;

                return (
                  <tr
                    key={item.id || idx}
                    style={{
                      borderBottom: isLast ? 'none' : '1px solid #e2e8f0',
                      background: '#ffffff',
                    }}
                  >
                    <td
                      style={{
                        textAlign: 'center',
                        padding: '12px 8px',
                        fontSize: '0.78rem',
                        color: '#475569',
                        fontWeight: 600,
                        borderRight: '1px solid #e2e8f0',
                      }}
                    >
                      {idx + 1}
                    </td>
                    <td
                      style={{
                        textAlign: 'left',
                        padding: '12px 16px',
                        fontSize: '0.82rem',
                        color: '#1e293b',
                        fontWeight: 700,
                        borderRight: '1px solid #e2e8f0',
                      }}
                    >
                      <div>{item.name || item.description || 'Enterprise Consulting'}</div>
                      {item.name && item.description && item.description !== item.name && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 400, marginTop: 2 }}>
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td
                      style={{
                        textAlign: 'center',
                        padding: '12px 8px',
                        fontSize: '0.8rem',
                        color: '#1e293b',
                        fontWeight: 600,
                        borderRight: '1px solid #e2e8f0',
                      }}
                    >
                      {itemQty}
                    </td>
                    <td
                      style={{
                        textAlign: 'center',
                        padding: '12px 10px',
                        fontSize: '0.8rem',
                        color: '#1e293b',
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                        borderRight: '1px solid #e2e8f0',
                      }}
                    >
                      {currencySymbol}{formatAmount(itemRate)}
                    </td>
                    <td
                      style={{
                        textAlign: 'center',
                        padding: '12px 8px',
                        fontSize: '0.78rem',
                        color: '#475569',
                        fontWeight: 600,
                        borderRight: '1px solid #e2e8f0',
                      }}
                    >
                      {getItemTaxDisplay(item)}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        padding: '12px 16px',
                        fontSize: '0.84rem',
                        color: '#1e293b',
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {currencySymbol}{formatAmount(itemAmt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 5. Split Section: Payment Information (Left) + Totals & Balance Due (Right) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 0.85fr',
            gap: 16,
            alignItems: 'stretch',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Left Card: PAYMENT INFORMATION */}
          <div
            style={{
              background: '#fcfbf9',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 5,
                  background: '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CreditCard size={14} color="#475569" />
              </div>
              <span style={{ color: '#1e293b', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.06em' }}>
                PAYMENT INFORMATION
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: '0.76rem' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 116, color: '#475569' }}>Bank Name</span>
                <span style={{ width: 16, color: '#64748b', textAlign: 'center' }}>:</span>
                <span style={{ color: '#1e293b', fontWeight: 600 }}>{document.bankName || 'HDFC Bank Ltd.'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 116, color: '#475569' }}>Account Number</span>
                <span style={{ width: 16, color: '#64748b', textAlign: 'center' }}>:</span>
                <span style={{ color: '#1e293b', fontWeight: 600 }}>{document.accountNumber || '502000486720194'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 116, color: '#475569' }}>IFSC Code</span>
                <span style={{ width: 16, color: '#64748b', textAlign: 'center' }}>:</span>
                <span style={{ color: '#1e293b', fontWeight: 600 }}>{document.ifscCode || 'HDFC0001234'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 116, color: '#475569' }}>Branch</span>
                <span style={{ width: 16, color: '#64748b', textAlign: 'center' }}>:</span>
                <span style={{ color: '#1e293b', fontWeight: 600 }}>{document.branch || 'BKC Premier Mumbai'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 116, color: '#475569' }}>UPI ID</span>
                <span style={{ width: 16, color: '#64748b', textAlign: 'center' }}>:</span>
                <span style={{ color: '#1e293b', fontWeight: 600 }}>{document.upiId || 'apexcorp@hdfcbank'}</span>
              </div>
            </div>
          </div>

          {/* Right Totals Block */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 8,
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                <span style={{ fontSize: '0.86rem', color: '#475569' }}>Sub Total</span>
                <span style={{ fontSize: '0.96rem', fontWeight: 700, color: '#1e293b', fontVariantNumeric: 'tabular-nums' }}>
                  {currencySymbol}{formatAmount(calc.subtotal)}
                </span>
              </div>

              {calc.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', color: '#059669' }}>
                  <span style={{ fontSize: '0.86rem' }}>Concession / Discount</span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    -{currencySymbol}{formatAmount(calc.discountAmount)}
                  </span>
                </div>
              )}

              {calc.taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                  <span style={{ fontSize: '0.86rem', color: '#475569' }}>Tax ({billTaxRate}%)</span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1e293b', fontVariantNumeric: 'tabular-nums' }}>
                    {currencySymbol}{formatAmount(calc.taxAmount)}
                  </span>
                </div>
              )}

              {calc.additionalCharges > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                  <span style={{ fontSize: '0.86rem', color: '#475569' }}>Additional Charges</span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1e293b', fontVariantNumeric: 'tabular-nums' }}>
                    {currencySymbol}{formatAmount(calc.additionalCharges)}
                  </span>
                </div>
              )}

              <div style={{ borderTop: '1px solid #e2e8f0', margin: '3px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                <span style={{ fontSize: '1.04rem', fontWeight: 800, color: '#1e293b' }}>Total Bill Amount</span>
                <span style={{ fontSize: '1.26rem', fontWeight: 900, color: '#1e293b', fontVariantNumeric: 'tabular-nums' }}>
                  {currencySymbol}{formatAmount(calc.grandTotal)}
                </span>
              </div>

              {calc.amountPaid > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', color: '#64748b' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>Amount Paid</span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {currencySymbol}{formatAmount(calc.amountPaid)}
                  </span>
                </div>
              )}
            </div>

            {/* Apricot / Terracotta Balance Due Banner */}
            <div
              style={{
                backgroundColor: '#dfc3ab',
                borderRadius: 6,
                padding: '12px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 4,
              }}
            >
              <span style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1e293b' }}>Balance Due</span>
              <span style={{ fontSize: '1.24rem', fontWeight: 900, color: '#1e293b', fontVariantNumeric: 'tabular-nums' }}>
                {currencySymbol}{formatAmount(calc.balanceDue)}
              </span>
            </div>
          </div>
        </div>

        {/* 6. NOTES & TERMS + BARCODE STRIP */}
        <div
          style={{
            background: '#fcfbf9',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
            gap: 16,
          }}
        >
          {/* Left: Notes & Terms */}
          <div style={{ flex: 1, paddingRight: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
              <FileText size={15} color="#475569" />
              <span style={{ color: '#1e293b', fontWeight: 800, fontSize: '0.74rem', letterSpacing: '0.06em' }}>
                NOTES &amp; TERMS
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#334155', lineHeight: 1.45 }}>
              <div style={{ fontWeight: 600 }}>{document.notes || 'Thank you for your business.'}</div>
              <div style={{ color: '#64748b', marginTop: 2 }}>
                Terms: {document.termsAndConditions || 'Goods/services are subject to the agreed terms.'}
              </div>
            </div>
          </div>

          {/* Right: Barcode Strip */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <svg width="150" height="28" viewBox="0 0 150 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="0" width="2.5" height="28" fill="#1e293b" />
              <rect x="6.5" y="0" width="3.5" height="28" fill="#1e293b" />
              <rect x="12" y="0" width="1.5" height="28" fill="#1e293b" />
              <rect x="15" y="0" width="3" height="28" fill="#1e293b" />
              <rect x="20.5" y="0" width="2" height="28" fill="#1e293b" />
              <rect x="24.5" y="0" width="4.5" height="28" fill="#1e293b" />
              <rect x="31" y="0" width="2" height="28" fill="#1e293b" />
              <rect x="35" y="0" width="1.5" height="28" fill="#1e293b" />
              <rect x="38.5" y="0" width="4" height="28" fill="#1e293b" />
              <rect x="45" y="0" width="2" height="28" fill="#1e293b" />
              <rect x="49" y="0" width="1.5" height="28" fill="#1e293b" />
              <rect x="52.5" y="0" width="3" height="28" fill="#1e293b" />
              <rect x="58" y="0" width="2.5" height="28" fill="#1e293b" />
              <rect x="62.5" y="0" width="4" height="28" fill="#1e293b" />
              <rect x="69" y="0" width="2" height="28" fill="#1e293b" />
              <rect x="73" y="0" width="3" height="28" fill="#1e293b" />
              <rect x="78" y="0" width="1.5" height="28" fill="#1e293b" />
              <rect x="81.5" y="0" width="4.5" height="28" fill="#1e293b" />
              <rect x="88" y="0" width="2" height="28" fill="#1e293b" />
              <rect x="92" y="0" width="1.5" height="28" fill="#1e293b" />
              <rect x="95.5" y="0" width="3.5" height="28" fill="#1e293b" />
              <rect x="101" y="0" width="2" height="28" fill="#1e293b" />
              <rect x="105" y="0" width="4" height="28" fill="#1e293b" />
              <rect x="111" y="0" width="1.5" height="28" fill="#1e293b" />
              <rect x="114.5" y="0" width="3" height="28" fill="#1e293b" />
              <rect x="119.5" y="0" width="2.5" height="28" fill="#1e293b" />
              <rect x="124" y="0" width="4.5" height="28" fill="#1e293b" />
              <rect x="130.5" y="0" width="2" height="28" fill="#1e293b" />
              <rect x="134.5" y="0" width="3.5" height="28" fill="#1e293b" />
              <rect x="140" y="0" width="2" height="28" fill="#1e293b" />
              <rect x="144" y="0" width="3" height="28" fill="#1e293b" />
            </svg>
            <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#1e293b', letterSpacing: '0.08em', marginTop: 3 }}>
              *BILL-{cleanBillId}*
            </div>
          </div>
        </div>

        {/* 7. Footer: Brand Tagline (Left) + Optional Signature (Right) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingTop: 12,
            marginTop: 'auto',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Left: Brand Bar + Partner Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 3,
                height: 34,
                backgroundColor: '#d8b49e',
                borderRadius: 2,
              }}
            />
            <div>
              <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.88rem' }}>
                {senderName === 'Apex Corporate' ? 'Apex Hospital' : senderName}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 2 }}>
                {senderTagline || 'Trusted Healthcare Partner'}
              </div>
            </div>
          </div>

          {/* Right: Signature (Only if explicitly provided on document; fake scribble removed) */}
          {document.signature ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 140 }}>
              <img
                src={document.signature}
                alt="Authorized Signature"
                style={{ maxHeight: 32, maxWidth: 130, objectFit: 'contain' }}
              />
              <div style={{ borderTop: '1px solid #1e293b', width: '100%', marginTop: 2, paddingTop: 3, textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1e293b' }}>
                  Authorized Signature
                </div>
                <div style={{ fontSize: '0.66rem', color: '#64748b' }}>
                  {senderName === 'Apex Corporate' ? 'Apex Hospital' : senderName}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* 8. Bottom Center Footnote: HEALTH • CARE • TRUST */}
        <div
          style={{
            borderTop: '1px solid #e2e8f0',
            marginTop: 8,
            paddingTop: 10,
            paddingBottom: 4,
            textAlign: 'center',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.24em',
            color: '#52616b',
            textTransform: 'uppercase',
            position: 'relative',
            zIndex: 1,
          }}
        >
          HEALTH &nbsp;•&nbsp; CARE &nbsp;•&nbsp; TRUST
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. ACADEMY & TUITION FEE VOUCHER (layout === 'academic', id: 'academia-blue')
  // =========================================================================
  if (layout === 'academic') {
    const cleanBillId = cleanBillNum.replace(/^(BL|BILL|BIL|REC|INV)[-_ ]*/i, '') || '2026-5479';
    const activeLogo = senderLogo || document.logo;

    return (
      <div
        className={`a4-paper-sheet tpl-academic bill-document-sheet ${className}`}
        id="printable-bill-canvas"
        style={{
          ...sharedCanvasStyle,
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
          fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
          border: '1.5px solid #C7D2FE',
          borderRadius: 12,
        }}
      >
        {/* Top Right Subtle Collegiate Geometric Accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 140,
            height: 140,
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 0,
          }}
        >
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
            <path d="M0 0 L140 0 L140 140 Z" fill="#EEF2FF" opacity="0.85" />
          </svg>
        </div>

        {/* 1. Royal Academia Blue Collegiate Header with Gold Accent */}
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
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Heraldic Collegiate Badge or Custom Logo */}
            {activeLogo ? (
              <img
                src={activeLogo}
                alt="Logo"
                style={{
                  maxHeight: 48,
                  maxWidth: 120,
                  objectFit: 'contain',
                  borderRadius: 6,
                  background: '#ffffff',
                  padding: '3px 6px',
                }}
              />
            ) : (
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
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
                }}
              >
                <GraduationCap size={28} color="#E2B93B" />
              </div>
            )}
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#FFFFFF', letterSpacing: '0.02em', lineHeight: 1.2 }}>
                {senderName || 'Cambridge Global Academy'}
              </h2>
              <div style={{ fontSize: '0.74rem', color: '#FCD34D', fontWeight: 700, fontStyle: 'italic', marginTop: 3 }}>
                {senderTagline || 'Excellence in Higher Education & Research'}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.85)', marginTop: 4, lineHeight: 1.4 }}>
                {[senderAddress || '101 University Boulevard, Knowledge Park, Bangalore 560001', senderPhone && `Bursar Ph: ${senderPhone}`, senderEmail].filter(Boolean).join('  •  ')}
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
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
              }}
            >
              AUTUMN SEMESTER 2026-27
            </div>
            <div style={{ fontSize: '0.94rem', fontWeight: 900, letterSpacing: '0.02em', color: '#FFFFFF', marginTop: 5, whiteSpace: 'nowrap' }}>
              OFFICIAL TUITION VOUCHER #BL-{cleanBillId}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.9)', marginTop: 3 }}>
              Issue Date: <strong>{formatHeaderDate(document.issueDate) || '2026-09-06'}</strong>
            </div>
            {document.dueDate && (
              <div style={{ fontSize: '0.70rem', color: '#FCA5A5', fontWeight: 600, marginTop: 1 }}>
                Late Fee Due: {formatHeaderDate(document.dueDate)}
              </div>
            )}
            <div style={{ fontSize: '0.70rem', color: '#FCD34D', fontWeight: 700, marginTop: 3, letterSpacing: '0.02em' }}>
              ROLL / ENROLMENT: {document.poNumber || 'CGA-2026-089'}
            </div>
          </div>
        </div>

        {/* 2. Symmetrical Collegiate Dual Information Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'stretch' }}>
          {/* Card 1: Institution / Bursar Particulars */}
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
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.94rem', marginTop: 4, lineHeight: 1.2 }}>
                {senderName || 'Cambridge Global Academy'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#283593', fontWeight: 600, marginTop: 2 }}>
                Affiliation: UGC / AICTE Recognized • Inst ID: #AC-9428
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 6, lineHeight: 1.4 }}>
                {senderAddress || '101 University Boulevard, Knowledge Park, Bangalore 560001'}
              </div>
              <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: 4 }}>
                {[senderPhone && `Ph: ${senderPhone}`, senderEmail].filter(Boolean).join('  •  ')}
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1E293B', marginTop: 10, paddingTop: 4, borderTop: '1px solid #E2E8F0' }}>
              INST REG / TAX: {senderTaxNumber || '27AABCA1234F1Z9'}
            </div>
          </div>

          {/* Card 2: Student / Payee Particulars */}
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
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.94rem', marginTop: 4, lineHeight: 1.2 }}>
                {clientName || 'Rahul Sharma'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#283593', fontWeight: 600, marginTop: 2 }}>
                {clientCompany && clientCompany !== clientName ? clientCompany : 'Bachelor of Technology (Computer Science) • Batch 2026-30'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 6, lineHeight: 1.4 }}>
                {clientAddress || 'Flat 402, Greenfield Residency, Metro Station Road'}
              </div>
              <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: 4 }}>
                {[clientPhone && `Ph: ${clientPhone}`, clientEmail].filter(Boolean).join('  •  ')}
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1E293B', marginTop: 10, paddingTop: 4, borderTop: '1px solid #E2E8F0' }}>
              ROLL NO / UID: {document.poNumber || 'CGA-2026-089'}
            </div>
          </div>
        </div>

        {/* 3. Tuition & Curricular Fee Table */}
        <div style={{ border: '1.5px solid #283593', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#283593', color: '#FFFFFF' }}>
                <th style={{ width: '46%', textAlign: 'left', padding: '11px 14px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  FEE PARTICULARS / COURSE MODULES / LAB SESSIONS
                </th>
                <th style={{ width: '12%', textAlign: 'center', padding: '11px 8px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  CREDITS / QTY
                </th>
                <th style={{ width: '14%', textAlign: 'right', padding: '11px 10px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  RATE / FEE
                </th>
                <th style={{ width: '12%', textAlign: 'center', padding: '11px 8px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  TAX / CESS
                </th>
                <th style={{ width: '16%', textAlign: 'right', padding: '11px 14px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  NET AMOUNT
                </th>
              </tr>
            </thead>
            <tbody>
              {document.items.map((item, idx) => {
                const itemAmt = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                const isEven = idx % 2 === 1;
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0', background: isEven ? '#F8FAFC' : '#FFFFFF' }}>
                    <td style={{ textAlign: 'left', padding: '11px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.82rem' }}>
                        {item.name || item.description || 'Academic Tuition Particular'}
                      </div>
                      {item.name && item.description && item.description !== item.name && (
                        <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: 2 }}>{item.description}</div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', padding: '11px 8px', fontWeight: 600, fontSize: '0.80rem', color: '#334155' }}>
                      {item.qty}
                    </td>
                    <td style={{ textAlign: 'right', padding: '11px 10px', fontVariantNumeric: 'tabular-nums', fontSize: '0.80rem', color: '#334155' }}>
                      {currencySymbol}{formatAmount(item.rate)}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '0.74rem', color: '#64748B', padding: '11px 8px' }}>
                      {getItemTaxDisplay(item)}
                    </td>
                    <td style={{ textAlign: 'right', padding: '11px 14px', fontWeight: 800, color: '#283593', fontVariantNumeric: 'tabular-nums', fontSize: '0.84rem' }}>
                      {currencySymbol}{formatAmount(itemAmt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 4. Split Section: Seal & Remittance (Left) vs Fee Totals & Due Banner (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 16, alignItems: 'stretch' }}>
          {/* Left: Official Seal & Bursar Remittance */}
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
              <div
                style={{
                  background: '#283593',
                  color: '#E2B93B',
                  padding: '5px 12px',
                  borderRadius: 4,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 800,
                  fontSize: '0.70rem',
                  letterSpacing: '0.04em',
                }}
              >
                <Award size={15} color="#E2B93B" />
                <span>★ OFFICIAL UNIVERSITY SEAL: VERIFIED &amp; AUDITED ★</span>
              </div>

              {hasBankDetails ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8, fontSize: '0.74rem', color: '#475569' }}>
                  <div>Bank: <strong style={{ color: '#0F172A' }}>{document.bankName}</strong></div>
                  <div>Account No: <strong style={{ color: '#0F172A' }}>{document.accountNumber}</strong></div>
                  <div>IFSC Code: <strong style={{ color: '#0F172A' }}>{document.ifscCode}</strong> {document.branch && `(${document.branch})`}</div>
                  {document.upiId && <div>UPI ID: <strong style={{ color: '#283593' }}>{document.upiId}</strong></div>}
                  <div style={{ fontSize: '0.68rem', color: '#283593', fontStyle: 'italic', marginTop: 2 }}>
                    Quote Student Enrolment Ref: <strong>{document.poNumber || 'CGA-2026-089'}</strong> in payment remarks.
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontStyle: 'italic', marginTop: 8 }}>
                  Please remit tuition fees according to the official academic schedule via NEFT / RTGS / Online Portal.
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 8, marginTop: 10 }}>
              <div style={{ fontWeight: 800, color: '#283593', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.03em' }}>
                ACADEMIC REGULATIONS &amp; TERMS:
              </div>
              {document.notes && (
                <div style={{ fontSize: '0.70rem', color: '#475569', marginTop: 2 }}>
                  <strong>Notes:</strong> {document.notes}
                </div>
              )}
              {cleanPaymentInstructions && (
                <div style={{ fontSize: '0.70rem', color: '#475569', fontStyle: 'italic', marginTop: 2 }}>
                  {cleanPaymentInstructions}
                </div>
              )}
              <div style={{ fontSize: '0.66rem', color: '#64748B', marginTop: 3, lineHeight: 1.4 }}>
                1. Tuition fees once remitted are subject to institutional academic refund regulations.<br />
                2. Official fee voucher eligible for educational tax benefits under applicable laws.
              </div>
            </div>
          </div>

          {/* Right: Fee Totals Breakdown & Balance Due Banner */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: 8,
              padding: '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Gross Tuition Fee:</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{currencySymbol}{formatAmount(calc.subtotal)}</span>
              </div>
              {calc.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
                  <span>Scholarship / Concession:</span>
                  <span>-{currencySymbol}{formatAmount(calc.discountAmount)}</span>
                </div>
              )}
              {calc.taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Education Cess ({billTaxRate}%):</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{currencySymbol}{formatAmount(calc.taxAmount)}</span>
                </div>
              )}
              {calc.additionalCharges > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Lab / Exam Charges:</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{currencySymbol}{formatAmount(calc.additionalCharges)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, borderTop: '1px solid #E2E8F0', paddingTop: 6, color: '#0F172A', fontSize: '0.82rem' }}>
                <span>Total Tuition Fee:</span>
                <span>{currencySymbol}{formatAmount(calc.grandTotal)}</span>
              </div>
              {calc.amountPaid > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                  <span>Fee Paid / Advance:</span>
                  <span>{currencySymbol}{formatAmount(calc.amountPaid)}</span>
                </div>
              )}

              {/* Outstanding Balance Due Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #1E2B69 0%, #283593 100%)',
                  color: '#FFFFFF',
                  padding: '12px 16px',
                  borderRadius: 6,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 4,
                  boxShadow: '0 2px 6px rgba(40,53,147,0.2)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.64rem', color: '#FCD34D', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    OUTSTANDING
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, letterSpacing: '0.01em' }}>
                    Balance Tuition Due
                  </div>
                </div>
                <div style={{ fontSize: '1.20rem', fontWeight: 900, color: '#FCD34D', fontVariantNumeric: 'tabular-nums' }}>
                  {currencySymbol}{formatAmount(calc.balanceDue)}
                </div>
              </div>
            </div>

            {/* Registrar Signature Endorsement */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: 12, paddingTop: 6 }}>
              <div style={{ width: 175, textAlign: 'center' }}>
                {document.signature ? (
                  <img src={document.signature} alt="Sign" style={{ maxHeight: 28, maxWidth: 130, objectFit: 'contain', marginBottom: 2 }} />
                ) : (
                  <div style={{ height: 16 }} />
                )}
                <div style={{ borderTop: '1.5px solid #283593', fontSize: '0.70rem', color: '#283593', fontWeight: 800, paddingTop: 3 }}>
                  Registrar / Finance Bursar
                </div>
                <div style={{ fontSize: '0.64rem', color: '#64748B', marginTop: 1 }}>
                  {senderName || 'Authorized Signatory'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Anchored Collegiate Footnote Motto */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 8,
            textAlign: 'center',
            borderTop: '1px dashed #CBD5E1',
            fontSize: '0.66rem',
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
  // 4. CREATIVE AGENCY SERVICES BILL (layout === 'sidebar', id: 'warm-saffron-bill')
  // =========================================================================
  if (layout === 'sidebar') {
    const cleanBillId = cleanBillNum.replace(/^(BL|BILL|BIL|REC|INV)[-_ ]*/i, '') || '2026-5479';
    const activeLogo = senderLogo || document.logo;

    return (
      <div
        className={`a4-paper-sheet tpl-sidebar bill-document-sheet ${className}`}
        id="printable-bill-canvas"
        style={{
          ...sharedCanvasStyle,
          position: 'relative',
          overflow: 'hidden',
          background: '#FFFFFF',
          padding: '24px 26px',
          minHeight: 1080,
          maxWidth: 800,
          margin: '0 auto',
          boxSizing: 'border-box',
          fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
          border: '1.5px solid #FFCC80',
          borderRadius: 12,
        }}
      >
        <div
          className="tpl-sidebar-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '240px 1fr',
            gap: 20,
            height: '100%',
            minHeight: '100%',
          }}
        >
          {/* Left Brand Column (Warm Terracotta / Saffron Vertical Brand Sidebar) */}
          <div
            className="tpl-sidebar-left"
            style={{
              background: 'linear-gradient(180deg, #E65100 0%, #BF360C 100%)',
              padding: '22px 16px',
              borderRadius: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              color: '#FFFFFF',
              boxShadow: '0 4px 16px rgba(230,81,0,0.22)',
              boxSizing: 'border-box',
            }}
          >
            <div>
              {activeLogo ? (
                <div style={{ marginBottom: 8 }}>
                  <img
                    src={activeLogo}
                    alt={senderName}
                    style={{
                      maxHeight: 46,
                      maxWidth: 150,
                      objectFit: 'contain',
                      background: '#FFFFFF',
                      borderRadius: 6,
                      padding: '4px 8px',
                      display: 'block',
                    }}
                  />
                </div>
              ) : null}
              <div style={{ fontWeight: 900, fontSize: '1.38rem', color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {senderName || 'Apex Corporate'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#FED7AA', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 4 }}>
                {senderTagline || 'Corporate Billing Services'}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'rgba(255,255,255,0.20)',
                  padding: '4px 9px',
                  borderRadius: 5,
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginTop: 8,
                }}
              >
                <Sparkles size={12} color="#FED7AA" />
                <span>VERIFIED CREATIVE PARTNER</span>
              </div>
            </div>

            {/* Sidebar Contact Details in Frosted Glass Card */}
            <div
              style={{
                fontSize: '0.72rem',
                color: '#FFFFFF',
                background: 'rgba(255,255,255,0.14)',
                border: '1px solid rgba(255,255,255,0.22)',
                padding: '14px 14px',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.68rem', color: '#FED7AA', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                STUDIO HEADQUARTERS
              </div>
              <div style={{ lineHeight: 1.45 }}>{senderAddress || '101 Cyber Towers, BKC, Mumbai 400051'}</div>
              {senderPhone && <div>Ph: {senderPhone}</div>}
              {senderEmail && <div style={{ wordBreak: 'break-all' }}>{senderEmail}</div>}
              {document.senderWebsite && <div>{document.senderWebsite}</div>}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.22)', paddingTop: 6, marginTop: 4, fontWeight: 700, color: '#FED7AA', fontSize: '0.70rem' }}>
                GSTIN: {senderTaxNumber || '27AABCA1234F1Z9'}
              </div>
            </div>

            {/* Creative Engagement Scope Card */}
            <div
              style={{
                fontSize: '0.70rem',
                color: '#FFFFFF',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.20)',
                padding: '12px 14px',
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.66rem', color: '#FED7AA', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                ENGAGEMENT SCOPE
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Type:</span>
                <strong>Milestone Retainer</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>IP Rights:</span>
                <strong>100% Release</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Contract Ref:</span>
                <strong>{document.poNumber || 'PO-12345'}</strong>
              </div>
            </div>

            {/* Instant Pay QR Badge */}
            <div
              className="sidebar-qr-badge"
              style={{
                background: '#FFFFFF',
                color: '#E65100',
                padding: '14px 12px',
                borderRadius: 8,
                textAlign: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
              }}
            >
              <QrCode size={38} color="#E65100" style={{ margin: '0 auto 5px auto' }} />
              <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#0F172A', letterSpacing: '0.04em' }}>
                SCAN TO PAY VIA UPI
              </div>
              <div style={{ fontSize: '0.68rem', color: '#C2410C', fontWeight: 800, marginTop: 3, wordBreak: 'break-all' }}>
                {document.upiId || 'apexcorp@hdfcbank'}
              </div>
              <div style={{ fontSize: '0.60rem', color: '#64748B', marginTop: 2 }}>
                Instant settlement via any UPI App
              </div>
            </div>

            {/* Sidebar Bank Remittance Card */}
            {hasBankDetails && (
              <div
                style={{
                  background: 'rgba(255,255,255,0.14)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  padding: '14px 14px',
                  borderRadius: 8,
                  fontSize: '0.72rem',
                  color: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div style={{ fontWeight: 800, color: '#FED7AA', letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.68rem' }}>
                  WIRE REMITTANCE:
                </div>
                <div>Bank: <strong style={{ color: '#FFFFFF' }}>{document.bankName || 'HDFC Bank Ltd.'}</strong></div>
                <div>A/C: <strong style={{ color: '#FFFFFF' }}>{document.accountNumber || '50200084920194'}</strong></div>
                <div>IFSC: <strong style={{ color: '#FFFFFF' }}>{document.ifscCode || 'HDFC0001234'}</strong> {document.branch && `(${document.branch})`}</div>
                <div style={{ fontSize: '0.66rem', color: '#FED7AA', fontStyle: 'italic', marginTop: 3 }}>
                  Quote Ref #{cleanBillId} in remarks.
                </div>
              </div>
            )}

            {/* Creative Quality Guarantee Badge */}
            <div
              style={{
                fontSize: '0.66rem',
                color: 'rgba(255,255,255,0.92)',
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.16)',
                padding: '10px 12px',
                borderRadius: 8,
                lineHeight: 1.4,
              }}
            >
              <div style={{ fontWeight: 800, color: '#FED7AA', marginBottom: 2 }}>✦ CREATIVE SLA GUARANTEE</div>
              <div>Certified quality assurance &amp; strict NDA compliance on all creative deliverables.</div>
            </div>

            {/* Bottom Footnote in Sidebar */}
            <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '0.64rem', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.08em', textTransform: 'uppercase', paddingTop: 6 }}>
              LICENSED CREATIVE SERVICES
            </div>
          </div>

          {/* Right Charges & Deliverables Pane */}
          <div className="tpl-sidebar-right" style={{ display: 'flex', flexDirection: 'column', gap: 15, height: '100%', boxSizing: 'border-box' }}>
            {/* Header & Meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2.5px solid #E65100', paddingBottom: 12 }}>
              <div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#E65100', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {document.title || 'BILL'}
                </h1>
                <div
                  style={{
                    display: 'inline-block',
                    background: '#FFF7ED',
                    color: '#C2410C',
                    border: '1.5px solid #FFCC80',
                    padding: '4px 12px',
                    borderRadius: 5,
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    marginTop: 6,
                  }}
                >
                  BILL #{cleanBillId}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.76rem', color: '#475569', lineHeight: 1.6 }}>
                <div>Bill Date: <strong style={{ color: '#0F172A' }}>{formatHeaderDate(document.issueDate) || '2026-09-06'}</strong></div>
                <div>Payment Due: <strong style={{ color: '#0F172A' }}>{formatHeaderDate(document.dueDate) || '2026-10-06'}</strong></div>
                <div style={{ color: '#C2410C', fontWeight: 800, marginTop: 2 }}>
                  Project Ref: {document.poNumber || 'PO-12345'}
                </div>
              </div>
            </div>

            {/* Billed To Client Card with Warm Amber Tint */}
            <div style={{ background: '#FFF7ED', border: '1.5px solid #FFEDD5', borderRadius: 8, padding: '14px 18px', fontSize: '0.76rem' }}>
              <span style={{ fontSize: '0.68rem', color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                CLIENT / BILLED TO:
              </span>
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '1.02rem', marginTop: 3 }}>{clientName}</div>
              {clientCompany && clientCompany !== clientName && <div style={{ color: '#475569', fontSize: '0.76rem', marginTop: 1 }}>{clientCompany}</div>}
              {clientAddress && <div style={{ color: '#64748B', fontSize: '0.74rem', marginTop: 3, lineHeight: 1.45 }}>{clientAddress}</div>}
              {(clientPhone || clientEmail || clientTaxNumber) && (
                <div style={{ color: '#9A3412', fontSize: '0.72rem', fontWeight: 600, marginTop: 5 }}>
                  {[clientPhone && `Ph: ${clientPhone}`, clientEmail, clientTaxNumber && `GSTIN: ${clientTaxNumber}`].filter(Boolean).join('  •  ')}
                </div>
              )}
            </div>

            {/* Deliverables Table */}
            <div className="agency-table-wrapper" style={{ margin: '0', border: '1.5px solid #FFEDD5', borderRadius: 8, overflow: 'hidden' }}>
              <table className="agency-items-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                <thead>
                  <tr style={{ background: '#FFEDD5', color: '#9A3412' }}>
                    <th style={{ width: '6%', textAlign: 'center', padding: '12px 8px', fontWeight: 800, fontSize: '0.74rem' }}>#</th>
                    <th style={{ width: '44%', textAlign: 'left', padding: '12px 14px', fontWeight: 800, fontSize: '0.74rem', letterSpacing: '0.04em' }}>DELIVERABLE / MILESTONE</th>
                    <th style={{ width: '10%', textAlign: 'center', padding: '12px 8px', fontWeight: 800, fontSize: '0.74rem' }}>QTY</th>
                    <th style={{ width: '14%', textAlign: 'right', padding: '12px 10px', fontWeight: 800, fontSize: '0.74rem' }}>RATE</th>
                    <th style={{ width: '10%', textAlign: 'center', padding: '12px 8px', fontWeight: 800, fontSize: '0.74rem' }}>TAX</th>
                    <th style={{ width: '16%', textAlign: 'right', padding: '12px 14px', fontWeight: 800, fontSize: '0.74rem' }}>AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {document.items.map((item, idx) => {
                    const itemAmt = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                    const isEven = idx % 2 === 1;
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #FFEDD5', background: isEven ? '#FFFBF7' : '#FFFFFF' }}>
                        <td style={{ textAlign: 'center', padding: '13px 8px', fontWeight: 700, color: '#9A3412', fontSize: '0.78rem' }}>
                          {idx + 1}
                        </td>
                        <td className="cell-desc" style={{ textAlign: 'left', padding: '13px 14px' }}>
                          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.86rem' }}>{item.name || item.description || 'Deliverable'}</div>
                          {item.name && item.description && item.description !== item.name && (
                            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 3, lineHeight: 1.4 }}>{item.description}</div>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', padding: '13px 8px', fontWeight: 600, color: '#334155' }}>{item.qty}</td>
                        <td style={{ textAlign: 'right', padding: '13px 10px', fontVariantNumeric: 'tabular-nums', color: '#334155' }}>{currencySymbol}{formatAmount(item.rate)}</td>
                        <td style={{ textAlign: 'center', fontSize: '0.74rem', color: '#64748B', padding: '13px 8px' }}>
                          {getItemTaxDisplay(item)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#9A3412', padding: '13px 14px', fontVariantNumeric: 'tabular-nums', fontSize: '0.84rem' }}>
                          {currencySymbol}{formatAmount(itemAmt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Milestone Scope Acceptance Strip */}
            <div
              style={{
                background: '#FFF7ED',
                border: '1.5px solid #FFEDD5',
                borderRadius: 8,
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: '0.66rem', color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  MILESTONE AUDIT &amp; SCOPE ACCEPTANCE:
                </div>
                <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>
                  Deliverables audited and approved under project contract <strong>{document.poNumber || 'PO-12345'}</strong>.
                </div>
              </div>
              <span
                style={{
                  background: '#E65100',
                  color: '#FFFFFF',
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  flexShrink: 0,
                }}
              >
                ✓ MILESTONE VERIFIED
              </span>
            </div>

            {/* Bottom Section Row 1: Notes (Left) + Reconciliation Totals (Right) */}
            <div className="agency-bottom-row-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 14, alignItems: 'stretch' }}>
              <div style={{ fontSize: '0.74rem', color: '#475569', background: '#FFF7ED', border: '1.5px solid #FFEDD5', borderRadius: 8, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#C2410C', marginBottom: 5, textTransform: 'uppercase', fontSize: '0.70rem', letterSpacing: '0.04em' }}>
                    STUDIO PROJECT TERMS:
                  </div>
                  {document.notes && <div style={{ fontSize: '0.72rem', color: '#334155', marginBottom: 4 }}><strong>Notes:</strong> {document.notes}</div>}
                  {cleanPaymentInstructions && <div style={{ fontStyle: 'italic', marginTop: 2, fontSize: '0.70rem', color: '#64748B' }}>{cleanPaymentInstructions}</div>}
                  {document.termsAndConditions ? (
                    <div style={{ marginTop: 4, fontSize: '0.70rem', color: '#64748B', lineHeight: 1.45 }}><strong>Terms:</strong> {document.termsAndConditions}</div>
                  ) : (
                    <div style={{ marginTop: 4, fontSize: '0.68rem', color: '#64748B', lineHeight: 1.5 }}>
                      1. All intellectual property transfers upon full settlement of balance.<br />
                      2. Deliverables verified against agreed creative milestone scope.<br />
                      3. Production source files released upon electronic payment receipt.
                    </div>
                  )}
                </div>
                <div style={{ borderTop: '1px solid #FED7AA', paddingTop: 8, marginTop: 10, fontSize: '0.68rem', color: '#9A3412', fontWeight: 700 }}>
                  Quote Ref #{cleanBillId} in electronic payment remarks.
                </div>
              </div>

              <div style={{ background: '#FFFFFF', border: '1.5px solid #FFEDD5', borderRadius: 8, padding: '14px 16px', fontSize: '0.76rem', display: 'flex', flexDirection: 'column', gap: 6, boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Milestone Subtotal:</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{currencySymbol}{formatAmount(calc.subtotal)}</span>
                </div>
                {calc.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
                    <span>Agency Discount:</span>
                    <span>-{currencySymbol}{formatAmount(calc.discountAmount)}</span>
                  </div>
                )}
                {calc.taxAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>GST ({billTaxRate}%):</span>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>{currencySymbol}{formatAmount(calc.taxAmount)}</span>
                  </div>
                )}
                {calc.additionalCharges > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>Production Charges:</span>
                    <span>{currencySymbol}{formatAmount(calc.additionalCharges)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#0F172A', borderTop: '1px solid #FFEDD5', paddingTop: 5 }}>
                  <span>Total Project Fee:</span>
                  <span>{currencySymbol}{formatAmount(calc.grandTotal)}</span>
                </div>
                {calc.amountPaid > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                    <span>Advance Received:</span>
                    <span>{currencySymbol}{formatAmount(calc.amountPaid)}</span>
                  </div>
                )}
                {/* Balance Due Capsule */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #E65100 0%, #BF360C 100%)',
                    color: '#FFFFFF',
                    padding: '10px 14px',
                    borderRadius: 7,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 4,
                    boxShadow: '0 3px 10px rgba(230,81,0,0.22)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.62rem', color: '#FED7AA', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      BALANCE DUE
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>
                      Net Payable
                    </div>
                  </div>
                  <div style={{ fontSize: '1.20rem', fontWeight: 900, color: '#FEF08A', fontVariantNumeric: 'tabular-nums' }}>
                    {currencySymbol}{formatAmount(calc.balanceDue)}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section Row 2: Verification (Left) + Creative Director Signature (Right) */}
            <div className="agency-bottom-row-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', marginTop: 'auto', paddingTop: 14 }}>
              {/* Left Footnote */}
              <div>
                <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.84rem' }}>
                  {senderName || 'Apex Corporate'}
                </div>
                <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: 2 }}>
                  {senderTagline || 'Corporate Billing Services'}
                </div>
                <div style={{ fontSize: '0.64rem', color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 4 }}>
                  ORIGINAL FOR CLIENT • ELECTRONIC TAX INVOICE
                </div>
              </div>

              {/* Right: Signature Block */}
              <div className="agency-signature-block" style={{ width: 180, textAlign: 'center' }}>
                {document.signature ? (
                  <img src={document.signature} alt="Sign" style={{ maxHeight: 32, maxWidth: 130, objectFit: 'contain', marginBottom: 3 }} />
                ) : (
                  <div style={{ height: 20 }} />
                )}
                <div style={{ borderTop: '1.5px solid #E65100', fontSize: '0.72rem', color: '#E65100', fontWeight: 800, paddingTop: 4 }}>
                  Creative Director / Partner
                </div>
                <div style={{ fontSize: '0.66rem', color: '#64748B', marginTop: 1 }}>{senderName || 'Apex Corporate'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. MODERN MINIMALIST BILL (layout === 'minimal', id: 'modern-minimal-bill')
  // =========================================================================
  if (layout === 'minimal') {
    const cleanBillId = cleanBillNum.replace(/^(BL|BILL|BIL|REC|INV)[-_ ]*/i, '') || '2026-5479';
    const activeLogo = senderLogo || document.logo;

    return (
      <div
        className={`a4-paper-sheet tpl-minimal bill-document-sheet ${className}`}
        id="printable-bill-canvas"
        style={{
          ...sharedCanvasStyle,
          position: 'relative',
          overflow: 'hidden',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          padding: '28px 36px 20px 36px',
          minHeight: 1080,
          maxWidth: 800,
          margin: '0 auto',
          boxSizing: 'border-box',
          fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
          border: '1.5px solid #E2E8F0',
          borderRadius: 12,
        }}
      >
        {/* 1. Scandinavian Tech Modern Header */}
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
                ● VERIFIED DIGITAL TAX BILL
              </span>
            </div>
            {activeLogo ? (
              <div style={{ marginBottom: 6 }}>
                <img
                  src={activeLogo}
                  alt="Logo"
                  style={{
                    maxHeight: 46,
                    maxWidth: 150,
                    objectFit: 'contain',
                    borderRadius: 4,
                    display: 'block',
                  }}
                />
              </div>
            ) : null}
            <h1
              style={{
                fontSize: '1.55rem',
                fontWeight: 900,
                color: '#0F172A',
                margin: 0,
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
              }}
            >
              {senderName || 'Kronos Cloud Systems'}
            </h1>
            <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: 3, fontWeight: 500 }}>
              {senderTagline || 'Enterprise Cloud & Infrastructure Architecture'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: 4, lineHeight: 1.4 }}>
              {[senderAddress || '101 Cyber Towers, Tech Corridor, Bangalore 560100', senderPhone && `Ph: ${senderPhone}`, senderEmail].filter(Boolean).join('  •  ')}
            </div>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '1.60rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1 }}>
              TAX BILL
            </div>
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
                marginTop: 6,
              }}
            >
              BILL #{cleanBillId}
            </div>
            <div style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 700, marginTop: 4, letterSpacing: '0.04em' }}>
              ORIGINAL FOR RECIPIENT
            </div>
          </div>
        </div>

        {/* 2. Sleek Minimalist 4-Pillar Metadata Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            background: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            borderRadius: 8,
            padding: '10px 16px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              BILL DATE
            </div>
            <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
              {formatHeaderDate(document.issueDate) || '2026-09-06'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              PAYMENT DUE
            </div>
            <div style={{ fontSize: '0.80rem', fontWeight: 800, color: document.dueDate ? '#0F172A' : '#64748B', marginTop: 2 }}>
              {formatHeaderDate(document.dueDate) || 'Due on Receipt'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              REF / PO NO.
            </div>
            <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
              {document.poNumber || 'PO-12345'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              PAYMENT STATUS
            </div>
            <div
              style={{
                display: 'inline-block',
                marginTop: 2,
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: '0.70rem',
                fontWeight: 800,
                background: calc.balanceDue <= 0 ? '#DCFCE7' : '#FEF3C7',
                color: calc.balanceDue <= 0 ? '#15803D' : '#92400E',
              }}
            >
              {calc.balanceDue <= 0 ? 'PAID IN FULL' : 'PAYMENT DUE'}
            </div>
          </div>
        </div>

        {/* 3. Symmetrical Dual Party Information Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'stretch' }}>
          {/* Card 1: Bill From */}
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
              minHeight: 135,
            }}
          >
            <div>
              <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                01. ISSUED FROM
              </div>
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.94rem', marginTop: 4, lineHeight: 1.2 }}>
                {senderName || 'Kronos Cloud Systems'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>
                {senderTagline || 'Enterprise Cloud Infrastructure'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 4, lineHeight: 1.4 }}>
                {senderAddress || '101 Cyber Towers, Tech Corridor, Bangalore 560100'}
              </div>
              <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: 3 }}>
                {[senderPhone && `Ph: ${senderPhone}`, senderEmail].filter(Boolean).join('  •  ')}
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', marginTop: 'auto', paddingTop: 6, borderTop: '1px solid #E2E8F0' }}>
              TAX / GSTIN: {senderTaxNumber || '27AABCA1234F1Z9'}
            </div>
          </div>

          {/* Card 2: Bill To */}
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
              minHeight: 135,
            }}
          >
            <div>
              <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                02. INVOICED TO
              </div>
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.94rem', marginTop: 4, lineHeight: 1.2 }}>
                {clientName || 'Linear Labs Global Inc.'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>
                {clientCompany && clientCompany !== clientName ? clientCompany : 'Technology Operations & Cloud Services'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 4, lineHeight: 1.4 }}>
                {clientAddress || '45 Innovation Way, Tech Park, Bangalore 560100'}
              </div>
              <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: 3 }}>
                {[clientPhone && `Ph: ${clientPhone}`, clientEmail].filter(Boolean).join('  •  ')}
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', marginTop: 'auto', paddingTop: 6, borderTop: '1px solid #E2E8F0' }}>
              CLIENT REF: {document.poNumber || clientTaxNumber || 'PO-12345'}
            </div>
          </div>
        </div>

        {/* 4. Floating Modern Minimalist Table */}
        <div style={{ border: '1.5px solid #0F172A', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0F172A', color: '#FFFFFF' }}>
                <th style={{ width: '6%', textAlign: 'center', padding: '10px 6px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  #
                </th>
                <th style={{ width: '42%', textAlign: 'left', padding: '10px 12px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  ITEM / SERVICE PARTICULARS
                </th>
                <th style={{ width: '12%', textAlign: 'center', padding: '10px 8px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  QTY / UNITS
                </th>
                <th style={{ width: '14%', textAlign: 'right', padding: '10px 10px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  RATE / UNIT
                </th>
                <th style={{ width: '10%', textAlign: 'center', padding: '10px 8px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  TAX RATE
                </th>
                <th style={{ width: '16%', textAlign: 'right', padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  NET AMOUNT
                </th>
              </tr>
            </thead>
            <tbody>
              {document.items.map((item, idx) => {
                const itemAmt = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                const isEven = idx % 2 === 1;
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0', background: isEven ? '#F8FAFC' : '#FFFFFF' }}>
                    <td style={{ textAlign: 'center', padding: '10px 6px', fontWeight: 700, fontSize: '0.76rem', color: '#64748B' }}>
                      {idx + 1}
                    </td>
                    <td style={{ textAlign: 'left', padding: '10px 12px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.82rem' }}>
                        {item.name || item.description || 'Particular'}
                      </div>
                      {item.name && item.description && item.description !== item.name && (
                        <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: 2 }}>{item.description}</div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 8px', fontWeight: 600, fontSize: '0.80rem', color: '#334155' }}>
                      {item.qty}
                    </td>
                    <td style={{ textAlign: 'right', padding: '10px 10px', fontVariantNumeric: 'tabular-nums', fontSize: '0.80rem', color: '#334155' }}>
                      {currencySymbol}{formatAmount(item.rate)}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '0.74rem', color: '#64748B', padding: '10px 8px' }}>
                      {getItemTaxDisplay(item)}
                    </td>
                    <td style={{ textAlign: 'right', padding: '10px 14px', fontWeight: 800, color: '#0F172A', fontVariantNumeric: 'tabular-nums', fontSize: '0.84rem' }}>
                      {currencySymbol}{formatAmount(itemAmt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 5. Split Section: Payment & Remittance (Left) vs Minimalist Totals (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 16, alignItems: 'stretch' }}>
          {/* Left: Minimalist Payment & Remittance Box */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <CreditCard size={14} color="#0F172A" />
                <span style={{ fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.06em' }}>
                  PAYMENT INSTRUCTIONS &amp; REMITTANCE
                </span>
              </div>
              {hasBankDetails ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: '0.74rem', color: '#475569' }}>
                  <div>Bank Name: <strong style={{ color: '#0F172A' }}>{document.bankName}</strong></div>
                  <div>Account No: <strong style={{ color: '#0F172A' }}>{document.accountNumber}</strong></div>
                  <div>IFSC Code: <strong style={{ color: '#0F172A' }}>{document.ifscCode}</strong> {document.branch && `(${document.branch})`}</div>
                  {document.upiId && <div>UPI ID: <strong style={{ color: '#0F172A' }}>{document.upiId}</strong></div>}
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontStyle: 'italic', marginTop: 4 }}>
                    Please quote Bill Reference <strong>#{cleanBillId}</strong> in all electronic remittances.
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontStyle: 'italic', marginTop: 4 }}>
                  Please remit payment via NEFT / RTGS / IMPS / UPI in accordance with agreed commercial terms.
                </div>
              )}
            </div>

            <div style={{ fontSize: '0.68rem', color: '#64748B', borderTop: '1px solid #E2E8F0', paddingTop: 6, marginTop: 8 }}>
              Accepted Payment Modes: Online Bank Transfer, UPI, Corporate Card, Cheque
            </div>
          </div>

          {/* Right: Modern Minimalist Dark Slate Total Capsule */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: 8,
              padding: '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{currencySymbol}{formatAmount(calc.subtotal)}</span>
              </div>
              {calc.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
                  <span>Discount:</span>
                  <span>-{currencySymbol}{formatAmount(calc.discountAmount)}</span>
                </div>
              )}
              {calc.taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Tax ({billTaxRate}%):</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{currencySymbol}{formatAmount(calc.taxAmount)}</span>
                </div>
              )}
              {calc.additionalCharges > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Charges:</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{currencySymbol}{formatAmount(calc.additionalCharges)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, borderTop: '1px solid #E2E8F0', paddingTop: 6, color: '#0F172A', fontSize: '0.82rem' }}>
                <span>Total Amount:</span>
                <span>{currencySymbol}{formatAmount(calc.grandTotal)}</span>
              </div>
              {calc.amountPaid > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                  <span>Paid:</span>
                  <span>{currencySymbol}{formatAmount(calc.amountPaid)}</span>
                </div>
              )}

              {/* Outstanding Balance Due Banner */}
              <div
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  padding: '10px 14px',
                  borderRadius: 6,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 4,
                  boxShadow: '0 4px 12px rgba(15,23,42,0.18)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    OUTSTANDING
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.01em' }}>
                    Balance Due
                  </div>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FDE047', fontVariantNumeric: 'tabular-nums' }}>
                  {currencySymbol}{formatAmount(calc.balanceDue)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Dedicated Notes & Terms Bar with Barcode */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            borderRadius: 8,
            padding: '10px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div style={{ flex: 1, paddingRight: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <FileText size={14} color="#0F172A" />
              <span style={{ fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                NOTES &amp; TERMS OF SERVICE:
              </span>
            </div>
            <div style={{ fontSize: '0.70rem', color: '#475569', lineHeight: 1.45 }}>
              <div>{document.notes || 'Thank you for your business. Please remit within stated terms.'}</div>
              <div style={{ color: '#64748B', marginTop: 1 }}>
                Terms: {document.termsAndConditions || 'Payment is strictly due upon presentation of bill. Statutory commercial terms apply.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <svg width="150" height="24" viewBox="0 0 150 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="0" width="2.5" height="24" fill="#0F172A" />
              <rect x="6.5" y="0" width="3.5" height="24" fill="#0F172A" />
              <rect x="12" y="0" width="1.5" height="24" fill="#0F172A" />
              <rect x="15" y="0" width="3" height="24" fill="#0F172A" />
              <rect x="20.5" y="0" width="2" height="24" fill="#0F172A" />
              <rect x="24.5" y="0" width="4.5" height="24" fill="#0F172A" />
              <rect x="31" y="0" width="2" height="24" fill="#0F172A" />
              <rect x="35" y="0" width="1.5" height="24" fill="#0F172A" />
              <rect x="38.5" y="0" width="4" height="24" fill="#0F172A" />
              <rect x="45" y="0" width="2" height="24" fill="#0F172A" />
              <rect x="49" y="0" width="1.5" height="24" fill="#0F172A" />
              <rect x="52.5" y="0" width="3" height="24" fill="#0F172A" />
              <rect x="58" y="0" width="2.5" height="24" fill="#0F172A" />
              <rect x="62.5" y="0" width="4" height="24" fill="#0F172A" />
              <rect x="69" y="0" width="2" height="24" fill="#0F172A" />
              <rect x="73" y="0" width="3" height="24" fill="#0F172A" />
              <rect x="78" y="0" width="1.5" height="24" fill="#0F172A" />
              <rect x="81.5" y="0" width="4.5" height="24" fill="#0F172A" />
              <rect x="88" y="0" width="2" height="24" fill="#0F172A" />
              <rect x="92" y="0" width="1.5" height="24" fill="#0F172A" />
              <rect x="95.5" y="0" width="3.5" height="24" fill="#0F172A" />
              <rect x="101" y="0" width="2" height="24" fill="#0F172A" />
              <rect x="105" y="0" width="4" height="24" fill="#0F172A" />
              <rect x="111" y="0" width="1.5" height="24" fill="#0F172A" />
              <rect x="114.5" y="0" width="3" height="24" fill="#0F172A" />
              <rect x="119.5" y="0" width="2.5" height="24" fill="#0F172A" />
              <rect x="124" y="0" width="4.5" height="24" fill="#0F172A" />
              <rect x="130.5" y="0" width="2" height="24" fill="#0F172A" />
              <rect x="134.5" y="0" width="3.5" height="24" fill="#0F172A" />
              <rect x="140" y="0" width="2" height="24" fill="#0F172A" />
              <rect x="144" y="0" width="3" height="24" fill="#0F172A" />
            </svg>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#0F172A', letterSpacing: '0.08em', marginTop: 2 }}>
              *BILL-{cleanBillId}*
            </div>
          </div>
        </div>

        {/* 7. Footer: Brand Tagline (Left) + Authorized Signatory (Right) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingTop: 8,
            marginTop: 'auto',
          }}
        >
          {/* Left: Brand Identity */}
          <div>
            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.86rem' }}>
              {senderName || 'Kronos Cloud Systems'}
            </div>
            <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: 1 }}>
              {senderTagline || 'Enterprise Cloud & Infrastructure Architecture'}
            </div>
          </div>

          {/* Right: Architectural Minimalist Signature Endorsement */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ width: 175, textAlign: 'center' }}>
              {document.signature ? (
                <img src={document.signature} alt="Sign" style={{ maxHeight: 28, maxWidth: 130, objectFit: 'contain', marginBottom: 2 }} />
              ) : (
                <div style={{ height: 16 }} />
              )}
              <div style={{ borderTop: '1.5px solid #0F172A', fontSize: '0.70rem', color: '#0F172A', fontWeight: 800, paddingTop: 3 }}>
                Authorized Signatory
              </div>
              <div style={{ fontSize: '0.64rem', color: '#64748B', marginTop: 1 }}>
                {senderName || 'Kronos Cloud Systems'}
              </div>
            </div>
          </div>
        </div>

        {/* 8. Anchored Minimalist Footnote */}
        <div
          style={{
            textAlign: 'center',
            borderTop: '1px dashed #CBD5E1',
            paddingTop: 6,
            fontSize: '0.64rem',
            color: '#94A3B8',
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
  // 6. APEX CORPORATE STANDARD BILL (layout === 'classic' - Default Corporate)
  // =========================================================================
  return (
    <div
      className={`a4-paper-sheet tpl-classic bill-document-sheet ${className}`}
      id="printable-bill-canvas"
      style={sharedCanvasStyle}
    >
      {/* 1. TOP BUSINESS HEADER & BILL TITLE */}
      <div
        className="a4-tpl-classic-header bill-classic-header"
        style={{
          background: '#1A237E',
          color: '#FFFFFF',
          borderRadius: 8,
          padding: '14px 20px',
          boxShadow: '0 2px 10px rgba(26,35,126,0.15)',
        }}
      >
        <div className="a4-header-left bill-header-left">
          {senderLogo && (
            <div className="bill-logo-box" style={{ marginBottom: 4 }}>
              <img
                src={senderLogo}
                alt={senderName}
                style={{
                  maxHeight: 38,
                  maxWidth: 130,
                  objectFit: 'contain',
                  background: '#ffffff',
                  borderRadius: 6,
                  padding: '2px 6px',
                }}
              />
            </div>
          )}
          <div>
            <h1 className="a4-business-name bill-business-name" style={{ color: '#FFFFFF', fontSize: '1.45rem', fontWeight: 900, margin: 0, letterSpacing: '0.02em' }}>
              {senderName}
            </h1>
            {senderTagline && (
              <p className="a4-business-tagline bill-business-tagline" style={{ color: '#C5CAE9', opacity: 0.95, margin: '2px 0 0', fontSize: '0.74rem', fontWeight: 600 }}>
                {senderTagline}
              </p>
            )}
            <div className="a4-header-meta-row" style={{ color: '#FFFFFF', opacity: 0.9, marginTop: '5px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
              {senderEmail && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Mail size={11} /> {senderEmail}
                </span>
              )}
              {senderPhone && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Phone size={11} /> {senderPhone}
                </span>
              )}
              {senderWebsite && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Globe size={11} /> {senderWebsite}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="a4-header-right bill-header-right" style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="a4-doc-type-title bill-doc-type-title" style={{ color: '#FFFFFF', fontSize: '1.35rem', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {document.title || 'BILL'}
          </div>
          <div className="a4-bill-number" style={{ color: '#E8EAF6', fontWeight: 700, fontSize: '0.86rem', marginTop: 2 }}>
            {document.billNumber ? (document.billNumber.startsWith('#') ? document.billNumber : `#${document.billNumber}`) : '#BIL-2026-5479'}
          </div>
          <div className="a4-header-dates" style={{ color: '#FFFFFF', opacity: 0.9, fontSize: '0.72rem', marginTop: 4 }}>
            <div>
              <span style={{ opacity: 0.75 }}>Bill Date: </span>
              <strong>{formatHeaderDate(document.issueDate)}</strong>
            </div>
            {document.dueDate && (
              <div style={{ marginTop: 2 }}>
                <span style={{ opacity: 0.75 }}>Due Date: </span>
                <strong>{formatHeaderDate(document.dueDate)}</strong>
              </div>
            )}
            {(document.poNumber || 'PO-12345') && (
              <div style={{ marginTop: 2 }}>
                <span style={{ opacity: 0.75 }}>Ref/PO: </span>
                <strong>{document.poNumber || 'PO-12345'}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. DUAL PARTY CARDS (BILL FROM & BILL TO) */}
      <div className="a4-parties-row bill-parties-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Card 1: Bill From */}
        <div className="a4-party-col bill-party-col">
          <div className="a4-party-card" style={{ width: '100%', border: '1px solid #C5CAE9', borderRadius: 8, background: '#ffffff', overflow: 'hidden' }}>
            <div className="a4-party-card-header" style={{ borderBottom: '1px solid #C5CAE9', padding: '6px 12px', background: '#E8EAF6', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={13} color="#1A237E" />
              <span className="a4-party-header-text" style={{ color: '#1A237E', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.04em' }}>BILL FROM</span>
            </div>
            <div className="a4-party-card-body" style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div className="a4-party-name" style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.84rem' }}>
                {senderName}
              </div>
              {senderAddress && (
                <div className="a4-party-line" style={{ whiteSpace: 'pre-line', color: '#334155', fontSize: '0.74rem' }}>
                  {senderAddress}
                </div>
              )}
              {senderEmail && (
                <div className="a4-party-line" style={{ color: '#334155', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Mail size={11} color="#64748b" /> {senderEmail}
                </div>
              )}
              {senderPhone && (
                <div className="a4-party-line" style={{ color: '#334155', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Phone size={11} color="#64748b" /> {senderPhone}
                </div>
              )}
              {senderWebsite && (
                <div className="a4-party-line" style={{ color: '#334155', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Globe size={11} color="#64748b" /> {senderWebsite}
                </div>
              )}
              {senderTaxNumber && (
                <div className="a4-party-line bill-tax-line" style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.72rem', marginTop: 2 }}>
                  GSTIN/Tax: <span style={{ color: '#1A237E' }}>{senderTaxNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Bill To */}
        <div className="a4-party-col bill-party-col">
          <div className="a4-party-card" style={{ width: '100%', border: '1px solid #C5CAE9', borderRadius: 8, background: '#ffffff', overflow: 'hidden' }}>
            <div className="a4-party-card-header" style={{ borderBottom: '1px solid #C5CAE9', padding: '6px 12px', background: '#E8EAF6', display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={13} color="#1A237E" />
              <span className="a4-party-header-text" style={{ color: '#1A237E', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.04em' }}>BILL TO</span>
            </div>
            <div className="a4-party-card-body" style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div className="a4-party-name" style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.84rem' }}>
                {clientName}
              </div>
              {clientAddress && (
                <div className="a4-party-line" style={{ whiteSpace: 'pre-line', color: '#334155', fontSize: '0.74rem' }}>
                  <span style={{ color: '#475569', fontWeight: 500 }}>Billing Address:</span><br />
                  {clientAddress}
                </div>
              )}
              {shippingAddress && (
                <div className="a4-party-line shipping-line" style={{ color: '#64748b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Truck size={11} /> Ship to: {shippingAddress}
                </div>
              )}
              {clientEmail && (
                <div className="a4-party-line" style={{ color: '#334155', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Mail size={11} color="#64748b" /> {clientEmail}
                </div>
              )}
              {clientPhone && (
                <div className="a4-party-line" style={{ color: '#334155', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Phone size={11} color="#64748b" /> {clientPhone}
                </div>
              )}
              {clientTaxNumber && (
                <div className="a4-party-line bill-tax-line" style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.72rem', marginTop: 2 }}>
                  GSTIN/Tax: <span style={{ color: '#1A237E' }}>{clientTaxNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. STRUCTURED CORPORATE ITEMS TABLE */}
      <div className="a4-table-wrapper bill-table-wrapper" style={{ margin: '0', border: '1px solid #C5CAE9', borderRadius: 8, overflow: 'hidden' }}>
        <table className="a4-items-table bill-items-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#E8EAF6' }}>
              <th style={{ width: '46%', textAlign: 'left', color: '#1A237E', padding: '10px 14px', fontSize: '0.74rem', fontWeight: 800, borderRight: '1px solid #C5CAE9', letterSpacing: '0.04em' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>DESCRIPTION OF SERVICES / PRODUCTS</span>
                </div>
              </th>
              <th style={{ width: '12%', textAlign: 'center', color: '#1A237E', padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, borderRight: '1px solid #C5CAE9', letterSpacing: '0.04em' }}>
                QTY
              </th>
              <th style={{ width: '14%', textAlign: 'right', color: '#1A237E', padding: '10px 10px', fontSize: '0.74rem', fontWeight: 800, borderRight: '1px solid #C5CAE9', letterSpacing: '0.04em' }}>
                RATE
              </th>
              <th style={{ width: '12%', textAlign: 'center', color: '#1A237E', padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, borderRight: '1px solid #C5CAE9', letterSpacing: '0.04em' }}>
                TAX
              </th>
              <th style={{ width: '16%', textAlign: 'right', color: '#1A237E', padding: '10px 14px', fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                AMOUNT
              </th>
            </tr>
          </thead>
          <tbody>
            {document.items.map((item, idx) => {
              const itemAmt = (Number(item.qty) || 0) * (Number(item.rate) || 0);
              const isLast = idx === document.items.length - 1;
              return (
                <tr key={item.id} style={{ borderBottom: isLast ? 'none' : '1px solid #E8EAF6' }}>
                  <td className="cell-desc" style={{ textAlign: 'left', padding: '11px 14px', borderRight: '1px solid #E8EAF6' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8rem' }}>
                      {item.name || item.description || 'Untitled Item'}
                    </div>
                  </td>
                  <td className="cell-qty" style={{ textAlign: 'center', padding: '11px 8px', fontWeight: 600, fontSize: '0.78rem', color: '#0f172a', borderRight: '1px solid #E8EAF6' }}>
                    {item.qty}
                  </td>
                  <td className="cell-rate" style={{ textAlign: 'right', padding: '11px 10px', fontVariantNumeric: 'tabular-nums', fontSize: '0.78rem', color: '#0f172a', borderRight: '1px solid #E8EAF6' }}>
                    {currencySymbol}{formatAmount(item.rate)}
                  </td>
                  <td className="cell-tax" style={{ textAlign: 'center', fontSize: '0.76rem', color: '#64748b', padding: '11px 8px', borderRight: '1px solid #E8EAF6' }}>
                    {getItemTaxDisplay(item)}
                  </td>
                  <td className="cell-amount" style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a', padding: '11px 14px', fontVariantNumeric: 'tabular-nums', fontSize: '0.82rem' }}>
                    {currencySymbol}{formatAmount(itemAmt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. BOTTOM SECTION ROW 1: PAYMENT INFO (LEFT) + STRUCTURED TOTALS (RIGHT) */}
      <div className="bill-bottom-row-1" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 16, alignItems: 'stretch' }}>
        {/* Left: Bank & UPI Payment Details */}
        <div className="bill-payment-box">
          <div className="a4-notes-card bill-payment-card" style={{ border: '1px solid #C5CAE9', borderRadius: 8, background: '#ffffff', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="a4-notes-card-header" style={{ borderBottom: '1px solid #C5CAE9', padding: '9px 14px', background: '#E8EAF6', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Landmark size={15} color="#1A237E" />
              <span className="a4-notes-header-text" style={{ color: '#1A237E', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.06em' }}>PAYMENT INFORMATION</span>
            </div>
            <div className="a4-bank-details-grid bill-bank-grid" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1, justifyContent: 'center' }}>
              {hasBankDetails ? (
                <>
                  {document.bankName && (
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.76rem' }}>
                      <span style={{ width: 120, color: '#475569', flexShrink: 0, fontWeight: 500 }}>Bank Name</span>
                      <span style={{ width: 18, color: '#64748b', textAlign: 'center' }}>:</span>
                      <span style={{ color: '#0f172a', fontWeight: 600 }}>{document.bankName}</span>
                    </div>
                  )}
                  {document.accountNumber && (
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.76rem' }}>
                      <span style={{ width: 120, color: '#475569', flexShrink: 0, fontWeight: 500 }}>Account Number</span>
                      <span style={{ width: 18, color: '#64748b', textAlign: 'center' }}>:</span>
                      <span style={{ color: '#0f172a', fontWeight: 700 }}>{document.accountNumber}</span>
                    </div>
                  )}
                  {document.ifscCode && (
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.76rem' }}>
                      <span style={{ width: 120, color: '#475569', flexShrink: 0, fontWeight: 500 }}>IFSC Code</span>
                      <span style={{ width: 18, color: '#64748b', textAlign: 'center' }}>:</span>
                      <span style={{ color: '#0f172a', fontWeight: 700 }}>{document.ifscCode}</span>
                    </div>
                  )}
                  {document.branch && (
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.76rem' }}>
                      <span style={{ width: 120, color: '#475569', flexShrink: 0, fontWeight: 500 }}>Branch</span>
                      <span style={{ width: 18, color: '#64748b', textAlign: 'center' }}>:</span>
                      <span style={{ color: '#0f172a', fontWeight: 500 }}>{document.branch}</span>
                    </div>
                  )}
                  {document.upiId && (
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.76rem' }}>
                      <span style={{ width: 120, color: '#475569', flexShrink: 0, fontWeight: 500 }}>UPI ID</span>
                      <span style={{ width: 18, color: '#64748b', textAlign: 'center' }}>:</span>
                      <span style={{ color: '#1A237E', fontWeight: 800 }}>{document.upiId}</span>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.74rem' }}>
                  Please remit payment according to the agreed payment terms.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Totals, Discounts, Tax & Balance Due Highlight */}
        <div className="bill-totals-box" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, padding: '4px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>Subtotal</span>
            <span style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
              {currencySymbol}{formatAmount(calc.subtotal)}
            </span>
          </div>

          {calc.discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', color: '#059669' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Discount</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                -{currencySymbol}{formatAmount(calc.discountAmount)}
              </span>
            </div>
          )}

          {calc.taxAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
              <span style={{ fontSize: '0.84rem', color: '#475569' }}>Tax ({billTaxRate}%)</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                {currencySymbol}{formatAmount(calc.taxAmount)}
              </span>
            </div>
          )}

          {calc.additionalCharges > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
              <span style={{ fontSize: '0.84rem', color: '#475569' }}>Additional Charges</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                {currencySymbol}{formatAmount(calc.additionalCharges)}
              </span>
            </div>
          )}

          <div style={{ borderTop: '1px solid #e2e8f0', margin: '3px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
            <span style={{ fontSize: '1.02rem', fontWeight: 800, color: '#1A237E' }}>Total Bill Amount:</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1A237E', fontVariantNumeric: 'tabular-nums' }}>
              {currencySymbol}{formatAmount(calc.grandTotal)}
            </span>
          </div>

          {calc.amountPaid > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', color: '#64748b' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Amount Paid:</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {currencySymbol}{formatAmount(calc.amountPaid)}
              </span>
            </div>
          )}

          <div
            className="balance-due-highlight-line"
            style={{
              border: '1.5px solid #1A237E',
              backgroundColor: '#E8EAF6',
              borderRadius: 8,
              padding: '10px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 2,
            }}
          >
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1A237E' }}>Balance Due:</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1A237E', fontVariantNumeric: 'tabular-nums' }}>
              {currencySymbol}{formatAmount(calc.balanceDue)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. NOTES & TERMS (FULL WIDTH) */}
      <div className="bill-notes-full-row" style={{ width: '100%', marginTop: 0 }}>
        <div className="a4-notes-card bill-legal-card" style={{ width: '100%', border: '1px solid #C5CAE9', borderRadius: 8, overflow: 'hidden', background: '#ffffff' }}>
          <div className="a4-notes-card-header" style={{ borderBottom: '1px solid #C5CAE9', padding: '9px 14px', background: '#E8EAF6', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={15} color="#1A237E" />
            <span className="a4-notes-header-text" style={{ color: '#1A237E', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.06em' }}>NOTES &amp; TERMS</span>
          </div>
          <div className="bill-legal-content" style={{ padding: '12px 16px', fontSize: '0.74rem', color: '#334155', lineHeight: 1.5 }}>
            {document.notes && (
              <div className="bill-note-item" style={{ marginBottom: 3 }}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Notes: </span>{document.notes}
              </div>
            )}
            {document.termsAndConditions ? (
              <div className="bill-note-item">
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Terms: </span>{document.termsAndConditions}
              </div>
            ) : (
              <div className="bill-note-item">
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Terms: </span>Goods/services are subject to the agreed terms.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. AUTHORIZED SIGNATURE (RIGHT ALIGNED WITH GENEROUS SIGNING SPACE) */}
      <div className="bill-signature-section" style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginTop: 'auto', paddingTop: 18 }}>
        <div className="bill-signature-block" style={{ width: 180, textAlign: 'center' }}>
          <div className="bill-signature-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {document.signature ? (
              <div style={{ height: 52, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 4 }}>
                <img
                  src={document.signature}
                  alt="Authorized Signature"
                  style={{ maxHeight: 48, maxWidth: 150, objectFit: 'contain' }}
                />
              </div>
            ) : (
              /* Dedicated space for sign / physical stamp */
              <div style={{ height: 52 }} />
            )}
            <div className="a4-signature-line" style={{ width: 170, borderTop: '1.5px solid #64748b', margin: '0 auto 4px auto' }} />
            <div className="a4-signature-label" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>
              Authorized Signatory
            </div>
            <div className="a4-signature-sub" style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 1 }}>
              {senderName}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
