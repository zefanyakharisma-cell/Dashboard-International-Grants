import { esc } from '../helpers.js';
import { state } from '../../store.js';
import { listActivity } from '../../api/activity.js';
import { render } from '../router.js';

let lastFetch = 0;

export function adminActivityView() {
  // Refetch at most once every 5 seconds while the user stays on this view
  if (Date.now() - lastFetch > 5000) {
    lastFetch = Date.now();
    listActivity(200)
      .then(rows => { state.activity = rows; render(); })
      .catch(err => console.warn('[activity]', err.message));
  }

  return `
    <div class="space-y-4">
      <h1 class="text-2xl font-bold">Activity Log</h1>
      <p class="text-sm text-slate-500">Audit trail of admin actions on this database.</p>
      <div class="card scroll-x">
        <table class="tbl">
          <thead><tr><th>When</th><th>User</th><th>Action</th><th>Detail</th></tr></thead>
          <tbody>
            ${state.activity.length === 0 ? `<tr><td colspan="4" class="text-center text-slate-500 py-8">No activity yet.</td></tr>` :
            state.activity.map(a => `
              <tr>
                <td class="text-xs text-slate-500 whitespace-nowrap">${new Date(a.created_at).toLocaleString()}</td>
                <td>${esc(a.user_email || '-')}</td>
                <td><span class="chip">${esc(a.action)}</span></td>
                <td>${esc(a.detail || '')}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}
