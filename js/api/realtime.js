/**
 * Realtime subscription to the petra_grants.grants table.
 *
 * Patches `state.grants` in place on INSERT/UPDATE/DELETE so the public
 * dashboard re-renders the moment an admin changes anything (without
 * any page refresh).
 */

import { supabase } from '../supabaseClient.js';
import { state, notify } from '../store.js';
import { fromRow } from './grants.js';

let channel = null;

export function subscribeGrantsRealtime() {
  if (channel) return channel;

  channel = supabase
    .channel('petra_grants:grants')
    .on('postgres_changes',
      { event: '*', schema: 'petra_grants', table: 'grants' },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          state.grants = [fromRow(payload.new), ...state.grants];
        } else if (payload.eventType === 'UPDATE') {
          const next = fromRow(payload.new);
          state.grants = state.grants.map(g => g.id === next.id ? next : g);
        } else if (payload.eventType === 'DELETE') {
          state.grants = state.grants.filter(g => g.id !== payload.old.id);
        }
        notify();
      })
    .on('postgres_changes',
      { event: '*', schema: 'petra_grants', table: 'categories' },
      async () => {
        const { listCategories } = await import('./categories.js');
        try { state.categories = await listCategories(); notify(); } catch {}
      })
    .subscribe();

  return channel;
}

export function unsubscribeGrantsRealtime() {
  if (channel) { supabase.removeChannel(channel); channel = null; }
}
