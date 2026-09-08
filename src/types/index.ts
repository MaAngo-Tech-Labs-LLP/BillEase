export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD';

export type LayoutType =
  | 'classic'      // Classic Professional (Formal corporate, dual party cards, signature stamp)
  | 'minimal'      // Modern Minimal (Asymmetric whitespace, borderless floating table, dark total pill)
  | 'receipt'      // Bold Emerald (Retail & POS memo, dashed lines, centered store logo, barcode)
  | 'sidebar'      // Warm Saffron (Striking left vertical brand & payment sidebar, main right charges)
  | 'clinical'     // Medical & Clinical (Rx symbol, Doctor reg, Patient age/gender, medical fee table)
  | 'editorial'    // Corporate Navy (Serif typography, Law & Advisory matter ref, retainer reconciliation)
  | 'academic'     // Academia Blue (Tuition receipt, student roll no, semester schedule, registrar sign)
  | 'gst';         // GST Tax Invoice (Official Indian GST layout, HSN/SAC table, CGST/SGST split, amount in words)

export type TemplateId = 'classic' | 'modern' | 'minimal' | 'bold' | LayoutType | string;

export type AccentColor = 'indigo' | 'teal' | 'slate' | 'mono';

export type DocumentType = 'bill' | 'invoice';

export type DocumentStatus = 'Draft' | 'Sent' | 'Paid' | 'Pending';

export interface DocumentItem {
  id: string;
  name?: string; // Item / Service Name
  description: string;
  qty: number;
  rate: number;
  taxRate?: number; // Item-level tax rate (%)
  discount?: number; // Item-level discount amount
}

export interface BillDocument {
  id: string;
  type: DocumentType;
  title: string;
  billNumber: string;
  poNumber?: string;
  issueDate: string;
  dueDate: string;
  currency: CurrencyCode;
  // Sender / My Info (BILL FROM)
  senderLogo?: string; // Base64 image data URL
  senderName?: string;
  senderTagline?: string;
  senderEmail?: string;
  senderPhone?: string;
  senderAddress?: string;
  senderWebsite?: string;
  senderTaxNumber?: string; // GST / Tax Number
  // Client / Customer Info (BILL TO)
  clientName: string;
  clientCompany?: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress: string; // Billing Address
  shippingAddress?: string; // Shipping Address
  shippingSameAsBilling?: boolean;
  clientTaxNumber?: string; // GST / Tax Number
  // Items
  items: DocumentItem[];
  // Calculations
  taxRate: number; // Bill-level tax rate (%)
  discount: number; // Bill-level discount amount
  additionalCharges?: number; // Additional charges (shipping, etc.)
  amountPaid?: number; // Amount already paid
  // Payment Info
  paymentMethod?: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Other';
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
  upiId?: string;
  paymentTerms?: string;
  customPaymentTerms?: string;
  // Notes & Terms
  notes?: string;
  paymentNotes: string; // Payment instructions
  termsAndConditions?: string;
  // System
  template: TemplateId;
  accent: AccentColor;
  status: DocumentStatus;
  createdAt: string;
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  tag: string;
}
