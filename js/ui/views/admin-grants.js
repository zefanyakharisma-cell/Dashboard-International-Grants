import { esc, grantStatus, statusChip } from '../helpers.js';
import { state, facultyById } from '../../store.js';
import { applyFilters, filterBar } from '../filters.js';

export function adminGrantsView() {
  const list = applyFilters(state.grants); // includes archived
  return `
    <div class="space-y-4">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold">Manage Grants</h1>
          <p class="text-sm text-slate-500">${list.length} grants (including archived)</p>
        </div>
        <button class="btn btn-primary" id="new-grant-btn"><i data-lucide="plus"></i>Add grant</button>
      </div>
      ${filterBar()}
      <div class="card scroll-x">
        <table class="tbl">
          <thead><tr><th>Title</th><th>Country</th><th>Category</th><th>Deadline</th><th>Status</th><th>Eligible</th><th>Actions</th></tr></thead>
          <tbody>
            ${list.length === 0 ? `<tr><td colspan="7" class="text-center text-slate-500 py-8">No grants.</td></tr>` :
            list.map(g => {
              const facs = (g.facultyIds||[]).map(id => facultyById(id)?.name).filter(Boolean);
              const facsText = facs.length === state.faculties.length ? 'All faculties' : facs.slice(0,2).join(', ') + (facs.length>2?` +${facs.length-2}`:'');
              return `
                <tr>
                  <td>
                    <p class="font-medium">${esc(g.title)}</p>
                    <p class="text-xs text-slate-500">${esc(g.organization)}</p>
                  </td>
                  <td>${esc(g.country)}</td>
                  <td><span class="chip">${esc(g.category)}</span></td>
                  <td>${esc(g.deadline||'')}</td>
                  <td>${statusChip(grantStatus(g))} ${g.archived?'<span class="chip">Archived</span>':''}</td>
                  <td class="text-xs">${esc(facsText)}</td>
                  <td class="whitespace-nowrap">
                    <button class="btn btn-ghost text-xs" data-edit="${g.id}" title="Edit"><i data-lucide="pencil" class="w-4 h-4"></i></button>
                    <button class="btn btn-ghost text-xs" data-archive="${g.id}" title="${g.archived?'Restore':'Archive'}"><i data-lucide="${g.archived?'archive-restore':'archive'}" class="w-4 h-4"></i></button>
                    <button class="btn btn-ghost text-xs text-rose-600" data-delete="${g.id}" title="Delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}
