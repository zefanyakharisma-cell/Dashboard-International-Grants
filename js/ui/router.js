/**
 * Hash router. Routes are registered as { name → (params) => htmlString }.
 *
 * Admin routes (name starts with 'admin' or name === 'login' uses different logic)
 * are auth-guarded: if no signed-in admin, redirected to #login.
 */

import { $, $$, refreshIcons } from './helpers.js';
import { state } from '../store.js';
import { isAdmin } from '../auth.js';

const routes = {};

export function route(name, handler) { routes[name] = handler; }

export function currentRoute() {
  const raw = location.hash.replace(/^#/, '') || 'dashboard';
  const [name, ...rest] = raw.split('/');
  return { name, params: rest };
}

export function navigate(hash) {
  if (location.hash !== `#${hash}`) location.hash = hash;
  else render();
}

export function render() {
  const r = currentRoute();
  const handler = routes[r.name] || routes['dashboard'];

  // Auth guard: admin-* routes require signed-in admin
  if (r.name.startsWith('admin') && !isAdmin()) { navigate('login'); return; }

  $$('.nav-link').forEach(a => a.classList.toggle('active', a.dataset.route === r.name));

  const view = $('#view');
  view.classList.remove('fade-in'); void view.offsetWidth; view.classList.add('fade-in');
  view.innerHTML = handler(r.params);
  refreshIcons();

  // Allow each view to register a post-render hook (e.g. mount charts)
  if (typeof window.__afterRender === 'function') window.__afterRender(r);
}

export function initRouter() {
  window.addEventListener('hashchange', render);
}
