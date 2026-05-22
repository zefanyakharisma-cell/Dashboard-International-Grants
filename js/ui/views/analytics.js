import { state, allCountries } from '../../store.js';
import { activeGrants, archivedGrants } from '../filters.js';
import { statCard } from '../components.js';

export function analyticsView() {
  return `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold">Analytics</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Visual breakdown of the international grants portfolio.</p>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${statCard('globe-2','Total Grants', state.grants.length, 'bg-petra-100 text-petra-700')}
        ${statCard('check-circle-2','Active', activeGrants().length, 'bg-emerald-100 text-emerald-700')}
        ${statCard('archive','Archived', archivedGrants().length, 'bg-slate-200 text-slate-700')}
        ${statCard('flag','Countries', allCountries().length, 'bg-violet-100 text-violet-700')}
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="card p-4"><div class="section-title"><div><h2>By Country</h2></div></div><div class="h-72"><canvas id="ax-country"></canvas></div></div>
        <div class="card p-4"><div class="section-title"><div><h2>By Category</h2></div></div><div class="h-72"><canvas id="ax-category"></canvas></div></div>
        <div class="card p-4"><div class="section-title"><div><h2>Deadlines by Month</h2></div></div><div class="h-72"><canvas id="ax-timeline"></canvas></div></div>
        <div class="card p-4"><div class="section-title"><div><h2>Grants per Faculty</h2></div></div><div class="h-72"><canvas id="ax-faculty"></canvas></div></div>
      </div>
    </div>
    <script>window.__renderAnalyticsCharts && window.__renderAnalyticsCharts();</script>
  `;
}
