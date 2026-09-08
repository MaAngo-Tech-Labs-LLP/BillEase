export type LayoutType =
  | 'classic'      // Classic Professional (Formal corporate, dual party cards, signature stamp)
  | 'minimal'      // Modern Minimal (Asymmetric whitespace, borderless floating table, dark total pill)
  | 'receipt'      // Bold Emerald (Retail & POS memo, dashed lines, centered store logo, barcode)
  | 'sidebar'      // Warm Saffron (Striking left vertical brand & payment sidebar, main right charges)
  | 'clinical'     // Medical & Clinical (Rx symbol, Doctor reg, Patient age/gender, medical fee table)
  | 'editorial'    // Corporate Navy (Serif typography, Law & Advisory matter ref, retainer reconciliation)
  | 'academic'     // Academia Blue (Tuition receipt, student roll no, semester schedule, registrar sign)
  | 'gst';         // GST Tax Invoice (Official Indian GST layout, HSN/SAC table, CGST/SGST split, amount in words)

export interface TemplateStyle {
  id: string;
  name: string;
  category: string;
  categoryTag: string;
  docType: 'bill' | 'invoice' | 'both';
  badge: string;
  description: string;
  tags: string[];
  layoutType: LayoutType;
  accentColor: string;
  headerBg: string;
  headerText: string;
  tableHeaderBg: string;
  tableHeaderText: string;
  totalColor: string;
  borderColor: string;
  logoText: string;
  docLabel: string;
  sampleClient: string;
  sampleItems: { desc: string; qty: number; rate: number }[];
}

