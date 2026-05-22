import { supabase } from '../supabaseClient.js';

export async function listCategories() {
  const { data, error } = await supabase.from('categories').select('name').order('name');
  if (error) throw error;
  return data.map(c => c.name);
}

export async function createCategory(name) {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name })
    .select('name')
    .single();
  if (error) throw error;
  return data.name;
}

export async function deleteCategory(name) {
  const { error } = await supabase.from('categories').delete().eq('name', name);
  if (error) throw error;
}
