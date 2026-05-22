import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

if (!SUPABASE_URL || SUPABASE_URL.includes('YOUR-PROJECT-REF')) {
  console.error(
    '[Petra Grants] Supabase URL is not configured. Edit js/config.js and set ' +
    'SUPABASE_URL and SUPABASE_ANON_KEY from your Supabase project (Settings → API).'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  // All `.from()` and `.rpc()` calls default to this schema so app code stays
  // plain (`.from('grants')` rather than `.schema('petra_grants').from('grants')`).
  // Requires `petra_grants` to be added to Supabase → Settings → API → Exposed schemas.
  db: { schema: 'petra_grants' },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'pcu-grants-auth'
  },
  realtime: { params: { eventsPerSecond: 5 } }
});
