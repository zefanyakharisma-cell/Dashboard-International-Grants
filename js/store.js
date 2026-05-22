/**
 * In-memory application state.
 *
 * The DB is the source of truth — `state.grants`, `state.faculties`,
 * `state.categories` are simply caches refreshed from Supabase (and kept
 * live via realtime subscriptions).
 *
 * Use subscribe(callback) to re-render the view whenever state changes.
 */

import { APP_CONFIG } from './config.js';

const LS = {
  bookmarks: 'pcu_bookmarks',
  theme:     'pcu_theme',
  profile:   'pcu_profile',
  filters:   'pcu_filters'
};

function load(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export const state = {
  // Data (filled from Supabase)
  grants: [],
  faculties: [],     // [{ id, name, programs: [{id, name, degree}] }]
  categories: [],    // ['Research Grants', ...]

  // Auth
  user: null,        // { id, email, fullName, role }

  // Per-user UI state (kept in localStorage)
  bookmarks: new Set(load(LS.bookmarks, [])),
  profile:   load(LS.profile, { facultyId: '', programId: '' }),

  // Public dashboard filters
  filters: load(LS.filters, {
    q: '', faculty: '', program: '', degree: '', country: '',
    category: '', status: '', sort: 'deadline-asc', view: 'card',
    page: 1, perPage: APP_CONFIG.pageSize
  }),

  // Loading flags so views can show skeletons
  loading: { grants: true, faculties: true, categories: true },

  // For the activity-log view (admin only)
  activity: []
};

// ----- Subscriptions: minimal pub/sub for re-render -----
const listeners = new Set();
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function notify() { listeners.forEach(fn => { try { fn(); } catch (e) { console.error(e); } }); }

// ----- Persisting helpers -----
export function persistBookmarks() { save(LS.bookmarks, Array.from(state.bookmarks)); }
export function persistProfile()   { save(LS.profile, state.profile); }
export function persistFilters()   { save(LS.filters, state.filters); }
export function persistTheme(theme) { save(LS.theme, theme); }
export function loadTheme()        { return load(LS.theme, 'light'); }

// ----- Convenience lookups -----
export function facultyById(id) { return state.faculties.find(f => f.id === id); }
export function programById(id) {
  for (const f of state.faculties) {
    const p = f.programs.find(p => p.id === id);
    if (p) return { ...p, facultyId: f.id, facultyName: f.name };
  }
  return null;
}
export function allCountries() {
  return Array.from(new Set(state.grants.map(g => g.country).filter(Boolean))).sort();
}
export const ALL_DEGREES = ['Undergraduate', "Master's", 'Doctoral', 'Professional'];
