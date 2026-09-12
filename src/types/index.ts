export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD';

export type LayoutType =
  | 'classic'      // Classic Professional (Formal corporate, dual party cards, signature stamp)
  | 'minimal'      // Modern Minimal (Asymmetric whitespace, borderless floating table, dark total pill)
  | 'receipt'      // Bold Emerald (Retail & POS memo, dashed lines, centered store logo, barcode)
  | 'sidebar'      // Warm Saffron (Striking left vertical brand & payment sidebar, main right charges)
  | 'clinical'     // Medical & Clinical (Rx symbol, Doctor reg, Patient age/gender, medical fee table)
  | 'editorial'    // Corporate Navy (Serif typography, Law & Advisory matter ref, retainer reconciliation)
  | 'academic'     // Academia Blue (Tuition receipt, student roll no, semester schedule, registrar sign)
  | 'gst'          // GST Tax Invoice (Official Indian GST layout, HSN/SAC table, CGST/SGST split, amount in words)
  | 'eu-business'  // EU/Nordic Business Invoice (dense metadata block, Unit Price/Qty/VAT% table, BIC/IBAN bank footer)
  | 'gst-detailed'; // GST Tax Invoice — Detailed (PAN, Challan/E-Way Bill/Transport block, per-HSN IGST summary table, UPI QR, signature stamp)

export type TemplateId = 'classic' | 'modern' | 'minimal' | 'bold' | LayoutType | string;

export type AccentColor = 'indigo' | 'teal' | 'slate' | 'mono';

export type DocumentType = 'bill' | 'invoice';

export type DocumentStatus = 'Draft' | 'Sent' | 'Paid' | 'Pending' | 'Unpaid';
/** Alias kept for call sites that import the shorter name. */
export type DocStatus = DocumentStatus;

export interface DocumentItem {
  id: string;
  name?: string; // Item / Service Name
  description: string;
  qty: number;
  rate: number;
  taxRate?: number; // Item-level tax rate (%)
  discount?: number; // Item-level discount amount
  hsnSac?: string; // HSN (goods) / SAC (services) classification code, for GST invoices
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
  /** @deprecated legacy alias for senderLogo, read as a fallback for older saved documents */
  logo?: string;
  senderName?: string;
  senderTagline?: string;
  senderEmail?: string;
  senderPhone?: string;
  senderAddress?: string;
  senderWebsite?: string;
  senderTaxNumber?: string; // GST / Tax Number
  senderPanNumber?: string; // PAN (India), shown separately from GSTIN on statutory GST invoices
  // Client / Customer Info (BILL TO)
  clientName: string;
  clientCompany?: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress: string; // Billing Address
  shippingAddress?: string; // Shipping Address
  shippingSameAsBilling?: boolean;
  clientTaxNumber?: string; // GST / Tax Number
  // Dispatch / GST E-Way Details (India) — all optional, shown only on
  // GST-oriented templates (e.g. 'gst-detailed') when filled in.
  placeOfSupply?: string;
  challanNumber?: string;
  challanDate?: string;
  ewayBillNumber?: string;
  transportName?: string;
  transportId?: string;
  /** Base64 image data URL of a UPI/payment QR code, shown on the document when set. */
  paymentQrCode?: string;
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
  /** Base64 image data URL of an authorized signature, shown on the document when set. */
  signature?: string;
  // System
  template: TemplateId;
  accent: AccentColor;
  status: DocumentStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  tag: string;
}

export interface BusinessProfile {
  logo?: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  gstPanNumber: string;
  bankUpiId: string;
}

export const STORAGE_PROFILE_KEY = 'billease_business_profile';

export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  logo: '',
  companyName: '',
  email: '',
  phone: '',
  address: '',
  gstPanNumber: '',
  bankUpiId: '',
};

