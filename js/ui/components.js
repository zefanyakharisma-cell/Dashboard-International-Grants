/**
 * Re-usable HTML partials: stat card and grant card.
 */

import { state } from '../store.js';
import { esc, fmt, daysUntil, grantStatus, statusChip } from './helpers.js';

export function statCard(icon, label, value, color = 'bg-petra-100 text-petra-700') {
  return `
    <div class="card stat-card">
      <div class="stat-icon ${color}"><i data-lucide="${icon}"></i></div>
      <div>
        <p class="text-xs text-slate-500 dark:text-slate-400">${esc(label)}</p>
        <p class="text-xl font-bold">${value}</p>
      </div>
    </div>`;
}

export function grantCardHTML(g) {
  const status = grantStatus(g);
  const d = daysUntil(g.deadline);
  const remaining = d === null ? '' : d < 0 ? 'Expired' : `${d} day${d===1?'':'s'} left`;
  const bookmarked = state.bookmarks.has(g.id);
  return `
    <div class="card grant-card card-hover" data-grant="${g.id}">
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2">${statusChip(status)}<span class="chip">${esc(g.category)}</span></div>
        <button class="bookmark-btn p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800" data-id="${g.id}" title="Bookmark">
          <i data-lucide="${bookmarked?'bookmark-check':'bookmark'}" class="w-4 h-4 ${bookmarked?'text-petra-600':'text-slate-400'}"></i>
        </button>
      </div>
      <h3>${esc(g.title)}</h3>
      <p class="grant-meta line-clamp-2">${esc(g.description)}</p>
      <div class="flex flex-wrap gap-1.5">
        ${(g.tags||[]).slice(0,3).map(t => `<span class="tag">#${esc(t)}</span>`).join('')}
      </div>
      <div class="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div>
          <p class="text-slate-500 dark:text-slate-400">${esc(g.country)} · ${esc(g.organization)}</p>
          <p class="font-semibold mt-1">${esc(g.currency)} ${fmt.format(g.amount || 0)}</p>
        </div>
        <div class="text-right">
          <p class="text-slate-500 dark:text-slate-400">${esc(g.deadline)}</p>
          <p class="countdown ${d<=7&&d>=0?'text-amber-600':d<0?'text-rose-600':'text-emerald-600'}">${esc(remaining)}</p>
        </div>
      </div>
    </div>`;
}
