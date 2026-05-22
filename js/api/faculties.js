/**
 * Faculties + nested programs.
 * Returns the shape the rest of the app already expects:
 *   [{ id, name, programs: [{ id, name, degree }] }]
 */

import { supabase } from '../supabaseClient.js';

export async function listFacultiesWithPrograms() {
  const [{ data: faculties, error: e1 }, { data: programs, error: e2 }] = await Promise.all([
    supabase.from('faculties').select('id, name').order('name'),
    supabase.from('programs').select('id, faculty_id, name, degree').order('name')
  ]);
  if (e1) throw e1;
  if (e2) throw e2;

  const byFaculty = new Map(faculties.map(f => [f.id, { id: f.id, name: f.name, programs: [] }]));
  for (const p of programs) {
    const f = byFaculty.get(p.faculty_id);
    if (f) f.programs.push({ id: p.id, name: p.name, degree: p.degree });
  }
  return Array.from(byFaculty.values());
}
