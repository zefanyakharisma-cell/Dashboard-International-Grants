/**
 * Grants CRUD.
 *
 * The DB row uses snake_case columns; the rest of the app expects
 * camelCase. fromRow / toRow normalize at the boundary so view code
 * stays the same shape it had in the prototype.
 */

import { supabase } from '../supabaseClient.js';

export function fromRow(r) {
  if (!r) return null;
  return {
    id:            r.id,
    title:         r.title,
    organization:  r.organization,
    country:       r.country,
    category:      r.category,
    amount:        Number(r.amount) || 0,
    currency:      r.currency,
    amountNote:    r.amount_note || '',
    deadline:      r.deadline,         // ISO date string (YYYY-MM-DD)
    description:   r.description || '',
    eligibility:   r.eligibility || '',
    website:       r.website || '',
    contactEmail:  r.contact_email || '',
    tags:          r.tags || [],
    attachments:   r.attachments || [],
    facultyIds:    r.faculty_ids || [],
    programIds:    r.program_ids || [],
    degreeLevels:  r.degree_levels || [],
    archived:      !!r.archived,
    createdBy:     r.created_by,
    createdAt:     r.created_at ? r.created_at.slice(0,10) : null,
    updatedAt:     r.updated_at
  };
}

export function toRow(g) {
  return {
    title:         g.title,
    organization:  g.organization,
    country:       g.country,
    category:      g.category,
    amount:        g.amount || 0,
    currency:      g.currency || 'USD',
    amount_note:   g.amountNote || '',
    deadline:      g.deadline || null,
    description:   g.description || '',
    eligibility:   g.eligibility || '',
    website:       g.website || '',
    contact_email: g.contactEmail || '',
    tags:          g.tags || [],
    attachments:   g.attachments || [],
    faculty_ids:   g.facultyIds || [],
    program_ids:   g.programIds || [],
    degree_levels: g.degreeLevels || [],
    archived:      !!g.archived
  };
}

export async function listGrants() {
  const { data, error } = await supabase
    .from('grants')
    .select('*')
    .order('deadline', { ascending: true });
  if (error) throw error;
  return data.map(fromRow);
}

export async function getGrant(id) {
  const { data, error } = await supabase.from('grants').select('*').eq('id', id).single();
  if (error) throw error;
  return fromRow(data);
}

export async function createGrant(grant) {
  const { data, error } = await supabase
    .from('grants')
    .insert(toRow(grant))
    .select('*')
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateGrant(id, grant) {
  const { data, error } = await supabase
    .from('grants')
    .update(toRow(grant))
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteGrant(id) {
  const { error } = await supabase.from('grants').delete().eq('id', id);
  if (error) throw error;
}

export async function setArchived(id, archived) {
  const { data, error } = await supabase
    .from('grants')
    .update({ archived })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return fromRow(data);
}

/**
 * Server-side auto-archive of grants whose deadline has passed.
 * Safe to call on app boot — RLS will silently no-op for non-admins.
 */
export async function autoArchiveExpired() {
  const today = new Date().toISOString().slice(0, 10);
  const { error } = await supabase
    .from('grants')
    .update({ archived: true })
    .lt('deadline', today)
    .eq('archived', false);
  if (error && error.code !== '42501') console.warn('[grants] auto-archive', error.message);
}
