/**
 * Activity log — admin-only audit trail.
 * Insert is allowed only for the signed-in user inserting their own row
 * (RLS policy in 02_policies.sql). Read is admin-only.
 */

import { supabase } from '../supabaseClient.js';
import { state } from '../store.js';

export async function logActivity(action, detail, grantId = null) {
  if (!state.user) return; // anonymous browsing doesn't log
  const { error } = await supabase.from('activity_log').insert({
    user_id:    state.user.id,
    user_email: state.user.email,
    action,
    detail,
    grant_id:   grantId
  });
  if (error) console.warn('[activity] insert', error.message);
}

export async function listActivity(limit = 200) {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
