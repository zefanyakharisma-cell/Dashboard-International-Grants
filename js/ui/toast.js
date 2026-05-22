import { $, esc, refreshIcons } from './helpers.js';

export function toast(msg, kind = 'info') {
  const cls = { info:'', success:'toast-success', error:'toast-error', warn:'toast-warn' }[kind] || '';
  const icon = kind === 'error' ? 'alert-octagon'
             : kind === 'success' ? 'check-circle-2'
             : kind === 'warn' ? 'alert-triangle' : 'info';
  const el = document.createElement('div');
  el.className = `toast ${cls}`;
  el.innerHTML = `<div class="flex items-start gap-2">
      <i data-lucide="${icon}" class="w-4 h-4 mt-0.5"></i>
      <span>${esc(msg)}</span>
    </div>`;
  $('#toasts').appendChild(el);
  refreshIcons();
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(8px)'; }, 3000);
  setTimeout(() => el.remove(), 3400);
}
