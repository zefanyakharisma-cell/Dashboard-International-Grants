import { state } from '../../store.js';
import { grantCardHTML } from '../components.js';

export function favoritesView() {
  const list = state.grants.filter(g => state.bookmarks.has(g.id));
  return `
    <div class="space-y-4">
      <div>
        <h1 class="text-2xl font-bold">My Bookmarks</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Grants you've saved for later.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        ${list.length === 0
          ? `<div class="card p-8 text-center text-slate-500 col-span-full">No bookmarks yet. Tap the bookmark icon on a grant card.</div>`
          : list.map(grantCardHTML).join('')}
      </div>
    </div>`;
}
