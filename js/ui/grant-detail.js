/**
 * Grant detail modal — read-only popup with description, eligibility,
 * attachments, and action buttons. An "Edit" button is shown for admins.
 */

import { $, esc, fmt, daysUntil, grantStatus, statusChip, refreshIcons } from './helpers.js';
import { state, facultyById, programById } from '../store.js';
import { isAdmin } from '../auth.js';

export function openGrant(id) {
  const g = state.grants.find(x => x.id === id);
  if (!g) return;
  const status = grantStatus(g);
  const d = daysUntil(g.deadline);
  const facList = (g.facultyIds||[]).map(fid => facultyById(fid)?.name).filter(Boolean);
  const progList = (g.programIds||[]).map(pid => programById(pid)?.name).filter(Boolean);
  const bookmarked = state.bookmarks.has(g.id);

  $('#grant-modal-body').innerHTML = `
    <div class="p-6">
      <div class="flex items-start justify-between gap-3 mb-3">
        <div>
          <div class="flex items-center gap-2 mb-2">${statusChip(status)}<span class="chip">${esc(g.category)}</span>${g.archived?'<span class="chip">Archived</span>':''}</div>
          <h2 class="text-2xl font-bold leading-tight">${esc(g.title)}</h2>
          <p class="text-sm text-slate-500 mt-1">${esc(g.organization)} · ${esc(g.country)}</p>
        </div>
        <button class="btn btn-ghost" id="close-modal"><i data-lucide="x"></i></button>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <div class="card p-3"><p class="text-xs text-slate-500">Funding</p><p class="font-bold">${esc(g.currency)} ${fmt.format(g.amount||0)}</p><p class="text-xs text-slate-500">${esc(g.amountNote||'')}</p></div>
        <div class="card p-3"><p class="text-xs text-slate-500">Deadline</p><p class="font-bold">${esc(g.deadline||'')}</p><p class="text-xs ${d<0?'text-rose-600':d<=7?'text-amber-600':'text-emerald-600'} countdown">${d===null?'':d<0?'Expired':d+' days left'}</p></div>
        <div class="card p-3"><p class="text-xs text-slate-500">Category</p><p class="font-semibold text-sm">${esc(g.category)}</p></div>
        <div class="card p-3"><p class="text-xs text-slate-500">Country</p><p class="font-semibold text-sm">${esc(g.country)}</p></div>
      </div>

      <section class="space-y-4">
        <div><h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Description</h3><p class="mt-1 text-sm">${esc(g.description)}</p></div>
        <div><h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Eligibility</h3><p class="mt-1 text-sm">${esc(g.eligibility)}</p></div>
        <div>
          <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Eligible Academic Units</h3>
          <div class="mt-2 flex flex-wrap gap-1.5">
            ${facList.map(n => `<span class="chip chip-green">${esc(n)}</span>`).join('')}
            ${progList.map(n => `<span class="tag">${esc(n)}</span>`).join('')}
            ${facList.length === 0 && progList.length === 0 ? `<span class="text-xs text-slate-400">Open to all units</span>` : ''}
          </div>
          ${g.degreeLevels?.length ? `<div class="mt-2 text-xs text-slate-500">Degree levels: ${g.degreeLevels.map(d=>esc(d)).join(', ')}</div>` : ''}
        </div>
        ${g.tags?.length ? `<div class="flex flex-wrap gap-1.5">${g.tags.map(t=>`<span class="tag">#${esc(t)}</span>`).join('')}</div>` : ''}
        ${g.attachments?.length ? `
          <div>
            <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Attachments</h3>
            <ul class="mt-1 space-y-1">
              ${g.attachments.map(a => `<li><a class="text-petra-600 hover:underline inline-flex items-center gap-2" href="${esc(a.url||'#')}" target="_blank"><i data-lucide="paperclip" class="w-4 h-4"></i>${esc(a.name)}</a></li>`).join('')}
            </ul>
          </div>` : ''}
        <div class="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          ${g.website ? `<a class="btn btn-primary" href="${esc(g.website)}" target="_blank"><i data-lucide="external-link"></i>Open application</a>` : ''}
          ${g.contactEmail ? `<a class="btn btn-secondary" href="mailto:${esc(g.contactEmail)}"><i data-lucide="mail"></i>${esc(g.contactEmail)}</a>` : ''}
          <button class="btn btn-secondary" data-bookmark="${g.id}"><i data-lucide="${bookmarked?'bookmark-check':'bookmark'}"></i>${bookmarked?'Bookmarked':'Bookmark'}</button>
          ${isAdmin() ? `<button class="btn btn-secondary" data-edit="${g.id}"><i data-lucide="pencil"></i>Edit</button>` : ''}
        </div>
      </section>
    </div>`;
  $('#grant-modal').classList.remove('hidden');
  refreshIcons();
}

export function closeGrant() {
  $('#grant-modal').classList.add('hidden');
}
