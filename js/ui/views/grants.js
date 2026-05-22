import { esc, fmt, daysUntil, grantStatus, statusChip } from '../helpers.js';
import { state } from '../../store.js';
import { applyFilters, activeGrants, filterBar } from '../filters.js';
import { grantCardHTML } from '../components.js';

export function grantsView() {
  const list = applyFilters(activeGrants());
  state.filters.page = Math.min(state.filters.page, Math.max(1, Math.ceil(list.length / state.filters.perPage)));
  const start = (state.filters.page - 1) * state.filters.perPage;
  const pageItems = list.slice(start, start + state.filters.perPage);
  const totalPages = Math.max(1, Math.ceil(list.length / state.filters.perPage));

  const body = state.filters.view === 'card'
    ? `<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
         ${pageItems.length === 0
           ? `<div class="card p-8 text-center text-slate-500 col-span-full">No grants match your filters.</div>`
           : pageItems.map(grantCardHTML).join('')}
       </div>`
    : `<div class="card scroll-x">
        <table class="tbl">
          <thead><tr>
            <th>Title</th><th>Organization</th><th>Country</th><th>Category</th><th>Amount</th><th>Deadline</th><th>Status</th><th></th>
          </tr></thead>
          <tbody>
            ${pageItems.length === 0 ? `<tr><td colspan="8" class="text-center text-slate-500 py-8">No grants match your filters.</td></tr>` :
              pageItems.map(g => {
                const d = daysUntil(g.deadline);
                return `
                  <tr data-grant="${g.id}" class="cursor-pointer">
                    <td class="font-medium">${esc(g.title)}</td>
                    <td>${esc(g.organization)}</td>
                    <td>${esc(g.country)}</td>
                    <td>${esc(g.category)}</td>
                    <td>${esc(g.currency)} ${fmt.format(g.amount||0)}</td>
                    <td>${esc(g.deadline||'')} <span class="block text-xs text-slate-400">${d===null?'':d<0?'Expired':d+' d'}</span></td>
                    <td>${statusChip(grantStatus(g))}</td>
                    <td><button class="btn btn-ghost text-xs" data-grant-open="${g.id}"><i data-lucide="external-link" class="w-4 h-4"></i></button></td>
                  </tr>`;
              }).join('')}
          </tbody>
        </table>
      </div>`;

  return `
    <div class="space-y-4">
      <div>
        <h1 class="text-2xl font-bold">Browse International Grants</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">${list.length} of ${activeGrants().length} grants displayed.</p>
      </div>
      ${filterBar()}
      ${body}
      <div class="flex items-center justify-between flex-wrap gap-2 mt-2">
        <p class="text-xs text-slate-500">Page ${state.filters.page} of ${totalPages}</p>
        <div class="flex gap-1">
          <button class="btn btn-secondary text-xs" id="page-prev" ${state.filters.page<=1?'disabled':''}><i data-lucide="chevron-left" class="w-4 h-4"></i>Prev</button>
          <button class="btn btn-secondary text-xs" id="page-next" ${state.filters.page>=totalPages?'disabled':''}>Next<i data-lucide="chevron-right" class="w-4 h-4"></i></button>
        </div>
      </div>
    </div>`;
}
