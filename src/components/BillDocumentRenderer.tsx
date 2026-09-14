import React from 'react';
import {
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  Landmark,
  FileText,
  Globe,
  Truck,
  CreditCard,
  QrCode,
  Receipt,
  Stethoscope,
  GraduationCap,
  Sparkles,
  MapPin,
  ShoppingBag,
} from 'lucide-react';
import { BillDocument, DocumentItem } from '../types';
import {
  CURRENCY_SYMBOLS,
  ACCENT_COLOR_MAP,
  normalizeTemplateId,
  getTemplateById,
} from '../data/templates';
import { calculateBillTotals, formatCurrencyAmount } from '../utils/billCalculations';
import { formatHeaderDate } from '../utils/dates';
import { shadeHexColor } from '../utils/colors';

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

  const rawBillNum = document.billNumber || 'BILL-2026-5479';
  const cleanBillNum = rawBillNum.startsWith('#') ? rawBillNum.slice(1) : rawBillNum;

  const normTemplateId = normalizeTemplateId(document.template, 'bill');
  const tplStyle = getTemplateById(normTemplateId) || getTemplateById('apex-corporate-bill');
  const layout = tplStyle?.layoutType || 'classic';

  // User-chosen accent ALWAYS overrides the template's built-in colors
  const userAccentHex: string | null = document.accent
    ? (document.accent.startsWith('#')
        ? document.accent
        : ((ACCENT_COLOR_MAP as any)[document.accent] ?? null))
    : null;
  const accentHex       = userAccentHex ?? tplStyle?.accentColor ?? '#4f46e5';
  const headerBg        = userAccentHex ?? tplStyle?.headerBg    ?? accentHex;
  const headerText      = tplStyle?.headerText ?? '#FFFFFF';
  const tableHeaderBg   = userAccentHex ? `${userAccentHex}18`  : (tplStyle?.tableHeaderBg   ?? '#E8EAF6');
  const tableHeaderText = userAccentHex ? shadeHexColor(userAccentHex, -25) : (tplStyle?.tableHeaderText ?? '#1A237E');
  const totalColor      = userAccentHex                         ?? (tplStyle?.totalColor      ?? accentHex);
  const borderColor     = userAccentHex ? `${userAccentHex}35`  : (tplStyle?.borderColor      ?? '#C5CAE9');
  const darkerAccentHex = shadeHexColor(accentHex, -28);

  const billTaxRate = typeof document.taxRate === 'number' ? document.taxRate : Number(document.taxRate) || 0;

  const getItemTaxDisplay = (item: DocumentItem) => {
    if (item.taxRate !== undefined && item.taxRate !== null && !isNaN(Number(item.taxRate))) {
      return `${Number(item.taxRate)}%`;
    }
    return billTaxRate > 0 ? `${billTaxRate}%` : '0%';
  };

  // 1. Business Details (BILL FROM)
  const senderName = document.senderName ? document.senderName.trim() : '';
  const senderPlaceholder = <span className="preview-placeholder">[Your Business Name]</span>;
  const senderTagline = document.senderTagline || '';
  const senderAddress = document.senderAddress || '';
  const senderPhone = document.senderPhone || '';
  const senderEmail = document.senderEmail || '';
  const senderWebsite = document.senderWebsite || '';
  const senderTaxNumber = document.senderTaxNumber || '';
  const senderLogo = document.senderLogo || (document as any).logo || '';

  // 2. Customer Details (BILL TO) - clean empty fallbacks
  const clientName = document.clientName ? document.clientName.trim() : '';
  const clientPlaceholder = <span className="preview-placeholder">[Client / Customer Name]</span>;
  const itemPlaceholder = <span className="preview-placeholder">Item / service description</span>;
  const clientCompany = document.clientCompany || '';
  const clientAddress = document.clientAddress || '';
  const shippingAddress =
    !document.shippingSameAsBilling && document.shippingAddress ? document.shippingAddress : '';
  const clientPhone = document.clientPhone || '';
  const clientEmail = document.clientEmail || '';
  const clientTaxNumber = document.clientTaxNumber || '';

  // PO & Tax helpers
  const hasPoNumber = Boolean(
    document.poNumber &&
    document.poNumber.trim() &&
    document.poNumber.trim().toLowerCase() !== 'none' &&
    document.poNumber.trim() !== '-'
  );
  const poNumberValue = hasPoNumber ? document.poNumber!.trim() : '';
  const paymentTerms = (
    (document.paymentTerms === 'Custom' ? document.customPaymentTerms : document.paymentTerms) ||
    document.paymentTerms ||
    ''
  ).trim();
  const hasPaymentTerms = Boolean(
    paymentTerms &&
    paymentTerms.toLowerCase() !== 'none' &&
    paymentTerms !== '-'
  );
  const hasSenderTax = Boolean(
    senderTaxNumber &&
    senderTaxNumber.trim() &&
    senderTaxNumber.trim().toLowerCase() !== 'none' &&
    senderTaxNumber.trim() !== '-'
  );
  const hasClientTax = Boolean(
    clientTaxNumber &&
    clientTaxNumber.trim() &&
    clientTaxNumber.trim().toLowerCase() !== 'none' &&
    clientTaxNumber.trim() !== '-'
  );
  const hasAnyTax = billTaxRate > 0 || calc.taxAmount > 0;

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
    const displayBrandName = senderName?.trim() || '';
    const displayBrandTagline = senderTagline?.trim() || '';

    // Header contact info
    const contactAddress = senderAddress?.trim() || '';
    const contactPhone = senderPhone?.trim() || '';
    const contactEmail = senderEmail?.trim() || '';
    const contactWebsite = senderWebsite?.trim() || '';
    const displaySenderTax = senderTaxNumber?.trim() || '';

    // Customer info (Active form fields)
    const hasClientName = Boolean(clientName);
    const hasClientCompany = Boolean(clientCompany);

    let displayCustomerName: React.ReactNode = 'Walk-in Customer';
    let displaySubCompany: string | null = null;

    if (hasClientName && hasClientCompany && clientName !== clientCompany) {
      if (clientName === 'Walk-in Customer') {
        displayCustomerName = clientCompany;
        displaySubCompany = 'Walk-in Customer';
      } else {
        displayCustomerName = clientName;
        displaySubCompany = clientCompany;
      }
    } else if (hasClientName) {
      displayCustomerName = clientName;
    } else if (hasClientCompany) {
      displayCustomerName = clientCompany;
    } else {
      displayCustomerName = 'Walk-in Customer';
    }
    const displayCustomerAddress = clientAddress || 'N/A';

    // Bill metadata
    const displayBillNum = cleanBillNum || 'BILL-2026-3927';
    const invoiceLabel = document.title && document.title.toUpperCase() !== 'BILL' ? `${document.title.toUpperCase()} NO.` : 'INVOICE NO.';
    const displayIssueDate = formatHeaderDate(document.issueDate) || '2026-09-06';

    // Items
    const hasEnteredItems = Boolean(
      document.items &&
        document.items.length > 0 &&
        document.items.some((it) => it.name || it.description || Number(it.rate) > 0)
    );
    const receiptItems = hasEnteredItems
      ? document.items
      : [
          { id: '1', name: 'Wireless Earbuds', description: '', qty: 1, rate: 1999, taxRate: 0 },
          { id: '2', name: 'ddd', description: '', qty: 2, rate: 7, taxRate: 0 },
        ];

    // Bank / Payment details
    const bankNameVal = document.bankName?.trim() || '';
    const acctNumVal = document.accountNumber?.trim() || '';
    const ifscVal = document.ifscCode?.trim() || '';
    const branchVal = document.branch?.trim() || '';
    const upiVal = document.upiId?.trim() || '';

    // Totals
    const subtotalVal = calc.subtotal > 0 || hasEnteredItems ? calc.subtotal : 24;
    const grandTotalVal = calc.grandTotal > 0 || hasEnteredItems ? calc.grandTotal : 24;

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
          gap: 14,
          padding: '30px 36px 24px 36px',
          minHeight: 1080,
          maxWidth: 800,
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Right Decorative Lavender Wave */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 200,
            height: 160,
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 0,
          }}
        >
          <svg width="200" height="160" viewBox="0 0 200 160" fill="none" style={{ position: 'absolute', top: 0, right: 0 }}>
            <path
              d="M200 0 L110 0 C130 50 160 95 200 115 Z"
              fill="#ded8e6"
              opacity="0.8"
            />
            <path
              d="M200 0 L70 0 C100 65 150 125 200 150 Z"
              fill="#eeeaf2"
              opacity="0.65"
            />
          </svg>
        </div>

        {/* Bottom Left Decorative Lavender Wave */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 190,
            height: 140,
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 0,
          }}
        >
          <svg width="190" height="140" viewBox="0 0 190 140" fill="none" style={{ position: 'absolute', bottom: 0, left: 0 }}>
            <path
              d="M0 140 L0 55 C35 70 70 100 110 140 Z"
              fill="#ded8e6"
              opacity="0.75"
            />
            <path
              d="M0 140 L0 90 C50 105 85 125 125 140 Z"
              fill="#eeeaf2"
              opacity="0.9"
            />
          </svg>
        </div>

        {/* 1. RETAIL STORE & POS HEADER */}
        <div
          className="receipt-header-row"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
            gap: 20,
            paddingBottom: 2,
          }}
        >
          {/* Left: Shopping Bag Logo + Brand Names */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {senderLogo ? (
              <img
                src={senderLogo}
                alt={displayBrandName}
                style={{
                  maxWidth: 130,
                  maxHeight: 58,
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  flexShrink: 0,
                }}
              />
            ) : (
              <svg width="54" height="58" viewBox="0 0 54 58" fill="none" style={{ flexShrink: 0 }}>
                {/* Bag Handles */}
                <path
                  d="M20 16 C20 7 34 7 34 16"
                  stroke="#5c4e70"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M23 16 C23 9 31 9 31 16"
                  stroke="#7a6c8e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.85"
                />
                {/* Bag Left Gusset / Shadow (3D effect) */}
                <path
                  d="M13 18 L7 52 L17 52 L19 18 Z"
                  fill="#9d91b0"
                  stroke="#5c4e70"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                {/* Bag Front Main Body */}
                <path
                  d="M19 18 L17 52 L45 52 L41 18 Z"
                  fill="url(#bagLavenderGradient)"
                  stroke="#5c4e70"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                {/* Subtle fold line */}
                <path
                  d="M19 18 L17 52"
                  stroke="#7a6c8e"
                  strokeWidth="1"
                  opacity="0.4"
                />
                <defs>
                  <linearGradient id="bagLavenderGradient" x1="19" y1="18" x2="45" y2="52" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ffffff" />
                    <stop offset="0.6" stopColor="#f0ecf5" />
                    <stop offset="1" stopColor="#dcd5e6" />
                  </linearGradient>
                </defs>
              </svg>
            )}
            {(displayBrandName || displayBrandTagline) && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {displayBrandName && (
                  <div
                    style={{
                      color: '#2e2b38',
                      fontSize: '1.85rem',
                      fontWeight: 900,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.1,
                    }}
                  >
                    {displayBrandName}
                  </div>
                )}
                {displayBrandTagline && (
                  <div
                    style={{
                      color: '#787389',
                      fontSize: '1rem',
                      fontWeight: 700,
                      letterSpacing: '-0.01em',
                      lineHeight: 1.2,
                      marginTop: 2,
                    }}
                  >
                    {displayBrandTagline}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Title & Contact Details */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, justifyContent: 'center' }}>
            <div
              style={{
                color: '#2e2b38',
                fontSize: '0.94rem',
                fontWeight: 700,
                letterSpacing: '0.01em',
              }}
            >
              Retail Store &amp; POS Bill
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 4,
                fontSize: '0.74rem',
                color: '#6c6878',
              }}
            >
              {contactAddress && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <MapPin size={12} color="#6c6479" style={{ flexShrink: 0, width: 13 }} />
                  <span>{contactAddress}</span>
                </div>
              )}
              {contactPhone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Phone size={12} color="#6c6479" style={{ flexShrink: 0, width: 13 }} />
                  <span>{contactPhone}</span>
                </div>
              )}
              {contactEmail && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Mail size={12} color="#6c6479" style={{ flexShrink: 0, width: 13 }} />
                  <span>{contactEmail}</span>
                </div>
              )}
              {contactWebsite && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Globe size={12} color="#6c6479" style={{ flexShrink: 0, width: 13 }} />
                  <span>{contactWebsite}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. DUAL PARTY CARDS (ISSUED BY & CUSTOMER / BILLED TO) */}
        <div className="bill-parties-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, position: 'relative', zIndex: 1 }}>
          {/* Left: Issued By */}
          <div style={{ border: `1px solid ${userAccentHex ? `${accentHex}30` : '#eae6ee'}`, borderRadius: 8, background: '#ffffff', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: userAccentHex ? accentHex : '#85749c', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingBag size={14} color="#ffffff" />
              <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.74rem', letterSpacing: '0.04em' }}>
                ISSUED BY
              </span>
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.76rem', flex: 1 }}>
              {senderName?.trim() ? (
                <div style={{ fontWeight: 800, color: '#1e1e24', fontSize: '0.96rem', marginBottom: 2 }}>
                  {senderName.trim()}
                </div>
              ) : null}
              {contactAddress && (
                <div style={{ color: '#6c6878', display: 'flex', alignItems: 'center', gap: 6, lineHeight: 1.4 }}>
                  <MapPin size={12} color="#6c6479" style={{ flexShrink: 0 }} /> {contactAddress}
                </div>
              )}
              {contactPhone && (
                <div style={{ color: '#6c6878', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={12} color="#6c6479" style={{ flexShrink: 0 }} /> {contactPhone}
                </div>
              )}
              {contactEmail && (
                <div style={{ color: '#6c6878', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={12} color="#6c6479" style={{ flexShrink: 0 }} /> {contactEmail}
                </div>
              )}
              {contactWebsite && (
                <div style={{ color: '#6c6878', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Globe size={12} color="#6c6479" style={{ flexShrink: 0 }} /> {contactWebsite}
                </div>
              )}
              {displaySenderTax && (
                <div style={{ fontWeight: 800, fontSize: '0.76rem', marginTop: 4, color: '#1e1e24' }}>
                  GSTIN / Tax: <span style={{ fontWeight: 800 }}>{displaySenderTax}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Customer / Billed To */}
          <div style={{ border: `1px solid ${userAccentHex ? `${accentHex}30` : '#eae6ee'}`, borderRadius: 8, background: '#ffffff', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: userAccentHex ? `${accentHex}18` : '#f4f2f6', borderBottom: `1px solid ${userAccentHex ? `${accentHex}30` : '#eae6ee'}`, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={14} color={userAccentHex ? darkerAccentHex : "#3d3748"} />
              <span style={{ color: userAccentHex ? darkerAccentHex : '#3d3748', fontWeight: 800, fontSize: '0.74rem', letterSpacing: '0.04em' }}>
                CUSTOMER / BILLED TO
              </span>
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.76rem', flex: 1 }}>
              <div style={{ fontWeight: 800, color: '#1e1e24', fontSize: '0.96rem', marginBottom: 2 }}>
                {displayCustomerName}
              </div>
              {displaySubCompany && (
                <div style={{ color: '#5c4e70', fontWeight: 600, fontSize: '0.78rem', marginTop: -1, marginBottom: 2 }}>
                  {displaySubCompany}
                </div>
              )}
              <div style={{ color: '#6c6878', lineHeight: 1.45 }}>
                {displayCustomerAddress}
              </div>
              {clientPhone && (
                <div style={{ color: '#6c6878', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={12} color="#6c6479" style={{ flexShrink: 0 }} /> {clientPhone}
                </div>
              )}
              {clientEmail && (
                <div style={{ color: '#6c6878', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={12} color="#6c6479" style={{ flexShrink: 0 }} /> {clientEmail}
                </div>
              )}
              {clientTaxNumber && (
                <div style={{ fontWeight: 800, fontSize: '0.76rem', marginTop: 4, color: '#1e1e24' }}>
                  GSTIN / Tax: <span style={{ fontWeight: 800 }}>{clientTaxNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. POS TRANSACTION META BAR */}
        <div
          style={{
            background: '#f9f8fa',
            border: '1px solid #eae6ee',
            borderRadius: 8,
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
            gap: 24,
          }}
        >
          {/* Left: Bill / Invoice # */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <FileText size={22} color={userAccentHex ? accentHex : "#85749c"} />
            <div>
              <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#787389', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {invoiceLabel}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2e2b38', marginTop: 1 }}>
                #{displayBillNum}
              </div>
            </div>
          </div>

          {/* Center Divider */}
          <div style={{ width: 1, backgroundColor: '#eae6ee', height: 28 }} />

          {/* Right: Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <Calendar size={22} color={userAccentHex ? accentHex : "#85749c"} />
            <div>
              <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#787389', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                DATE
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2e2b38', marginTop: 1 }}>
                {displayIssueDate}
              </div>
            </div>
          </div>

          {/* Optional PO # */}
          {hasPoNumber && (
            <>
              <div style={{ width: 1, backgroundColor: '#eae6ee', height: 28 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                <Receipt size={22} color={userAccentHex ? accentHex : "#85749c"} />
                <div>
                  <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#787389', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    REF / PO
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2e2b38', marginTop: 1 }}>
                    {poNumberValue}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 4. ITEMS TABLE */}
        <div style={{ border: `1px solid ${userAccentHex ? `${accentHex}30` : '#eae6ee'}`, borderRadius: 8, overflow: 'hidden', margin: 0, position: 'relative', zIndex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: userAccentHex ? `${accentHex}18` : '#eeeaf2', color: userAccentHex ? darkerAccentHex : '#3d3748' }}>
                <th style={{ width: '6%', textAlign: 'center', padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: userAccentHex ? darkerAccentHex : '#3d3748', letterSpacing: '0.04em' }}>
                  #
                </th>
                <th style={{ width: hasAnyTax ? '44%' : '52%', textAlign: 'left', padding: '10px 16px', fontSize: '0.74rem', fontWeight: 800, color: userAccentHex ? darkerAccentHex : '#3d3748', letterSpacing: '0.04em' }}>
                  PARTICULARS / ITEM DESCRIPTION
                </th>
                <th style={{ width: '12%', textAlign: 'center', padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: userAccentHex ? darkerAccentHex : '#3d3748', letterSpacing: '0.04em' }}>
                  QTY
                </th>
                <th style={{ width: '15%', textAlign: 'center', padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: userAccentHex ? darkerAccentHex : '#3d3748', letterSpacing: '0.04em' }}>
                  RATE ({currencySymbol})
                </th>
                {hasAnyTax && (
                  <th style={{ width: '10%', textAlign: 'center', padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, color: userAccentHex ? darkerAccentHex : '#3d3748', letterSpacing: '0.04em' }}>
                    TAX (%)
                  </th>
                )}
                <th style={{ width: '15%', textAlign: 'right', padding: '10px 16px', fontSize: '0.74rem', fontWeight: 800, color: userAccentHex ? darkerAccentHex : '#3d3748', letterSpacing: '0.04em' }}>
                  AMOUNT ({currencySymbol})
                </th>
              </tr>
            </thead>
            <tbody>
              {receiptItems.map((item, idx) => {
                const itemAmt = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                const isLast = idx === receiptItems.length - 1;
                return (
                  <tr key={item.id || idx} style={{ borderBottom: isLast ? 'none' : '1px solid #f2eff5', background: '#ffffff' }}>
                    <td style={{ textAlign: 'center', padding: '12px 8px', fontSize: '0.78rem', fontWeight: 600, color: '#2e2b38' }}>
                      {idx + 1}
                    </td>
                    <td style={{ textAlign: 'left', padding: '10px 16px', fontSize: '0.8rem', color: '#2e2b38' }}>
                      <div style={{ fontWeight: 700, color: '#2e2b38', lineHeight: 1.3 }}>
                        {item.name || item.description || <span className="preview-placeholder">Item description</span>}
                      </div>
                      {item.name && item.description && item.description !== item.name && (
                        <div style={{ fontSize: '0.72rem', color: '#6c6878', fontWeight: 400, marginTop: 2, lineHeight: 1.35 }}>
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px 8px', fontSize: '0.78rem', fontWeight: 600, color: '#2e2b38' }}>
                      {item.qty}
                    </td>
                    <td style={{ textAlign: 'center', padding: '12px 8px', fontSize: '0.78rem', fontWeight: 600, color: '#2e2b38', fontVariantNumeric: 'tabular-nums' }}>
                      {currencySymbol}{formatAmount(Number(item.rate) || 0)}
                    </td>
                    {hasAnyTax && (
                      <td style={{ textAlign: 'center', padding: '12px 8px', fontSize: '0.76rem', color: '#2e2b38' }}>
                        {getItemTaxDisplay(item as DocumentItem)}
                      </td>
                    )}
                    <td style={{ textAlign: 'right', padding: '12px 16px', fontSize: '0.82rem', fontWeight: 700, color: '#2e2b38', fontVariantNumeric: 'tabular-nums' }}>
                      {currencySymbol}{formatAmount(itemAmt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 5. PAYMENT INFORMATION & TOTALS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 16, alignItems: 'stretch', position: 'relative', zIndex: 1 }}>
          {/* Left: Payment Information */}
          <div style={{ border: '1px solid #eae6ee', borderRadius: 8, background: '#ffffff', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#f4f2f6', borderBottom: '1px solid #eae6ee', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={14} color="#85749c" />
              <span style={{ color: '#3d3748', fontWeight: 800, fontSize: '0.74rem', letterSpacing: '0.04em' }}>
                PAYMENT INFORMATION
              </span>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.76rem', flex: 1, justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 110, color: '#6c6878', flexShrink: 0, fontWeight: 500 }}>Bank Name</span>
                <span style={{ width: 18, color: '#8a8698', textAlign: 'center' }}>:</span>
                <span style={{ color: '#2e2b38', fontWeight: 600 }}>{bankNameVal || '-'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 110, color: '#6c6878', flexShrink: 0, fontWeight: 500 }}>Account Number</span>
                <span style={{ width: 18, color: '#8a8698', textAlign: 'center' }}>:</span>
                <span style={{ color: '#2e2b38', fontWeight: 700 }}>{acctNumVal || '-'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 110, color: '#6c6878', flexShrink: 0, fontWeight: 500 }}>IFSC Code</span>
                <span style={{ width: 18, color: '#8a8698', textAlign: 'center' }}>:</span>
                <span style={{ color: '#2e2b38', fontWeight: 700 }}>{ifscVal || '-'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 110, color: '#6c6878', flexShrink: 0, fontWeight: 500 }}>Branch</span>
                <span style={{ width: 18, color: '#8a8698', textAlign: 'center' }}>:</span>
                <span style={{ color: '#2e2b38', fontWeight: 500 }}>{branchVal || '-'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 110, color: '#6c6878', flexShrink: 0, fontWeight: 500 }}>UPI ID</span>
                <span style={{ width: 18, color: '#8a8698', textAlign: 'center' }}>:</span>
                <span style={{ color: '#85749c', fontWeight: 800 }}>{upiVal || '-'}</span>
              </div>
            </div>
          </div>

          {/* Right: Totals, Total Bill Amount Card & Balance Due Card */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, padding: '4px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
              <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#2e2b38' }}>Subtotal</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#2e2b38', fontVariantNumeric: 'tabular-nums' }}>
                {currencySymbol}{formatAmount(subtotalVal)}
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
                <span style={{ fontSize: '0.84rem', color: '#6c6878' }}>Tax ({billTaxRate}%)</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2e2b38', fontVariantNumeric: 'tabular-nums' }}>
                  {currencySymbol}{formatAmount(calc.taxAmount)}
                </span>
              </div>
            )}

            {calc.additionalCharges > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                <span style={{ fontSize: '0.84rem', color: '#6c6878' }}>Additional Charges</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2e2b38', fontVariantNumeric: 'tabular-nums' }}>
                  {currencySymbol}{formatAmount(calc.additionalCharges)}
                </span>
              </div>
            )}

            {calc.amountPaid > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', color: '#64748b' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Amount Paid</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  {currencySymbol}{formatAmount(calc.amountPaid)}
                </span>
              </div>
            )}

            {/* Total Bill Amount Card (Solid Accent Color) */}
            <div
              style={{
                backgroundColor: userAccentHex ? accentHex : '#85749c',
                borderRadius: 8,
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 4,
                boxShadow: userAccentHex ? `0 2px 8px ${accentHex}35` : '0 2px 8px rgba(133,116,156,0.25)',
              }}
            >
              <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#ffffff' }}>
                Total Bill Amount
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                {currencySymbol}{formatAmount(grandTotalVal)}
              </span>
            </div>
          </div>
        </div>

        {/* 6. NOTES & TERMS */}
        <div
          style={{
            background: '#f9f8fa',
            border: '1px solid #eae6ee',
            borderRadius: 8,
            padding: '10px 14px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <FileText size={14} color={userAccentHex ? accentHex : "#85749c"} />
            <span style={{ color: userAccentHex ? darkerAccentHex : '#3d3748', fontWeight: 800, fontSize: '0.74rem', letterSpacing: '0.04em' }}>
              NOTES &amp; TERMS
            </span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#787389', fontStyle: 'italic', lineHeight: 1.45 }}>
            {document.notes || document.termsAndConditions || 'No additional notes or terms specified.'}
          </div>
        </div>

        {/* 7. FOOTER & THANK YOU */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%',
            marginTop: 'auto',
            paddingTop: 14,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Left: Barcode */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <svg width="140" height="26" viewBox="0 0 140 26" fill="none">
              <rect x="0" y="0" width="2" height="26" fill="#2e2b38" />
              <rect x="4" y="0" width="4" height="26" fill="#2e2b38" />
              <rect x="10" y="0" width="2" height="26" fill="#2e2b38" />
              <rect x="14" y="0" width="3" height="26" fill="#2e2b38" />
              <rect x="19" y="0" width="1" height="26" fill="#2e2b38" />
              <rect x="22" y="0" width="5" height="26" fill="#2e2b38" />
              <rect x="29" y="0" width="2" height="26" fill="#2e2b38" />
              <rect x="33" y="0" width="1" height="26" fill="#2e2b38" />
              <rect x="36" y="0" width="4" height="26" fill="#2e2b38" />
              <rect x="42" y="0" width="2" height="26" fill="#2e2b38" />
              <rect x="46" y="0" width="1" height="26" fill="#2e2b38" />
              <rect x="49" y="0" width="3" height="26" fill="#2e2b38" />
              <rect x="54" y="0" width="2" height="26" fill="#2e2b38" />
              <rect x="58" y="0" width="4" height="26" fill="#2e2b38" />
              <rect x="64" y="0" width="2" height="26" fill="#2e2b38" />
              <rect x="68" y="0" width="3" height="26" fill="#2e2b38" />
              <rect x="73" y="0" width="1" height="26" fill="#2e2b38" />
              <rect x="76" y="0" width="5" height="26" fill="#2e2b38" />
              <rect x="83" y="0" width="2" height="26" fill="#2e2b38" />
              <rect x="87" y="0" width="3" height="26" fill="#2e2b38" />
              <rect x="92" y="0" width="1" height="26" fill="#2e2b38" />
              <rect x="95" y="0" width="4" height="26" fill="#2e2b38" />
              <rect x="101" y="0" width="2" height="26" fill="#2e2b38" />
              <rect x="105" y="0" width="3" height="26" fill="#2e2b38" />
              <rect x="110" y="0" width="1" height="26" fill="#2e2b38" />
              <rect x="113" y="0" width="4" height="26" fill="#2e2b38" />
              <rect x="119" y="0" width="2" height="26" fill="#2e2b38" />
              <rect x="123" y="0" width="5" height="26" fill="#2e2b38" />
              <rect x="130" y="0" width="2" height="26" fill="#2e2b38" />
              <rect x="134" y="0" width="3" height="26" fill="#2e2b38" />
            </svg>
            <div style={{ fontSize: '0.68rem', color: '#2e2b38', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.06em', marginTop: 4 }}>
              *{displayBillNum}*
            </div>
          </div>

          {/* Right: Signature if uploaded + Script Thank You */}
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {document.signature && (
              <img src={document.signature} alt="Sign" style={{ maxHeight: 34, maxWidth: 130, objectFit: 'contain', marginBottom: 4 }} />
            )}
            <div
              style={{
                fontFamily: "'Caveat', 'Playball', 'Brush Script MT', cursive",
                fontSize: '2rem',
                color: '#685a7e',
                lineHeight: 1,
                letterSpacing: '0.02em',
              }}
            >
              Thank You!
            </div>
            <div
              style={{
                fontFamily: "'Caveat', 'Playball', 'Brush Script MT', cursive",
                fontSize: '0.98rem',
                color: '#787389',
                marginTop: 2,
              }}
            >
              For Your Business
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. MEDICAL & HEALTHCARE CLINICAL BILL (layout === 'clinical', id: 'medical-clinical')
  // =========================================================================
  if (layout === 'clinical') {
    const hasEnteredItems = Boolean(
      document.items &&
        document.items.length > 0 &&
        document.items.some((it) => it.name || it.description || Number(it.rate) > 0)
    );

    const clinicalItems: DocumentItem[] = hasEnteredItems
      ? document.items
      : [
          { id: '1', name: 'General Consultation', description: '', qty: 1, rate: 500, taxRate: 0 },
          { id: '2', name: 'Blood Test (CBC)', description: '', qty: 1, rate: 1200, taxRate: 0 },
          { id: '3', name: 'Medicine', description: '', qty: 5, rate: 80, taxRate: 0 },
          { id: '4', name: 'Nursing Charges', description: '', qty: 1, rate: 300, taxRate: 0 },
        ];

    const rawBillNum = document.billNumber?.trim() || '';
    const isRetailOrGenericBill = !rawBillNum || rawBillNum.startsWith('BIL-') || rawBillNum.startsWith('BILL-') || rawBillNum.startsWith('INV-');
    const displayBillId = isRetailOrGenericBill
      ? 'HSP-2026-1123'
      : (rawBillNum.startsWith('HSP-') ? rawBillNum : `HSP-${rawBillNum.replace(/^#/, '')}`);

    const rawTitle = document.title?.trim();
    const isRetailOrGenericTitle = !rawTitle ||
      rawTitle.toUpperCase() === 'BILL' ||
      rawTitle.toUpperCase().includes('WALK-IN') ||
      rawTitle.toUpperCase().includes('COUNTER') ||
      rawTitle.toUpperCase().includes('RETAIL');
    const displayTitle = isRetailOrGenericTitle ? 'HOSPITAL BILL' : rawTitle.toUpperCase();

    // Header & Hospital info
    const hospitalName = senderName?.trim() || 'CityCare';
    const hospitalTagline = (senderTagline?.trim() && senderTagline.trim() !== 'Multispeciality Hospital') 
      ? senderTagline.trim() 
      : '';
    const hospitalAddress = senderAddress?.trim() || '101 abc villa';
    const hospitalPhone = senderPhone?.trim() || '+9177383873';
    const hospitalEmail = senderEmail?.trim() || 'ddd@gmail.com';
    const hospitalWebsite = senderWebsite?.trim() || 'www.ggh.com';

    // Patient info (Active form fields)
    const rawPatientName = clientName?.trim();
    const rawCompanyName = clientCompany?.trim();

    let patientName = 'Walk-in Patient';
    let patientSubCompany: string | null = null;

    if (rawPatientName && rawCompanyName && rawPatientName !== rawCompanyName) {
      if (rawPatientName === 'Walk-in Patient' || rawPatientName === 'Walk-in Customer') {
        patientName = rawCompanyName;
        patientSubCompany = rawPatientName;
      } else {
        patientName = rawPatientName;
        patientSubCompany = rawCompanyName;
      }
    } else if (rawPatientName && rawPatientName !== 'Walk-in Customer') {
      patientName = rawPatientName;
    } else if (rawCompanyName) {
      patientName = rawCompanyName;
    } else {
      patientName = 'Walk-in Patient';
    }
    const patientId = document.patientId?.trim() || (poNumberValue && poNumberValue !== 'PO-12345' ? poNumberValue : '112233');
    const patientGender = document.patientGender?.trim() || 'Male';
    const patientAge = document.patientAge?.trim() || '32 Years';
    const patientAddress = clientAddress?.trim() || 'N/A';

    // Dates
    const issueDateStr = formatHeaderDate(document.issueDate) || '2026-09-06';
    const dueDateStr = formatHeaderDate(document.dueDate) || '2026-09-06';

    // Totals calculations
    const itemsSubtotal = clinicalItems.reduce((acc, it) => acc + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0);
    const renderSubtotal = hasEnteredItems ? calc.subtotal : (itemsSubtotal > 0 ? itemsSubtotal : 2400);
    const renderDiscount = hasEnteredItems ? calc.discountAmount : 0;
    const docTaxRateNum = Number(document.taxRate) || 0;
    const hasTax = calc.taxAmount > 0 || docTaxRateNum > 0;
    const taxPercentage = docTaxRateNum > 0 ? docTaxRateNum : (calc.taxAmount > 0 && renderSubtotal > 0 ? Math.round((calc.taxAmount / renderSubtotal) * 100) : (hasEnteredItems ? 0 : 5));
    const renderTax = hasEnteredItems 
      ? (calc.taxAmount > 0 ? calc.taxAmount : (docTaxRateNum > 0 ? renderSubtotal * (docTaxRateNum / 100) : 0))
      : 120; // 5% of 2400 default
    const renderGrandTotal = hasEnteredItems 
      ? (calc.grandTotal > 0 ? calc.grandTotal : (renderSubtotal + renderTax - renderDiscount))
      : 2520; // 2400 - 0 + 120 default

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
          justifyContent: 'flex-start',
          gap: 16,
          padding: '28px 30px 24px 30px',
          minHeight: 1080,
          maxWidth: 800,
          margin: '0 auto',
          boxSizing: 'border-box',
          fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
          color: '#4a3f3a',
        }}
      >
        {/* Bottom Right Multi-tone Fluid Waves Decorative Accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 240,
            height: 160,
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 0,
            opacity: 0.45,
          }}
        >
          <svg width="240" height="160" viewBox="0 0 280 200" fill="none" style={{ position: 'absolute', bottom: 0, right: 0 }}>
            <path
              d="M70 200 C130 200 150 130 210 120 C240 115 260 135 280 150 L280 200 Z"
              fill="#ede6e2"
              opacity="0.85"
            />
            <path
              d="M130 200 C180 195 205 160 235 150 C255 142 268 152 280 162 L280 200 Z"
              fill="#ded4cd"
              opacity="0.75"
            />
          </svg>
        </div>

        {/* 1. TOP HEADER (Hospital Brand Identity & Contact Details) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
            gap: 18,
            paddingBottom: 2,
          }}
        >
          {/* Left: Cross with Heartbeat ECG + Hospital Name & Motto */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {senderLogo ? (
              <img
                src={senderLogo}
                alt="Hospital Logo"
                style={{ maxHeight: 54, maxWidth: 90, objectFit: 'contain', display: 'block' }}
              />
            ) : (
              <div style={{ width: 50, height: 50, position: 'relative', flexShrink: 0 }}>
                <svg viewBox="0 0 100 100" fill="none" style={{ width: '100%', height: '100%' }}>
                  {/* Medical Cross in Dusty Rose / Mauve (#b48e89) */}
                  <path
                    d="M38 12 C38 7.5 41.5 4 46 4 L54 4 C58.5 4 62 7.5 62 12 L62 38 L88 38 C92.5 38 96 41.5 96 46 L96 54 C96 58.5 92.5 62 88 62 L62 62 L62 88 C62 92.5 58.5 96 54 96 L46 96 C41.5 96 38 92.5 38 88 L38 62 L12 62 C7.5 62 4 58.5 4 54 L4 46 C4 41.5 7.5 38 12 38 L38 38 Z"
                    fill={accentHex}
                  />
                  {/* Crisp White Heartbeat ECG Pulse Line */}
                  <path
                    d="M10 50 L34 50 L40 34 L48 66 L56 42 L62 54 L68 50 L90 50"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  color: '#4a3f3a',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                }}
              >
                {hospitalName}
              </h1>
              {hospitalTagline && (
                <div
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 500,
                    color: '#7d726b',
                    marginTop: 2,
                  }}
                >
                  {hospitalTagline}
                </div>
              )}
            </div>
          </div>

          {/* Right: Thin Divider & Contact Stack */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 1, height: 56, backgroundColor: '#ede6e2' }} />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                fontSize: '0.72rem',
                color: '#7d726b',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <MapPin size={12} style={{ color: '#8c8078', flexShrink: 0 }} />
                <span>{hospitalAddress}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Phone size={12} style={{ color: '#8c8078', flexShrink: 0 }} />
                <span>{hospitalPhone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Mail size={12} style={{ color: '#8c8078', flexShrink: 0 }} />
                <span>{hospitalEmail}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Globe size={12} style={{ color: '#8c8078', flexShrink: 0 }} />
                <span>{hospitalWebsite}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SPLIT LAYOUT: LEFT SUMMARY SIDEBAR + RIGHT CLINICAL SECTIONS */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'stretch', flex: 1, width: '100%', position: 'relative', zIndex: 1 }}>
          {/* ===================== LEFT SIDEBAR PANEL ===================== */}
          <div
            style={{
              width: 195,
              flexShrink: 0,
              background: '#f7f2ef',
              border: '1px solid #ede6e2',
              borderRadius: 12,
              padding: '20px 16px 18px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            {/* Top: Hospital Bill Title & Stacked Metadata */}
            <div>
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch', marginBottom: 16, maxWidth: '100%' }}>
                <div
                  style={{
                    fontSize: displayTitle.length > 14 ? '0.78rem' : '0.84rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    color: '#5e524d',
                    textTransform: 'uppercase',
                    lineHeight: 1.25,
                    wordBreak: 'break-word',
                  }}
                >
                  {displayTitle}
                </div>
                <div style={{ width: 34, height: 2.5, backgroundColor: accentHex, marginTop: 5, borderRadius: 1 }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.73rem' }}>
                <div>
                  <div style={{ color: '#8c8078', fontSize: '0.68rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Bill No.</div>
                  <div style={{ color: '#4a3f3a', fontWeight: 700, fontSize: '0.80rem', marginTop: 1, letterSpacing: '0.01em' }}>
                    {displayBillId}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#8c8078', fontSize: '0.68rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Bill Date</div>
                  <div style={{ color: '#4a3f3a', fontWeight: 600, fontSize: '0.80rem', marginTop: 1 }}>
                    {issueDateStr}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#8c8078', fontSize: '0.68rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Due Date</div>
                  <div style={{ color: '#4a3f3a', fontWeight: 600, fontSize: '0.80rem', marginTop: 1 }}>
                    {dueDateStr}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#8c8078', fontSize: '0.68rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Bill Status</div>
                  <div style={{ marginTop: 2 }}>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 10,
                        background: (document.status === 'Paid' || !document.status) ? '#ecfdf5' : '#fffbeb',
                        color: (document.status === 'Paid' || !document.status) ? '#059669' : '#b45309',
                        border: (document.status === 'Paid' || !document.status) ? '1px solid #a7f3d0' : '1px solid #fde68a',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        display: 'inline-block',
                      }}
                    >
                      {document.status || 'Paid'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle: Motto & Heartbeat ECG Illustration */}
            <div style={{ margin: 'auto 0', padding: '16px 0 12px 0' }}>
              <div
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#5e524d',
                  lineHeight: 1.35,
                  textTransform: 'uppercase',
                }}
              >
                YOUR HEALTH<br />
                OUR PRIORITY
              </div>
              <div style={{ width: 28, height: 2, backgroundColor: accentHex, marginTop: 4, marginBottom: 10, borderRadius: 1 }} />

              {/* Heartbeat ECG Line Graphic */}
              <div style={{ width: '100%', height: 32 }}>
                <svg viewBox="0 0 160 36" fill="none" style={{ width: '100%', height: '100%' }}>
                  <path
                    d="M0 18 L44 18 L52 18 L58 4 L66 32 L74 10 L80 24 L86 18 L160 18"
                    stroke={accentHex}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.9"
                  />
                </svg>
              </div>
            </div>

            {/* Bottom: Authorized Signatory */}
            <div style={{ borderTop: '1px solid #e2dad5', paddingTop: 10 }}>
              {document.signature ? (
                <div style={{ marginBottom: 4 }}>
                  <img
                    src={document.signature}
                    alt="Signature"
                    style={{ maxHeight: 34, maxWidth: 110, objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <div style={{ height: 26, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div style={{ width: 85, borderBottom: '1.5px dashed #c4bcb7', marginBottom: 4 }} />
                </div>
              )}
              <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#4a3f3a' }}>
                Authorized Signatory
              </div>
              <div style={{ fontSize: '0.67rem', color: '#8c8078', fontWeight: 400, marginTop: 1, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {hospitalName || 'CityCare Hospital'}
              </div>
            </div>
          </div>

          {/* ===================== RIGHT MAIN CONTENT ===================== */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {/* 1. Dual Patient Information & Bill To Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 12 }}>
              {/* Patient Information Card */}
              <div
                style={{
                  border: '1px solid #ede6e2',
                  borderRadius: 10,
                  background: '#ffffff',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: accentHex,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0,
                    }}
                  >
                    <User size={12} strokeWidth={2.5} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      color: '#5e524d',
                      textTransform: 'uppercase',
                    }}
                  >
                    PATIENT INFORMATION
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto auto 1fr',
                    rowGap: 5,
                    columnGap: 8,
                    fontSize: '0.73rem',
                    marginTop: 1,
                  }}
                >
                  <span style={{ color: '#8c8078' }}>Name</span>
                  <span style={{ color: '#8c8078' }}>:</span>
                  <span style={{ color: '#4a3f3a', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patientName}</span>

                  {patientSubCompany && (
                    <>
                      <span style={{ color: '#8c8078' }}>Company</span>
                      <span style={{ color: '#8c8078' }}>:</span>
                      <span style={{ color: '#4a3f3a', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patientSubCompany}</span>
                    </>
                  )}

                  <span style={{ color: '#8c8078' }}>Patient ID</span>
                  <span style={{ color: '#8c8078' }}>:</span>
                  <span style={{ color: '#4a3f3a', fontWeight: 500 }}>{patientId}</span>

                  <span style={{ color: '#8c8078' }}>Gender</span>
                  <span style={{ color: '#8c8078' }}>:</span>
                  <span style={{ color: '#4a3f3a', fontWeight: 500 }}>{patientGender}</span>

                  <span style={{ color: '#8c8078' }}>Age</span>
                  <span style={{ color: '#8c8078' }}>:</span>
                  <span style={{ color: '#4a3f3a', fontWeight: 500 }}>{patientAge}</span>
                </div>
              </div>

              {/* Bill To Card */}
              <div
                style={{
                  border: '1px solid #ede6e2',
                  borderRadius: 10,
                  background: '#ffffff',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: accentHex,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={12} strokeWidth={2.5} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      color: '#5e524d',
                      textTransform: 'uppercase',
                    }}
                  >
                    BILL TO
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 1 }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#4a3f3a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {patientName}
                  </div>
                  {patientSubCompany && (
                    <div style={{ fontSize: '0.75rem', color: '#6e635d', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {patientSubCompany}
                    </div>
                  )}
                  {patientAddress && patientAddress !== 'N/A' && (
                    <div style={{ fontSize: '0.72rem', color: '#6e635d', lineHeight: 1.35, maxHeight: 38, overflow: 'hidden' }}>
                      {patientAddress}
                    </div>
                  )}
                  {clientPhone && (
                    <div style={{ fontSize: '0.71rem', color: '#6e635d', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: '#8c8078' }}>Phone:</span>
                      <span style={{ color: '#4a3f3a', fontWeight: 500 }}>{clientPhone}</span>
                    </div>
                  )}
                  {clientEmail && (
                    <div style={{ fontSize: '0.71rem', color: '#6e635d', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: '#8c8078' }}>Email:</span>
                      <span style={{ color: '#4a3f3a', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{clientEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Services & Charges Section and Totals Group */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Custom Shaped Slate Tab */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: userAccentHex ? accentHex : '#4d5b63',
                    color: '#ffffff',
                    padding: '7px 18px 7px 14px',
                    borderTopLeftRadius: 8,
                    borderBottomLeftRadius: 8,
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 18,
                    boxShadow: `0 2px 6px ${userAccentHex ? `${accentHex}30` : 'rgba(77, 91, 99, 0.15)'}`,
                  }}
                >
                  <Stethoscope size={14} strokeWidth={2.4} />
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                    SERVICES &amp; CHARGES
                  </span>
                </div>
              </div>

              {/* Table */}
              <div
                style={{
                  border: '1px solid #ede6e2',
                  borderRadius: 10,
                  overflow: 'hidden',
                  background: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <thead>
                    <tr
                      style={{
                        background: '#fbf8f6',
                        borderBottom: '1px solid #ede6e2',
                        fontSize: '0.70rem',
                        color: '#5e524d',
                      }}
                    >
                      <th style={{ textAlign: 'left', padding: '9px 12px', fontWeight: 700, letterSpacing: '0.04em' }}>
                        DESCRIPTION
                      </th>
                      <th style={{ textAlign: 'center', padding: '9px 6px', fontWeight: 700, letterSpacing: '0.04em', width: 80 }}>
                        DATE
                      </th>
                      <th style={{ textAlign: 'center', padding: '9px 4px', fontWeight: 700, letterSpacing: '0.04em', width: 42 }}>
                        QTY
                      </th>
                      <th style={{ textAlign: 'right', padding: '9px 8px', fontWeight: 700, letterSpacing: '0.04em', width: 78 }}>
                        RATE ({currencySymbol})
                      </th>
                      <th style={{ textAlign: 'right', padding: '9px 12px', fontWeight: 700, letterSpacing: '0.04em', width: 88 }}>
                        AMOUNT ({currencySymbol})
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clinicalItems.map((item, idx) => {
                      const lineTotal = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                      const isLast = idx === clinicalItems.length - 1;
                      return (
                        <tr
                          key={item.id || idx}
                          style={{
                            borderBottom: isLast ? 'none' : '1px solid #f2ede9',
                            fontSize: '0.74rem',
                            color: '#4a3f3a',
                          }}
                        >
                          <td style={{ padding: '11px 12px', verticalAlign: 'top', wordBreak: 'break-word' }}>
                            <div style={{ fontWeight: 600, color: '#4a3f3a', lineHeight: 1.3 }}>
                              {item.name || item.description || itemPlaceholder}
                            </div>
                            {item.name && item.description && item.description.trim() !== '' && (
                              <div style={{ fontSize: '0.67rem', color: '#8c8078', marginTop: 2, lineHeight: 1.3 }}>
                                {item.description}
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: 'center', padding: '11px 6px', color: '#8c8078', verticalAlign: 'top', whiteSpace: 'nowrap', fontSize: '0.71rem' }}>
                            {issueDateStr}
                          </td>
                          <td style={{ textAlign: 'center', padding: '11px 4px', fontWeight: 600, color: '#4a3f3a', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                            {item.qty}
                          </td>
                          <td style={{ textAlign: 'right', padding: '11px 8px', color: '#5e524d', verticalAlign: 'top', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                            {currencySymbol}{formatAmount(item.rate)}
                          </td>
                          <td style={{ textAlign: 'right', padding: '11px 12px', fontWeight: 600, color: '#4a3f3a', verticalAlign: 'top', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                            {currencySymbol}{formatAmount(lineTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 3. Totals Breakdown & Solid Slate Total Bill Box */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.15fr 1fr',
                  gap: 12,
                  alignItems: 'stretch',
                }}
              >
                {/* Left Subtotal & Tax Rows */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '12px 16px',
                    background: '#fcfbf9',
                    border: '1px solid #ede6e2',
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      color: '#7d726b',
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>Sub Total</span>
                    <span style={{ fontWeight: 700, color: '#4a3f3a', fontVariantNumeric: 'tabular-nums' }}>
                      {currencySymbol}{formatAmount(renderSubtotal)}
                    </span>
                  </div>

                  {renderDiscount > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.78rem',
                        color: '#15803d',
                      }}
                    >
                      <span>Discount</span>
                      <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                        -{currencySymbol}{formatAmount(renderDiscount)}
                      </span>
                    </div>
                  )}

                  {hasTax && renderTax > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.78rem',
                        color: '#7d726b',
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>
                        Tax {taxPercentage > 0 ? `(GST ${taxPercentage}%)` : ''}
                      </span>
                      <span style={{ fontWeight: 700, color: '#4a3f3a', fontVariantNumeric: 'tabular-nums' }}>
                        {currencySymbol}{formatAmount(renderTax)}
                      </span>
                    </div>
                  )}

                  {calc.amountPaid > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.76rem',
                        color: '#059669',
                        paddingTop: 4,
                        borderTop: '1px dashed #ede6e2',
                      }}
                    >
                      <span>Amount Paid</span>
                      <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                        {currencySymbol}{formatAmount(calc.amountPaid)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right Solid Slate Total Box */}
                <div
                  style={{
                    background: userAccentHex
                      ? `linear-gradient(135deg, ${accentHex} 0%, ${darkerAccentHex} 100%)`
                      : '#4d5b63',
                    color: '#ffffff',
                    borderRadius: 10,
                    padding: '12px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    boxShadow: `0 3px 10px ${userAccentHex ? `${accentHex}30` : 'rgba(77, 91, 99, 0.18)'}`,
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Total Bill Amount
                  </span>
                  <span style={{ fontSize: '1.45rem', fontWeight: 900, marginTop: 3, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                    {currencySymbol}{formatAmount(renderGrandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Real Bill Details & Payment Settlement Information */}
            <div
              style={{
                background: '#fcfbf9',
                border: '1px solid #ede6e2',
                borderRadius: 10,
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                marginTop: 0,
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: userAccentHex ? accentHex : '#4d5b63',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0,
                    }}
                  >
                    <CreditCard size={12} strokeWidth={2.4} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      color: '#5e524d',
                      textTransform: 'uppercase',
                    }}
                  >
                    BILL &amp; PAYMENT DETAILS
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: (document.status === 'Paid' || !document.status) ? '#ecfdf5' : '#fffbeb',
                      color: (document.status === 'Paid' || !document.status) ? '#059669' : '#b45309',
                      border: (document.status === 'Paid' || !document.status) ? '1px solid #a7f3d0' : '1px solid #fde68a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {document.status || 'Paid'}
                  </span>
                </div>
              </div>

              {/* Grid of actual bill details */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: 8,
                  fontSize: '0.72rem',
                  paddingTop: 6,
                  borderTop: '1px solid #f2ede9',
                }}
              >
                <div>
                  <div style={{ color: '#8c8078', fontSize: '0.66rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Payment Mode</div>
                  <div style={{ color: '#4a3f3a', fontWeight: 600, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {document.paymentMethod || 'Bank Transfer'}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#8c8078', fontSize: '0.66rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Payment Terms</div>
                  <div style={{ color: '#4a3f3a', fontWeight: 600, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {document.paymentTerms || 'Due on receipt'}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#8c8078', fontSize: '0.66rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Total Services</div>
                  <div style={{ color: '#4a3f3a', fontWeight: 600, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {clinicalItems.length} Items ({clinicalItems.reduce((acc, it) => acc + (Number(it.qty) || 0), 0)} Units)
                  </div>
                </div>

                <div>
                  <div style={{ color: '#8c8078', fontSize: '0.66rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Billing Date</div>
                  <div style={{ color: '#4a3f3a', fontWeight: 600, marginTop: 1, whiteSpace: 'nowrap' }}>
                    {issueDateStr}
                  </div>
                </div>
              </div>

              {/* If bank or UPI details exist in the form, show them */}
              {hasBankDetails && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '4px 14px',
                    fontSize: '0.70rem',
                    paddingTop: 6,
                    borderTop: '1px dashed #ede6e2',
                    color: '#7d726b',
                  }}
                >
                  {document.bankName && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: '#8c8078' }}>Bank:</span>
                      <span style={{ fontWeight: 600, color: '#4a3f3a' }}>{document.bankName}</span>
                    </div>
                  )}
                  {document.accountNumber && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: '#8c8078' }}>A/C:</span>
                      <span style={{ fontWeight: 600, color: '#4a3f3a' }}>{document.accountNumber}</span>
                    </div>
                  )}
                  {document.ifscCode && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: '#8c8078' }}>IFSC:</span>
                      <span style={{ fontWeight: 600, color: '#4a3f3a' }}>{document.ifscCode}</span>
                    </div>
                  )}
                  {document.upiId && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ color: '#8c8078' }}>UPI ID:</span>
                      <span style={{ fontWeight: 700, color: '#4d5b63' }}>{document.upiId}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Terms */}
              {hasPaymentTerms && (
                <div
                  style={{
                    fontSize: '0.70rem',
                    color: '#6e635d',
                    paddingTop: 4,
                    borderTop: '1px dashed #ede6e2',
                    lineHeight: 1.35,
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#5e524d' }}>Payment Terms: </span>
                  {paymentTerms}
                </div>
              )}

              {/* Customer Notes */}
              {document.notes && document.notes.trim() !== '' && (
                <div
                  style={{
                    fontSize: '0.70rem',
                    color: '#6e635d',
                    paddingTop: 4,
                    borderTop: '1px dashed #ede6e2',
                    lineHeight: 1.35,
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#5e524d' }}>Notes: </span>
                  {document.notes}
                </div>
              )}

              {/* Payment Instructions */}
              {document.paymentNotes && document.paymentNotes.trim() !== '' && (
                <div
                  style={{
                    fontSize: '0.70rem',
                    color: '#6e635d',
                    paddingTop: 4,
                    borderTop: '1px dashed #ede6e2',
                    lineHeight: 1.35,
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#5e524d' }}>Payment Instructions: </span>
                  {document.paymentNotes}
                </div>
              )}

              {/* Terms & Conditions */}
              {document.termsAndConditions && document.termsAndConditions.trim() !== '' && (
                <div
                  style={{
                    fontSize: '0.70rem',
                    color: '#6e635d',
                    paddingTop: 4,
                    borderTop: '1px dashed #ede6e2',
                    lineHeight: 1.35,
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#5e524d' }}>Terms & Conditions: </span>
                  {document.termsAndConditions}
                </div>
              )}
            </div>


          </div>
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
          border: `1.5px solid ${userAccentHex ? `${accentHex}40` : '#C7D2FE'}`,
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
            <path d="M0 0 L140 0 L140 140 Z" fill={userAccentHex ? `${accentHex}15` : '#EEF2FF'} opacity="0.85" />
          </svg>
        </div>

        {/* 1. Royal Academia Blue Collegiate Header with Gold Accent */}
        <div
          className="academic-header"
          style={{
            background: userAccentHex
              ? `linear-gradient(135deg, ${darkerAccentHex} 0%, ${accentHex} 100%)`
              : 'linear-gradient(135deg, #1E2B69 0%, #283593 100%)',
            borderBottom: '3px solid #E2B93B',
            padding: '16px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderRadius: 8,
            color: '#FFFFFF',
            boxShadow: `0 4px 12px ${userAccentHex ? `${accentHex}30` : 'rgba(40,53,147,0.18)'}`,
            position: 'relative',
            zIndex: 1,
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0 }}>
            {/* Heraldic Collegiate Badge or Custom Logo */}
            {activeLogo ? (
              <img
                src={activeLogo}
                alt="Logo"
                style={{
                  maxHeight: 48,
                  maxWidth: 120,
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  flexShrink: 0,
                  marginTop: 2,
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
                  marginTop: 2,
                }}
              >
                <GraduationCap size={28} color="#E2B93B" />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#FFFFFF', letterSpacing: '0.02em', lineHeight: 1.2, wordBreak: 'break-word' }}>
                {senderName || senderPlaceholder}
              </h2>
              {senderTagline && (
                <div style={{ fontSize: '0.74rem', color: '#FCD34D', fontWeight: 700, fontStyle: 'italic', marginTop: 3 }}>
                  {senderTagline}
                </div>
              )}
              {senderAddress && (
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.85)', marginTop: 4, lineHeight: 1.4, wordBreak: 'break-word' }}>
                  {senderAddress}
                </div>
              )}
              {(senderPhone || senderEmail) && (
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.85)', marginTop: 2, lineHeight: 1.4, wordBreak: 'break-word' }}>
                  {[senderPhone && `Ph: ${senderPhone}`, senderEmail].filter(Boolean).join('  •  ')}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
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
                whiteSpace: 'nowrap',
              }}
            >
              {document.title || 'BILL'}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.02em', color: '#FFFFFF', marginTop: 4, whiteSpace: 'nowrap' }}>
              #{cleanBillId}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto auto',
                columnGap: 8,
                rowGap: 2,
                fontSize: '0.70rem',
                alignItems: 'baseline',
                marginTop: 4,
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.75)', textAlign: 'right', fontWeight: 500 }}>Issue Date:</span>
              <span style={{ color: '#FFFFFF', fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' }}>
                {formatHeaderDate(document.issueDate) || '-'}
              </span>

              {document.dueDate && (
                <>
                  <span style={{ color: 'rgba(255,255,255,0.75)', textAlign: 'right', fontWeight: 500 }}>Due Date:</span>
                  <span style={{ color: '#FCA5A5', fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' }}>
                    {formatHeaderDate(document.dueDate)}
                  </span>
                </>
              )}

              {hasPaymentTerms && (
                <>
                  <span style={{ color: 'rgba(255,255,255,0.75)', textAlign: 'right', fontWeight: 500 }}>Payment Terms:</span>
                  <span style={{ color: '#FFFFFF', fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' }}>
                    {paymentTerms}
                  </span>
                </>
              )}

              {hasPoNumber && (
                <>
                  <span style={{ color: 'rgba(255,255,255,0.75)', textAlign: 'right', fontWeight: 500 }}>REF / PO:</span>
                  <span style={{ color: '#FCD34D', fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' }}>
                    {poNumberValue}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 2. Symmetrical Collegiate Dual Information Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'stretch' }}>
          {/* Card 1: Institution / Issued By */}
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
              <div style={{ color: userAccentHex ? accentHex : '#283593', fontWeight: 800, fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building2 size={13} color={userAccentHex ? accentHex : '#283593'} />
                <span>ISSUED BY</span>
              </div>
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.94rem', marginTop: 4, lineHeight: 1.2 }}>
                {senderName || senderPlaceholder}
              </div>
              {senderAddress && (
                <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 6, lineHeight: 1.4 }}>
                  {senderAddress}
                </div>
              )}
              <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: 4 }}>
                {[senderPhone && `Ph: ${senderPhone}`, senderEmail].filter(Boolean).join('  •  ')}
              </div>
            </div>

            {hasSenderTax && (
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1E293B', marginTop: 10, paddingTop: 4, borderTop: '1px solid #E2E8F0' }}>
                GSTIN / Tax: {senderTaxNumber}
              </div>
            )}
          </div>

          {/* Card 2: Customer / Payee Particulars */}
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
              <div style={{ color: userAccentHex ? accentHex : '#283593', fontWeight: 800, fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={13} color={userAccentHex ? accentHex : '#283593'} />
                <span>BILLED TO</span>
              </div>
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.94rem', marginTop: 4, lineHeight: 1.2 }}>
                {clientName || clientCompany || clientPlaceholder}
              </div>
              {clientCompany && clientName && clientCompany !== clientName && (
                <div style={{ fontSize: '0.72rem', color: userAccentHex ? accentHex : '#283593', fontWeight: 600, marginTop: 2 }}>
                  {clientCompany}
                </div>
              )}
              {clientAddress && (
                <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 6, lineHeight: 1.4 }}>
                  {clientAddress}
                </div>
              )}
              <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: 4 }}>
                {[clientPhone && `Ph: ${clientPhone}`, clientEmail].filter(Boolean).join('  •  ')}
              </div>
            </div>

            {hasPoNumber && (
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1E293B', marginTop: 10, paddingTop: 4, borderTop: '1px solid #E2E8F0' }}>
                REF / PO: {poNumberValue}
              </div>
            )}
          </div>
        </div>

        {/* 3. Tuition & Fee Table */}
        <div style={{ border: `1.5px solid ${userAccentHex ? accentHex : '#283593'}`, borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: userAccentHex ? accentHex : '#283593', color: '#FFFFFF' }}>
                <th style={{ width: hasAnyTax ? '46%' : '58%', textAlign: 'left', padding: '11px 14px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  PARTICULARS / DESCRIPTION
                </th>
                <th style={{ width: '12%', textAlign: 'center', padding: '11px 8px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  QTY
                </th>
                <th style={{ width: '14%', textAlign: 'right', padding: '11px 10px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  RATE ({currencySymbol})
                </th>
                {hasAnyTax && (
                  <th style={{ width: '12%', textAlign: 'center', padding: '11px 8px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                    TAX (%)
                  </th>
                )}
                <th style={{ width: '16%', textAlign: 'right', padding: '11px 14px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  AMOUNT ({currencySymbol})
                </th>
              </tr>
            </thead>
            <tbody>
              {document.items.map((item, idx) => {
                const itemAmt = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                const isEven = idx % 2 === 1;
                return (
                  <tr key={item.id || idx} style={{ background: isEven ? '#F8FAFC' : '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px 14px', fontSize: '0.78rem', color: '#0F172A' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>
                        {item.name || item.description || itemPlaceholder}
                      </div>
                      {item.name && item.description && item.description !== item.name && (
                        <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 400, marginTop: 2 }}>
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', padding: '11px 8px', fontSize: '0.76rem', color: '#334155' }}>
                      {item.qty}
                    </td>
                    <td style={{ textAlign: 'right', padding: '11px 10px', fontSize: '0.76rem', color: '#334155', fontVariantNumeric: 'tabular-nums' }}>
                      {currencySymbol}{formatAmount(item.rate)}
                    </td>
                    {hasAnyTax && (
                      <td style={{ textAlign: 'center', padding: '11px 8px', fontSize: '0.76rem', color: '#334155' }}>
                        {getItemTaxDisplay(item)}
                      </td>
                    )}
                    <td style={{ textAlign: 'right', padding: '11px 14px', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
                      {currencySymbol}{formatAmount(itemAmt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 4. Settlement & Totals Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 16, alignItems: 'stretch' }}>
          {/* Left Column: Bank Details Box & Regulations Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
            {hasBankDetails && (
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 8,
                  padding: '12px 16px',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ color: '#283593', fontWeight: 800, fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  BANK &amp; REMITTANCE DETAILS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 10, rowGap: 5, fontSize: '0.74rem', color: '#475569', alignItems: 'baseline' }}>
                  {document.bankName && (
                    <>
                      <span style={{ color: '#64748B' }}>Bank:</span>
                      <strong style={{ color: '#0F172A' }}>{document.bankName}</strong>
                    </>
                  )}
                  {document.accountNumber && (
                    <>
                      <span style={{ color: '#64748B' }}>Account No:</span>
                      <strong style={{ color: '#0F172A' }}>{document.accountNumber}</strong>
                    </>
                  )}
                  {document.ifscCode && (
                    <>
                      <span style={{ color: '#64748B' }}>IFSC Code:</span>
                      <div>
                        <strong style={{ color: '#0F172A' }}>{document.ifscCode}</strong> {document.branch && <span style={{ color: '#64748B' }}>({document.branch})</span>}
                      </div>
                    </>
                  )}
                  {document.upiId && (
                    <>
                      <span style={{ color: '#64748B' }}>UPI ID:</span>
                      <strong style={{ color: '#283593' }}>{document.upiId}</strong>
                    </>
                  )}
                </div>
              </div>
            )}

            <div
              style={{
                background: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                borderRadius: 8,
                padding: '12px 16px',
                boxSizing: 'border-box',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
              }}
            >
              <div style={{ fontWeight: 800, color: '#283593', textTransform: 'uppercase', fontSize: '0.66rem', letterSpacing: '0.05em', marginBottom: 6 }}>
                REGULATIONS &amp; TERMS
              </div>
              {hasPaymentTerms && (
                <div style={{ fontSize: '0.70rem', color: '#475569', marginBottom: 4 }}>
                  <strong style={{ color: '#0F172A' }}>Payment Terms:</strong> {paymentTerms}
                </div>
              )}
              {document.notes && (
                <div style={{ fontSize: '0.70rem', color: '#475569', marginBottom: 4 }}>
                  <strong style={{ color: '#0F172A' }}>Notes:</strong> {document.notes}
                </div>
              )}
              {cleanPaymentInstructions && (
                <div style={{ fontSize: '0.70rem', color: '#475569', fontStyle: 'italic', marginBottom: 4 }}>
                  {cleanPaymentInstructions}
                </div>
              )}
              {document.termsAndConditions ? (
                <div style={{ fontSize: '0.68rem', color: '#475569', lineHeight: 1.4 }}>
                  {document.termsAndConditions}
                </div>
              ) : (
                <div className="preview-placeholder" style={{ fontSize: '0.66rem', color: '#64748B', lineHeight: 1.4 }}>
                  1. Tuition fees once remitted are subject to institutional academic refund regulations.<br />
                  2. Official fee voucher eligible for educational tax benefits under applicable laws.
                </div>
              )}
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
              {/* Total, Paid & Balance Due Banner */}
              <div
                style={{
                  background: userAccentHex
                    ? `linear-gradient(135deg, ${darkerAccentHex} 0%, ${accentHex} 100%)`
                    : 'linear-gradient(135deg, #1E2B69 0%, #283593 100%)',
                  color: '#FFFFFF',
                  padding: '12px 16px',
                  borderRadius: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  marginTop: 6,
                  boxShadow: `0 2px 6px ${userAccentHex ? `${accentHex}30` : 'rgba(40,53,147,0.2)'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 5 }}>
                  <span style={{ color: 'rgba(255,255,255,0.85)' }}>Total Tuition Fee:</span>
                  <span style={{ fontWeight: 700, color: '#FFFFFF', fontVariantNumeric: 'tabular-nums' }}>
                    {currencySymbol}{formatAmount(calc.grandTotal)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 5 }}>
                  <span style={{ color: '#86EFAC' }}>Amount Paid:</span>
                  <span style={{ fontWeight: 700, color: '#86EFAC', fontVariantNumeric: 'tabular-nums' }}>
                    {currencySymbol}{formatAmount(calc.amountPaid || 0)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 }}>
                  <div>
                    <div style={{ fontSize: '0.62rem', color: '#FCD34D', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      BALANCE DUE
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, letterSpacing: '0.01em', color: '#FFFFFF' }}>
                      Balance to Pay
                    </div>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FCD34D', fontVariantNumeric: 'tabular-nums' }}>
                    {currencySymbol}{formatAmount(calc.balanceDue)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Registrar Signature Endorsement (Below all cards) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, paddingRight: 4 }}>
          <div style={{ width: 185, textAlign: 'center' }}>
            {document.signature ? (
              <img src={document.signature} alt="Sign" style={{ maxHeight: 32, maxWidth: 140, objectFit: 'contain', marginBottom: 2 }} />
            ) : (
              <div style={{ height: 26 }} />
            )}
            <div style={{ borderTop: `1.5px solid ${userAccentHex ? accentHex : '#283593'}`, fontSize: '0.72rem', color: userAccentHex ? accentHex : '#283593', fontWeight: 800, paddingTop: 4 }}>
              Registrar / Finance Bursar
            </div>
            <div style={{ fontSize: '0.64rem', color: '#64748B', marginTop: 1 }}>
              {senderName || senderPlaceholder}
            </div>
          </div>
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
          border: `1.5px solid ${userAccentHex ? `${accentHex}40` : '#FFCC80'}`,
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          className="tpl-sidebar-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '195px 1fr',
            gap: 16,
            minHeight: '100%',
            flex: 1,
            alignItems: 'stretch',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Left Brand Column (Warm Vertical Brand Sidebar) */}
          <div
            className="tpl-sidebar-left"
            style={{
              background: `linear-gradient(180deg, ${accentHex} 0%, ${darkerAccentHex} 100%)`,
              padding: '16px 13px',
              borderRadius: 10,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 10,
              color: '#FFFFFF',
              boxShadow: `0 4px 16px ${userAccentHex ? `${accentHex}38` : 'rgba(230,81,0,0.22)'}`,
              boxSizing: 'border-box',
              minWidth: 0,
              width: '100%',
            }}
          >
            <div>
              {activeLogo ? (
                <div style={{ marginBottom: 8 }}>
                  <img
                    src={activeLogo}
                    alt={senderName || 'Logo'}
                    style={{
                      maxHeight: 46,
                      maxWidth: 150,
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                </div>
              ) : null}
              <div style={{ fontWeight: 900, fontSize: '1.38rem', color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {senderName || senderPlaceholder}
              </div>
              {senderTagline && (
                <div style={{ fontSize: '0.74rem', color: userAccentHex ? 'rgba(255,255,255,0.85)' : '#FED7AA', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 4 }}>
                  {senderTagline}
                </div>
              )}
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
                <Sparkles size={12} color={userAccentHex ? '#FFFFFF' : '#FED7AA'} />
                <span>VERIFIED CREATIVE PARTNER</span>
              </div>
            </div>

            {/* Sidebar Contact Details in Frosted Glass Card */}
            {(senderAddress || senderPhone || senderEmail || document.senderWebsite || hasSenderTax) && (
              <div
                style={{
                  fontSize: '0.70rem',
                  color: '#FFFFFF',
                  background: 'rgba(255,255,255,0.14)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  padding: '10px 11px',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.66rem', color: userAccentHex ? 'rgba(255,255,255,0.88)' : '#FED7AA', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  STUDIO HEADQUARTERS
                </div>
                {senderAddress && <div style={{ lineHeight: 1.35 }}>{senderAddress}</div>}
                {senderPhone && <div>Ph: {senderPhone}</div>}
                {senderEmail && <div style={{ wordBreak: 'break-all' }}>{senderEmail}</div>}
                {document.senderWebsite && <div>{document.senderWebsite}</div>}
                {hasSenderTax && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.22)', paddingTop: 4, marginTop: 2, fontWeight: 700, color: userAccentHex ? '#FFFFFF' : '#FED7AA', fontSize: '0.68rem' }}>
                    GSTIN: {senderTaxNumber}
                  </div>
                )}
              </div>
            )}

            {/* Creative Engagement Scope Card */}
            {hasPoNumber && (
              <div
                style={{
                  fontSize: '0.70rem',
                  color: '#FFFFFF',
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.20)',
                  padding: '10px 11px',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.66rem', color: userAccentHex ? 'rgba(255,255,255,0.88)' : '#FED7AA', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  ENGAGEMENT SCOPE
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.70rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap' }}>PO / Ref:</span>
                  <strong style={{ color: '#FFFFFF', fontWeight: 800, whiteSpace: 'nowrap' }}>{poNumberValue}</strong>
                </div>
              </div>
            )}

            {/* Instant Pay QR Badge */}
            {document.upiId && (
              <div
                className="sidebar-qr-badge"
                style={{
                  background: '#FFFFFF',
                  color: userAccentHex ? accentHex : '#E65100',
                  padding: '10px 8px',
                  borderRadius: 8,
                  textAlign: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
                }}
              >
                <QrCode size={32} color={userAccentHex ? accentHex : '#E65100'} style={{ margin: '0 auto 4px auto' }} />
                <div style={{ fontSize: '0.70rem', fontWeight: 900, color: '#0F172A', letterSpacing: '0.03em' }}>
                  SCAN TO PAY VIA UPI
                </div>
                <div style={{ fontSize: '0.66rem', color: userAccentHex ? darkerAccentHex : '#C2410C', fontWeight: 800, marginTop: 2, wordBreak: 'break-all' }}>
                  {document.upiId}
                </div>
                <div style={{ fontSize: '0.58rem', color: '#64748B', marginTop: 1 }}>
                  Instant settlement via any UPI App
                </div>
              </div>
            )}

            {/* Sidebar Bank Remittance Card */}
            {hasBankDetails && (
              <div
                style={{
                  background: 'rgba(255,255,255,0.14)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  padding: '10px 11px',
                  borderRadius: 8,
                  fontSize: '0.70rem',
                  color: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}
              >
                <div style={{ fontWeight: 800, color: userAccentHex ? 'rgba(255,255,255,0.88)' : '#FED7AA', letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.66rem' }}>
                  WIRE REMITTANCE:
                </div>
                {document.bankName && <div>Bank: <strong style={{ color: '#FFFFFF' }}>{document.bankName}</strong></div>}
                {document.accountNumber && <div>A/C: <strong style={{ color: '#FFFFFF' }}>{document.accountNumber}</strong></div>}
                {document.ifscCode && <div>IFSC: <strong style={{ color: '#FFFFFF' }}>{document.ifscCode}</strong> {document.branch && `(${document.branch})`}</div>}
                <div style={{ fontSize: '0.64rem', color: userAccentHex ? 'rgba(255,255,255,0.85)' : '#FED7AA', fontStyle: 'italic', marginTop: 2 }}>
                  Quote Ref #{cleanBillId} in remarks.
                </div>
              </div>
            )}

            {/* Creative Quality Guarantee Badge */}
            <div
              style={{
                fontSize: '0.64rem',
                color: 'rgba(255,255,255,0.92)',
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.16)',
                padding: '8px 10px',
                borderRadius: 8,
                lineHeight: 1.35,
              }}
            >
              <div style={{ fontWeight: 800, color: userAccentHex ? '#FFFFFF' : '#FED7AA', marginBottom: 2 }}>✦ CREATIVE SLA GUARANTEE</div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `2.5px solid ${accentHex}`, paddingBottom: 12 }}>
              <div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: accentHex, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {document.title || 'BILL'}
                </h1>
                <div
                  style={{
                    display: 'inline-block',
                    background: userAccentHex ? `${accentHex}14` : '#FFF7ED',
                    color: accentHex,
                    border: `1.5px solid ${userAccentHex ? `${accentHex}40` : '#FFCC80'}`,
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
                <div>Bill Date: <strong style={{ color: '#0F172A' }}>{formatHeaderDate(document.issueDate) || '-'}</strong></div>
                <div>Payment Due: <strong style={{ color: '#0F172A' }}>{formatHeaderDate(document.dueDate) || '-'}</strong></div>
                {hasPaymentTerms && (
                  <div>Payment Terms: <strong style={{ color: '#0F172A' }}>{paymentTerms}</strong></div>
                )}
                {hasPoNumber && (
                  <div style={{ color: accentHex, fontWeight: 800, marginTop: 2 }}>
                    Project Ref: {poNumberValue}
                  </div>
                )}
              </div>
            </div>

            {/* Billed To Client Card with Warm Accent Tint */}
            <div style={{ background: userAccentHex ? `${accentHex}0c` : '#FFF7ED', border: `1.5px solid ${userAccentHex ? `${accentHex}30` : '#FFEDD5'}`, borderRadius: 8, padding: '14px 18px', fontSize: '0.76rem' }}>
              <span style={{ fontSize: '0.68rem', color: accentHex, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                CLIENT / BILLED TO:
              </span>
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '1.02rem', marginTop: 3 }}>{clientName || clientCompany || clientPlaceholder}</div>
              {clientCompany && clientName && clientCompany !== clientName && <div style={{ color: '#475569', fontSize: '0.76rem', marginTop: 1, fontWeight: 600 }}>{clientCompany}</div>}
              {clientAddress && <div style={{ color: '#64748B', fontSize: '0.74rem', marginTop: 3, lineHeight: 1.45 }}>{clientAddress}</div>}
              {(clientPhone || clientEmail || hasClientTax) && (
                <div style={{ color: userAccentHex ? darkerAccentHex : '#9A3412', fontSize: '0.72rem', fontWeight: 600, marginTop: 5 }}>
                  {[clientPhone && `Ph: ${clientPhone}`, clientEmail, hasClientTax && `GSTIN: ${clientTaxNumber}`].filter(Boolean).join('  •  ')}
                </div>
              )}
            </div>

            {/* Deliverables Table */}
            {(() => {
              const thBg = userAccentHex ? `${accentHex}18` : '#FFEDD5';
              const thColor = userAccentHex ? darkerAccentHex : '#9A3412';
              const thBorderRight = `1px solid ${userAccentHex ? `${accentHex}25` : '#FED7AA'}`;
              const thBorderBottom = `1.5px solid ${userAccentHex ? `${accentHex}35` : '#FDBA74'}`;
              const tdBorderRight = `1px solid ${userAccentHex ? `${accentHex}18` : '#FFEDD5'}`;
              const tdBorderBottom = `1px solid ${userAccentHex ? `${accentHex}20` : '#FFEDD5'}`;

              return (
                <div className="agency-table-wrapper" style={{ margin: '0', border: `1.5px solid ${userAccentHex ? `${accentHex}35` : '#FFEDD5'}`, borderRadius: 8, overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}>
                  <table className="agency-items-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', tableLayout: 'auto' }}>
                    <thead>
                      <tr style={{ background: thBg }}>
                        <th className="th-nowrap" style={{ width: '32px', textAlign: 'center', padding: '10px 4px', fontWeight: 800, fontSize: '0.73rem', whiteSpace: 'nowrap', background: thBg, color: thColor, borderRight: thBorderRight, borderBottom: thBorderBottom }}>#</th>
                        <th style={{ textAlign: 'left', padding: '10px 10px', fontWeight: 800, fontSize: '0.73rem', letterSpacing: '0.04em', background: thBg, color: thColor, borderRight: thBorderRight, borderBottom: thBorderBottom }}>DELIVERABLE / MILESTONE</th>
                        <th className="th-nowrap" style={{ width: '48px', textAlign: 'center', padding: '10px 6px', fontWeight: 800, fontSize: '0.73rem', whiteSpace: 'nowrap', background: thBg, color: thColor, borderRight: thBorderRight, borderBottom: thBorderBottom }}>QTY</th>
                        <th className="th-nowrap" style={{ width: '85px', textAlign: 'right', padding: '10px 8px', fontWeight: 800, fontSize: '0.73rem', whiteSpace: 'nowrap', background: thBg, color: thColor, borderRight: thBorderRight, borderBottom: thBorderBottom }}>RATE</th>
                        {hasAnyTax && (
                          <th className="th-nowrap" style={{ width: '52px', textAlign: 'center', padding: '10px 6px', fontWeight: 800, fontSize: '0.73rem', whiteSpace: 'nowrap', background: thBg, color: thColor, borderRight: thBorderRight, borderBottom: thBorderBottom }}>TAX</th>
                        )}
                        <th className="th-nowrap" style={{ width: '95px', textAlign: 'right', padding: '10px 10px', fontWeight: 800, fontSize: '0.73rem', whiteSpace: 'nowrap', background: thBg, color: thColor, borderBottom: thBorderBottom }}>AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {document.items.map((item, idx) => {
                        const itemAmt = (Number(item.qty) || 0) * (Number(item.rate) || 0);
                        const isEven = idx % 2 === 1;
                        const isLastRow = idx === document.items.length - 1;
                        const rowBorderBottom = isLastRow ? 'none' : tdBorderBottom;
                        const rowBg = isEven ? (userAccentHex ? `${accentHex}06` : '#FFFBF7') : '#FFFFFF';

                        return (
                          <tr key={item.id} style={{ background: rowBg }}>
                            <td className="td-nowrap" style={{ textAlign: 'center', padding: '10px 4px', fontWeight: 700, color: userAccentHex ? darkerAccentHex : '#9A3412', fontSize: '0.76rem', whiteSpace: 'nowrap', borderRight: tdBorderRight, borderBottom: rowBorderBottom }}>
                              {idx + 1}
                            </td>
                            <td className="cell-desc" style={{ textAlign: 'left', padding: '10px 10px', borderRight: tdBorderRight, borderBottom: rowBorderBottom }}>
                              <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.84rem', wordBreak: 'break-word' }}>{item.name || item.description || itemPlaceholder}</div>
                              {item.name && item.description && item.description !== item.name && (
                                <div style={{ fontSize: '0.71rem', color: '#64748B', marginTop: 2, lineHeight: 1.35, wordBreak: 'break-word' }}>{item.description}</div>
                              )}
                            </td>
                            <td className="td-nowrap" style={{ textAlign: 'center', padding: '10px 6px', fontWeight: 600, color: '#334155', whiteSpace: 'nowrap', borderRight: tdBorderRight, borderBottom: rowBorderBottom }}>{item.qty}</td>
                            <td className="td-nowrap" style={{ textAlign: 'right', padding: '10px 8px', fontVariantNumeric: 'tabular-nums', color: '#334155', whiteSpace: 'nowrap', borderRight: tdBorderRight, borderBottom: rowBorderBottom }}>{currencySymbol}{formatAmount(item.rate)}</td>
                            {hasAnyTax && (
                              <td className="td-nowrap" style={{ textAlign: 'center', fontSize: '0.73rem', color: '#64748B', padding: '10px 6px', whiteSpace: 'nowrap', borderRight: tdBorderRight, borderBottom: rowBorderBottom }}>
                                {getItemTaxDisplay(item)}
                              </td>
                            )}
                            <td className="td-nowrap" style={{ textAlign: 'right', fontWeight: 800, color: userAccentHex ? accentHex : '#9A3412', padding: '10px 10px', fontVariantNumeric: 'tabular-nums', fontSize: '0.82rem', whiteSpace: 'nowrap', borderBottom: rowBorderBottom }}>
                              {currencySymbol}{formatAmount(itemAmt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}


            {/* Bottom Section Row 1: Notes (Left) + Reconciliation Totals (Right) */}
            <div className="agency-bottom-row-1" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.25fr)', gap: 12, alignItems: 'start' }}>
              <div style={{ fontSize: '0.74rem', color: '#475569', background: userAccentHex ? `${accentHex}0a` : '#FFF7ED', border: `1.5px solid ${userAccentHex ? `${accentHex}30` : '#FFEDD5'}`, borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6, boxSizing: 'border-box' }}>
                <div style={{ fontWeight: 800, color: accentHex, marginBottom: 2, textTransform: 'uppercase', fontSize: '0.70rem', letterSpacing: '0.04em' }}>
                  STUDIO PROJECT TERMS:
                </div>
                {hasPaymentTerms && (
                  <div style={{ fontSize: '0.72rem', color: '#334155' }}>
                    <strong>Payment Terms:</strong> {paymentTerms}
                  </div>
                )}
                {document.notes && (
                  <div style={{ fontSize: '0.72rem', color: '#334155' }}>
                    <strong>Notes:</strong> {document.notes}
                  </div>
                )}
                {cleanPaymentInstructions && (
                  <div style={{ fontStyle: 'italic', fontSize: '0.70rem', color: '#64748B' }}>
                    {cleanPaymentInstructions}
                  </div>
                )}
                {document.termsAndConditions ? (
                  <div style={{ fontSize: '0.70rem', color: '#64748B', lineHeight: 1.45 }}>
                    <strong>Terms:</strong> {document.termsAndConditions}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8', fontStyle: 'italic', lineHeight: 1.45 }}>
                    Payment due as per invoice terms. All deliverables verified upon electronic receipt.
                  </div>
                )}
              </div>

              <div style={{ background: '#FFFFFF', border: `1.5px solid ${userAccentHex ? `${accentHex}30` : '#FFEDD5'}`, borderRadius: 8, padding: '12px 14px', fontSize: '0.76rem', display: 'flex', flexDirection: 'column', gap: 5, boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Milestone Subtotal:</span>
                  <span style={{ fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>{currencySymbol}{formatAmount(calc.subtotal)}</span>
                </div>
                {calc.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
                    <span>Agency Discount:</span>
                    <span style={{ whiteSpace: 'nowrap' }}>-{currencySymbol}{formatAmount(calc.discountAmount)}</span>
                  </div>
                )}
                {calc.taxAmount > 0 && hasAnyTax && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>GST ({billTaxRate}%):</span>
                    <span style={{ fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>{currencySymbol}{formatAmount(calc.taxAmount)}</span>
                  </div>
                )}
                {calc.additionalCharges > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                    <span>Production Charges:</span>
                    <span style={{ whiteSpace: 'nowrap' }}>{currencySymbol}{formatAmount(calc.additionalCharges)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: accentHex, borderTop: `1px solid ${userAccentHex ? `${accentHex}25` : '#FFEDD5'}`, paddingTop: 5 }}>
                  <span>Total Project Fee:</span>
                  <span style={{ whiteSpace: 'nowrap', fontSize: '0.92rem' }}>{currencySymbol}{formatAmount(calc.grandTotal)}</span>
                </div>
                {calc.amountPaid > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                    <span>Advance Received:</span>
                    <span style={{ whiteSpace: 'nowrap' }}>{currencySymbol}{formatAmount(calc.amountPaid)}</span>
                  </div>
                )}

                {/* Integrated Payment Terms & Method summary */}
                <div style={{ marginTop: 4, paddingTop: 6, borderTop: `1px dashed ${userAccentHex ? `${accentHex}20` : '#FFEDD5'}`, fontSize: '0.70rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {hasPaymentTerms && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Terms:</span>
                      <strong style={{ color: '#0F172A' }}>{paymentTerms}</strong>
                    </div>
                  )}
                  {document.paymentMethod && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Method:</span>
                      <strong style={{ color: '#0F172A' }}>{document.paymentMethod}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Section Row 2: Verification (Left) + Creative Director Signature (Right) */}
            <div className="agency-bottom-row-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', marginTop: 'auto', paddingTop: 10 }}>
              {/* Left Footnote */}
              <div>
                <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.84rem' }}>
                  {senderName || senderPlaceholder}
                </div>
                {senderTagline && (
                  <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: 2 }}>
                    {senderTagline}
                  </div>
                )}
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
                <div style={{ borderTop: `1.5px solid ${accentHex}`, fontSize: '0.72rem', color: accentHex, fontWeight: 800, paddingTop: 4 }}>
                  Creative Director / Partner
                </div>
                <div style={{ fontSize: '0.66rem', color: '#64748B', marginTop: 1 }}>{senderName || senderPlaceholder}</div>
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
            borderBottom: `2px solid ${userAccentHex ? accentHex : '#0F172A'}`,
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
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
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
              {senderName || senderPlaceholder}
            </h1>
            {senderTagline && (
              <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: 3, fontWeight: 500 }}>
                {senderTagline}
              </div>
            )}
            <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: 4, lineHeight: 1.4 }}>
              {[senderAddress, senderPhone && `Ph: ${senderPhone}`, senderEmail].filter(Boolean).join('  •  ')}
            </div>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '1.60rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {document.title || 'BILL'}
            </div>
            <div
              style={{
                background: userAccentHex ? accentHex : '#0F172A',
                color: '#FFFFFF',
                padding: '4px 14px',
                borderRadius: 9999,
                fontSize: '0.78rem',
                fontWeight: 900,
                display: 'inline-block',
                letterSpacing: '0.03em',
                boxShadow: `0 2px 6px ${userAccentHex ? `${accentHex}30` : 'rgba(15,23,42,0.15)'}`,
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

        {/* 2. Sleek Minimalist Metadata Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: hasPoNumber ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
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
              {formatHeaderDate(document.issueDate) || '-'}
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
          {hasPoNumber && (
            <div>
              <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                REF / PO NO.
              </div>
              <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
                {poNumberValue}
              </div>
            </div>
          )}
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
                {senderName || senderPlaceholder}
              </div>
              {senderTagline && (
                <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>
                  {senderTagline}
                </div>
              )}
              {senderAddress && (
                <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 4, lineHeight: 1.4 }}>
                  {senderAddress}
                </div>
              )}
              {(senderPhone || senderEmail) && (
                <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: 3 }}>
                  {[senderPhone && `Ph: ${senderPhone}`, senderEmail].filter(Boolean).join('  •  ')}
                </div>
              )}
            </div>

            {hasSenderTax && (
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', marginTop: 'auto', paddingTop: 6, borderTop: '1px solid #E2E8F0' }}>
                TAX / GSTIN: {senderTaxNumber}
              </div>
            )}
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
                {clientName || clientCompany || clientPlaceholder}
              </div>
              {clientCompany && clientName && clientCompany !== clientName && (
                <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2, fontWeight: 600 }}>
                  {clientCompany}
                </div>
              )}
              {clientAddress && (
                <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 4, lineHeight: 1.4 }}>
                  {clientAddress}
                </div>
              )}
              {(clientPhone || clientEmail) && (
                <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: 3 }}>
                  {[clientPhone && `Ph: ${clientPhone}`, clientEmail].filter(Boolean).join('  •  ')}
                </div>
              )}
            </div>

            {(hasClientTax || hasPoNumber) && (
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', marginTop: 'auto', paddingTop: 6, borderTop: '1px solid #E2E8F0' }}>
                {[hasClientTax && `GSTIN: ${clientTaxNumber}`, hasPoNumber && `REF: ${poNumberValue}`].filter(Boolean).join('  •  ')}
              </div>
            )}
          </div>
        </div>

        {/* 4. Floating Modern Minimalist Table */}
        <div style={{ border: `1.5px solid ${userAccentHex ? accentHex : '#0F172A'}`, borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: userAccentHex ? accentHex : '#0F172A', color: '#FFFFFF' }}>
                <th style={{ width: '6%', textAlign: 'center', padding: '10px 6px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  #
                </th>
                <th style={{ width: hasAnyTax ? '42%' : '52%', textAlign: 'left', padding: '10px 12px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  ITEM / SERVICE PARTICULARS
                </th>
                <th style={{ width: '12%', textAlign: 'center', padding: '10px 8px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  QTY / UNITS
                </th>
                <th style={{ width: '14%', textAlign: 'right', padding: '10px 10px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                  RATE / UNIT
                </th>
                {hasAnyTax && (
                  <th style={{ width: '10%', textAlign: 'center', padding: '10px 8px', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFFFFF' }}>
                    TAX RATE
                  </th>
                )}
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
                        {item.name || item.description || itemPlaceholder}
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
                    {hasAnyTax && (
                      <td style={{ textAlign: 'center', fontSize: '0.74rem', color: '#64748B', padding: '10px 8px' }}>
                        {getItemTaxDisplay(item)}
                      </td>
                    )}
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
                  {document.bankName && <div>Bank Name: <strong style={{ color: '#0F172A' }}>{document.bankName}</strong></div>}
                  {document.accountNumber && <div>Account No: <strong style={{ color: '#0F172A' }}>{document.accountNumber}</strong></div>}
                  {document.ifscCode && <div>IFSC Code: <strong style={{ color: '#0F172A' }}>{document.ifscCode}</strong> {document.branch && `(${document.branch})`}</div>}
                  {document.upiId && <div>UPI ID: <strong style={{ color: '#0F172A' }}>{document.upiId}</strong></div>}
                  <div style={{ fontSize: '0.68rem', color: '#64748B', fontStyle: 'italic', marginTop: 4 }}>
                    Please quote Bill Reference <strong>#{cleanBillId}</strong> in all electronic remittances.
                  </div>
                </div>
              ) : (
                <div className="preview-placeholder" style={{ fontSize: '0.74rem', fontStyle: 'italic', marginTop: 4 }}>
                  Please remit payment via NEFT / RTGS / IMPS / UPI in accordance with agreed commercial terms.
                </div>
              )}
            </div>

            <div className="preview-placeholder" style={{ fontSize: '0.68rem', color: '#94A3B8', borderTop: '1px solid #E2E8F0', paddingTop: 6, marginTop: 8 }}>
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
              {calc.taxAmount > 0 && hasAnyTax && (
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
              {calc.amountPaid > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700, borderTop: '1px solid #E2E8F0', paddingTop: 6 }}>
                  <span>Paid:</span>
                  <span>{currencySymbol}{formatAmount(calc.amountPaid)}</span>
                </div>
              )}

              {/* Total Amount Banner */}
              <div
                style={{
                  background: userAccentHex ? `linear-gradient(135deg, ${darkerAccentHex} 0%, ${accentHex} 100%)` : '#0F172A',
                  color: '#FFFFFF',
                  padding: '11px 14px',
                  borderRadius: 6,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 6,
                  boxShadow: userAccentHex ? `0 4px 12px ${accentHex}30` : '0 4px 12px rgba(15,23,42,0.18)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.75)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    FINAL AMOUNT
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, letterSpacing: '0.01em' }}>
                    Total Amount
                  </div>
                </div>
                <div style={{ fontSize: '1.20rem', fontWeight: 900, color: '#FFFFFF', fontVariantNumeric: 'tabular-nums' }}>
                  {currencySymbol}{formatAmount(calc.grandTotal)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Dedicated Notes & Terms Bar with Barcode */}
        <div
          style={{
            background: '#F8FAFC',
            border: `1.5px solid ${userAccentHex ? `${accentHex}35` : '#E2E8F0'}`,
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
              <FileText size={14} color={userAccentHex ? accentHex : "#0F172A"} />
              <span style={{ fontWeight: 800, color: userAccentHex ? accentHex : '#0F172A', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                NOTES &amp; TERMS OF SERVICE:
              </span>
            </div>
            <div style={{ fontSize: '0.70rem', color: '#475569', lineHeight: 1.45 }}>
              {hasPaymentTerms && (
                <div style={{ color: '#0F172A', fontWeight: 600, marginBottom: 2 }}>
                  Payment Terms: <span style={{ fontWeight: 500, color: '#475569' }}>{paymentTerms}</span>
                </div>
              )}
              <div>{document.notes || <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Thank you for your business. Please remit within stated terms.</span>}</div>
              <div style={{ color: '#64748B', marginTop: 1 }}>
                Terms: {document.termsAndConditions || <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Payment is strictly due upon presentation of bill. Statutory commercial terms apply.</span>}
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
              {senderName || senderPlaceholder}
            </div>
            {senderTagline && (
              <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: 1 }}>
                {senderTagline}
              </div>
            )}
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
                {senderName || senderPlaceholder}
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
          background: userAccentHex
            ? `linear-gradient(135deg, ${accentHex} 0%, ${darkerAccentHex} 100%)`
            : '#1A237E',
          color: '#FFFFFF',
          borderRadius: 8,
          padding: '14px 20px',
          boxShadow: `0 2px 10px ${userAccentHex ? `${accentHex}30` : 'rgba(26,35,126,0.15)'}`,
        }}
      >
        <div className="a4-header-left bill-header-left">
          {senderLogo && (
            <div className="bill-logo-box" style={{ marginBottom: 4 }}>
              <img
                src={senderLogo}
                alt={senderName || 'Logo'}
                style={{
                  maxHeight: 38,
                  maxWidth: 130,
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>
          )}
          <div>
            <h1
              className="a4-business-name bill-business-name"
              style={{
                color: '#FFFFFF',
                fontSize: '1.45rem',
                fontWeight: 900,
                margin: 0,
                letterSpacing: '0.01em',
                lineHeight: 1.2,
              }}
            >
              {senderName || senderPlaceholder}
            </h1>
            {senderTagline && (
              <p
                className="a4-business-tagline bill-business-tagline"
                style={{
                  color: userAccentHex ? '#F1F5F9' : '#C5CAE9',
                  opacity: 0.95,
                  margin: '3px 0 0',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {senderTagline}
              </p>
            )}
            <div
              className="a4-header-meta-row"
              style={{
                color: '#FFFFFF',
                opacity: 0.92,
                marginTop: '6px',
                fontSize: '0.72rem',
                lineHeight: 1.35,
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                rowGap: '4px',
                columnGap: '16px',
              }}
            >
              {senderEmail && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Mail size={12} style={{ flexShrink: 0 }} /> {senderEmail}
                </span>
              )}
              {senderPhone && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Phone size={12} style={{ flexShrink: 0 }} /> {senderPhone}
                </span>
              )}
              {senderWebsite && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Globe size={12} style={{ flexShrink: 0 }} /> {senderWebsite}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="a4-header-right bill-header-right" style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="a4-doc-type-title bill-doc-type-title" style={{ color: '#FFFFFF', fontSize: '1.35rem', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {document.title || 'BILL'}
          </div>
          <div className="a4-bill-number" style={{ color: userAccentHex ? '#F8FAFC' : '#E8EAF6', fontWeight: 700, fontSize: '0.86rem', marginTop: 2 }}>
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
            {hasPaymentTerms && (
              <div style={{ marginTop: 2 }}>
                <span style={{ opacity: 0.75 }}>Payment Terms: </span>
                <strong>{paymentTerms}</strong>
              </div>
            )}
            {hasPoNumber && (
              <div style={{ marginTop: 2 }}>
                <span style={{ opacity: 0.75 }}>Ref/PO: </span>
                <strong>{poNumberValue}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. DUAL PARTY CARDS (BILL FROM & BILL TO) */}
      <div className="a4-parties-row bill-parties-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Card 1: Bill From */}
        <div className="a4-party-col bill-party-col">
          <div className="a4-party-card" style={{ width: '100%', border: `1px solid ${borderColor}`, borderRadius: 8, background: '#ffffff', overflow: 'hidden' }}>
            <div className="a4-party-card-header" style={{ borderBottom: `1px solid ${borderColor}`, padding: '6px 12px', background: tableHeaderBg, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={13} color={accentHex} />
              <span className="a4-party-header-text" style={{ color: accentHex, fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.04em' }}>BILL FROM</span>
            </div>
            <div className="a4-party-card-body" style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div className="a4-party-name" style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.84rem' }}>
                {senderName || senderPlaceholder}
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
              {hasSenderTax && (
                <div className="a4-party-line bill-tax-line" style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.72rem', marginTop: 2 }}>
                  GSTIN/Tax: <span style={{ color: accentHex }}>{senderTaxNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Bill To */}
        <div className="a4-party-col bill-party-col">
          <div className="a4-party-card" style={{ width: '100%', border: `1px solid ${borderColor}`, borderRadius: 8, background: '#ffffff', overflow: 'hidden' }}>
            <div className="a4-party-card-header" style={{ borderBottom: `1px solid ${borderColor}`, padding: '6px 12px', background: tableHeaderBg, display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={13} color={accentHex} />
              <span className="a4-party-header-text" style={{ color: accentHex, fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.04em' }}>BILL TO</span>
            </div>
            <div className="a4-party-card-body" style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div className="a4-party-name" style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.84rem' }}>
                {clientName || clientCompany || clientPlaceholder}
              </div>
              {clientCompany && clientName && clientCompany !== clientName && (
                <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 1, fontWeight: 600 }}>
                  {clientCompany}
                </div>
              )}
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
              {hasClientTax && (
                <div className="a4-party-line bill-tax-line" style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.72rem', marginTop: 2 }}>
                  GSTIN/Tax: <span style={{ color: accentHex }}>{clientTaxNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. STRUCTURED CORPORATE ITEMS TABLE */}
      <div className="a4-table-wrapper bill-table-wrapper" style={{ margin: '0', border: `1px solid ${borderColor}`, borderRadius: 8, overflow: 'hidden' }}>
        <table className="a4-items-table bill-items-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: tableHeaderBg }}>
              <th style={{ width: hasAnyTax ? '46%' : '58%', textAlign: 'left', color: tableHeaderText, padding: '10px 14px', fontSize: '0.74rem', fontWeight: 800, borderRight: `1px solid ${borderColor}`, letterSpacing: '0.04em' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>DESCRIPTION OF SERVICES / PRODUCTS</span>
                </div>
              </th>
              <th style={{ width: '12%', textAlign: 'center', color: tableHeaderText, padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, borderRight: `1px solid ${borderColor}`, letterSpacing: '0.04em' }}>
                QTY
              </th>
              <th style={{ width: '14%', textAlign: 'right', color: tableHeaderText, padding: '10px 10px', fontSize: '0.74rem', fontWeight: 800, borderRight: `1px solid ${borderColor}`, letterSpacing: '0.04em' }}>
                RATE
              </th>
              {hasAnyTax && (
                <th style={{ width: '12%', textAlign: 'center', color: tableHeaderText, padding: '10px 8px', fontSize: '0.74rem', fontWeight: 800, borderRight: `1px solid ${borderColor}`, letterSpacing: '0.04em' }}>
                  TAX
                </th>
              )}
              <th style={{ width: '16%', textAlign: 'right', color: tableHeaderText, padding: '10px 14px', fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                AMOUNT
              </th>
            </tr>
          </thead>
          <tbody>
            {document.items.map((item, idx) => {
              const itemAmt = (Number(item.qty) || 0) * (Number(item.rate) || 0);
              const isLast = idx === document.items.length - 1;
              return (
                <tr key={item.id} style={{ borderBottom: isLast ? 'none' : `1px solid ${userAccentHex ? `${accentHex}18` : '#E8EAF6'}` }}>
                  <td className="cell-desc" style={{ textAlign: 'left', padding: '10px 14px', borderRight: `1px solid ${userAccentHex ? `${accentHex}18` : '#E8EAF6'}` }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8rem' }}>
                      {item.name || item.description || itemPlaceholder}
                    </div>
                    {item.name && item.description && item.description !== item.name && (
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400, marginTop: 2 }}>
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="cell-qty" style={{ textAlign: 'center', padding: '11px 8px', fontWeight: 600, fontSize: '0.78rem', color: '#0f172a', borderRight: `1px solid ${userAccentHex ? `${accentHex}18` : '#E8EAF6'}` }}>
                    {item.qty}
                  </td>
                  <td className="cell-rate" style={{ textAlign: 'right', padding: '11px 10px', fontVariantNumeric: 'tabular-nums', fontSize: '0.78rem', color: '#0f172a', borderRight: `1px solid ${userAccentHex ? `${accentHex}18` : '#E8EAF6'}` }}>
                    {currencySymbol}{formatAmount(item.rate)}
                  </td>
                  {hasAnyTax && (
                    <td className="cell-tax" style={{ textAlign: 'center', fontSize: '0.76rem', color: '#64748b', padding: '11px 8px', borderRight: `1px solid ${userAccentHex ? `${accentHex}18` : '#E8EAF6'}` }}>
                      {getItemTaxDisplay(item)}
                    </td>
                  )}
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
      <div className="bill-bottom-row-1" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* Left: Bank & UPI Payment Details */}
        <div className="bill-payment-box" style={{ width: '100%' }}>
          <div className="a4-party-card bill-payment-card" style={{ width: '100%', border: `1px solid ${borderColor}`, borderRadius: 8, background: '#ffffff', overflow: 'hidden' }}>
            <div className="a4-party-card-header" style={{ borderBottom: `1px solid ${borderColor}`, padding: '6px 12px', background: tableHeaderBg, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Landmark size={13} color={accentHex} />
              <span className="a4-party-header-text" style={{ color: accentHex, fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.04em' }}>PAYMENT INFORMATION</span>
            </div>
            <div className="a4-party-card-body bill-bank-grid" style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 3.5, justifyContent: 'flex-start' }}>
              {hasBankDetails ? (
                <>
                  {document.bankName && (
                    <div className="a4-party-line" style={{ display: 'flex', alignItems: 'center', fontSize: '0.74rem' }}>
                      <span style={{ width: 105, color: '#475569', flexShrink: 0, fontWeight: 500 }}>Bank Name</span>
                      <span style={{ width: 14, color: '#64748b', textAlign: 'center' }}>:</span>
                      <span style={{ color: '#0f172a', fontWeight: 600 }}>{document.bankName}</span>
                    </div>
                  )}
                  {document.accountNumber && (
                    <div className="a4-party-line" style={{ display: 'flex', alignItems: 'center', fontSize: '0.74rem' }}>
                      <span style={{ width: 105, color: '#475569', flexShrink: 0, fontWeight: 500 }}>Account Number</span>
                      <span style={{ width: 14, color: '#64748b', textAlign: 'center' }}>:</span>
                      <span style={{ color: '#0f172a', fontWeight: 700 }}>{document.accountNumber}</span>
                    </div>
                  )}
                  {document.ifscCode && (
                    <div className="a4-party-line" style={{ display: 'flex', alignItems: 'center', fontSize: '0.74rem' }}>
                      <span style={{ width: 105, color: '#475569', flexShrink: 0, fontWeight: 500 }}>IFSC Code</span>
                      <span style={{ width: 14, color: '#64748b', textAlign: 'center' }}>:</span>
                      <span style={{ color: '#0f172a', fontWeight: 700 }}>{document.ifscCode}</span>
                    </div>
                  )}
                  {document.branch && (
                    <div className="a4-party-line" style={{ display: 'flex', alignItems: 'center', fontSize: '0.74rem' }}>
                      <span style={{ width: 105, color: '#475569', flexShrink: 0, fontWeight: 500 }}>Branch</span>
                      <span style={{ width: 14, color: '#64748b', textAlign: 'center' }}>:</span>
                      <span style={{ color: '#0f172a', fontWeight: 500 }}>{document.branch}</span>
                    </div>
                  )}
                  {document.upiId && (
                    <div className="a4-party-line" style={{ display: 'flex', alignItems: 'center', fontSize: '0.74rem' }}>
                      <span style={{ width: 105, color: '#475569', flexShrink: 0, fontWeight: 500 }}>UPI ID</span>
                      <span style={{ width: 14, color: '#64748b', textAlign: 'center' }}>:</span>
                      <span style={{ color: accentHex, fontWeight: 800 }}>{document.upiId}</span>
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

          {calc.taxAmount > 0 && hasAnyTax && (
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

          {calc.amountPaid > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', color: '#64748b' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Amount Paid:</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {currencySymbol}{formatAmount(calc.amountPaid)}
              </span>
            </div>
          )}

          <div
            className="total-highlight-line"
            style={{
              border: `1.5px solid ${accentHex}`,
              backgroundColor: tableHeaderBg,
              borderRadius: 8,
              padding: '10px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 4,
            }}
          >
            <span style={{ fontSize: '1.02rem', fontWeight: 800, color: accentHex }}>Total Bill Amount:</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: accentHex, fontVariantNumeric: 'tabular-nums' }}>
              {currencySymbol}{formatAmount(calc.grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. NOTES & TERMS (FULL WIDTH) */}
      <div className="bill-notes-full-row" style={{ width: '100%', marginTop: 0 }}>
        <div className="a4-notes-card bill-legal-card" style={{ width: '100%', border: `1px solid ${borderColor}`, borderRadius: 8, overflow: 'hidden', background: '#ffffff' }}>
          <div className="a4-notes-card-header" style={{ borderBottom: `1px solid ${borderColor}`, padding: '9px 14px', background: tableHeaderBg, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={15} color={accentHex} />
            <span className="a4-notes-header-text" style={{ color: accentHex, fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.06em' }}>NOTES &amp; TERMS</span>
          </div>
          <div className="bill-legal-content" style={{ padding: '12px 16px', fontSize: '0.74rem', color: '#334155', lineHeight: 1.5 }}>
            {hasPaymentTerms && (
              <div className="bill-note-item" style={{ marginBottom: 3 }}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Payment Terms: </span>{paymentTerms}
              </div>
            )}
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
              <div className="bill-note-item preview-placeholder">
                <span style={{ fontWeight: 600 }}>Terms: </span>Goods/services are subject to the agreed terms.
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
              {senderName || senderPlaceholder}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

