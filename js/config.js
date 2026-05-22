/**
 * Supabase configuration.
 *
 * Replace the two values below with the ones from your Supabase project:
 *   Project settings → API → "Project URL" and "anon" public key.
 *
 * The anon key is SAFE to commit — Row Level Security policies enforce
 * all access control. NEVER put the `service_role` key here.
 *
 * For Vercel: set SUPABASE_URL and SUPABASE_ANON_KEY as project env vars
 * and the `vercel-build` script (see vercel.json) will overwrite this file
 * at build time so you don't have to commit production credentials.
 */
export const SUPABASE_URL      = 'https://xrzwjwaaayeoizmabchj.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_QznNbgBFWibdv6eDosc2jQ_ZjwJMu8g';

export const APP_CONFIG = {
  name: 'Petra International Grants',
  organization: 'Universitas Kristen Petra',
  // Days-until-deadline threshold at which a grant is flagged "Closing Soon"
  closingSoonDays: 7,
  // Page size for the public grants browser
  pageSize: 9,
  // Storage bucket name (must match what you created in Supabase Storage)
  attachmentsBucket: 'grant-attachments'
};
