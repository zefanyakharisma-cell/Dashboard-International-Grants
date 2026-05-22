/**
 * Authentication wrapper around Supabase Auth.
 *
 * Exports:
 *   - signIn(email, password)
 *   - signOut()
 *   - onAuthChange(cb)  → invoked with the hydrated user (or null)
 *   - getCurrentUser()  → current cached user object
 *
 * A "user" here is { id, email, fullName, role }. The role comes
 * from public.profiles which is auto-created by a Postgres trigger.
 */

import { supabase } from './supabaseClient.js';
import { state, notify } from './store.js';

async function fetchProfile(authUser) {
  if (!authUser) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', authUser.id)
    .single();

  if (error) {
    console.warn('[auth] failed to load profile', error.message);
    return { id: authUser.id, email: authUser.email, fullName: authUser.email, role: 'viewer' };
  }
  return {
    id: data.id,
    email: data.email || authUser.email,
    fullName: data.full_name || authUser.email,
    role: data.role || 'viewer'
  };
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  state.user = await fetchProfile(data.user);
  notify();
  return state.user;
}

export async function signOut() {
  await supabase.auth.signOut();
  state.user = null;
  notify();
}

export function getCurrentUser() { return state.user; }

export function isAdmin() {
  return state.user?.role === 'admin';
}

/**
 * Hydrate state.user from the existing session (if any) and subscribe
 * to future auth state changes (sign-in / sign-out / token refresh).
 */
export async function initAuth(onChange) {
  const { data: { session } } = await supabase.auth.getSession();
  state.user = await fetchProfile(session?.user || null);
  onChange?.(state.user);
  notify();

  supabase.auth.onAuthStateChange(async (_event, session) => {
    state.user = await fetchProfile(session?.user || null);
    onChange?.(state.user);
    notify();
  });
}
