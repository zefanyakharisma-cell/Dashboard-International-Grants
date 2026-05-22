/**
 * Filtering, sorting, and the shared filter-bar partial used by both
 * the public Browse Grants and admin Manage Grants views.
 */

import { state, facultyById, programById, allCountries, ALL_DEGREES } from '../store.js';
import { esc, parseDate, grantStatus } from './helpers.js';

export function applyFilters(list) {
  const f = state.filters;
  const q = f.q.trim().toLowerCase();
  let out = list.filter(g => {
    if (q) {
      const hay = [g.title, g.organization, g.country, g.category, g.description, (g.tags||[]).join(' ')].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (f.faculty && !(g.facultyIds || []).includes(f.faculty)) return false;
    if (f.program) {
      const p = programById(f.program);
      const match = p && ((g.programIds || []).includes(f.program) || (g.facultyIds || []).includes(p.facultyId));
      if (!match) return false;
    }
    if (f.degree && !(g.degreeLevels || []).includes(f.degree)) return false;
    if (f.country && g.country !== f.country) return false;
    if (f.category && g.category !== f.category) return false;
    if (f.status && grantStatus(g) !== f.status) return false;
    return true;
  });

  const sorters = {
    'deadline-asc' : (a,b) => parseDate(a.deadline) - parseDate(b.deadline),
    'deadline-desc': (a,b) => parseDate(b.deadline) - parseDate(a.deadline),
    'amount-desc'  : (a,b) => (b.amount||0) - (a.amount||0),
    'amount-asc'   : (a,b) => (a.amount||0) - (b.amount||0),
    'title-asc'    : (a,b) => a.title.localeCompare(b.title),
    'recent'       : (a,b) => String(b.createdAt||'').localeCompare(String(a.createdAt||''))
  };
  return out.sort(sorters[f.sort] || sorters['deadline-asc']);
}

export function activeGrants()   { return state.grants.filter(g => !g.archived); }
export function archivedGrants() { return state.grants.filter(g =>  g.archived); }

export function filterBar() {
  const f = state.filters;
  const faculties = state.faculties
    .map(x => `<option value="${x.id}" ${f.faculty===x.id?'selected':''}>${esc(x.name)}</option>`).join('');

  const programs = (() => {
    const source = f.faculty ? [facultyById(f.faculty)].filter(Boolean) : state.faculties;
    return source.flatMap(x => x.programs.map(p =>
      `<option value="${p.id}" ${f.program===p.id?'selected':''}>${esc(p.name)}</option>`)).join('');
  })();

  const countries = allCountries()
    .map(c => `<option value="${esc(c)}" ${f.country===c?'selected':''}>${esc(c)}</option>`).join('');
  const cats = state.categories
    .map(c => `<option value="${esc(c)}" ${f.category===c?'selected':''}>${esc(c)}</option>`).join('');
  const degrees = ALL_DEGREES
    .map(d => `<option value="${esc(d)}" ${f.degree===d?'selected':''}>${esc(d)}</option>`).join('');

  return `
    <div class="card p-4 mb-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
        <select class="select" data-filter="faculty"><option value="">All Faculties</option>${faculties}</select>
        <select class="select" data-filter="program"><option value="">All Programs</option>${programs}</select>
        <select class="select" data-filter="degree"><option value="">All Degrees</option>${degrees}</select>
        <select class="select" data-filter="country"><option value="">All Countries</option>${countries}</select>
        <select class="select" data-filter="category"><option value="">All Categories</option>${cats}</select>
        <select class="select" data-filter="status">
          <option value="">All Statuses</option>
          <option value="Open" ${f.status==='Open'?'selected':''}>Open</option>
          <option value="Closing Soon" ${f.status==='Closing Soon'?'selected':''}>Closing Soon</option>
          <option value="Closed" ${f.status==='Closed'?'selected':''}>Closed</option>
        </select>
        <select class="select" data-filter="sort">
          <option value="deadline-asc"  ${f.sort==='deadline-asc'?'selected':''}>Deadline ↑</option>
          <option value="deadline-desc" ${f.sort==='deadline-desc'?'selected':''}>Deadline ↓</option>
          <option value="amount-desc"   ${f.sort==='amount-desc'?'selected':''}>Amount ↓</option>
          <option value="amount-asc"    ${f.sort==='amount-asc'?'selected':''}>Amount ↑</option>
          <option value="title-asc"     ${f.sort==='title-asc'?'selected':''}>Title A–Z</option>
          <option value="recent"        ${f.sort==='recent'?'selected':''}>Recently added</option>
        </select>
      </div>
      <div class="flex flex-wrap items-center gap-2 mt-3">
        <button class="btn btn-secondary text-xs" id="reset-filters"><i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>Reset</button>
        <div class="ml-auto flex items-center gap-1 text-xs">
          <span class="text-slate-500">View:</span>
          <button class="btn btn-ghost ${f.view==='card'?'!text-petra-700 !bg-petra-50 dark:!bg-petra-900/20':''}" data-view="card"><i data-lucide="grid-3x3"></i></button>
          <button class="btn btn-ghost ${f.view==='table'?'!text-petra-700 !bg-petra-50 dark:!bg-petra-900/20':''}" data-view="table"><i data-lucide="table-2"></i></button>
          <button class="btn btn-ghost" id="export-csv" title="Export visible to CSV"><i data-lucide="download"></i></button>
        </div>
      </div>
    </div>`;
}