export const TEMPLATES: TemplateStyle[] = [
  // =========================================================================
  // BILL TEMPLATES (Dedicated to Create Bill Model)
  // =========================================================================
  {
    id: 'apex-corporate-bill',
    name: 'Apex Corporate Standard Bill',
    category: 'Professional Services',
    categoryTag: 'Corporate Bill',
    docType: 'bill',
    badge: 'Default Standard',
    description: 'The premier corporate bill format featuring dual party cards (Bill From & Bill To), item tax column, structured bank details, amount paid, balance due highlight, and signature block.',
    tags: ['Corporate', 'Standard', 'Bank Transfer', 'PO Reference'],
    layoutType: 'classic',
    accentColor: '#1A237E',
    headerBg: '#1A237E',
    headerText: '#FFFFFF',
    tableHeaderBg: '#E8EAF6',
    tableHeaderText: '#1A237E',
    totalColor: '#1A237E',
    borderColor: '#C5CAE9',
    logoText: 'Apex Corporate',
    docLabel: 'BILL',
    sampleClient: 'Stellar Innovations Pvt. Ltd.',
    sampleItems: [
      { desc: 'Enterprise Architecture Consulting', qty: 20, rate: 2500 },
      { desc: 'Cloud Infrastructure Audit & Hardening', qty: 10, rate: 3500 },
      { desc: 'Executive Stakeholder Presentation', qty: 3, rate: 1500 },
    ],
  },
  {
    id: 'bold-emerald',
    name: 'Retail Store & POS Bill',
    category: 'E-Commerce & Retail',
    categoryTag: 'Retail',
    docType: 'bill',
    badge: 'Retail Ready',
    description: 'Modern retail and wholesale store bill featuring dual store/customer outlet cards, POS transaction metadata, forest green accent theme, and barcode authentication.',
    tags: ['Retail', 'POS', 'Store', 'Counter Bill'],
    layoutType: 'receipt',
    accentColor: '#1b4332',
    headerBg: '#1b4332',
    headerText: '#FFFFFF',
    tableHeaderBg: '#1b4332',
    tableHeaderText: '#FFFFFF',
    totalColor: '#1b4332',
    borderColor: '#d1e7dd',
    logoText: 'Apex Corporate',
    docLabel: 'RETAIL & WHOLESALE',
    sampleClient: 'Stellar Innovations Pvt. Ltd.',
    sampleItems: [
      { desc: 'Enterprise Architecture Consulting', qty: 20, rate: 2500 },
      { desc: 'Cloud Infrastructure Audit & Hardening', qty: 10, rate: 3500 },
      { desc: 'Executive Stakeholder Presentation', qty: 3, rate: 1500 },
    ],
  },
  {
    id: 'medical-clinical',
    name: 'Medical & Healthcare Bill',
    category: 'Healthcare & Wellness',
    categoryTag: 'Healthcare',
    docType: 'bill',
    badge: 'Clinical',
    description: 'Hospital & Healthcare billing format featuring clinical cross emblem, dual provider/registration cards, 4-way transaction strip, apricot balance due, barcode, and physician authorization.',
    tags: ['Clinical', 'Hospital', 'Doctors', 'Medical', 'Healthcare'],
    layoutType: 'clinical',
    accentColor: '#52616b',
    headerBg: '#52616b',
    headerText: '#FFFFFF',
    tableHeaderBg: '#52616b',
    tableHeaderText: '#FFFFFF',
    totalColor: '#1e293b',
    borderColor: '#e2e8f0',
    logoText: 'Apex Hospital',
    docLabel: 'OPD / IPD MEDICAL BILL',
    sampleClient: 'Stellar Innovations Pvt. Ltd. (Patient UID: PO-12345)',
    sampleItems: [
      { desc: 'Enterprise Architecture Consulting', qty: 20, rate: 2500 },
      { desc: 'Cloud Infrastructure Audit & Hardening', qty: 10, rate: 3500 },
      { desc: 'Executive Stakeholder Presentation', qty: 3, rate: 1500 },
    ],
  },
  {
    id: 'academia-blue',
    name: 'Academy & Tuition Fee Bill',
    category: 'Education & Training',
    categoryTag: 'Education',
    docType: 'bill',
    badge: 'Scholarly',
    description: 'Official academic fee billing format with institution crest, Student Enrollment/Roll number, Program Term breakdown, and Registrar signature stamp.',
    tags: ['Tuition', 'Academy', 'Coaching', 'Fees'],
    layoutType: 'academic',
    accentColor: '#283593',
    headerBg: '#283593',
    headerText: '#FFFFFF',
    tableHeaderBg: '#E8EAF6',
    tableHeaderText: '#283593',
    totalColor: '#283593',
    borderColor: '#9FA8DA',
    logoText: 'Cambridge Global Academy',
    docLabel: 'OFFICIAL TUITION FEE BILL',
    sampleClient: 'Rahul Sharma (Roll: CGA-2026-089)',
    sampleItems: [
      { desc: 'Advanced Physics & Mathematics Semester Fee', qty: 1, rate: 22000 },
      { desc: 'Science Laboratory & Practical Material Kit', qty: 1, rate: 3500 },
      { desc: 'Annual Digital Learning Portal & Mock Exam Access', qty: 1, rate: 4500 },
    ],
  },
  {
    id: 'modern-minimal-bill',
    name: 'Modern Minimalist Bill',
    category: 'Technology & SaaS',
    categoryTag: 'Tech & Modern',
    docType: 'bill',
    badge: 'Clean Tech',
    description: 'Sleek dark slate modern bill format with crisp typography, understated border styling, elegant payment card, and clear balance due reconciliation.',
    tags: ['Modern', 'Minimal', 'Tech', 'Clean'],
    layoutType: 'minimal',
    accentColor: '#1E293B',
    headerBg: '#1E293B',
    headerText: '#FFFFFF',
    tableHeaderBg: '#F1F5F9',
    tableHeaderText: '#0F172A',
    totalColor: '#0F172A',
    borderColor: '#CBD5E1',
    logoText: 'Studio Pulse Tech',
    docLabel: 'BILL',
    sampleClient: 'NexaTech Labs Ltd.',
    sampleItems: [
      { desc: 'Cloud Platform Managed Hosting (1yr)', qty: 1, rate: 28000 },
      { desc: 'API Gateway Cluster Configuration', qty: 4, rate: 3000 },
      { desc: 'Automated Security Audit & Hardening', qty: 1, rate: 8500 },
    ],
  },
  {
    id: 'warm-saffron-bill',
    name: 'Creative Agency Services Bill',
    category: 'Professional Services',
    categoryTag: 'Creative',
    docType: 'bill',
    badge: 'Creative',
    description: 'Dynamic creative agency bill with warm terracotta styling, deliverable breakdown, UPI & online bank settlement info, and client sign-off.',
    tags: ['Agency', 'Design', 'Media', 'Services'],
    layoutType: 'sidebar',
    accentColor: '#E65100',
    headerBg: '#E65100',
    headerText: '#FFFFFF',
    tableHeaderBg: '#FFF3E0',
    tableHeaderText: '#BF360C',
    totalColor: '#E65100',
    borderColor: '#FFCC80',
    logoText: 'Aura Media Works',
    docLabel: 'CREATIVE SERVICES BILL',
    sampleClient: 'Horizon Digital Studios',
    sampleItems: [
      { desc: 'Brand Identity System & Style Guide', qty: 1, rate: 35000 },
      { desc: '3D Motion Graphics & Animation Render', qty: 2, rate: 7500 },
      { desc: 'Social Media Campaign Assets Pack', qty: 1, rate: 10000 },
    ],
  },

  // =========================================================================
  // INVOICE TEMPLATES (Dedicated to Create Invoice Model)
  // =========================================================================
  {
    id: 'classic-pro',
    name: 'Classic Professional Invoice',
    category: 'Professional Services',
    categoryTag: 'Professional',
    docType: 'invoice',
    badge: 'Most Popular',
    description: 'A timeless formal corporate layout with dual bordered party cards, zebra-striped corporate item table, and authorized signatory line.',
    tags: ['Consulting', 'Freelance', 'Agency', 'Formal'],
    layoutType: 'classic',
    accentColor: '#1A237E',
    headerBg: '#1A237E',
    headerText: '#FFFFFF',
    tableHeaderBg: '#E8EAF6',
    tableHeaderText: '#1A237E',
    totalColor: '#1A237E',
    borderColor: '#C5CAE9',
    logoText: 'Apex Corporate',
    docLabel: 'INVOICE',
    sampleClient: 'Stellar Innovations Pvt. Ltd.',
    sampleItems: [
      { desc: 'Enterprise Architecture Consulting', qty: 20, rate: 2500 },
      { desc: 'Cloud Infrastructure Audit & Hardening', qty: 10, rate: 3500 },
      { desc: 'Executive Stakeholder Presentation', qty: 3, rate: 1500 },
    ],
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal Invoice',
    category: 'Technology & SaaS',
    categoryTag: 'Tech & SaaS',
    docType: 'invoice',
    badge: 'Designer Pick',
    description: 'Ultra-clean Scandinavian tech layout with generous whitespace, floating borderless table, dark total pill, and payment QR badge.',
    tags: ['SaaS', 'Startup', 'Clean', 'Modern'],
    layoutType: 'minimal',
    accentColor: '#111827',
    headerBg: '#FFFFFF',
    headerText: '#111827',
    tableHeaderBg: '#F9FAFB',
    tableHeaderText: '#4B5563',
    totalColor: '#111827',
    borderColor: '#E5E7EB',
    logoText: 'Studio Pulse',
    docLabel: 'INVOICE',
    sampleClient: 'NovaTech AI Solutions Inc.',
    sampleItems: [
      { desc: 'SaaS Platform Enterprise License (Annual)', qty: 1, rate: 48000 },
      { desc: 'Custom API Gateway Integration & Setup', qty: 5, rate: 2000 },
      { desc: '24/7 Dedicated Priority Support SLA', qty: 1, rate: 12000 },
    ],
  },
  {
    id: 'warm-saffron',
    name: 'Creative Studio Sidebar Invoice',
    category: 'Professional Services',
    categoryTag: 'Creative',
    docType: 'invoice',
    badge: 'Creative',
    description: 'Split vertical sidebar layout featuring a colored left brand column with payment info & QR code, paired with a modern right-side charges breakdown.',
    tags: ['Photography', 'Design', 'Creative', 'Sidebar'],
    layoutType: 'sidebar',
    accentColor: '#E65100',
    headerBg: '#E65100',
    headerText: '#FFFFFF',
    tableHeaderBg: '#FFF3E0',
    tableHeaderText: '#BF360C',
    totalColor: '#E65100',
    borderColor: '#FFCC80',
    logoText: 'Aura Visual Works',
    docLabel: 'PROJECT INVOICE',
    sampleClient: 'Arjun Signature Wedding Films',
    sampleItems: [
      { desc: 'Full Day Cinematic Video Production (4K)', qty: 1, rate: 35000 },
      { desc: 'Handcrafted Premium Photo Album & Print', qty: 1, rate: 12000 },
      { desc: 'Drone Aerial Cinematography Add-on', qty: 1, rate: 8000 },
    ],
  },
  {
    id: 'corporate-navy',
    name: 'Executive Legal & Advisory Invoice',
    category: 'Professional Services',
    categoryTag: 'Corporate',
    docType: 'invoice',
    badge: 'Executive',
    description: 'High-end law and consulting firm format with classic serif typography, client matter reference block, hourly breakdown, and retainer deduction.',
    tags: ['Legal', 'Finance', 'Law Firm', 'Advisory'],
    layoutType: 'editorial',
    accentColor: '#0D2137',
    headerBg: '#0D2137',
    headerText: '#FFFFFF',
    tableHeaderBg: '#E3F2FD',
    tableHeaderText: '#0D2137',
    totalColor: '#0D2137',
    borderColor: '#B0BEC5',
    logoText: 'Sterling & Croft LLP',
    docLabel: 'FEE STATEMENT & INVOICE',
    sampleClient: 'MegaCorp Industries Global Ltd.',
    sampleItems: [
      { desc: 'Corporate Retainer Fee & Board Advisory (Monthly)', qty: 1, rate: 75000 },
      { desc: 'M&A Contract Drafting, Due Diligence & Review', qty: 4, rate: 8500 },
      { desc: 'Statutory Regulatory Compliance Audit (Hours)', qty: 10, rate: 5000 },
    ],
  },
  {
    id: 'gst-tax-invoice',
    name: 'Indian GST Tax Invoice',
    category: 'Technology & SaaS',
    categoryTag: 'GST Compliant',
    docType: 'invoice',
    badge: 'GST Ready',
    description: 'Fully compliant statutory Indian Tax Invoice layout with GSTIN, State Codes, HSN/SAC codes column, CGST & SGST split, Amount in Words, and Seal.',
    tags: ['GST', 'CGST+SGST', 'HSN Code', 'Compliant'],
    layoutType: 'gst',
    accentColor: '#880E4F',
    headerBg: '#880E4F',
    headerText: '#FFFFFF',
    tableHeaderBg: '#FCE4EC',
    tableHeaderText: '#880E4F',
    totalColor: '#880E4F',
    borderColor: '#F48FB1',
    logoText: 'TaxPro India Private Limited',
    docLabel: 'TAX INVOICE (GST)',
    sampleClient: 'Sharma Global Traders GSTIN: 07AAAAA0000A1Z5',
    sampleItems: [
      { desc: 'Custom Software Architecture & Dev (SAC: 998314)', qty: 40, rate: 1500 },
      { desc: 'Cloud Server Hosting & Managed Cluster 1yr (SAC: 998315)', qty: 1, rate: 24000 },
      { desc: 'Priority DevOps Technical Support (Monthly)', qty: 3, rate: 5000 },
    ],
  },
];

