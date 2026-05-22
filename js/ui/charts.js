/**
 * Chart.js rendering for the Dashboard and Analytics views.
 * Exposed globally on window so the view templates can trigger them
 * after their HTML lands in the DOM.
 */

import { state } from '../store.js';
import { activeGrants } from './filters.js';
import { grantStatus } from './helpers.js';

const instances = {};
function destroy(key) { if (instances[key]) { instances[key].destroy(); delete instances[key]; } }

export function renderDashboardCharts() {
  const grants = activeGrants();
  const catCounts = {};
  grants.forEach(g => catCounts[g.category] = (catCounts[g.category]||0)+1);
  const catLabels = Object.keys(catCounts);

  destroy('cat');
  const catCtx = document.getElementById('chart-category');
  if (catCtx) instances.cat = new window.Chart(catCtx, {
    type: 'bar',
    data: { labels: catLabels, datasets: [{ label:'Grants', data: catLabels.map(k=>catCounts[k]), backgroundColor:'#3a6fea', borderRadius:6 }] },
    options: { plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true, ticks:{precision:0}}}, maintainAspectRatio:false }
  });

  const statusCounts = { Open:0, 'Closing Soon':0, Closed:0 };
  state.grants.forEach(g => statusCounts[grantStatus(g)]++);
  destroy('status');
  const stCtx = document.getElementById('chart-status');
  if (stCtx) instances.status = new window.Chart(stCtx, {
    type: 'doughnut',
    data: { labels: Object.keys(statusCounts), datasets:[{ data: Object.values(statusCounts), backgroundColor:['#16a34a','#f59e0b','#ef4444'] }] },
    options: { plugins:{legend:{position:'bottom'}}, maintainAspectRatio:false }
  });
}

export function renderAnalyticsCharts() {
  const grants = activeGrants();
  const countryCounts = {}; grants.forEach(g=>countryCounts[g.country]=(countryCounts[g.country]||0)+1);
  const catCounts = {};     grants.forEach(g=>catCounts[g.category]=(catCounts[g.category]||0)+1);
  const monthCounts = {};   grants.forEach(g => { const m = (g.deadline||'').slice(0,7); if (m) monthCounts[m]=(monthCounts[m]||0)+1; });
  const months = Object.keys(monthCounts).sort();
  const facCounts = state.faculties.map(f => ({ name:f.name, count: grants.filter(g=>(g.facultyIds||[]).includes(f.id)).length }));

  destroy('axc');
  const c1 = document.getElementById('ax-country');
  if (c1) instances.axc = new window.Chart(c1, {
    type:'bar',
    data:{ labels:Object.keys(countryCounts), datasets:[{label:'Grants', data:Object.values(countryCounts), backgroundColor:'#2553cf', borderRadius:6}] },
    options:{ indexAxis:'y', plugins:{legend:{display:false}}, maintainAspectRatio:false, scales:{x:{beginAtZero:true,ticks:{precision:0}}} }
  });

  destroy('axcat');
  const c2 = document.getElementById('ax-category');
  if (c2) instances.axcat = new window.Chart(c2, {
    type:'pie',
    data:{ labels:Object.keys(catCounts), datasets:[{ data:Object.values(catCounts), backgroundColor:['#3a6fea','#16a34a','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16'] }] },
    options:{ plugins:{legend:{position:'right', labels:{boxWidth:12}}}, maintainAspectRatio:false }
  });

  destroy('axtl');
  const c3 = document.getElementById('ax-timeline');
  if (c3) instances.axtl = new window.Chart(c3, {
    type:'line',
    data:{ labels:months, datasets:[{label:'Deadlines', data:months.map(m=>monthCounts[m]), borderColor:'#3a6fea', backgroundColor:'rgba(58,111,234,0.18)', fill:true, tension:.35 }] },
    options:{ plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,ticks:{precision:0}}}, maintainAspectRatio:false }
  });

  destroy('axf');
  const c4 = document.getElementById('ax-faculty');
  if (c4) instances.axf = new window.Chart(c4, {
    type:'bar',
    data:{ labels:facCounts.map(x=>x.name), datasets:[{label:'Grants', data:facCounts.map(x=>x.count), backgroundColor:'#1d3a82', borderRadius:6}] },
    options:{ indexAxis:'y', plugins:{legend:{display:false}}, maintainAspectRatio:false, scales:{x:{beginAtZero:true,ticks:{precision:0}}} }
  });
}

// Expose for view templates that trigger via inline <script>
window.__renderDashboardCharts = renderDashboardCharts;
window.__renderAnalyticsCharts = renderAnalyticsCharts;
