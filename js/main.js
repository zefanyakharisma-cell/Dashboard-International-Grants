/**
 * Petra International Grants — entry point.
 *
 * 1. Boot the auth listener (re-renders when sign-in state changes)
 * 2. Fetch faculties, categories, grants from Supabase in parallel
 * 3. Subscribe to realtime updates on grants/categories
 * 4. Mount the router with all registered views
 * 5. Attach the global event delegate
 */

import { $, refreshIcons, daysUntil } from './ui/helpers.js';
import { state, subscribe, loadTheme } from './store.js';
import { initAuth } from './auth.js';
import { listGrants, autoArchiveExpired } from './api/grants.js';
import { listFacultiesWithPrograms } from './api/faculties.js';
import { listCategories } from './api/categories.js';
import { listRemoteBookmarks } from './api/bookmarks.js';
import { subscribeGrantsRealtime } from './api/realtime.js';

import { route, render, initRouter, navigate } from './ui/router.js';
import { attachGlobalEvents } from './events.js';
import { updateAuthUI } from './ui/auth-ui.js';
import { toast } from './ui/toast.js';
import { activeGrants } from './ui/filters.js';
import { refreshNotifBadge } from './ui/notifications.js';
import './ui/charts.js'; // installs window.__renderDashboardCharts / __renderAnalyticsCharts

// View handlers
import { dashboardView }      from './ui/views/dashboard.js';
import { grantsView }         from './ui/views/grants.js';
import { calendarView }       from './ui/views/calendar.js';
import { facultiesView }      from './ui/views/faculties.js';
import { matchingView }       from './ui/views/matching.js';
import { favoritesView }      from './ui/views/favorites.js';
import { analyticsView }      from './ui/views/analytics.js';
import { loginView }          from './ui/views/login.js';
import { adminView }          from './ui/views/admin.js';
import { adminGrantsView }    from './ui/views/admin-grants.js';
import { adminArchiveView }   from './ui/views/admin-archive.js';
import { adminActivityView }  from './ui/views/admin-activity.js';

// ------------------------------------------------------------
// Register routes
// ------------------------------------------------------------
route('dashboard',      dashboardView);
route('grants',         grantsView);
route('calendar',       calendarView);
route('faculties',      facultiesView);
route('matching',       matchingView);
route('favorites',      favoritesView);
route('analytics',      analyticsView);
route('login',          loginView);
route('admin',          adminView);
route('admin-grants',   adminGrantsView);
route('admin-archive',  adminArchiveView);
route('admin-activity', adminActivityView);

// ------------------------------------------------------------
// Boot
// ------------------------------------------------------------
async function boot() {
  // Theme + footer year
  document.documentElement.classList.toggle('dark', loadTheme() === 'dark');
  const yearEl = $('#footer-year'); if (yearEl) yearEl.textContent = new Date().getFullYear();
  refreshIcons();

  // Re-render whenever any module mutates state
  subscribe(() => {
    updateAuthUI();
    refreshNotifBadge();
    render();
  });

  // Set up router + global events first so the UI is interactive immediately
  initRouter();
  attachGlobalEvents();
  if (!location.hash) location.hash = 'dashboard';

  // Initial empty render (shows whatever's in state)
  render();

  // Hydrate auth session in the background (subscribe() will re-render on change)
  initAuth().catch(err => console.warn('[auth init]', err.message));

  // Load reference + grants data in parallel
  try {
    const [faculties, categories, grants] = await Promise.all([
      listFacultiesWithPrograms(),
      listCategories(),
      listGrants()
    ]);
    state.faculties = faculties;
    state.categories = categories;
    state.grants = grants;
    state.loading = { grants: false, faculties: false, categories: false };

    // If user is signed in, also pull their remote bookmarks
    if (state.user) {
      try {
        const remote = await listRemoteBookmarks();
        remote.forEach(id => state.bookmarks.add(id));
      } catch {}
    }

    // Quietly auto-archive expired grants (RLS will reject for non-admins, which is fine)
    autoArchiveExpired().catch(()=>{});

    render();
    refreshNotifBadge();

    // Closing-soon alert
    const closing = activeGrants().filter(g => { const d = daysUntil(g.deadline); return d!==null && d>=0 && d<=7; });
    if (closing.length) toast(`${closing.length} grant${closing.length===1?'':'s'} closing within 7 days`, 'warn');
  } catch (err) {
    console.error('[boot] data load failed', err);
    toast(`Could not connect to database — check js/config.js. (${err.message})`, 'error');
  }

  // Subscribe to live changes — UI updates the moment an admin saves
  subscribeGrantsRealtime();
}

document.addEventListener('DOMContentLoaded', boot);
