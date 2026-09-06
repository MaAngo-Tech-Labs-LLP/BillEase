export type LayoutType =
  | 'classic'      // Classic Professional (Formal corporate, dual party cards, signature stamp)
  | 'minimal'      // Modern Minimal (Asymmetric whitespace, borderless floating table, dark total pill)
  | 'receipt'      // Bold Emerald (Retail & POS memo, dashed lines, centered store logo, barcode)
  | 'sidebar'      // Warm Saffron (Striking left vertical brand & payment sidebar, main right charges)
  | 'clinical'     // Medical & Clinical (Rx symbol, Doctor reg, Patient age/gender, medical fee table)
  | 'editorial'    // Corporate Navy (Serif typography, Law & Advisory matter ref, retainer reconciliation)
  | 'academic'     // Academia Blue (Tuition receipt, student roll no, semester schedule, registrar sign)
  | 'gst'          // GST Tax Invoice (Official Indian GST layout, HSN/SAC table, CGST/SGST split, amount in words)

export interface TemplateStyle {
  id: string
  name: string
  category: string
  categoryTag: string
  docType: 'bill' | 'invoice' | 'both'
  badge: string
  description: string
  tags: string[]
  layoutType: LayoutType
  accentColor: string
  headerBg: string
  headerText: string
  tableHeaderBg: string
  tableHeaderText: string
  totalColor: string
  borderColor: string
  logoText: string
  docLabel: string
  sampleClient: string
  sampleItems: { desc: string; qty: number; rate: number }[]
}

export const TEMPLATES: TemplateStyle[] = [
  {
    id: 'classic-pro',
    name: 'Classic Professional',
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
    name: 'Modern Minimal',
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
    id: 'bold-emerald',
    name: 'Retail Store & POS Bill',
    category: 'E-Commerce & Retail',
    categoryTag: 'Retail',
    docType: 'bill',
    badge: 'Fresh Look',
    description: 'Authentic retail point-of-sale receipt bill with centered store branding, dashed dividing rules, cashier metadata, and barcode strip.',
    tags: ['Retail', 'POS', 'Store', 'Receipt'],
    layoutType: 'receipt',
    accentColor: '#00695C',
    headerBg: '#00695C',
    headerText: '#FFFFFF',
    tableHeaderBg: '#E0F2F1',
    tableHeaderText: '#00695C',
    totalColor: '#00695C',
    borderColor: '#B2DFDB',
    logoText: 'GreenLeaf Organic Store',
    docLabel: 'CASH / RETAIL MEMO',
    sampleClient: 'Priya Sharma (Walk-in Customer)',
    sampleItems: [
      { desc: 'Organic Darjeeling Tea Pack (250g)', qty: 5, rate: 850 },
      { desc: 'Cold Pressed Virgin Coconut Oil (500ml)', qty: 3, rate: 480 },
      { desc: 'Eco-friendly Jute Carry Bag', qty: 2, rate: 120 },
    ],
  },
  {
    id: 'warm-saffron',
    name: 'Creative Studio Sidebar',
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
    id: 'medical-clinical',
    name: 'Medical & Clinical Bill',
    category: 'Healthcare & Wellness',
    categoryTag: 'Healthcare',
    docType: 'bill',
    badge: 'Compliant',
    description: 'Hospital & Clinical consultation format with medical Rx header, Clinic Reg #, Patient Details box (Age/Gender/UHID), and Doctor Signature line.',
    tags: ['Clinical', 'Hospital', 'Doctors', 'Medical'],
    layoutType: 'clinical',
    accentColor: '#00838F',
    headerBg: '#FFFFFF',
    headerText: '#00838F',
    tableHeaderBg: '#E0F7FA',
    tableHeaderText: '#00696F',
    totalColor: '#00838F',
    borderColor: '#80DEEA',
    logoText: 'Apex Life Care Hospital',
    docLabel: 'CONSULTATION & SERVICE BILL',
    sampleClient: 'Suresh Mehta (Patient Age: 42 / M)',
    sampleItems: [
      { desc: 'Senior Consultant Physician OPD Fee', qty: 1, rate: 800 },
      { desc: 'Comprehensive Metabolic Panel & Lipid Profile', qty: 1, rate: 1400 },
      { desc: '12-Lead Diagnostic Electrocardiogram (ECG)', qty: 1, rate: 600 },
    ],
  },
  {
    id: 'corporate-navy',
    name: 'Executive Legal & Advisory',
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
    id: 'academia-blue',
    name: 'Academy & Tuition Fee Receipt',
    category: 'Education & Training',
    categoryTag: 'Education',
    docType: 'invoice',
    badge: 'Scholarly',
    description: 'Official academic fee receipt format with institution crest, Student Enrollment/Roll number, Program Term breakdown, and Registrar signature stamp.',
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
    docLabel: 'OFFICIAL FEE RECEIPT',
    sampleClient: 'Rahul Sharma (Roll: CGA-2026-089)',
    sampleItems: [
      { desc: 'Advanced Physics & Mathematics Semester Fee', qty: 1, rate: 22000 },
      { desc: 'Science Laboratory & Practical Material Kit', qty: 1, rate: 3500 },
      { desc: 'Annual Digital Learning Portal & Mock Exam Access', qty: 1, rate: 4500 },
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
]

export const TEMPLATE_STORAGE_KEY = 'billease_active_template'

export function saveTemplateChoice(templateId: string): void {
  localStorage.setItem(TEMPLATE_STORAGE_KEY, templateId)
}
export const setTemplateChoice = saveTemplateChoice

export function getTemplateChoice(): string | null {
  return localStorage.getItem(TEMPLATE_STORAGE_KEY)
}

export function getTemplateById(id: string): TemplateStyle | undefined {
  return TEMPLATES.find(t => t.id === id)
}

export const ALL_CATEGORIES = [
  'All Categories',
  'Professional Services',
  'Technology & SaaS',
  'E-Commerce & Retail',
  'Healthcare & Wellness',
  'Education & Training',
]
