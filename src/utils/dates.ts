/**
 * Canonical date handling for the whole app.
 *
 * All dates are stored as ISO `YYYY-MM-DD` strings — unambiguous, sortable,
 * and independent of locale/timezone. Every place that accepts free-typed
 * date input (DateInputWithPicker) normalizes to this format on blur before
 * it's ever saved, so nothing downstream has to guess whether a "NN-NN-YYYY"
 * string means day-first or month-first.
 *
 * `toIsoDate` still accepts a few common typed formats for backward
 * compatibility with dates that were saved before that normalization existed,
 * or entered elsewhere. Ambiguous "NN-NN-YYYY" / "NN/NN/YYYY" input is
 * treated as DD-MM-YYYY (day first) app-wide — this app targets Indian
 * businesses (GST invoices, ₹ default currency), where DD-MM-YYYY is the
 * standard convention, and every parser in the codebase must agree on the
 * same assumption or the same string parses to different dates in different
 * places.
 */

/** Parses a date string in common typed formats into canonical ISO
 * `YYYY-MM-DD`. Returns '' if the input is empty or unparseable — callers
 * should keep the original text in that case rather than discard it. */
export function toIsoDate(val?: string): string {
  if (!val) return '';
  const trimmed = val.trim();
  if (!trimmed) return '';

  // Already ISO: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY
  const dmy = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // YYYY/MM/DD, YYYY.MM.DD
  const ymd = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymd) {
    const [, y, m, d] = ymd;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  return '';
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

/** Formats a stored date string for compact display (e.g. "2026-09-12" ->
 * "2026-09-12", used in document headers). Normalizes to ISO first so
 * whatever format is stored displays consistently. */
export function formatHeaderDate(d?: string): string {
  const iso = toIsoDate(d);
  return iso || (d ? d.trim() : '');
}

/** Formats a stored date string for human-friendly display (e.g. "12 Sept
 * 2026"), used in document lists and previews. */
export function formatDisplayDate(d?: string): string {
  const iso = toIsoDate(d);
  if (!iso) return d ? d.trim() : '';
  const [y, m, day] = iso.split('-');
  const mIdx = parseInt(m, 10) - 1;
  return `${parseInt(day, 10)} ${MONTHS_SHORT[mIdx] || ''} ${y}`;
}
