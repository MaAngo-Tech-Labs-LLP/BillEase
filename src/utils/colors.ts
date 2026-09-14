/**
 * Shared color helpers for document rendering.
 *
 * Used by both DocumentRenderer (invoices) and BillDocumentRenderer (bills)
 * to derive gradient/shade variants of the user's picked accent color, so a
 * template's gradient or hover shade always stays a variant of the same
 * color the user chose rather than mixing in an unrelated fixed hue.
 */

/** Lightens (positive percent) or darkens (negative percent) a hex color. */
export function shadeHexColor(color: string, percent: number): string {
  if (!color || !color.startsWith('#')) return color;
  let hex = color.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(hex, 16);
  if (isNaN(num)) return color;
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
