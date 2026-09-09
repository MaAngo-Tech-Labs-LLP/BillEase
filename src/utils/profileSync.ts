import { BillDocument, BusinessProfile, STORAGE_PROFILE_KEY } from '../types';

export const PROFILE_UPDATED_EVENT = 'billease_profile_updated';

/**
 * Retrieve the saved business profile defaults from localStorage
 */
export function getSavedBusinessProfile(): BusinessProfile | null {
  try {
    const saved = localStorage.getItem(STORAGE_PROFILE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading business profile from localStorage:', e);
  }
  return null;
}

/**
 * Check whether a field currently holds a placeholder default value
 */
function isPlaceholderDefault(field: string, value: string | undefined): boolean {
  if (!value || !value.trim()) return true;
  const v = value.trim().toLowerCase();

  switch (field) {
    case 'senderName':
      return (
        v.includes('apex corporate') ||
        v.includes('studio pulse') ||
        v === 'apex corporate' ||
        v === 'studio pulse'
      );
    case 'senderEmail':
      return (
        v === 'billing@apexcorp.com' ||
        v === 'billing@apexcorporate.io' ||
        v === 'billing@studiopulse.design' ||
        v === 'hello@studiopulse.design' ||
        v.includes('@apexcorp.com') ||
        v.includes('@studiopulse.design')
      );
    case 'senderPhone':
      return (
        v === '+91 98765 43210' ||
        v === '+91 98200 11223' ||
        v === '+91 98111 22334'
      );
    case 'senderAddress':
      return (
        v.includes('101 cyber towers') ||
        v.includes('74 nordic creative park') ||
        v.includes('402, lotus grandeur')
      );
    case 'senderTaxNumber':
      return (
        v === '27aabca1234f1z9' ||
        v === '22aaaaa0000a1z5' ||
        v === '27aabcs1429b1z8'
      );
    case 'upiId':
      return (
        v === 'apexcorp@icici' ||
        v === 'studiopulse@okaxis' ||
        v === 'billing@upi'
      );
    default:
      return false;
  }
}

/**
 * Automatically apply business profile defaults to a document (Bill or Invoice)
 * @param doc - Document to populate
 * @param profile - Optional profile (falls back to saved profile from localStorage)
 * @param forceOverride - If true, replaces any existing value with non-empty profile fields
 */
export function applyBusinessProfileToDoc<T extends Partial<BillDocument>>(
  doc: T,
  profile?: BusinessProfile | null,
  forceOverride = false
): T {
  const p = profile !== undefined ? profile : getSavedBusinessProfile();
  if (!p) return doc;

  const result = { ...doc };

  // 1. Business / Sender Name
  if (p.companyName && p.companyName.trim()) {
    if (forceOverride || isPlaceholderDefault('senderName', result.senderName)) {
      result.senderName = p.companyName.trim();
    }
  }

  // 2. Business Email
  if (p.email && p.email.trim()) {
    if (forceOverride || isPlaceholderDefault('senderEmail', result.senderEmail)) {
      result.senderEmail = p.email.trim();
    }
  }

  // 3. Business Phone
  if (p.phone && p.phone.trim()) {
    if (forceOverride || isPlaceholderDefault('senderPhone', result.senderPhone)) {
      result.senderPhone = p.phone.trim();
    }
  }

  // 4. Business Address
  if (p.address && p.address.trim()) {
    if (forceOverride || isPlaceholderDefault('senderAddress', result.senderAddress)) {
      result.senderAddress = p.address.trim();
    }
  }

  // 5. GSTIN / PAN / Tax Number
  if (p.gstPanNumber && p.gstPanNumber.trim()) {
    if (forceOverride || isPlaceholderDefault('senderTaxNumber', result.senderTaxNumber)) {
      result.senderTaxNumber = p.gstPanNumber.trim();
    }
  }

  // 6. Bank / UPI ID
  if (p.bankUpiId && p.bankUpiId.trim()) {
    if (forceOverride || isPlaceholderDefault('upiId', result.upiId)) {
      result.upiId = p.bankUpiId.trim();
    }
  }

  // 7. Business Logo
  if (p.logo) {
    if (forceOverride || !result.senderLogo || result.senderLogo.includes('DEFAULT_INVOICE_LOGO')) {
      result.senderLogo = p.logo;
    }
  }

  return result;
}

/**
 * Persist and broadcast a profile update across active editors and saved drafts
 */
export function broadcastProfileUpdate(profile: BusinessProfile) {
  try {
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
    updateSavedDraftsWithProfile(profile);
    window.dispatchEvent(
      new CustomEvent(PROFILE_UPDATED_EVENT, { detail: profile })
    );
  } catch (e) {
    console.error('Failed to broadcast profile update:', e);
  }
}

/**
 * Automatically update localStorage drafts so returning to them has current profile info
 */
export function updateSavedDraftsWithProfile(profile: BusinessProfile) {
  // Update bill draft
  try {
    const savedBill = localStorage.getItem('billease_bill_draft');
    if (savedBill) {
      const parsed = JSON.parse(savedBill);
      const updated = applyBusinessProfileToDoc(parsed, profile, true);
      localStorage.setItem('billease_bill_draft', JSON.stringify(updated));
    }
  } catch (_) {}

  // Update invoice draft
  try {
    const savedInv = localStorage.getItem('billease_invoice_draft');
    if (savedInv) {
      const parsed = JSON.parse(savedInv);
      const updated = applyBusinessProfileToDoc(parsed, profile, true);
      localStorage.setItem('billease_invoice_draft', JSON.stringify(updated));
    }
  } catch (_) {}

  // Update active draft
  try {
    const savedActive = localStorage.getItem('billease_active_draft');
    if (savedActive) {
      const parsed = JSON.parse(savedActive);
      const updated = applyBusinessProfileToDoc(parsed, profile, true);
      localStorage.setItem('billease_active_draft', JSON.stringify(updated));
    }
  } catch (_) {}
}
