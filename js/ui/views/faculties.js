import { esc } from '../helpers.js';
import { state } from '../../store.js';
import { activeGrants } from '../filters.js';

export function facultiesView() {
  const fHTML = state.faculties.map(f => {
    const grants = activeGrants().filter(g => (g.facultyIds||[]).includes(f.id));
    const progLines = f.programs.map(p => {
      const matching = activeGrants().filter(g =>
        (g.programIds||[]).includes(p.id) || (g.facultyIds||[]).includes(f.id)
      ).length;
      return `<li class="flex items-center justify-between text-sm py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span><span class="text-slate-400 text-xs mr-2">${esc(p.degree)}</span>${esc(p.name)}</span>
                <a class="text-petra-600 hover:underline text-xs" href="#grants" data-filter-program="${p.id}">${matching} grants →</a>
              </li>`;
    }).join('');
    return `
      <div class="card p-5">
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-bold text-lg">${esc(f.name)}</h3>
            <p class="text-sm text-slate-500">${f.programs.length} programs · ${grants.length} grants available</p>
          </div>
          <a class="btn btn-secondary text-xs" href="#grants" data-filter-faculty="${f.id}"><i data-lucide="filter"></i>View grants</a>
        </div>
        <details class="group" open>
          <summary class="cursor-pointer text-xs font-semibold text-slate-500 hover:text-petra-700">Show programs</summary>
          <ul class="mt-2">${progLines}</ul>
        </details>
      </div>`;
  }).join('');

  return `
    <div class="space-y-4">
      <div>
        <h1 class="text-2xl font-bold">Faculties & Programs</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Browse grants by Petra Christian University's academic units.</p>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">${fHTML}</div>
    </div>`;
}
