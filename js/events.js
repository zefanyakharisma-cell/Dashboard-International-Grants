/**
 * Global click/change/submit handlers — uses event delegation so a single
 * handler covers content that is re-rendered by the router.
 */

import { $, $$, esc } from './ui/helpers.js';
import { state, persistBookmarks, persistProfile, persistFilters, persistTheme } from './store.js';
import { isAdmin, signIn, signOut } from './auth.js';
import { setArchived, deleteGrant } from './api/grants.js';
import { logActivity } from './api/activity.js';
import { addRemoteBookmark, removeRemoteBookmark } from './api/bookmarks.js';
import { toast } from './ui/toast.js';
import { renderNotifPanel, refreshNotifBadge } from './ui/notifications.js';
import { openGrant, closeGrant } from './ui/grant-detail.js';
import { openGrantForm } from './ui/grant-form.js';
import { updateAuthUI } from './ui/auth-ui.js';
import { navigate, render } from './ui/router.js';
import { applyFilters, activeGrants } from './ui/filters.js';
import { grantStatus } from './ui/helpers.js';

function exportCSV() {
  const cols = ['id','title','organization','country','category','currency','amount','deadline','status','website','contactEmail'];
  const list = applyFilters(activeGrants());
  const rows = [cols.join(',')];
  list.forEach(g => {
    const status = grantStatus(g);
    const r = cols.map(c => {
      const v = c === 'status' ? status : g[c];
      return `"${String(v ?? '').replace(/"/g,'""')}"`;
    });
    rows.push(r.join(','));
  });
  const blob = new Blob([rows.join('\n')], { type:'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `petra-grants-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  toast('CSV exported', 'success');
}

export function attachGlobalEvents() {
  document.addEventListener('click', async (e) => {
    // Nav links
    const nav = e.target.closest('.nav-link');
    if (nav && nav.dataset.route) {
      e.preventDefault();
      navigate(nav.dataset.route);
      $('#sidebar').classList.add('-translate-x-full');
      $('#sidebar-backdrop').classList.add('hidden');
      return;
    }

    // Grant detail open
    const openTrigger = e.target.closest('[data-grant], [data-grant-open]');
    if (openTrigger
        && !e.target.closest('.bookmark-btn')
        && !e.target.closest('[data-edit]')
        && !e.target.closest('[data-archive]')
        && !e.target.closest('[data-delete]')) {
      const id = openTrigger.dataset.grant || openTrigger.dataset.grantOpen;
      if (id) { openGrant(id); return; }
    }

    if (e.target.closest('#close-modal'))          { closeGrant(); return; }
    if (e.target === $('#grant-modal'))            { closeGrant(); return; }
    if (e.target === $('#grant-form-modal'))       { $('#grant-form-modal').classList.add('hidden'); return; }

    // Bookmark
    const bm = e.target.closest('.bookmark-btn, [data-bookmark]');
    if (bm) {
      e.stopPropagation();
      const id = bm.dataset.id || bm.dataset.bookmark;
      if (state.bookmarks.has(id)) {
        state.bookmarks.delete(id);
        await removeRemoteBookmark(id).catch(() => {});
        toast('Bookmark removed', 'success');
      } else {
        state.bookmarks.add(id);
        await addRemoteBookmark(id).catch(() => {});
        toast('Bookmarked', 'success');
      }
      persistBookmarks();
      if (location.hash.startsWith('#favorites')) render();
      else if (!$('#grant-modal').classList.contains('hidden')) openGrant(id);
      else render();
      return;
    }

    // View toggle
    const viewBtn = e.target.closest('[data-view]');
    if (viewBtn) { state.filters.view = viewBtn.dataset.view; persistFilters(); render(); return; }

    // Reset filters
    if (e.target.closest('#reset-filters')) {
      Object.assign(state.filters, { q:'', faculty:'', program:'', degree:'', country:'', category:'', status:'', sort:'deadline-asc', page:1 });
      $('#global-search').value = '';
      persistFilters(); render(); return;
    }

    // Export
    if (e.target.closest('#export-csv')) { exportCSV(); return; }

    // Pagination
    if (e.target.closest('#page-prev')) { state.filters.page = Math.max(1, state.filters.page-1); persistFilters(); render(); return; }
    if (e.target.closest('#page-next')) { state.filters.page += 1; persistFilters(); render(); return; }

    // Admin actions
    const edit = e.target.closest('[data-edit]');
    if (edit && isAdmin()) { e.stopPropagation(); openGrantForm(edit.dataset.edit); return; }

    const arch = e.target.closest('[data-archive]');
    if (arch && isAdmin()) {
      const id = arch.dataset.archive;
      const g = state.grants.find(x => x.id === id);
      if (!g) return;
      try {
        const next = await setArchived(id, !g.archived);
        await logActivity(next.archived ? 'archive' : 'restore', `${next.archived?'Archived':'Restored'} "${next.title}"`, id);
        toast(next.archived ? 'Grant archived' : 'Grant restored', 'success');
      } catch (err) { toast(err.message || 'Failed', 'error'); }
      return;
    }

    const del = e.target.closest('[data-delete]');
    if (del && isAdmin()) {
      const id = del.dataset.delete;
      const g = state.grants.find(x => x.id === id);
      if (g && confirm(`Delete "${g.title}" permanently?`)) {
        try {
          await deleteGrant(id);
          await logActivity('delete', `Deleted "${g.title}"`, null);
          toast('Grant deleted', 'success');
        } catch (err) { toast(err.message || 'Delete failed', 'error'); }
      }
      return;
    }

    if (e.target.closest('#new-grant-btn')) { openGrantForm(); return; }

    // Faculty/program shortcut filter
    const filterFac = e.target.closest('[data-filter-faculty]');
    if (filterFac) { state.filters.faculty = filterFac.dataset.filterFaculty; state.filters.page=1; persistFilters(); navigate('grants'); return; }
    const filterProg = e.target.closest('[data-filter-program]');
    if (filterProg) { state.filters.program = filterProg.dataset.filterProgram; state.filters.page=1; persistFilters(); navigate('grants'); return; }

    // Theme toggle
    if (e.target.closest('#theme-toggle')) {
      const next = document.documentElement.classList.toggle('dark') ? 'dark' : 'light';
      persistTheme(next);
      if (location.hash.includes('analytics')) window.__renderAnalyticsCharts?.();
      if (location.hash === '' || location.hash === '#dashboard') window.__renderDashboardCharts?.();
      return;
    }

    // Notif panel
    if (e.target.closest('#notif-btn')) {
      const panel = $('#notif-panel');
      panel.classList.toggle('hidden');
      if (!panel.classList.contains('hidden')) renderNotifPanel();
      return;
    }
    if (!e.target.closest('#notif-panel') && !e.target.closest('#notif-btn')) {
      $('#notif-panel')?.classList.add('hidden');
    }

    // Sidebar (mobile)
    if (e.target.closest('#sidebar-toggle')) {
      $('#sidebar').classList.toggle('-translate-x-full');
      $('#sidebar-backdrop').classList.toggle('hidden');
      return;
    }
    if (e.target.closest('#sidebar-backdrop')) {
      $('#sidebar').classList.add('-translate-x-full');
      $('#sidebar-backdrop').classList.add('hidden');
      return;
    }

    // Logout
    if (e.target.closest('#logout-btn')) {
      await logActivity('logout', `Signed out`).catch(()=>{});
      await signOut();
      updateAuthUI();
      toast('Signed out', 'success');
      navigate('dashboard');
      return;
    }
  });

  // Filter selects
  document.addEventListener('change', (e) => {
    const sel = e.target.closest('[data-filter]');
    if (sel) {
      const key = sel.dataset.filter;
      state.filters[key] = sel.value;
      if (key === 'faculty') state.filters.program = '';
      state.filters.page = 1;
      persistFilters();
      render();
      return;
    }
    if (e.target.id === 'profile-faculty') {
      state.profile.facultyId = e.target.value;
      state.profile.programId = '';
      persistProfile();
      render(); return;
    }
    if (e.target.id === 'profile-program') {
      state.profile.programId = e.target.value;
      persistProfile();
      render(); return;
    }
  });

  // Global search
  const search = $('#global-search');
  if (search) {
    search.addEventListener('input', (e) => {
      state.filters.q = e.target.value;
      state.filters.page = 1;
      persistFilters();
      const box = $('#search-suggestions');
      const q = e.target.value.trim().toLowerCase();
      if (!q) { box.classList.add('hidden'); }
      else {
        const matches = activeGrants()
          .filter(g => g.title.toLowerCase().includes(q) || g.organization.toLowerCase().includes(q))
          .slice(0,6);
        box.innerHTML = matches.length ? matches.map(g => `
          <button class="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm" data-grant="${g.id}">
            <span class="font-medium">${esc(g.title)}</span>
            <span class="block text-xs text-slate-500">${esc(g.organization)} · ${esc(g.country)}</span>
          </button>`).join('') : `<div class="px-3 py-2 text-sm text-slate-500">No matches</div>`;
        box.classList.remove('hidden');
      }
      if (location.hash.startsWith('#grants') || location.hash === '' || location.hash === '#dashboard') render();
    });
    search.addEventListener('blur', () => setTimeout(() => $('#search-suggestions').classList.add('hidden'), 150));
    search.addEventListener('focus', (e) => { if (e.target.value) $('#search-suggestions').classList.remove('hidden'); });
  }

  // Login form submit (Supabase Auth)
  document.addEventListener('submit', async (e) => {
    if (e.target.id !== 'login-form') return;
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = String(fd.get('email')).trim();
    const password = String(fd.get('password'));
    try {
      const user = await signIn(email, password);
      await logActivity('login', `Signed in`);
      toast(`Welcome, ${user.fullName || user.email}`, 'success');
      updateAuthUI();
      refreshNotifBadge();
      navigate(isAdmin() ? 'admin' : 'dashboard');
    } catch (err) {
      toast(err.message || 'Invalid credentials', 'error');
    }
  });
}
