-- ============================================================
-- Seed data — faculties, programs, categories, sample grants
-- Run AFTER 02_policies.sql
-- Idempotent: safe to re-run.
-- ============================================================

-- Faculties
insert into public.faculties (id, name) values
  ('fcep',  'Faculty of Civil Engineering and Planning'),
  ('fit',   'Faculty of Industrial Technology'),
  ('sbm',   'School of Business and Management'),
  ('fhci',  'Faculty of Humanities and Creative Industries'),
  ('fdent', 'Faculty of Dentistry'),
  ('fmed',  'Faculty of Medicine'),
  ('fte',   'Faculty of Teacher Education')
on conflict (id) do update set name = excluded.name;

-- Programs
insert into public.programs (id, faculty_id, name, degree) values
  -- FCEP
  ('ce',    'fcep', 'Civil Engineering', 'Undergraduate'),
  ('arch',  'fcep', 'Architecture', 'Undergraduate'),
  ('ashre', 'fcep', 'Architecture of Sustainable Housing and Real Estate', 'Undergraduate'),
  ('mce',   'fcep', 'Master''s Program in Civil Engineering', 'Master''s'),
  ('march', 'fcep', 'Master''s Program in Architecture', 'Master''s'),
  ('dce',   'fcep', 'Doctoral Program in Civil Engineering', 'Doctoral'),
  -- FIT
  ('ee',    'fit',  'Electrical Engineering', 'Undergraduate'),
  ('iot',   'fit',  'Internet of Things', 'Undergraduate'),
  ('smed',  'fit',  'Sustainable Mechanical Engineering and Design', 'Undergraduate'),
  ('auto',  'fit',  'Automotive', 'Undergraduate'),
  ('ie',    'fit',  'Industrial Engineering', 'Undergraduate'),
  ('glsc',  'fit',  'Global Logistics and Supply Chain', 'Undergraduate'),
  ('ibe',   'fit',  'International Business Engineering', 'Undergraduate'),
  ('inf',   'fit',  'Informatics', 'Undergraduate'),
  ('bis',   'fit',  'Business Information System', 'Undergraduate'),
  ('dsa',   'fit',  'Data Science and Analytics', 'Undergraduate'),
  ('ft',    'fit',  'Food Technology', 'Undergraduate'),
  ('ai',    'fit',  'Artificial Intelligence', 'Undergraduate'),
  ('mie',   'fit',  'Master''s Program in Industrial Engineering', 'Master''s'),
  ('epe',   'fit',  'Engineer Profession Education', 'Professional'),
  -- SBM
  ('ct',    'sbm',  'Creative Tourism', 'Undergraduate'),
  ('hm',    'sbm',  'Hotel Management', 'Undergraduate'),
  ('fi',    'sbm',  'Finance and Investment', 'Undergraduate'),
  ('bdm',   'sbm',  'Branding & Digital Marketing', 'Undergraduate'),
  ('bm',    'sbm',  'Business Management', 'Undergraduate'),
  ('cbm',   'sbm',  'Culinary Business Management', 'Undergraduate'),
  ('ba',    'sbm',  'Business Accounting', 'Undergraduate'),
  ('ta',    'sbm',  'Tax Accounting', 'Undergraduate'),
  ('rbm',   'sbm',  'Retail Business Management', 'Undergraduate'),
  ('dbt',   'sbm',  'Digital Business Transformation', 'Undergraduate'),
  ('iba',   'sbm',  'International Business Accounting', 'Undergraduate'),
  ('itf',   'sbm',  'International Trade & Finance', 'Undergraduate'),
  ('ibm',   'sbm',  'International Business Management', 'Undergraduate'),
  ('idaf',  'sbm',  'International Digital Accounting & Fraud', 'Undergraduate'),
  ('mm',    'sbm',  'Master''s Program in Management', 'Master''s'),
  ('dlm',   'sbm',  'Doctoral Program in Leadership & Management', 'Doctoral'),
  -- FHCI
  ('eci',   'fhci', 'English for Creative Industry', 'Undergraduate'),
  ('eb',    'fhci', 'English for Business', 'Undergraduate'),
  ('chi',   'fhci', 'Chinese', 'Undergraduate'),
  ('indes', 'fhci', 'Interior Design', 'Undergraduate'),
  ('ipdm',  'fhci', 'International Program in Digital Media', 'Undergraduate'),
  ('tfd',   'fhci', 'Textile and Fashion Design', 'Undergraduate'),
  ('vcd',   'fhci', 'Visual Communication Design', 'Undergraduate'),
  ('sc',    'fhci', 'Strategic Communication', 'Undergraduate'),
  ('cmc',   'fhci', 'Creative Media Communication', 'Undergraduate'),
  ('imi',   'fhci', 'Interactive Media & Imagineering', 'Undergraduate'),
  ('mall',  'fhci', 'Master''s Program in Applied Literature & Language', 'Master''s'),
  ('msc',   'fhci', 'Master''s Program in Scriptwriting & Copywriting', 'Master''s'),
  ('md',    'fhci', 'Master''s Program in Design', 'Master''s'),
  -- FDENT
  ('dm',    'fdent','Dental Medicine', 'Undergraduate'),
  ('dpe',   'fdent','Dentist Professional Education', 'Professional'),
  -- FMED
  ('med',   'fmed', 'Medicine', 'Undergraduate'),
  ('mdpe',  'fmed', 'Medical Doctor Professional Education', 'Professional'),
  -- FTE
  ('ete',   'fte',  'Elementary Teacher Education', 'Undergraduate'),
  ('ecte',  'fte',  'Early Childhood Teacher Education', 'Undergraduate')
