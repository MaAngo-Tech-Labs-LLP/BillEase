import { AccentColor, CurrencyCode, BillDocument } from '../types';
import {
  TEMPLATES as STYLE_TEMPLATES,
  BILL_TEMPLATES,
  INVOICE_TEMPLATES,
  normalizeTemplateId,
  getTemplateById,
  TemplateStyle,
} from './templateStyles';

export { normalizeTemplateId, getTemplateById, BILL_TEMPLATES, INVOICE_TEMPLATES };
export type { TemplateStyle };
export const TEMPLATES = STYLE_TEMPLATES;

export const ACCENT_COLOR_MAP: Record<AccentColor, string> = {
  indigo: '#349b73',
  slate: '#1e293b',
  mono: '#0f172a',
  teal: '#349b73',
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  CAD: '$',
};

export const INVOICE_TITLE_OPTIONS = ['INVOICE', 'TAX INVOICE', 'PROFORMA INVOICE', 'COMMERCIAL INVOICE'] as const;
export const BILL_TITLE_OPTIONS = ['BILL', 'TAX BILL', 'CASH MEMO', 'RETAIL INVOICE'] as const;

export const getTodayIsoDate = () => {
  try {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch {
    return '2026-09-11';
  }
};

export const getFutureIsoDate = (daysAhead: number = 30) => {
  try {
    const d = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch {
    return '2026-10-11';
  }
};

export const DEFAULT_INVOICE_LOGO = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%23111827"/><path d="M22 50 L38 50 L46 26 L56 74 L64 50 L78 50" fill="none" stroke="%238B5CF6" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="51" cy="50" r="4" fill="%23A78BFA"/></svg>`;

export const DEFAULT_INVOICE: BillDocument = {
  id: 'inv-studio-pulse',
  type: 'invoice',
  title: 'INVOICE',
  billNumber: 'INV-2026-1817',
  poNumber: '',
  issueDate: getTodayIsoDate(),
  dueDate: getFutureIsoDate(30),
  currency: 'INR',
  paymentTerms: '',
  senderLogo: '',
  senderName: '',
  senderTagline: '',
  senderEmail: '',
  senderPhone: '',
  senderAddress: '',
  senderTaxNumber: '',
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  clientAddress: '',
  items: [
    { id: 'item-1', name: '', description: '', qty: 1, rate: 0, taxRate: 0 },
  ],
  taxRate: 0,
  discount: 0,
  paymentNotes: '',
  notes: '',
  template: 'modern-minimal',
  accent: 'indigo',
  status: 'Draft',
  createdAt: new Date().toISOString(),
};

export const DEFAULT_BILL: BillDocument = {
  id: 'doc-apex-billing',
  type: 'bill',
  title: 'BILL',
  billNumber: 'BIL-2026-5479',
  poNumber: '',
  issueDate: getTodayIsoDate(),
  dueDate: getFutureIsoDate(30),
  currency: 'INR',
  senderName: '',
  senderTagline: '',
  senderEmail: '',
  senderPhone: '',
  senderAddress: '',
  senderWebsite: '',
  senderTaxNumber: '',
  clientName: '',
  clientCompany: '',
  clientEmail: '',
  clientPhone: '',
  clientAddress: '',
  shippingAddress: '',
  shippingSameAsBilling: true,
  clientTaxNumber: '',
  items: [
    {
      id: 'item-1',
      name: '',
      description: '',
      qty: 1,
      rate: 0,
      taxRate: 0,
      discount: 0,
    },
  ],
  taxRate: 0,
  discount: 0,
  additionalCharges: 0,
  amountPaid: 0,
  paymentMethod: 'Bank Transfer',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  branch: '',
  upiId: '',
  paymentTerms: '',
  notes: '',
  paymentNotes: '',
  termsAndConditions: '',
  template: 'classic',
  accent: 'indigo',
  status: 'Draft',
  createdAt: new Date().toISOString(),
};

export const SAMPLE_INVOICE_DATA: BillDocument = {
  id: 'sample-invoice',
  type: 'invoice',
  title: 'TAX INVOICE',
  billNumber: 'INV-2026-8492',
  poNumber: 'PO-2026-9041',
  issueDate: getTodayIsoDate(),
  dueDate: getFutureIsoDate(30),
  currency: 'INR',
  paymentTerms: 'Net 30',
  senderLogo: DEFAULT_INVOICE_LOGO,
  senderName: 'Studio Pulse Creative Labs',
  senderTagline: 'Digital Product Design & Cloud Architecture',
  senderEmail: 'billing@studiopulse.io',
  senderPhone: '+91 98765 43210',
  senderAddress: 'Suite 400, Indiranagar 100ft Road, Bengaluru, KA 560038',
  senderWebsite: 'www.studiopulse.io',
  senderTaxNumber: '29ABCDE1234F1Z5',
  clientName: 'Acme Corporation Ltd.',
  clientEmail: 'finance@acmecorp.com',
  clientPhone: '+91 91234 56789',
  clientAddress: 'Plot 18, Cyber Gateway, Hitec City, Hyderabad, TS 500081',
  items: [
    {
      id: 'item-1',
      name: 'Full-Stack Web & Cloud Architecture',
      description: 'Design system implementation, React UI and high-throughput microservices',
      qty: 1,
      rate: 45000,
      taxRate: 18,
    },
    {
      id: 'item-2',
      name: 'DevOps & Kubernetes Infrastructure',
      description: 'Multi-region CI/CD pipelines, container orchestration and security hardening',
      qty: 1,
      rate: 25000,
      taxRate: 18,
    },
    {
      id: 'item-3',
      name: 'Performance Optimization & QA Audit',
      description: 'Lighthouse 100 audit, core web vitals and automated regression suites',
      qty: 1,
      rate: 15000,
      taxRate: 18,
    },
  ],
  taxRate: 18,
  discount: 5000,
  paymentNotes: 'Please quote invoice number in all wire transfers.',
  notes: 'Thank you for partnering with Studio Pulse! We appreciate your business.',
  template: 'modern-minimal',
  accent: 'indigo',
  status: 'Draft',
  createdAt: new Date().toISOString(),
};

export const SAMPLE_BILL_DATA: BillDocument = {
  id: 'sample-bill',
  type: 'bill',
  title: 'TAX BILL',
  billNumber: 'BIL-2026-5479',
  poNumber: 'PO-2026-4421',
  issueDate: getTodayIsoDate(),
  dueDate: getFutureIsoDate(30),
  currency: 'INR',
  senderName: 'Apex Corporate Solutions Pvt. Ltd.',
  senderTagline: 'Enterprise Management & Technology Consulting',
  senderEmail: 'billing@apexsolutions.com',
  senderPhone: '+91 98765 12345',
  senderAddress: 'Tower B, 7th Floor, DLF Cyber City, Gurugram, HR 122002',
  senderWebsite: 'www.apexsolutions.com',
  senderTaxNumber: '07AAAAA1234A1Z5',
  clientName: 'Global Horizon Enterprises',
  clientCompany: 'Global Horizon Enterprises Ltd.',
  clientEmail: 'accounts@globalhorizon.com',
  clientPhone: '+91 98111 22233',
  clientAddress: 'Tech Park Central, Outer Ring Road, Bengaluru, KA 560103',
  shippingAddress: 'Tech Park Central, Outer Ring Road, Bengaluru, KA 560103',
  shippingSameAsBilling: true,
  clientTaxNumber: '29BBBBB5678B1Z2',
  items: [
    {
      id: 'item-1',
      name: 'Enterprise Architecture Consulting',
      description: 'System design, microservices analysis and technical blueprinting',
      qty: 2,
      rate: 25000,
      taxRate: 18,
      discount: 0,
    },
    {
      id: 'item-2',
      name: 'Cloud Infrastructure Audit & Hardening',
      description: 'Security compliance review, IAM policy verification and cost optimization',
      qty: 1,
      rate: 35000,
      taxRate: 18,
      discount: 0,
    },
    {
      id: 'item-3',
      name: 'Executive Technical Briefing',
      description: 'C-level architectural roadmap, risk assessments and executive sign-off',
      qty: 1,
      rate: 15000,
      taxRate: 18,
      discount: 0,
    },
  ],
  taxRate: 18,
  discount: 3000,
  additionalCharges: 0,
  amountPaid: 0,
  paymentMethod: 'Bank Transfer',
  bankName: 'ICICI Bank',
  accountNumber: '001105012345',
  ifscCode: 'ICIC0000011',
  branch: 'Cyber City Branch',
  upiId: 'apexsolutions@icici',
  paymentTerms: '30 days',
  notes: 'Thank you for your business. Please remit payments in accordance with agreed terms.',
  paymentNotes: 'Please reference bill number in transaction details.',
  termsAndConditions: 'Goods and professional services are subject to standard enterprise terms.',
  template: 'classic',
  accent: 'indigo',
  status: 'Draft',
  createdAt: new Date().toISOString(),
};

export const SAMPLE_DOCUMENTS: BillDocument[] = [
  DEFAULT_INVOICE,
  {
    id: 'doc-hero-match',
    type: 'bill',
    title: 'Walk-in Counter Bill',
    billNumber: 'BIL-2026-3927',
    issueDate: '2026-09-06',
    dueDate: '2026-09-06',
    currency: 'INR',
    clientName: 'Walk-in Customer',
    clientEmail: '',
    clientAddress: '',
    items: [],
    taxRate: 0,
    discount: 0,
    paymentNotes: 'Settled at counter.',
    template: 'modern',
    accent: 'teal',
    status: 'Paid',
    createdAt: '2026-09-06T10:00:00.000Z',
  },
];

// System/identity fields a "load sample" action must never touch — these
// belong to the document being worked on, not to the example content.
const SAMPLE_FILL_SKIP_KEYS = new Set<keyof BillDocument>([
  'id',
  'type',
  'template',
  'accent',
  'status',
  'createdAt',
  'updatedAt',
  'currency',
]);

const isBlankItem = (item: { name?: string; description?: string; rate?: number }) =>
  !item.name && !item.description && !item.rate;

/**
 * Fills in sample/example content for a document WITHOUT overwriting anything
 * the user has already entered. Used by the "Sample Data" action so it behaves
 * like placeholder content (fill the blanks so people can see what a finished
 * document looks like) rather than silently discarding real, already-typed data.
 *
 * - Text/number fields: only filled in when the current value is empty ('' or
 *   undefined) — an explicit 0 the user typed is left alone.
 * - `items`: only replaced wholesale when every current row is blank; a single
 *   row the user has started filling in is left untouched.
 */
export function fillSampleIntoEmpty(current: BillDocument, sample: BillDocument): BillDocument {
  const next: BillDocument = { ...current };

  (Object.keys(sample) as (keyof BillDocument)[]).forEach((key) => {
    if (SAMPLE_FILL_SKIP_KEYS.has(key)) return;
    if (key === 'items') return; // handled separately below
    const currentValue = current[key];
    if (currentValue === '' || currentValue === undefined || currentValue === null) {
      (next as any)[key] = sample[key];
    }
  });

  if (!current.items || current.items.length === 0 || current.items.every(isBlankItem)) {
    next.items = sample.items.map((item, i) => ({
      ...item,
      id: current.items?.[i]?.id || item.id,
    }));
  }

  return next;
}

// Emails and tax numbers unique to each built-in sample document. Older
// builds could persist full sample content straight into a saved draft
// (before "Sample Data" became preview-only); this lets us recognize and
// discard that leftover content instead of showing it to the user as if it
// were real, saved data.
const KNOWN_SAMPLE_EMAILS = new Set(
  [SAMPLE_INVOICE_DATA.senderEmail, SAMPLE_INVOICE_DATA.clientEmail, SAMPLE_BILL_DATA.senderEmail, SAMPLE_BILL_DATA.clientEmail].filter(Boolean)
);
const KNOWN_SAMPLE_TAX_NUMBERS = new Set(
  [SAMPLE_BILL_DATA.senderTaxNumber, SAMPLE_BILL_DATA.clientTaxNumber].filter(Boolean)
);

/**
 * True if a saved draft looks like leftover sample content rather than
 * something the user actually typed (matches a known sample sender/client
 * email or tax number exactly). Used to purge stale sample drafts left in
 * localStorage by older versions of the "Sample Data" feature.
 */
export function looksLikeStaleSampleDraft(doc: Partial<BillDocument> | null | undefined): boolean {
  if (!doc) return false;
  return Boolean(
    (doc.senderEmail && KNOWN_SAMPLE_EMAILS.has(doc.senderEmail)) ||
    (doc.clientEmail && KNOWN_SAMPLE_EMAILS.has(doc.clientEmail)) ||
    (doc.senderTaxNumber && KNOWN_SAMPLE_TAX_NUMBERS.has(doc.senderTaxNumber)) ||
    (doc.clientTaxNumber && KNOWN_SAMPLE_TAX_NUMBERS.has(doc.clientTaxNumber))
  );
}

