import { esc, grantStatus } from '../helpers.js';
import { state } from '../../store.js';
import { activeGrants, archivedGrants } from '../filters.js';
import { statCard } from '../components.js';

export function adminView() {
  const grants = state.grants;
  const closing = activeGrants().filter(g => grantStatus(g) === 'Closing Soon');
  const recent = [...grants].sort((a,b) => String(b.createdAt||'').localeCompare(String(a.createdAt||''))).slice(0, 5);
  const byFaculty = state.faculties.map(f => ({
    f, count: activeGrants().filter(g => (g.facultyIds||[]).includes(f.id)).length
  })).sort((a,b) => b.count - a.count);

  return `
    <div class="space-y-6">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold">Admin Console</h1>
          <p class="text-sm text-slate-500">Signed in as ${esc(state.user?.fullName || state.user?.email || '')}.</p>
        </div>
        <div class="flex gap-2">
          <a class="btn btn-secondary" href="#admin-grants"><i data-lucide="folder-cog"></i>Manage grants</a>
          <button class="btn btn-primary" id="new-grant-btn"><i data-lucide="plus"></i>Add grant</button>
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${statCard('database','Total Grants', grants.length, 'bg-petra-100 text-petra-700')}
        ${statCard('check-circle-2','Active', activeGrants().length, 'bg-emerald-100 text-emerald-700')}
        ${statCard('archive','Archived', archivedGrants().length, 'bg-slate-200 text-slate-700')}
        ${statCard('alarm-clock','Closing Soon', closing.length, 'bg-amber-100 text-amber-700')}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="card p-4">
          <div class="section-title"><div><h2>Faculty Participation</h2><p>Active grants per faculty</p></div></div>
          <div class="space-y-2">
            ${byFaculty.map(({f,count}) => `
              <div>
                <div class="flex items-center justify-between text-sm mb-1">
                  <span class="truncate">${esc(f.name)}</span><span class="font-semibold">${count}</span>
                </div>
                <div class="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-petra-600" style="width:${activeGrants().length?Math.min(100, count/Math.max(1,activeGrants().length)*100):0}%"></div>
                </div>
              </div>`).join('')}
          </div>
        </div>

        <div class="card p-4">
          <div class="section-title"><div><h2>Recently Added</h2></div></div>
          <table class="tbl">
            <thead><tr><th>Title</th><th>Created</th><th></th></tr></thead>
            <tbody>${recent.map(g => `
              <tr><td>${esc(g.title)}</td><td class="text-xs text-slate-500">${esc(g.createdAt||'-')}</td>
              <td><button class="btn btn-ghost text-xs" data-edit="${g.id}"><i data-lucide="pencil" class="w-4 h-4"></i></button></td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
}
