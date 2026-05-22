/**
 * File uploads for grant attachments.
 *
 * Uses the Supabase Storage bucket configured in APP_CONFIG.attachmentsBucket.
 * The bucket must be PUBLIC (or signed URLs must be generated) and the
 * RLS policies in supabase/README.md must be in place.
 */

import { supabase } from '../supabaseClient.js';
import { APP_CONFIG } from '../config.js';

export async function uploadAttachment(file) {
  if (!file) return null;
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${Date.now()}-${safe}`;
  const { error } = await supabase.storage
    .from(APP_CONFIG.attachmentsBucket)
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(APP_CONFIG.attachmentsBucket).getPublicUrl(path);
  return { name: file.name, url: data.publicUrl, path };
}

export async function deleteAttachment(path) {
  if (!path) return;
  const { error } = await supabase.storage.from(APP_CONFIG.attachmentsBucket).remove([path]);
  if (error) throw error;
}
