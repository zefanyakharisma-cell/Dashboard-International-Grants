import { $, esc, refreshIcons, daysUntil } from './helpers.js';
import { activeGrants } from './filters.js';
import { state } from '../store.js';
import { APP_CONFIG } from '../config.js';

export function buildNotifications() {
  const items = [];
  activeGrants().forEach(g => {
    const d = daysUntil(g.deadline);
    if (d !== null && d >= 0 && d <= APP_CONFIG.closingSoonDays) {
      items.push({ icon: 'alarm-clock', title: 'Closing soon',
        text: `${g.title} — ${d} day${d===1?'':'s'} left`, id: g.id, kind: 'warn' });
    }
  });
  const recents = [...state.grants]
    .sort((a,b) => String(b.createdAt||'').localeCompare(String(a.createdAt||'')))
    .slice(0, 3);
  recents.forEach(g => items.push({ icon:'sparkles', title:'New grant added', text:g.title, id:g.id, kind:'info' }));
  return items.slice(0, 12);
}

export function refreshNotifBadge() {
  const items = buildNotifications();
  $('#notif-dot')?.classList.toggle('hidden', items.length === 0);
}

export function renderNotifPanel() {
  const items = buildNotifications();
  $('#notif-panel').innerHTML = `
    <div class="px-1 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
      <p class="text-sm font-bold">Notifications</p>
    </div>
    <div class="space-y-1">
      ${items.length === 0 ? `<p class="text-xs text-slate-500 px-2 py-3">No notifications</p>` :
        items.map(n => `
          <button class="w-full text-left px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-start gap-2" data-grant="${n.id}">
            <i data-lucide="${n.icon}" class="w-4 h-4 mt-0.5 text-petra-600"></i>
            <div class="min-w-0">
              <p class="text-xs font-semibold">${esc(n.title)}</p>
              <p class="text-xs text-slate-500 truncate">${esc(n.text)}</p>
            </div>
          </button>`).join('')}
    </div>`;
  refreshIcons();
}
