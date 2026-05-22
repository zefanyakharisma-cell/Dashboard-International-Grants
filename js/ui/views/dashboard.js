import { esc, fmt, daysUntil, parseDate, grantStatus, statusChip } from '../helpers.js';
import { state } from '../../store.js';
import { activeGrants } from '../filters.js';
import { statCard } from '../components.js';

export function dashboardView() {
  const grants = activeGrants();
  const closing = grants.filter(g => grantStatus(g) === 'Closing Soon');
  const totalFunding = grants.reduce((s, g) => s + (g.amount || 0), 0);
  const upcoming = [...grants].sort((a, b) => parseDate(a.deadline) - parseDate(b.deadline)).slice(0, 5);
  const recent = [...grants].sort((a, b) => String(b.createdAt||'').localeCompare(String(a.createdAt||''))).slice(0, 4);

  return `
    <div class="space-y-6">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold">Welcome to Petra International Grants</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">Discover global funding opportunities tailored to Petra Christian University faculties and programs.</p>
        </div>
        <a class="btn btn-primary" href="#grants"><i data-lucide="globe-2"></i>Browse all grants</a>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${statCard('globe-2','Active Grants', grants.length, 'bg-emerald-100 text-emerald-700')}
        ${statCard('timer','Closing Soon', closing.length, 'bg-amber-100 text-amber-700')}
        ${statCard('graduation-cap','Faculties Served', state.faculties.length, 'bg-petra-100 text-petra-700')}
        ${statCard('wallet','Total Funding (sum)', `~${fmt.format(totalFunding)}`, 'bg-violet-100 text-violet-700')}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="card p-4 lg:col-span-2">
          <div class="section-title"><div><h2>Grants by Category</h2><p>Active programmes only</p></div></div>
          <div class="h-64"><canvas id="chart-category"></canvas></div>
        </div>
        <div class="card p-4">
          <div class="section-title"><div><h2>Grants by Status</h2><p>Real-time</p></div></div>
          <div class="h-64"><canvas id="chart-status"></canvas></div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="card p-4 lg:col-span-2">
          <div class="section-title">
            <div><h2>Upcoming Deadlines</h2><p>Soonest first</p></div>
            <a class="text-sm text-petra-600 hover:underline" href="#calendar">Open calendar →</a>
          </div>
          <div class="space-y-2">
            ${upcoming.map(g => {
              const d = daysUntil(g.deadline);
              const tone = d<=7?'text-amber-600':d<0?'text-rose-600':'text-emerald-600';
              return `
                <div class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer" data-grant="${g.id}">
                  <div class="min-w-0">
                    <p class="font-semibold truncate">${esc(g.title)}</p>
                    <p class="text-xs text-slate-500 truncate">${esc(g.organization)} · ${esc(g.country)}</p>
                  </div>
                  <div class="text-right text-xs whitespace-nowrap">
                    <p class="text-slate-500">${esc(g.deadline||'')}</p>
                    <p class="${tone} countdown">${d===null?'':d<0?'Expired':d+' days'}</p>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>

        <div class="card p-4">
          <div class="section-title"><div><h2>Recently Added</h2><p>Latest opportunities</p></div></div>
          <div class="space-y-3">
            ${recent.map(g => `
              <div class="flex items-start gap-3 cursor-pointer" data-grant="${g.id}">
                <div class="w-9 h-9 rounded-lg bg-petra-100 text-petra-700 grid place-items-center"><i data-lucide="sparkles" class="w-4 h-4"></i></div>
                <div class="min-w-0">
                  <p class="font-semibold text-sm truncate">${esc(g.title)}</p>
                  <p class="text-xs text-slate-500 truncate">${esc(g.country)} · ${esc(g.category)}</p>
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>
    <script>window.__renderDashboardCharts && window.__renderDashboardCharts();</script>
  `;
}
