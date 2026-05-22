/**
 * Bookmarks are kept in localStorage for guests (current behaviour),
 * and optionally synced to the database for signed-in users.
 */

import { supabase } from '../supabaseClient.js';
import { state } from '../store.js';

export async function listRemoteBookmarks() {
  if (!state.user) return [];
  const { data, error } = await supabase
    .from('bookmarks')
    .select('grant_id')
    .eq('user_id', state.user.id);
  if (error) { console.warn(error.message); return []; }
  return data.map(r => r.grant_id);
}

export async function addRemoteBookmark(grantId) {
  if (!state.user) return;
  await supabase.from('bookmarks').upsert({ user_id: state.user.id, grant_id: grantId });
}

export async function removeRemoteBookmark(grantId) {
  if (!state.user) return;
  await supabase.from('bookmarks').delete().match({ user_id: state.user.id, grant_id: grantId });
}