export const BILL_TEMPLATES = TEMPLATES.filter((t) => t.docType === 'bill');
export const INVOICE_TEMPLATES = TEMPLATES.filter((t) => t.docType === 'invoice');

export const TEMPLATE_STORAGE_KEY = 'billease_active_template';

export function saveTemplateChoice(templateId: string): void {
  localStorage.setItem(TEMPLATE_STORAGE_KEY, templateId);
}
export const setTemplateChoice = saveTemplateChoice;

export function getTemplateChoice(): string | null {
  return localStorage.getItem(TEMPLATE_STORAGE_KEY);
}

export function getTemplateById(id: string): TemplateStyle | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function normalizeTemplateId(id?: string, docType?: 'bill' | 'invoice'): string {
  if (!id) {
    return docType === 'invoice' ? 'classic-pro' : 'apex-corporate-bill';
  }
  // Check direct match
  if (TEMPLATES.some((t) => t.id === id)) {
    return id;
  }
  if (id === 'classic' || id === 'classic-bill') {
    return docType === 'invoice' ? 'classic-pro' : 'apex-corporate-bill';
  }
  if (id === 'minimal' || id === 'modern') {
    return docType === 'bill' ? 'modern-minimal-bill' : 'modern-minimal';
  }
  if (id === 'bold' || id === 'receipt') return 'bold-emerald';
  if (id === 'sidebar') return docType === 'bill' ? 'warm-saffron-bill' : 'warm-saffron';
  if (id === 'clinical') return 'medical-clinical';
  if (id === 'editorial') return 'corporate-navy';
  if (id === 'academic') return 'academia-blue';
  if (id === 'gst') return 'gst-tax-invoice';
  return id;
}

export const ALL_CATEGORIES = [
  'All Categories',
  'Professional Services',
  'Technology & SaaS',
  'E-Commerce & Retail',
  'Healthcare & Wellness',
  'Education & Training',
];
