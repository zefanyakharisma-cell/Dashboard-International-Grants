import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

if (!SUPABASE_URL || SUPABASE_URL.includes('YOUR-PROJECT-REF')) {
  console.error(
    '[Petra Grants] Supabase URL is not configured. Edit js/config.js and set ' +
    'SUPABASE_URL and SUPABASE_ANON_KEY from your Supabase project (Settings → API).'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'pcu-grants-auth'
  },
  realtime: { params: { eventsPerSecond: 5 } }
});
