import { esc, parseDate } from '../helpers.js';
import { state, facultyById } from '../../store.js';
import { activeGrants } from '../filters.js';
import { grantCardHTML } from '../components.js';

export function matchingView() {
  const p = state.profile;
  const facOpts = state.faculties.map(f =>
    `<option value="${f.id}" ${p.facultyId===f.id?'selected':''}>${esc(f.name)}</option>`
  ).join('');
  const progOpts = (() => {
    const fac = facultyById(p.facultyId);
    if (!fac) return '';
    return fac.programs.map(pr =>
      `<option value="${pr.id}" ${p.programId===pr.id?'selected':''}>${esc(pr.name)}</option>`
    ).join('');
  })();

  const matching = activeGrants().filter(g => {
    if (!p.facultyId) return false;
    if ((g.facultyIds||[]).includes(p.facultyId)) {
      if (p.programId && (g.programIds||[]).length) {
        return g.programIds.includes(p.programId);
      }
      return true;
    }
    return false;
  }).sort((a,b) => parseDate(a.deadline) - parseDate(b.deadline));

  return `
    <div class="space-y-4">
      <div>
        <h1 class="text-2xl font-bold">Grant Matching</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Choose your academic unit and get matched with the most relevant grants.</p>
      </div>
      <div class="card p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-semibold text-slate-500 mb-1 block">Faculty</label>
            <select class="select" id="profile-faculty"><option value="">— Select —</option>${facOpts}</select>
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-500 mb-1 block">Program (optional)</label>
            <select class="select" id="profile-program" ${!p.facultyId?'disabled':''}><option value="">— Any program in faculty —</option>${progOpts}</select>
          </div>
        </div>
      </div>

      ${p.facultyId ? `
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Recommended for you</h2>
          <span class="chip">${matching.length} matched</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          ${matching.length === 0
            ? `<div class="card p-8 text-center text-slate-500 col-span-full">No matches yet. Try a different program.</div>`
            : matching.map(grantCardHTML).join('')}
        </div>
      ` : `<div class="card p-8 text-center text-slate-500">Select your faculty to see recommended grants.</div>`}
    </div>`;
}
