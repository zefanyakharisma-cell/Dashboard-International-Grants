import { $, $$ } from './helpers.js';
import { state } from '../store.js';
import { isAdmin } from '../auth.js';

export function updateAuthUI() {
  const signedIn = !!state.user;
  const admin = isAdmin();
  $$('.admin-only').forEach(el => el.classList.toggle('hidden', !admin));
  $('#auth-link')?.classList.toggle('hidden', signedIn);
  $('#user-chip')?.classList.toggle('hidden', !signedIn);
  if (signedIn) {
    $('#user-name').textContent = state.user.fullName || state.user.email;
    $('#user-initials').textContent = (state.user.fullName || state.user.email || 'A').slice(0,1).toUpperCase();
  }
}
