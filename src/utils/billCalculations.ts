import { CurrencyCode, DocumentItem } from '../types';

export interface BillCalculationResult {
  subtotal: number;
  itemDiscountsTotal: number;
  billDiscount: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  additionalCharges: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  isFullyPaid: boolean;
  hasBalance: boolean;
}

export interface BillCalculationInput {
  items: DocumentItem[];
  discount?: number;
  taxRate?: number;
  additionalCharges?: number;
  amountPaid?: number;
}

/**
 * Pure calculation engine for Bill totals, taxes, discounts, and balances.
 * Isolated from UI components per project architecture requirements.
 */
export function calculateBillTotals(input: BillCalculationInput): BillCalculationResult {
  const items = Array.isArray(input.items) ? input.items : [];

  let subtotal = 0;
  let itemDiscountsTotal = 0;
  let itemTaxesTotal = 0;
  let hasItemLevelTax = false;

  for (const it of items) {
    const qty = Math.max(0, Number(it.qty) || 0);
    const rate = Math.max(0, Number(it.rate) || 0);
    const lineTotal = qty * rate;
    subtotal += lineTotal;

    const itDiscount = Math.min(lineTotal, Math.max(0, Number(it.discount) || 0));
    itemDiscountsTotal += itDiscount;

    if (it.taxRate !== undefined && it.taxRate !== null && Number(it.taxRate) > 0) {
      hasItemLevelTax = true;
      const taxableLine = Math.max(0, lineTotal - itDiscount);
      itemTaxesTotal += (taxableLine * Number(it.taxRate)) / 100;
    }
  }

  // Bill-level discount vs item discounts
  const billDiscount = Math.max(0, Number(input.discount) || 0);
  const discountAmount = billDiscount > 0 ? billDiscount : itemDiscountsTotal;

  const taxableAmount = Math.max(0, subtotal - discountAmount);

  // Tax calculation
  let taxAmount = 0;
  if (hasItemLevelTax) {
    taxAmount = itemTaxesTotal;
  } else {
    const rate = Math.max(0, Number(input.taxRate) || 0);
    taxAmount = (taxableAmount * rate) / 100;
  }

  const additionalCharges = Math.max(0, Number(input.additionalCharges) || 0);
  const grandTotal = Math.max(0, taxableAmount + taxAmount + additionalCharges);

  const rawAmountPaid = Math.max(0, Number(input.amountPaid) || 0);
  const amountPaid = Math.min(grandTotal, rawAmountPaid);
  const balanceDue = Math.max(0, grandTotal - amountPaid);

  const isFullyPaid = grandTotal > 0 && balanceDue <= 0.001;
  const hasBalance = balanceDue > 0.001;

  return {
    subtotal,
    itemDiscountsTotal,
    billDiscount,
    discountAmount,
    taxableAmount,
    taxAmount,
    additionalCharges,
    grandTotal,
    amountPaid,
    balanceDue,
    isFullyPaid,
    hasBalance,
  };
}

/**
 * Standard currency amount formatter respecting Indian numbering system (Lakhs/Crores)
 * for INR and Western standard for USD/EUR/GBP/CAD.
 */
export function formatCurrencyAmount(amount: number, currency: CurrencyCode = 'INR'): string {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return Number(amount || 0).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
