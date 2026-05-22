/**
 * Tiny DOM + formatting helpers shared by all views.
 */

import { APP_CONFIG } from '../config.js';

export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));

export const fmt = new Intl.NumberFormat('en-US');

export const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };

export const parseDate = (s) => {
  if (!s) return null;
  const d = new Date(String(s).slice(0,10) + 'T00:00:00');
  return isNaN(d) ? null : d;
};

export function daysUntil(deadline) {
  const d = parseDate(deadline); if (!d) return null;
  return Math.ceil((d - today()) / (1000 * 60 * 60 * 24));
}

export function grantStatus(g) {
  if (g.archived) return 'Closed';
  const d = daysUntil(g.deadline);
  if (d === null) return 'Open';
  if (d < 0) return 'Closed';
  if (d <= APP_CONFIG.closingSoonDays) return 'Closing Soon';
  return 'Open';
}

export function statusChip(s) {
  const map = { 'Open':'chip-green', 'Closing Soon':'chip-yellow', 'Closed':'chip-red' };
  return `<span class="chip ${map[s] || ''}">${esc(s)}</span>`;
}

export function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}
