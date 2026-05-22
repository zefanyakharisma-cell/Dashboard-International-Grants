import { esc } from '../helpers.js';
import { archivedGrants } from '../filters.js';

export function adminArchiveView() {
  const list = archivedGrants();
  return `
    <div class="space-y-4">
      <h1 class="text-2xl font-bold">Archived Grants</h1>
      <div class="card scroll-x">
        <table class="tbl">
          <thead><tr><th>Title</th><th>Deadline</th><th>Actions</th></tr></thead>
          <tbody>
            ${list.length === 0 ? `<tr><td colspan="3" class="text-center text-slate-500 py-8">No archived grants.</td></tr>` :
            list.map(g => `
              <tr>
                <td>${esc(g.title)}</td>
                <td>${esc(g.deadline||'')}</td>
                <td>
                  <button class="btn btn-ghost text-xs" data-archive="${g.id}"><i data-lucide="archive-restore" class="w-4 h-4"></i>Restore</button>
                  <button class="btn btn-ghost text-xs text-rose-600" data-delete="${g.id}"><i data-lucide="trash-2" class="w-4 h-4"></i>Delete</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}