on conflict (id) do update set name = excluded.name, faculty_id = excluded.faculty_id, degree = excluded.degree;

-- Categories
insert into public.categories (name) values
  ('Research Grants'),
  ('Student Exchange Funding'),
  ('Lecturer Mobility Grants'),
  ('Innovation Grants'),
  ('Sustainability Grants'),
  ('Startup Grants'),
  ('Scholarship Collaboration Grants'),
  ('Community Development Grants')
on conflict (name) do nothing;

-- Sample grants (only seed if table is empty so we never overwrite real data)
insert into public.grants
  (title, organization, country, category, amount, currency, amount_note, deadline,
   description, eligibility, website, contact_email, tags, attachments,
   faculty_ids, program_ids, degree_levels, archived)
select * from (values
  ('DAAD Research Grants for Doctoral Programmes in Germany','German Academic Exchange Service (DAAD)','Germany','Research Grants',1200,'EUR','Monthly stipend + travel allowance','2026-07-31'::date,
   'Doctoral research grants for international scholars pursuing PhDs at German universities and research institutes across all disciplines.',
   'Master''s degree holders under age 36. Strong academic record. Research proposal aligned with German host institution.',
   'https://www.daad.de','info@daad.de',
   array['PhD','Research','Germany','Mobility'],
   '[{"name":"DAAD-Guidelines-2026.pdf","url":"#"}]'::jsonb,
   array['fcep','fit','fhci','sbm'], array[]::text[], array['Doctoral','Master''s'], false),
  ('Fulbright Foreign Student Program','U.S. Department of State / AMINEF','United States','Scholarship Collaboration Grants',50000,'USD','Full tuition, living stipend, travel, insurance','2026-06-15'::date,
   'Fully funded Master''s and PhD scholarships for outstanding Indonesian graduates to study at accredited U.S. universities.',
   'Indonesian citizens, minimum GPA 3.0, strong leadership profile, TOEFL iBT 80+.',
   'https://www.aminef.or.id','infofulbright_ind@aminef.or.id',
   array['USA','Master''s','PhD','Scholarship'],
   '[{"name":"Fulbright-Application-Guide.pdf","url":"#"}]'::jsonb,
   array['fcep','fit','sbm','fhci','fdent','fmed','fte'], array[]::text[], array['Master''s','Doctoral'], false),
  ('Erasmus+ International Credit Mobility','European Commission','European Union','Student Exchange Funding',850,'EUR','Monthly grant + travel','2026-05-30'::date,
   'Semester-long exchange programs at partner universities across the EU for undergraduate and master''s students.',
   'Enrolled at Petra, minimum GPA 3.25, English proficiency, second-year undergraduate or above.',
   'https://erasmus-plus.ec.europa.eu','erasmus@petra.ac.id',
   array['Europe','Exchange','Mobility'], '[]'::jsonb,
   array['fcep','fit','sbm','fhci'], array[]::text[], array['Undergraduate','Master''s'], false),
  ('Google AI for Social Good — APAC Research Award','Google Research','Singapore','Innovation Grants',80000,'USD','Per project, 12 months','2026-05-25'::date,
   'Funding for AI research projects addressing social, environmental and humanitarian challenges in the Asia-Pacific region.',
   'Faculty researchers and graduate students. Project proposal in AI, ML, NLP, or computer vision applied to social impact.',
   'https://research.google/programs','ai-research@google.com',
   array['AI','Machine Learning','Innovation','APAC'], '[]'::jsonb,
   array['fit'], array['inf','ai','dsa','bis'], array['Undergraduate','Master''s','Doctoral'], false),
  ('MEXT Japanese Government Scholarship','Ministry of Education, Culture, Sports, Science and Technology (Japan)','Japan','Scholarship Collaboration Grants',1430000,'JPY','Yen/month + tuition + travel','2026-06-10'::date,
   'Full scholarship to study at Japanese universities for undergraduate, master''s and doctoral programs.',
   'Indonesian nationals under age 35. Strong academic record. Japanese or English proficiency.',
   'https://www.id.emb-japan.go.jp','scholarship@su.mofa.go.jp',
   array['Japan','Full Scholarship','MEXT'],
   '[{"name":"MEXT-2026-Guidelines.pdf","url":"#"}]'::jsonb,
   array['fcep','fit','sbm','fhci','fdent','fmed','fte'], array[]::text[], array['Undergraduate','Master''s','Doctoral'], false),
  ('Newton Fund — UK-Indonesia Joint Research','British Council & Kemendikbud','United Kingdom','Research Grants',75000,'GBP','Per project, up to 24 months','2026-05-27'::date,
   'Joint research funding between UK and Indonesian institutions in sustainability, health, and innovation.',
   'Faculty members with active UK collaborator. Project lifecycle no more than 24 months.',
   'https://www.britishcouncil.id','newtonfund@britishcouncil.org',
   array['UK','Research','Sustainability','Health'], '[]'::jsonb,
   array['fcep','fit','fmed','fdent'], array[]::text[], array['Master''s','Doctoral'], false),
  ('Australia Awards Scholarships','Government of Australia','Australia','Scholarship Collaboration Grants',60000,'AUD','Full tuition + living + travel','2026-05-28'::date,
   'Long-term scholarship for Master''s and PhD studies at Australian universities, particularly in development priority areas.',
   'Indonesian citizens. Strong academic record. IELTS 6.5+ or equivalent.',
   'https://www.australiaawardsindonesia.org','info@australiaawardsindonesia.org',
   array['Australia','Master''s','PhD'], '[]'::jsonb,
   array['fcep','fit','sbm','fhci','fmed','fdent','fte'], array[]::text[], array['Master''s','Doctoral'], false),
  ('ASEAN Youth Sustainability Innovation Grant','ASEAN Foundation','ASEAN','Sustainability Grants',15000,'USD','Per team','2026-05-24'::date,
   'Seed funding for youth-led innovation projects tackling climate change, biodiversity, and circular economy in ASEAN.',
   'Teams of 3-5 ASEAN students/young professionals (18-30). Project pitch + impact metrics required.',
   'https://www.aseanfoundation.org','info@aseanfoundation.org',
   array['Sustainability','ASEAN','Youth','Climate'], '[]'::jsonb,
   array['fcep','fit','sbm'], array[]::text[], array['Undergraduate','Master''s'], false),
  ('Hult Prize — Student Startup Challenge','Hult Prize Foundation','United Kingdom','Startup Grants',1000000,'USD','Grand prize for winning team','2026-06-30'::date,
   'Global startup competition with USD 1M seed funding for student-led ventures solving the world''s most pressing issues.',
   'Teams of 3-5 enrolled students. Business plan addressing global social challenge.',
   'https://www.hultprize.org','team@hultprize.org',
   array['Startup','Entrepreneurship','Competition'], '[]'::jsonb,
   array['sbm','fit','fhci'], array[]::text[], array['Undergraduate','Master''s'], false),
  ('Chevening Scholarships','UK Foreign, Commonwealth & Development Office','United Kingdom','Scholarship Collaboration Grants',45000,'GBP','Full tuition + stipend + travel','2026-11-05'::date,
   'Fully funded one-year Master''s scholarship at any UK university, awarded to emerging leaders.',
   'Indonesian citizens. 2+ years work experience. Bachelor''s degree. Leadership potential.',
   'https://www.chevening.org','indonesia@chevening.org',
   array['UK','Master''s','Leadership'], '[]'::jsonb,
   array['fcep','fit','sbm','fhci','fmed','fdent','fte'], array[]::text[], array['Master''s'], false)
) as t(title, organization, country, category, amount, currency, amount_note, deadline,
       description, eligibility, website, contact_email, tags, attachments,
       faculty_ids, program_ids, degree_levels, archived)
where not exists (select 1 from public.grants);

-- ============================================================
-- After running this file, create your first admin via the
-- Supabase Auth dashboard (Authentication → Users → Add user),
-- then run this snippet (replace the email) to promote them:
--
--   update public.profiles set role = 'admin'
--   where email = 'you@petra.ac.id';
-- ============================================================
