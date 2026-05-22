#!/usr/bin/env node
/**
 * Build-time generator that overwrites js/config.js with the values from
 * Vercel environment variables. This keeps real production credentials
 * out of the git repo while still shipping a static site (no runtime
 * server needed).
 *
 * Set on Vercel:
 *   SUPABASE_URL       = https://<ref>.supabase.co
 *   SUPABASE_ANON_KEY  = eyJhbGciOi...
 *
 * (Optional)
 *   APP_PAGE_SIZE         = 9
 *   APP_CLOSING_SOON_DAYS = 7
 *   APP_ATTACHMENTS_BUCKET= grant-attachments
 *
 * Runs locally too — `node scripts/inject-env.js` after exporting the vars.
 */

const fs = require('node:fs');
const path = require('node:path');

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missing = required.filter(k => !process.env[k]);

if (missing.length) {
  console.warn(
    `[inject-env] missing ${missing.join(', ')} — keeping existing js/config.js (this is fine for first deploy if you've committed your keys).`
  );
  process.exit(0);
}

const url    = process.env.SUPABASE_URL;
const anon   = process.env.SUPABASE_ANON_KEY;
const page   = parseInt(process.env.APP_PAGE_SIZE || '9', 10);
const close  = parseInt(process.env.APP_CLOSING_SOON_DAYS || '7', 10);
const bucket = process.env.APP_ATTACHMENTS_BUCKET || 'grant-attachments';

const out = `// AUTO-GENERATED at build time by scripts/inject-env.js — do not commit manual edits.
export const SUPABASE_URL      = ${JSON.stringify(url)};
export const SUPABASE_ANON_KEY = ${JSON.stringify(anon)};

export const APP_CONFIG = {
  name: 'Petra International Grants',
  organization: 'Universitas Kristen Petra',
  closingSoonDays: ${close},
  pageSize: ${page},
  attachmentsBucket: ${JSON.stringify(bucket)}
};
`;

const target = path.join(__dirname, '..', 'js', 'config.js');
fs.writeFileSync(target, out);
console.log(`[inject-env] wrote ${target}`);
