/* ============================================================
 * Petra International Grants Dashboard — main.js
 * Self-contained SPA: router, auth, CRUD, charts, search, filter.
 * Works from file:// because the seed is inline; localStorage
 * provides write-through persistence over the seed.
 * ============================================================ */

(() => {
  'use strict';

  /* -----------------------------------------------------------
   *  INLINE SEED — mirrors data/database.json so the app runs
   *  without a backend or fetch. Edit the JSON file too if you
   *  want both kept in sync as schema documentation.
   * --------------------------------------------------------- */
  const SEED = {
    users: [
      {
        id: 'u1',
        username: 'admin',
        name: 'Petra International Office',
        email: 'international@petra.ac.id',
        role: 'admin',
        // sha256("admin")
        passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'
      }
    ],
    faculties: [
      { id: 'fcep', name: 'Faculty of Civil Engineering and Planning', programs: [
        { id: 'ce', name: 'Civil Engineering', degree: 'Undergraduate' },
        { id: 'arch', name: 'Architecture', degree: 'Undergraduate' },
        { id: 'ashre', name: 'Architecture of Sustainable Housing and Real Estate', degree: 'Undergraduate' },
        { id: 'mce', name: "Master's Program in Civil Engineering", degree: "Master's" },
        { id: 'march', name: "Master's Program in Architecture", degree: "Master's" },
        { id: 'dce', name: 'Doctoral Program in Civil Engineering', degree: 'Doctoral' }
      ]},
      { id: 'fit', name: 'Faculty of Industrial Technology', programs: [
        { id: 'ee', name: 'Electrical Engineering', degree: 'Undergraduate' },
        { id: 'iot', name: 'Internet of Things', degree: 'Undergraduate' },
        { id: 'smed', name: 'Sustainable Mechanical Engineering and Design', degree: 'Undergraduate' },
        { id: 'auto', name: 'Automotive', degree: 'Undergraduate' },
        { id: 'ie', name: 'Industrial Engineering', degree: 'Undergraduate' },
        { id: 'glsc', name: 'Global Logistics and Supply Chain', degree: 'Undergraduate' },
        { id: 'ibe', name: 'International Business Engineering', degree: 'Undergraduate' },
        { id: 'inf', name: 'Informatics', degree: 'Undergraduate' },
        { id: 'bis', name: 'Business Information System', degree: 'Undergraduate' },
        { id: 'dsa', name: 'Data Science and Analytics', degree: 'Undergraduate' },
        { id: 'ft', name: 'Food Technology', degree: 'Undergraduate' },
        { id: 'ai', name: 'Artificial Intelligence', degree: 'Undergraduate' },
        { id: 'mie', name: "Master's Program in Industrial Engineering", degree: "Master's" },
        { id: 'epe', name: 'Engineer Profession Education', degree: 'Professional' }
      ]},
      { id: 'sbm', name: 'School of Business and Management', programs: [
        { id: 'ct', name: 'Creative Tourism', degree: 'Undergraduate' },
        { id: 'hm', name: 'Hotel Management', degree: 'Undergraduate' },
        { id: 'fi', name: 'Finance and Investment', degree: 'Undergraduate' },
        { id: 'bdm', name: 'Branding & Digital Marketing', degree: 'Undergraduate' },
        { id: 'bm', name: 'Business Management', degree: 'Undergraduate' },
        { id: 'cbm', name: 'Culinary Business Management', degree: 'Undergraduate' },
        { id: 'ba', name: 'Business Accounting', degree: 'Undergraduate' },
        { id: 'ta', name: 'Tax Accounting', degree: 'Undergraduate' },
        { id: 'rbm', name: 'Retail Business Management', degree: 'Undergraduate' },
        { id: 'dbt', name: 'Digital Business Transformation', degree: 'Undergraduate' },
        { id: 'iba', name: 'International Business Accounting', degree: 'Undergraduate' },
        { id: 'itf', name: 'International Trade & Finance', degree: 'Undergraduate' },
        { id: 'ibm', name: 'International Business Management', degree: 'Undergraduate' },
        { id: 'idaf', name: 'International Digital Accounting & Fraud', degree: 'Undergraduate' },
        { id: 'mm', name: "Master's Program in Management", degree: "Master's" },
        { id: 'dlm', name: 'Doctoral Program in Leadership & Management', degree: 'Doctoral' }
      ]},
      { id: 'fhci', name: 'Faculty of Humanities and Creative Industries', programs: [
        { id: 'eci', name: 'English for Creative Industry', degree: 'Undergraduate' },
        { id: 'eb', name: 'English for Business', degree: 'Undergraduate' },
        { id: 'chi', name: 'Chinese', degree: 'Undergraduate' },
        { id: 'indes', name: 'Interior Design', degree: 'Undergraduate' },
        { id: 'ipdm', name: 'International Program in Digital Media', degree: 'Undergraduate' },
        { id: 'tfd', name: 'Textile and Fashion Design', degree: 'Undergraduate' },
        { id: 'vcd', name: 'Visual Communication Design', degree: 'Undergraduate' },
        { id: 'sc', name: 'Strategic Communication', degree: 'Undergraduate' },
        { id: 'cmc', name: 'Creative Media Communication', degree: 'Undergraduate' },
        { id: 'imi', name: 'Interactive Media & Imagineering', degree: 'Undergraduate' },
        { id: 'mall', name: "Master's Program in Applied Literature & Language", degree: "Master's" },
        { id: 'msc', name: "Master's Program in Scriptwriting & Copywriting", degree: "Master's" },
        { id: 'md', name: "Master's Program in Design", degree: "Master's" }
      ]},
      { id: 'fdent', name: 'Faculty of Dentistry', programs: [
        { id: 'dm', name: 'Dental Medicine', degree: 'Undergraduate' },
        { id: 'dpe', name: 'Dentist Professional Education', degree: 'Professional' }
      ]},
      { id: 'fmed', name: 'Faculty of Medicine', programs: [
        { id: 'med', name: 'Medicine', degree: 'Undergraduate' },
        { id: 'mdpe', name: 'Medical Doctor Professional Education', degree: 'Professional' }
      ]},
      { id: 'fte', name: 'Faculty of Teacher Education', programs: [
        { id: 'ete', name: 'Elementary Teacher Education', degree: 'Undergraduate' },
        { id: 'ecte', name: 'Early Childhood Teacher Education', degree: 'Undergraduate' }
      ]}
    ],
    categories: [
      'Research Grants',
      'Student Exchange Funding',
      'Lecturer Mobility Grants',
      'Innovation Grants',
      'Sustainability Grants',
      'Startup Grants',
      'Scholarship Collaboration Grants',
      'Community Development Grants'
    ],
    grants: [
      { id:'g1', title:'DAAD Research Grants for Doctoral Programmes in Germany', organization:'German Academic Exchange Service (DAAD)', country:'Germany', category:'Research Grants', amount:1200, currency:'EUR', amountNote:'Monthly stipend + travel allowance', deadline:'2026-07-31', description:'Doctoral research grants for international scholars pursuing PhDs at German universities and research institutes across all disciplines.', eligibility:"Master's degree holders under age 36. Strong academic record. Research proposal aligned with German host institution.", website:'https://www.daad.de', contactEmail:'info@daad.de', tags:['PhD','Research','Germany','Mobility'], attachments:[{name:'DAAD-Guidelines-2026.pdf',url:'#'}], facultyIds:['fcep','fit','fhci','sbm'], programIds:[], degreeLevels:['Doctoral',"Master's"], archived:false, createdAt:'2026-04-10' },
      { id:'g2', title:'Fulbright Foreign Student Program', organization:'U.S. Department of State / AMINEF', country:'United States', category:'Scholarship Collaboration Grants', amount:50000, currency:'USD', amountNote:'Full tuition, living stipend, travel, insurance', deadline:'2026-06-15', description:"Fully funded Master's and PhD scholarships for outstanding Indonesian graduates to study at accredited U.S. universities.", eligibility:'Indonesian citizens, minimum GPA 3.0, strong leadership profile, TOEFL iBT 80+.', website:'https://www.aminef.or.id', contactEmail:'infofulbright_ind@aminef.or.id', tags:['USA',"Master's",'PhD','Scholarship'], attachments:[{name:'Fulbright-Application-Guide.pdf',url:'#'}], facultyIds:['fcep','fit','sbm','fhci','fdent','fmed','fte'], programIds:[], degreeLevels:["Master's",'Doctoral'], archived:false, createdAt:'2026-03-15' },
      { id:'g3', title:'Erasmus+ International Credit Mobility', organization:'European Commission', country:'European Union', category:'Student Exchange Funding', amount:850, currency:'EUR', amountNote:'Monthly grant + travel', deadline:'2026-05-30', description:"Semester-long exchange programs at partner universities across the EU for undergraduate and master's students.", eligibility:'Enrolled at Petra, minimum GPA 3.25, English proficiency, second-year undergraduate or above.', website:'https://erasmus-plus.ec.europa.eu', contactEmail:'erasmus@petra.ac.id', tags:['Europe','Exchange','Mobility'], attachments:[], facultyIds:['fcep','fit','sbm','fhci'], programIds:[], degreeLevels:['Undergraduate',"Master's"], archived:false, createdAt:'2026-02-01' },
      { id:'g4', title:'Google AI for Social Good — APAC Research Award', organization:'Google Research', country:'Singapore', category:'Innovation Grants', amount:80000, currency:'USD', amountNote:'Per project, 12 months', deadline:'2026-05-25', description:'Funding for AI research projects addressing social, environmental and humanitarian challenges in the Asia-Pacific region.', eligibility:'Faculty researchers and graduate students. Project proposal in AI, ML, NLP, or computer vision applied to social impact.', website:'https://research.google/programs', contactEmail:'ai-research@google.com', tags:['AI','Machine Learning','Innovation','APAC'], attachments:[], facultyIds:['fit'], programIds:['inf','ai','dsa','bis'], degreeLevels:['Undergraduate',"Master's",'Doctoral'], archived:false, createdAt:'2026-03-20' },
      { id:'g5', title:'MEXT Japanese Government Scholarship', organization:'Ministry of Education, Culture, Sports, Science and Technology (Japan)', country:'Japan', category:'Scholarship Collaboration Grants', amount:1430000, currency:'JPY', amountNote:'Yen/month + tuition + travel', deadline:'2026-06-10', description:"Full scholarship to study at Japanese universities for undergraduate, master's and doctoral programs.", eligibility:'Indonesian nationals under age 35. Strong academic record. Japanese or English proficiency.', website:'https://www.id.emb-japan.go.jp', contactEmail:'scholarship@su.mofa.go.jp', tags:['Japan','Full Scholarship','MEXT'], attachments:[{name:'MEXT-2026-Guidelines.pdf',url:'#'}], facultyIds:['fcep','fit','sbm','fhci','fdent','fmed','fte'], programIds:[], degreeLevels:['Undergraduate',"Master's",'Doctoral'], archived:false, createdAt:'2026-02-20' },
      { id:'g6', title:'Newton Fund — UK-Indonesia Joint Research', organization:'British Council & Kemendikbud', country:'United Kingdom', category:'Research Grants', amount:75000, currency:'GBP', amountNote:'Per project, up to 24 months', deadline:'2026-05-27', description:'Joint research funding between UK and Indonesian institutions in sustainability, health, and innovation.', eligibility:'Faculty members with active UK collaborator. Project lifecycle ≤ 24 months.', website:'https://www.britishcouncil.id', contactEmail:'newtonfund@britishcouncil.org', tags:['UK','Research','Sustainability','Health'], attachments:[], facultyIds:['fcep','fit','fmed','fdent'], programIds:[], degreeLevels:["Master's",'Doctoral'], archived:false, createdAt:'2026-04-01' },
      { id:'g7', title:'Australia Awards Scholarships', organization:'Government of Australia', country:'Australia', category:'Scholarship Collaboration Grants', amount:60000, currency:'AUD', amountNote:'Full tuition + living + travel', deadline:'2026-05-28', description:"Long-term scholarship for Master's and PhD studies at Australian universities, particularly in development priority areas.", eligibility:'Indonesian citizens. Strong academic record. IELTS 6.5+ or equivalent.', website:'https://www.australiaawardsindonesia.org', contactEmail:'info@australiaawardsindonesia.org', tags:['Australia',"Master's",'PhD'], attachments:[], facultyIds:['fcep','fit','sbm','fhci','fmed','fdent','fte'], programIds:[], degreeLevels:["Master's",'Doctoral'], archived:false, createdAt:'2026-03-05' },
      { id:'g8', title:'ASEAN Youth Sustainability Innovation Grant', organization:'ASEAN Foundation', country:'ASEAN', category:'Sustainability Grants', amount:15000, currency:'USD', amountNote:'Per team', deadline:'2026-05-24', description:'Seed funding for youth-led innovation projects tackling climate change, biodiversity, and circular economy in ASEAN.', eligibility:'Teams of 3-5 ASEAN students/young professionals (18-30). Project pitch + impact metrics required.', website:'https://www.aseanfoundation.org', contactEmail:'info@aseanfoundation.org', tags:['Sustainability','ASEAN','Youth','Climate'], attachments:[], facultyIds:['fcep','fit','sbm'], programIds:[], degreeLevels:['Undergraduate',"Master's"], archived:false, createdAt:'2026-04-22' },
      { id:'g9', title:'Hult Prize — Student Startup Challenge', organization:'Hult Prize Foundation', country:'United Kingdom', category:'Startup Grants', amount:1000000, currency:'USD', amountNote:'Grand prize for winning team', deadline:'2026-06-30', description:"Global startup competition with USD 1M seed funding for student-led ventures solving the world's most pressing issues.", eligibility:'Teams of 3-5 enrolled students. Business plan addressing global social challenge.', website:'https://www.hultprize.org', contactEmail:'team@hultprize.org', tags:['Startup','Entrepreneurship','Competition'], attachments:[], facultyIds:['sbm','fit','fhci'], programIds:[], degreeLevels:['Undergraduate',"Master's"], archived:false, createdAt:'2026-03-25' },
      { id:'g10', title:'Chevening Scholarships', organization:'UK Foreign, Commonwealth & Development Office', country:'United Kingdom', category:'Scholarship Collaboration Grants', amount:45000, currency:'GBP', amountNote:'Full tuition + stipend + travel', deadline:'2026-11-05', description:"Fully funded one-year Master's scholarship at any UK university, awarded to emerging leaders.", eligibility:"Indonesian citizens. 2+ years work experience. Bachelor's degree. Leadership potential.", website:'https://www.chevening.org', contactEmail:'indonesia@chevening.org', tags:['UK',"Master's",'Leadership'], attachments:[], facultyIds:['fcep','fit','sbm','fhci','fmed','fdent','fte'], programIds:[], degreeLevels:["Master's"], archived:false, createdAt:'2026-04-15' },
      { id:'g11', title:'WHO–TDR Postgraduate Training Grants', organization:'World Health Organization', country:'Switzerland', category:'Research Grants', amount:30000, currency:'CHF', amountNote:'Per scholar', deadline:'2026-06-20', description:'Postgraduate research training in implementation research for infectious diseases of poverty.', eligibility:'Health professionals from low- and middle-income countries. Medicine, public health, dentistry background.', website:'https://tdr.who.int', contactEmail:'tdr@who.int', tags:['Health','WHO','Research','Public Health'], attachments:[], facultyIds:['fmed','fdent'], programIds:[], degreeLevels:["Master's",'Doctoral','Professional'], archived:false, createdAt:'2026-04-05' },
      { id:'g12', title:'Adobe Creative Residency', organization:'Adobe Inc.', country:'United States', category:'Innovation Grants', amount:50000, currency:'USD', amountNote:'Stipend for 1-year residency', deadline:'2026-05-23', description:'Year-long residency for emerging creators in design, illustration, photography, and video.', eligibility:'Designers, illustrators, photographers. Strong portfolio. Independent creative practice.', website:'https://creativeresidency.adobe.com', contactEmail:'residency@adobe.com', tags:['Design','Creative','Residency'], attachments:[], facultyIds:['fhci'], programIds:['vcd','indes','tfd','ipdm','cmc'], degreeLevels:['Undergraduate',"Master's"], archived:false, createdAt:'2026-04-18' },
      { id:'g13', title:'Lecturer Mobility Program — NTU Singapore', organization:'Nanyang Technological University', country:'Singapore', category:'Lecturer Mobility Grants', amount:8000, currency:'SGD', amountNote:'1-month visiting fellowship', deadline:'2026-06-25', description:'Visiting fellowship for Petra lecturers to collaborate with NTU research groups in engineering and business.', eligibility:'Petra faculty members with PhD. Active research record. NTU host required.', website:'https://www.ntu.edu.sg', contactEmail:'visiting@ntu.edu.sg', tags:['Lecturer','Mobility','Singapore'], attachments:[], facultyIds:['fit','sbm','fcep'], programIds:[], degreeLevels:['Doctoral'], archived:false, createdAt:'2026-04-12' },
      { id:'g14', title:'UNESCO Community Development Microgrants', organization:'UNESCO Jakarta Office', country:'Indonesia / Global', category:'Community Development Grants', amount:10000, currency:'USD', amountNote:'Per community project', deadline:'2026-07-15', description:'Microgrants for university-led community development initiatives in education, culture, and heritage.', eligibility:'Petra-led project. Local community partner required. Sustainability plan.', website:'https://www.unesco.org/en/jakarta', contactEmail:'jakarta@unesco.org', tags:['Community','UNESCO','Education'], attachments:[], facultyIds:['fhci','fte','sbm'], programIds:[], degreeLevels:['Undergraduate',"Master's"], archived:false, createdAt:'2026-04-25' },
      { id:'g15', title:'ITRI Taiwan Smart Manufacturing Internship', organization:'Industrial Technology Research Institute, Taiwan', country:'Taiwan', category:'Student Exchange Funding', amount:2000, currency:'USD', amountNote:'Monthly stipend + housing', deadline:'2026-06-08', description:'Industry internship at ITRI for engineering students in smart manufacturing, IoT, and Industry 4.0.', eligibility:'Engineering students, GPA 3.0+, intermediate English. Available for 3-6 months.', website:'https://www.itri.org.tw', contactEmail:'internship@itri.org.tw', tags:['Taiwan','Internship','Industry 4.0','IoT'], attachments:[], facultyIds:['fit'], programIds:['ee','iot','smed','auto','ie','inf','ai'], degreeLevels:['Undergraduate',"Master's"], archived:false, createdAt:'2026-04-20' },
      { id:'g16', title:'KOICA Scholarship Program — South Korea', organization:'Korea International Cooperation Agency', country:'South Korea', category:'Scholarship Collaboration Grants', amount:25000, currency:'USD', amountNote:'Full tuition + living', deadline:'2026-05-31', description:"Master's degree scholarship at top Korean universities in development-oriented fields.", eligibility:'Government/university nominees. Strong English. Public-service interest.', website:'https://www.koica.go.kr', contactEmail:'scp@koica.go.kr', tags:['Korea',"Master's",'Development'], attachments:[], facultyIds:['sbm','fcep','fit','fte'], programIds:[], degreeLevels:["Master's"], archived:false, createdAt:'2026-03-30' },
      { id:'g17', title:'Petra–KU Leuven Architectural Heritage Workshop', organization:'KU Leuven, Belgium', country:'Belgium', category:'Student Exchange Funding', amount:3500, currency:'EUR', amountNote:'Workshop fee + travel waiver', deadline:'2026-05-22', description:'Two-week workshop on architectural heritage conservation, co-hosted with KU Leuven Faculty of Architecture.', eligibility:'Architecture students, year 3+. Portfolio review. English B2.', website:'https://www.kuleuven.be', contactEmail:'heritage@kuleuven.be', tags:['Architecture','Heritage','Belgium'], attachments:[], facultyIds:['fcep'], programIds:['arch','ashre','march'], degreeLevels:['Undergraduate',"Master's"], archived:false, createdAt:'2026-04-28' },
      { id:'g18', title:'ETH Zürich Excellence Scholarship', organization:'ETH Zürich', country:'Switzerland', category:'Scholarship Collaboration Grants', amount:12000, currency:'CHF', amountNote:'Per semester + tuition waiver', deadline:'2025-12-15', description:"Master's excellence scholarship at ETH Zürich for outstanding international students in STEM.", eligibility:"Top 10% of Bachelor's cohort. Admission to ETH Master's program.", website:'https://ethz.ch', contactEmail:'scholarships@ethz.ch', tags:['Switzerland','STEM',"Master's"], attachments:[], facultyIds:['fit','fcep'], programIds:[], degreeLevels:["Master's"], archived:true, createdAt:'2025-09-01' }
    ]
  };

  /* -----------------------------------------------------------
   *  STORAGE LAYER — localStorage write-through cache
   * --------------------------------------------------------- */
  const LS_KEYS = {
    grants: 'pcu_grants',
    activity: 'pcu_activity',
    bookmarks: 'pcu_bookmarks',
    auth: 'pcu_auth',
    theme: 'pcu_theme',
    profile: 'pcu_profile' // selected faculty/program for matching
  };

  const storage = {
    load(key, fallback) {
      try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
      catch { return fallback; }
    },
    save(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.warn('storage save failed', e); }
    },
    remove(key) { try { localStorage.removeItem(key); } catch {} }
  };

  /* -----------------------------------------------------------
   *  STATE
   * --------------------------------------------------------- */
  const state = {
    faculties: SEED.faculties,
    categories: SEED.categories,
    users: SEED.users,
    grants: storage.load(LS_KEYS.grants, SEED.grants),
    activity: storage.load(LS_KEYS.activity, []),
    bookmarks: new Set(storage.load(LS_KEYS.bookmarks, [])),
    user: storage.load(LS_KEYS.auth, null),
    filters: {
      q: '',
      faculty: '',
      program: '',
      degree: '',
      country: '',
      category: '',
      status: '',
      sort: 'deadline-asc',
      view: 'card', // card | table
      page: 1,
      perPage: 9
    },
    profile: storage.load(LS_KEYS.profile, { facultyId: '', programId: '' })
  };

  // First run: persist grant seed so admin edits survive
  if (!localStorage.getItem(LS_KEYS.grants)) storage.save(LS_KEYS.grants, state.grants);

  /* -----------------------------------------------------------
   *  HELPERS
   * --------------------------------------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  const fmt = new Intl.NumberFormat('en-US');
  const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
  const parseDate = (s) => { const d = new Date(s + 'T00:00:00'); return isNaN(d) ? null : d; };
  const daysUntil = (deadline) => {
    const d = parseDate(deadline); if (!d) return null;
    const diff = Math.ceil((d - today()) / (1000 * 60 * 60 * 24));
    return diff;
  };
  const grantStatus = (g) => {
    if (g.archived) return 'Closed';
    const d = daysUntil(g.deadline);
    if (d === null) return 'Open';
    if (d < 0) return 'Closed';
    if (d <= 7) return 'Closing Soon';
    return 'Open';
  };
  const statusChip = (s) => {
    const map = { 'Open':'chip-green', 'Closing Soon':'chip-yellow', 'Closed':'chip-red' };
    return `<span class="chip ${map[s] || ''}">${esc(s)}</span>`;
  };
  const facultyById = (id) => state.faculties.find(f => f.id === id);
  const programById = (id) => {
    for (const f of state.faculties) {
      const p = f.programs.find(p => p.id === id);
      if (p) return { ...p, facultyId: f.id, facultyName: f.name };
    }
    return null;
  };
  const allCountries = () => Array.from(new Set(state.grants.map(g => g.country))).sort();
  const allDegrees = () => ['Undergraduate', "Master's", 'Doctoral', 'Professional'];

  function uid(prefix='g') {
    return prefix + '_' + Math.random().toString(36).slice(2, 9);
  }

  async function sha256(s) {
    const enc = new TextEncoder().encode(s);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function logActivity(action, detail) {
    const entry = {
      id: uid('a'),
      at: new Date().toISOString(),
      user: state.user?.username || 'guest',
      action, detail
    };
    state.activity.unshift(entry);
    state.activity = state.activity.slice(0, 200);
    storage.save(LS_KEYS.activity, state.activity);
  }

  function toast(msg, kind='info') {
    const cls = { info:'', success:'toast-success', error:'toast-error', warn:'toast-warn' }[kind] || '';
    const el = document.createElement('div');
    el.className = `toast ${cls}`;
    el.innerHTML = `<div class="flex items-start gap-2"><i data-lucide="${kind==='error'?'alert-octagon':kind==='success'?'check-circle-2':kind==='warn'?'alert-triangle':'info'}" class="w-4 h-4 mt-0.5"></i><span>${esc(msg)}</span></div>`;
    $('#toasts').appendChild(el);
    if (window.lucide) lucide.createIcons();
    setTimeout(() => { el.style.opacity='0'; el.style.transform='translateY(8px)'; }, 3000);
    setTimeout(() => el.remove(), 3400);
  }

  /* -----------------------------------------------------------
   *  AUTO STATUS — sync archived flag for past deadlines
   * --------------------------------------------------------- */
  function syncStatuses() {
    let changed = false;
    state.grants.forEach(g => {
      const d = daysUntil(g.deadline);
      if (d !== null && d < 0 && !g.archived) {
        g.archived = true;
        changed = true;
        logActivity('auto-archive', `Grant "${g.title}" archived (deadline passed)`);
      }
    });
    if (changed) storage.save(LS_KEYS.grants, state.grants);
  }

  /* -----------------------------------------------------------
   *  ROUTER
   * --------------------------------------------------------- */
  const routes = {};
  function route(name, fn) { routes[name] = fn; }
  function navigate(hash) {
    if (location.hash !== `#${hash}`) location.hash = hash;
    else render();
  }
  function currentRoute() {
    const raw = location.hash.replace(/^#/, '') || 'dashboard';
    const [name, ...rest] = raw.split('/');
    return { name, params: rest };
  }
  function render() {
    const r = currentRoute();
    const handler = routes[r.name] || routes['dashboard'];
    // Auth guard for admin routes
    if (r.name.startsWith('admin') && !state.user) { navigate('login'); return; }
    document.querySelectorAll('.nav-link').forEach(a => a.classList.toggle('active', a.dataset.route === r.name));
    const view = $('#view');
    view.classList.remove('fade-in'); void view.offsetWidth; view.classList.add('fade-in');
    view.innerHTML = handler(r.params);
    if (window.lucide) lucide.createIcons();
    refreshNotifBadge();
  }
  window.addEventListener('hashchange', render);

  /* -----------------------------------------------------------
   *  FILTERING / SEARCH / SORT
   * --------------------------------------------------------- */
  function applyFilters(list) {
    const f = state.filters;
    const q = f.q.trim().toLowerCase();
    let out = list.filter(g => {
      if (q) {
        const hay = [g.title, g.organization, g.country, g.category, g.description, (g.tags||[]).join(' ')].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (f.faculty && !(g.facultyIds || []).includes(f.faculty)) return false;
      if (f.program) {
        const programInFaculty = (() => {
          const p = programById(f.program);
          if (!p) return false;
          // grant matches program if it lists the program OR its parent faculty (whole-faculty grants)
          return (g.programIds || []).includes(f.program) || (g.facultyIds || []).includes(p.facultyId);
        })();
        if (!programInFaculty) return false;
      }
      if (f.degree && !(g.degreeLevels || []).includes(f.degree)) return false;
      if (f.country && g.country !== f.country) return false;
      if (f.category && g.category !== f.category) return false;
      if (f.status) {
        const s = grantStatus(g);
        if (f.status !== s) return false;
      }
      return true;
    });

    // Sort
    const sorters = {
      'deadline-asc': (a,b)=> parseDate(a.deadline) - parseDate(b.deadline),
      'deadline-desc':(a,b)=> parseDate(b.deadline) - parseDate(a.deadline),
      'amount-desc': (a,b)=> (b.amount||0) - (a.amount||0),
      'amount-asc':  (a,b)=> (a.amount||0) - (b.amount||0),
      'title-asc':   (a,b)=> a.title.localeCompare(b.title),
      'recent':      (a,b)=> (b.createdAt||'').localeCompare(a.createdAt||'')
    };
    out = out.sort(sorters[f.sort] || sorters['deadline-asc']);
    return out;
  }

  function activeGrants() {
    return state.grants.filter(g => !g.archived);
  }
  function archivedGrants() {
    return state.grants.filter(g => g.archived);
  }

  /* -----------------------------------------------------------
   *  VIEWS
   * --------------------------------------------------------- */

  // --- Shared partials ---
  function statCard(icon, label, value, color='bg-petra-100 text-petra-700') {
    return `
      <div class="card stat-card">
        <div class="stat-icon ${color}"><i data-lucide="${icon}"></i></div>
        <div>
          <p class="text-xs text-slate-500 dark:text-slate-400">${esc(label)}</p>
          <p class="text-xl font-bold">${value}</p>
        </div>
      </div>`;
  }

  function grantCardHTML(g) {
    const status = grantStatus(g);
    const d = daysUntil(g.deadline);
    const remaining = d === null ? '' : d < 0 ? 'Expired' : `${d} day${d===1?'':'s'} left`;
    const bookmarked = state.bookmarks.has(g.id);
    return `
      <div class="card grant-card card-hover" data-grant="${g.id}">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2">${statusChip(status)}<span class="chip">${esc(g.category)}</span></div>
          <button class="bookmark-btn p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800" data-id="${g.id}" title="Bookmark">
            <i data-lucide="${bookmarked?'bookmark-check':'bookmark'}" class="w-4 h-4 ${bookmarked?'text-petra-600':'text-slate-400'}"></i>
          </button>
        </div>
        <h3>${esc(g.title)}</h3>
        <p class="grant-meta line-clamp-2">${esc(g.description)}</p>
        <div class="flex flex-wrap gap-1.5">
          ${(g.tags||[]).slice(0,3).map(t => `<span class="tag">#${esc(t)}</span>`).join('')}
        </div>
        <div class="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <p class="text-slate-500 dark:text-slate-400">${esc(g.country)} · ${esc(g.organization)}</p>
            <p class="font-semibold mt-1">${esc(g.currency)} ${fmt.format(g.amount || 0)}</p>
          </div>
          <div class="text-right">
            <p class="text-slate-500 dark:text-slate-400">${esc(g.deadline)}</p>
            <p class="countdown ${d<=7&&d>=0?'text-amber-600':d<0?'text-rose-600':'text-emerald-600'}">${esc(remaining)}</p>
          </div>
        </div>
      </div>`;
  }

  function filterBar() {
    const f = state.filters;
    const faculties = state.faculties.map(x => `<option value="${x.id}" ${f.faculty===x.id?'selected':''}>${esc(x.name)}</option>`).join('');
    const programs = (() => {
      const sourceF = f.faculty ? [facultyById(f.faculty)].filter(Boolean) : state.faculties;
      return sourceF.flatMap(x => x.programs.map(p => `<option value="${p.id}" ${f.program===p.id?'selected':''}>${esc(p.name)}</option>`)).join('');
    })();
    const countries = allCountries().map(c => `<option value="${esc(c)}" ${f.country===c?'selected':''}>${esc(c)}</option>`).join('');
    const cats = state.categories.map(c => `<option value="${esc(c)}" ${f.category===c?'selected':''}>${esc(c)}</option>`).join('');
    const degrees = allDegrees().map(d => `<option value="${esc(d)}" ${f.degree===d?'selected':''}>${esc(d)}</option>`).join('');
    return `
      <div class="card p-4 mb-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
          <select class="select" data-filter="faculty"><option value="">All Faculties</option>${faculties}</select>
          <select class="select" data-filter="program"><option value="">All Programs</option>${programs}</select>
          <select class="select" data-filter="degree"><option value="">All Degrees</option>${degrees}</select>
          <select class="select" data-filter="country"><option value="">All Countries</option>${countries}</select>
          <select class="select" data-filter="category"><option value="">All Categories</option>${cats}</select>
          <select class="select" data-filter="status">
            <option value="">All Statuses</option>
            <option value="Open" ${f.status==='Open'?'selected':''}>Open</option>
            <option value="Closing Soon" ${f.status==='Closing Soon'?'selected':''}>Closing Soon</option>
            <option value="Closed" ${f.status==='Closed'?'selected':''}>Closed</option>
          </select>
          <select class="select" data-filter="sort">
            <option value="deadline-asc" ${f.sort==='deadline-asc'?'selected':''}>Deadline ↑</option>
            <option value="deadline-desc" ${f.sort==='deadline-desc'?'selected':''}>Deadline ↓</option>
            <option value="amount-desc" ${f.sort==='amount-desc'?'selected':''}>Amount ↓</option>
            <option value="amount-asc" ${f.sort==='amount-asc'?'selected':''}>Amount ↑</option>
            <option value="title-asc" ${f.sort==='title-asc'?'selected':''}>Title A–Z</option>
            <option value="recent" ${f.sort==='recent'?'selected':''}>Recently added</option>
          </select>
        </div>
        <div class="flex flex-wrap items-center gap-2 mt-3">
          <button class="btn btn-secondary text-xs" id="reset-filters"><i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>Reset</button>
          <div class="ml-auto flex items-center gap-1 text-xs">
            <span class="text-slate-500">View:</span>
            <button class="btn btn-ghost ${f.view==='card'?'!text-petra-700 !bg-petra-50 dark:!bg-petra-900/20':''}" data-view="card"><i data-lucide="grid-3x3"></i></button>
            <button class="btn btn-ghost ${f.view==='table'?'!text-petra-700 !bg-petra-50 dark:!bg-petra-900/20':''}" data-view="table"><i data-lucide="table-2"></i></button>
            <button class="btn btn-ghost" id="export-csv" title="Export visible to CSV"><i data-lucide="download"></i></button>
          </div>
        </div>
      </div>`;
  }

  // ------------------ DASHBOARD ------------------
  route('dashboard', () => {
    const grants = activeGrants();
    const closing = grants.filter(g => grantStatus(g) === 'Closing Soon');
    const open = grants.filter(g => grantStatus(g) === 'Open' || grantStatus(g) === 'Closing Soon');
    const totalFunding = grants.reduce((s,g)=> s+(g.amount||0), 0);
    const upcoming = [...grants].sort((a,b)=>parseDate(a.deadline)-parseDate(b.deadline)).slice(0,5);
    const recent = [...grants].sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||'')).slice(0,4);

    return `
      <div class="space-y-6">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 class="text-2xl font-bold">Welcome to Petra International Grants</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400">Discover global funding opportunities tailored to Petra Christian University faculties and programs.</p>
          </div>
          <a class="btn btn-primary" href="#grants"><i data-lucide="globe-2"></i>Browse all grants</a>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          ${statCard('globe-2','Active Grants', grants.length, 'bg-emerald-100 text-emerald-700')}
          ${statCard('timer','Closing Soon', closing.length, 'bg-amber-100 text-amber-700')}
          ${statCard('graduation-cap','Faculties Served', state.faculties.length, 'bg-petra-100 text-petra-700')}
          ${statCard('wallet','Total Funding (sum)', `~${fmt.format(totalFunding)}`, 'bg-violet-100 text-violet-700')}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="card p-4 lg:col-span-2">
            <div class="section-title"><div><h2>Grants by Category</h2><p>Active programmes only</p></div></div>
            <div class="h-64"><canvas id="chart-category"></canvas></div>
          </div>
          <div class="card p-4">
            <div class="section-title"><div><h2>Grants by Status</h2><p>Real-time</p></div></div>
            <div class="h-64"><canvas id="chart-status"></canvas></div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="card p-4 lg:col-span-2">
            <div class="section-title">
              <div><h2>Upcoming Deadlines</h2><p>Soonest first</p></div>
              <a class="text-sm text-petra-600 hover:underline" href="#calendar">Open calendar →</a>
            </div>
            <div class="space-y-2">
              ${upcoming.map(g => {
                const d = daysUntil(g.deadline);
                const tone = d<=7?'text-amber-600':d<0?'text-rose-600':'text-emerald-600';
                return `
                  <div class="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer" data-grant="${g.id}">
                    <div class="min-w-0">
                      <p class="font-semibold truncate">${esc(g.title)}</p>
                      <p class="text-xs text-slate-500 truncate">${esc(g.organization)} · ${esc(g.country)}</p>
                    </div>
                    <div class="text-right text-xs whitespace-nowrap">
                      <p class="text-slate-500">${esc(g.deadline)}</p>
                      <p class="${tone} countdown">${d<0?'Expired':d+' days'}</p>
                    </div>
                  </div>`;
              }).join('')}
            </div>
          </div>

          <div class="card p-4">
            <div class="section-title"><div><h2>Recently Added</h2><p>Latest opportunities</p></div></div>
            <div class="space-y-3">
              ${recent.map(g => `
                <div class="flex items-start gap-3 cursor-pointer" data-grant="${g.id}">
                  <div class="w-9 h-9 rounded-lg bg-petra-100 text-petra-700 grid place-items-center"><i data-lucide="sparkles" class="w-4 h-4"></i></div>
                  <div class="min-w-0">
                    <p class="font-semibold text-sm truncate">${esc(g.title)}</p>
                    <p class="text-xs text-slate-500 truncate">${esc(g.country)} · ${esc(g.category)}</p>
                  </div>
                </div>`).join('')}
            </div>
          </div>
        </div>
      </div>
      <script>__renderDashboardCharts && __renderDashboardCharts();</script>
    `;
  });

  // ------------------ GRANTS BROWSE ------------------
  route('grants', () => {
    const list = applyFilters(activeGrants());
    state.filters.page = Math.min(state.filters.page, Math.max(1, Math.ceil(list.length / state.filters.perPage)));
    const start = (state.filters.page - 1) * state.filters.perPage;
    const pageItems = list.slice(start, start + state.filters.perPage);
    const totalPages = Math.max(1, Math.ceil(list.length / state.filters.perPage));

    const body = state.filters.view === 'card'
      ? `<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
           ${pageItems.length === 0 ? `<div class="card p-8 text-center text-slate-500 col-span-full">No grants match your filters.</div>` : pageItems.map(grantCardHTML).join('')}
         </div>`
      : `<div class="card scroll-x">
          <table class="tbl">
            <thead><tr>
              <th>Title</th><th>Organization</th><th>Country</th><th>Category</th><th>Amount</th><th>Deadline</th><th>Status</th><th></th>
            </tr></thead>
            <tbody>
              ${pageItems.length === 0 ? `<tr><td colspan="8" class="text-center text-slate-500 py-8">No grants match your filters.</td></tr>` :
                pageItems.map(g => {
                  const d = daysUntil(g.deadline);
                  return `
                    <tr data-grant="${g.id}" class="cursor-pointer">
                      <td class="font-medium">${esc(g.title)}</td>
                      <td>${esc(g.organization)}</td>
                      <td>${esc(g.country)}</td>
                      <td>${esc(g.category)}</td>
                      <td>${esc(g.currency)} ${fmt.format(g.amount||0)}</td>
                      <td>${esc(g.deadline)} <span class="block text-xs text-slate-400">${d<0?'Expired':d+' d'}</span></td>
                      <td>${statusChip(grantStatus(g))}</td>
                      <td><button class="btn btn-ghost text-xs" data-grant-open="${g.id}"><i data-lucide="external-link" class="w-4 h-4"></i></button></td>
                    </tr>`;
                }).join('') }
            </tbody>
          </table>
        </div>`;

    return `
      <div class="space-y-4">
        <div>
          <h1 class="text-2xl font-bold">Browse International Grants</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">${list.length} of ${activeGrants().length} grants displayed.</p>
        </div>
        ${filterBar()}
        ${body}
        <div class="flex items-center justify-between flex-wrap gap-2 mt-2">
          <p class="text-xs text-slate-500">Page ${state.filters.page} of ${totalPages}</p>
          <div class="flex gap-1">
            <button class="btn btn-secondary text-xs" id="page-prev" ${state.filters.page<=1?'disabled':''}><i data-lucide="chevron-left" class="w-4 h-4"></i>Prev</button>
            <button class="btn btn-secondary text-xs" id="page-next" ${state.filters.page>=totalPages?'disabled':''}>Next<i data-lucide="chevron-right" class="w-4 h-4"></i></button>
          </div>
        </div>
      </div>`;
  });

  // ------------------ CALENDAR ------------------
  route('calendar', (params) => {
    const now = new Date();
    const year = parseInt(params[0]) || now.getFullYear();
    const month = parseInt(params[1]) || now.getMonth() + 1; // 1-12
    const first = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const startWeekday = first.getDay();

    const events = activeGrants().reduce((acc, g) => {
      const d = parseDate(g.deadline); if (!d) return acc;
      if (d.getFullYear() === year && d.getMonth() === month - 1) {
        const key = d.getDate();
        (acc[key] = acc[key] || []).push(g);
      }
      return acc;
    }, {});

    const monthName = first.toLocaleString('en-US', { month: 'long' });
    const prevMonth = month === 1 ? { y: year-1, m: 12 } : { y: year, m: month-1 };
    const nextMonth = month === 12 ? { y: year+1, m: 1 } : { y: year, m: month+1 };

    let cells = '';
    for (let i = 0; i < startWeekday; i++) cells += `<div class="cal-cell empty"></div>`;
    const t = today();
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = t.getFullYear() === year && t.getMonth() === month-1 && t.getDate() === day;
      const dayEvents = events[day] || [];
      cells += `
        <div class="cal-cell ${isToday?'today':''}">
          <div class="date-num">${day}</div>
          ${dayEvents.slice(0,3).map(g => {
            const s = grantStatus(g);
            const cls = s === 'Closing Soon' ? 'closing' : s === 'Closed' ? 'closed' : '';
            return `<span class="cal-event ${cls}" data-grant="${g.id}" title="${esc(g.title)}">${esc(g.title.slice(0, 22))}</span>`;
          }).join('')}
          ${dayEvents.length > 3 ? `<span class="text-[10px] text-slate-500 mt-1 block">+${dayEvents.length-3} more</span>` : ''}
        </div>`;
    }

    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 class="text-2xl font-bold">Deadline Calendar</h1>
            <p class="text-sm text-slate-500">All grant deadlines for ${esc(monthName)} ${year}</p>
          </div>
          <div class="flex gap-1">
            <a class="btn btn-secondary" href="#calendar/${prevMonth.y}/${prevMonth.m}"><i data-lucide="chevron-left"></i></a>
            <a class="btn btn-secondary" href="#calendar/${now.getFullYear()}/${now.getMonth()+1}">Today</a>
            <a class="btn btn-secondary" href="#calendar/${nextMonth.y}/${nextMonth.m}"><i data-lucide="chevron-right"></i></a>
          </div>
        </div>
        <div class="card p-4">
          <div class="cal-grid mb-1 text-xs font-semibold text-slate-500">
            ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<div class="px-2 py-1">${d}</div>`).join('')}
          </div>
          <div class="cal-grid">${cells}</div>
        </div>
      </div>`;
  });

  // ------------------ FACULTIES ------------------
  route('faculties', () => {
    const fHTML = state.faculties.map(f => {
      const grants = activeGrants().filter(g => (g.facultyIds||[]).includes(f.id));
      const progLines = f.programs.map(p => {
        const matching = activeGrants().filter(g =>
          (g.programIds||[]).includes(p.id) || (g.facultyIds||[]).includes(f.id)
        ).length;
        return `<li class="flex items-center justify-between text-sm py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span><span class="text-slate-400 text-xs mr-2">${esc(p.degree)}</span>${esc(p.name)}</span>
                  <a class="text-petra-600 hover:underline text-xs" href="#grants?program=${p.id}" data-filter-program="${p.id}">${matching} grants →</a>
                </li>`;
      }).join('');
      return `
        <div class="card p-5">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="font-bold text-lg">${esc(f.name)}</h3>
              <p class="text-sm text-slate-500">${f.programs.length} programs · ${grants.length} grants available</p>
            </div>
            <a class="btn btn-secondary text-xs" href="#grants" data-filter-faculty="${f.id}"><i data-lucide="filter"></i>View grants</a>
          </div>
          <details class="group" open>
            <summary class="cursor-pointer text-xs font-semibold text-slate-500 hover:text-petra-700">Show programs</summary>
            <ul class="mt-2">${progLines}</ul>
          </details>
        </div>`;
    }).join('');

    return `
      <div class="space-y-4">
        <div>
          <h1 class="text-2xl font-bold">Faculties & Programs</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">Browse grants by Petra Christian University's academic units.</p>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">${fHTML}</div>
      </div>`;
  });

  // ------------------ GRANT MATCHING ------------------
  route('matching', () => {
    const p = state.profile;
    const facOpts = state.faculties.map(f => `<option value="${f.id}" ${p.facultyId===f.id?'selected':''}>${esc(f.name)}</option>`).join('');
    const progOpts = (() => {
      const fac = facultyById(p.facultyId);
      if (!fac) return '';
      return fac.programs.map(pr => `<option value="${pr.id}" ${p.programId===pr.id?'selected':''}>${esc(pr.name)}</option>`).join('');
    })();

    const matching = activeGrants().filter(g => {
      if (!p.facultyId) return false;
      if ((g.facultyIds||[]).includes(p.facultyId)) {
        if (p.programId && (g.programIds||[]).length) {
          return g.programIds.includes(p.programId);
        }
        return true;
      }
      return false;
    }).sort((a,b)=>parseDate(a.deadline)-parseDate(b.deadline));

    return `
      <div class="space-y-4">
        <div>
          <h1 class="text-2xl font-bold">Grant Matching</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">Choose your academic unit and get matched with the most relevant grants.</p>
        </div>
        <div class="card p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-semibold text-slate-500 mb-1 block">Faculty</label>
              <select class="select" id="profile-faculty"><option value="">— Select —</option>${facOpts}</select>
            </div>
            <div>
              <label class="text-xs font-semibold text-slate-500 mb-1 block">Program (optional)</label>
              <select class="select" id="profile-program" ${!p.facultyId?'disabled':''}><option value="">— Any program in faculty —</option>${progOpts}</select>
            </div>
          </div>
        </div>

        ${p.facultyId ? `
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Recommended for you</h2>
            <span class="chip">${matching.length} matched</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            ${matching.length === 0
              ? `<div class="card p-8 text-center text-slate-500 col-span-full">No matches yet. Try a different program.</div>`
              : matching.map(grantCardHTML).join('')}
          </div>
        ` : `<div class="card p-8 text-center text-slate-500">Select your faculty to see recommended grants.</div>`}
      </div>`;
  });

  // ------------------ FAVORITES ------------------
  route('favorites', () => {
    const list = state.grants.filter(g => state.bookmarks.has(g.id));
    return `
      <div class="space-y-4">
        <div>
          <h1 class="text-2xl font-bold">My Bookmarks</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">Grants you've saved for later.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          ${list.length === 0 ? `<div class="card p-8 text-center text-slate-500 col-span-full">No bookmarks yet. Tap the bookmark icon on a grant card.</div>` : list.map(grantCardHTML).join('')}
        </div>
      </div>`;
  });

  // ------------------ ANALYTICS ------------------
  route('analytics', () => {
    return `
      <div class="space-y-6">
        <div>
          <h1 class="text-2xl font-bold">Analytics</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">Visual breakdown of the international grants portfolio.</p>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          ${statCard('globe-2','Total Grants', state.grants.length, 'bg-petra-100 text-petra-700')}
          ${statCard('check-circle-2','Active', activeGrants().length, 'bg-emerald-100 text-emerald-700')}
          ${statCard('archive','Archived', archivedGrants().length, 'bg-slate-200 text-slate-700')}
          ${statCard('flag','Countries', allCountries().length, 'bg-violet-100 text-violet-700')}
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="card p-4"><div class="section-title"><div><h2>By Country</h2></div></div><div class="h-72"><canvas id="ax-country"></canvas></div></div>
          <div class="card p-4"><div class="section-title"><div><h2>By Category</h2></div></div><div class="h-72"><canvas id="ax-category"></canvas></div></div>
          <div class="card p-4"><div class="section-title"><div><h2>Deadlines by Month</h2></div></div><div class="h-72"><canvas id="ax-timeline"></canvas></div></div>
          <div class="card p-4"><div class="section-title"><div><h2>Grants per Faculty</h2></div></div><div class="h-72"><canvas id="ax-faculty"></canvas></div></div>
        </div>
      </div>
      <script>__renderAnalyticsCharts && __renderAnalyticsCharts();</script>
    `;
  });

  // ------------------ LOGIN ------------------
  route('login', () => {
    if (state.user) { setTimeout(()=>navigate('admin'),0); return '<div class="card p-8 text-center">Redirecting…</div>'; }
    return `
      <div class="max-w-md mx-auto card p-6 mt-8">
        <div class="text-center mb-6">
          <div class="mx-auto w-14 h-14 rounded-2xl bg-petra-600 text-white grid place-items-center shadow-soft"><i data-lucide="shield-check"></i></div>
          <h1 class="text-xl font-bold mt-3">Admin Sign In</h1>
          <p class="text-sm text-slate-500">Petra International Office staff only.</p>
        </div>
        <form id="login-form" class="space-y-3">
          <div>
            <label class="text-xs font-semibold text-slate-500">Username</label>
            <input class="input mt-1" name="username" placeholder="admin" autocomplete="username" required />
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-500">Password</label>
            <input class="input mt-1" name="password" type="password" placeholder="••••••••" autocomplete="current-password" required />
          </div>
          <button class="btn btn-primary w-full justify-center" type="submit"><i data-lucide="log-in"></i>Sign in</button>
          <p class="text-xs text-slate-500 text-center pt-2">Demo credentials: <code>admin</code> / <code>admin</code></p>
        </form>
      </div>`;
  });

  // ------------------ ADMIN DASHBOARD ------------------
  route('admin', () => {
    const grants = state.grants;
    const closing = activeGrants().filter(g => grantStatus(g) === 'Closing Soon');
    const recent = [...grants].sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||'')).slice(0,5);
    const byFaculty = state.faculties.map(f => ({
      f, count: activeGrants().filter(g => (g.facultyIds||[]).includes(f.id)).length
    })).sort((a,b)=>b.count-a.count);

    return `
      <div class="space-y-6">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 class="text-2xl font-bold">Admin Console</h1>
            <p class="text-sm text-slate-500">Signed in as ${esc(state.user.name)}.</p>
          </div>
          <div class="flex gap-2">
            <a class="btn btn-secondary" href="#admin-grants"><i data-lucide="folder-cog"></i>Manage grants</a>
            <button class="btn btn-primary" id="new-grant-btn"><i data-lucide="plus"></i>Add grant</button>
          </div>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          ${statCard('database','Total Grants', grants.length, 'bg-petra-100 text-petra-700')}
          ${statCard('check-circle-2','Active', activeGrants().length, 'bg-emerald-100 text-emerald-700')}
          ${statCard('archive','Archived', archivedGrants().length, 'bg-slate-200 text-slate-700')}
          ${statCard('alarm-clock','Closing Soon', closing.length, 'bg-amber-100 text-amber-700')}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="card p-4">
            <div class="section-title"><div><h2>Faculty Participation</h2><p>Active grants per faculty</p></div></div>
            <div class="space-y-2">
              ${byFaculty.map(({f,count}) => `
                <div>
                  <div class="flex items-center justify-between text-sm mb-1">
                    <span class="truncate">${esc(f.name)}</span><span class="font-semibold">${count}</span>
                  </div>
                  <div class="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div class="h-full bg-petra-600" style="width:${activeGrants().length?Math.min(100, count/Math.max(1,activeGrants().length)*100):0}%"></div>
                  </div>
                </div>`).join('')}
            </div>
          </div>

          <div class="card p-4">
            <div class="section-title"><div><h2>Recently Added</h2></div></div>
            <table class="tbl">
              <thead><tr><th>Title</th><th>Created</th><th></th></tr></thead>
              <tbody>${recent.map(g => `
                <tr><td>${esc(g.title)}</td><td class="text-xs text-slate-500">${esc(g.createdAt||'-')}</td>
                <td><button class="btn btn-ghost text-xs" data-edit="${g.id}"><i data-lucide="pencil" class="w-4 h-4"></i></button></td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;
  });

  // ------------------ ADMIN GRANTS LIST ------------------
  route('admin-grants', () => {
    const list = applyFilters(state.grants); // includes archived
    return `
      <div class="space-y-4">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 class="text-2xl font-bold">Manage Grants</h1>
            <p class="text-sm text-slate-500">${list.length} grants (including archived)</p>
          </div>
          <button class="btn btn-primary" id="new-grant-btn"><i data-lucide="plus"></i>Add grant</button>
        </div>
        ${filterBar()}
        <div class="card scroll-x">
          <table class="tbl">
            <thead><tr><th>Title</th><th>Country</th><th>Category</th><th>Deadline</th><th>Status</th><th>Eligible</th><th>Actions</th></tr></thead>
            <tbody>
              ${list.length === 0 ? `<tr><td colspan="7" class="text-center text-slate-500 py-8">No grants.</td></tr>` :
              list.map(g => {
                const facs = (g.facultyIds||[]).map(id => facultyById(id)?.name).filter(Boolean);
                const facsText = facs.length === state.faculties.length ? 'All faculties' : facs.slice(0,2).join(', ') + (facs.length>2?` +${facs.length-2}`:'');
                return `
                  <tr>
                    <td>
                      <p class="font-medium">${esc(g.title)}</p>
                      <p class="text-xs text-slate-500">${esc(g.organization)}</p>
                    </td>
                    <td>${esc(g.country)}</td>
                    <td><span class="chip">${esc(g.category)}</span></td>
                    <td>${esc(g.deadline)}</td>
                    <td>${statusChip(grantStatus(g))} ${g.archived?'<span class="chip">Archived</span>':''}</td>
                    <td class="text-xs">${esc(facsText)}</td>
                    <td class="whitespace-nowrap">
                      <button class="btn btn-ghost text-xs" data-edit="${g.id}" title="Edit"><i data-lucide="pencil" class="w-4 h-4"></i></button>
                      <button class="btn btn-ghost text-xs" data-archive="${g.id}" title="${g.archived?'Restore':'Archive'}"><i data-lucide="${g.archived?'archive-restore':'archive'}" class="w-4 h-4"></i></button>
                      <button class="btn btn-ghost text-xs text-rose-600" data-delete="${g.id}" title="Delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  });

  // ------------------ ADMIN ARCHIVE ------------------
  route('admin-archive', () => {
    const list = archivedGrants();
    return `
      <div class="space-y-4">
        <h1 class="text-2xl font-bold">Archived Grants</h1>
        <div class="card scroll-x">
          <table class="tbl">
            <thead><tr><th>Title</th><th>Deadline</th><th>Actions</th></tr></thead>
            <tbody>
              ${list.length === 0 ? `<tr><td colspan="3" class="text-center text-slate-500 py-8">No archived grants.</td></tr>` :
              list.map(g => `
                <tr>
                  <td>${esc(g.title)}</td>
                  <td>${esc(g.deadline)}</td>
                  <td>
                    <button class="btn btn-ghost text-xs" data-archive="${g.id}"><i data-lucide="archive-restore" class="w-4 h-4"></i>Restore</button>
                    <button class="btn btn-ghost text-xs text-rose-600" data-delete="${g.id}"><i data-lucide="trash-2" class="w-4 h-4"></i>Delete</button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  });

  // ------------------ ADMIN ACTIVITY ------------------
  route('admin-activity', () => {
    return `
      <div class="space-y-4">
        <h1 class="text-2xl font-bold">Activity Log</h1>
        <p class="text-sm text-slate-500">Audit trail of admin actions on this device.</p>
        <div class="card scroll-x">
          <table class="tbl">
            <thead><tr><th>When</th><th>User</th><th>Action</th><th>Detail</th></tr></thead>
            <tbody>
              ${state.activity.length === 0 ? `<tr><td colspan="4" class="text-center text-slate-500 py-8">No activity yet.</td></tr>` :
              state.activity.map(a => `
                <tr>
                  <td class="text-xs text-slate-500 whitespace-nowrap">${new Date(a.at).toLocaleString()}</td>
                  <td>${esc(a.user)}</td>
                  <td><span class="chip">${esc(a.action)}</span></td>
                  <td>${esc(a.detail)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  });

  /* -----------------------------------------------------------
   *  GRANT DETAIL MODAL
   * --------------------------------------------------------- */
  function openGrant(id) {
    const g = state.grants.find(x => x.id === id); if (!g) return;
    const status = grantStatus(g);
    const d = daysUntil(g.deadline);
    const facList = (g.facultyIds||[]).map(fid => facultyById(fid)?.name).filter(Boolean);
    const progList = (g.programIds||[]).map(pid => programById(pid)?.name).filter(Boolean);
    const bookmarked = state.bookmarks.has(g.id);
    const body = `
      <div class="p-6">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div>
            <div class="flex items-center gap-2 mb-2">${statusChip(status)}<span class="chip">${esc(g.category)}</span>${g.archived?'<span class="chip">Archived</span>':''}</div>
            <h2 class="text-2xl font-bold leading-tight">${esc(g.title)}</h2>
            <p class="text-sm text-slate-500 mt-1">${esc(g.organization)} · ${esc(g.country)}</p>
          </div>
          <button class="btn btn-ghost" id="close-modal"><i data-lucide="x"></i></button>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <div class="card p-3"><p class="text-xs text-slate-500">Funding</p><p class="font-bold">${esc(g.currency)} ${fmt.format(g.amount||0)}</p><p class="text-xs text-slate-500">${esc(g.amountNote||'')}</p></div>
          <div class="card p-3"><p class="text-xs text-slate-500">Deadline</p><p class="font-bold">${esc(g.deadline)}</p><p class="text-xs ${d<0?'text-rose-600':d<=7?'text-amber-600':'text-emerald-600'} countdown">${d<0?'Expired':d+' days left'}</p></div>
          <div class="card p-3"><p class="text-xs text-slate-500">Category</p><p class="font-semibold text-sm">${esc(g.category)}</p></div>
          <div class="card p-3"><p class="text-xs text-slate-500">Country</p><p class="font-semibold text-sm">${esc(g.country)}</p></div>
        </div>

        <section class="space-y-4">
          <div><h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Description</h3><p class="mt-1 text-sm">${esc(g.description)}</p></div>
          <div><h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Eligibility</h3><p class="mt-1 text-sm">${esc(g.eligibility)}</p></div>
          <div>
            <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Eligible Academic Units</h3>
            <div class="mt-2 flex flex-wrap gap-1.5">
              ${facList.map(n => `<span class="chip chip-green">${esc(n)}</span>`).join('')}
              ${progList.map(n => `<span class="tag">${esc(n)}</span>`).join('')}
              ${facList.length === 0 && progList.length === 0 ? `<span class="text-xs text-slate-400">Open to all units</span>` : ''}
            </div>
            ${g.degreeLevels?.length ? `<div class="mt-2 text-xs text-slate-500">Degree levels: ${g.degreeLevels.map(d=>esc(d)).join(', ')}</div>` : ''}
          </div>
          ${g.tags?.length ? `<div class="flex flex-wrap gap-1.5">${g.tags.map(t=>`<span class="tag">#${esc(t)}</span>`).join('')}</div>` : ''}
          ${g.attachments?.length ? `
            <div>
              <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Attachments</h3>
              <ul class="mt-1 space-y-1">
                ${g.attachments.map(a => `<li><a class="text-petra-600 hover:underline inline-flex items-center gap-2" href="${esc(a.url||'#')}" target="_blank"><i data-lucide="paperclip" class="w-4 h-4"></i>${esc(a.name)}</a></li>`).join('')}
              </ul>
            </div>` : ''}
          <div class="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <a class="btn btn-primary" href="${esc(g.website)}" target="_blank"><i data-lucide="external-link"></i>Open application</a>
            <a class="btn btn-secondary" href="mailto:${esc(g.contactEmail)}"><i data-lucide="mail"></i>${esc(g.contactEmail)}</a>
            <button class="btn btn-secondary" data-bookmark="${g.id}"><i data-lucide="${bookmarked?'bookmark-check':'bookmark'}"></i>${bookmarked?'Bookmarked':'Bookmark'}</button>
            ${state.user ? `<button class="btn btn-secondary" data-edit="${g.id}"><i data-lucide="pencil"></i>Edit</button>` : ''}
          </div>
        </section>
      </div>`;
    $('#grant-modal-body').innerHTML = body;
    $('#grant-modal').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }
  function closeGrant() { $('#grant-modal').classList.add('hidden'); }

  /* -----------------------------------------------------------
   *  ADMIN GRANT FORM
   * --------------------------------------------------------- */
  function openGrantForm(id) {
    const g = id ? state.grants.find(x=>x.id===id) : {
      id: '', title:'', organization:'', country:'', category: state.categories[0],
      amount: 0, currency:'USD', amountNote:'', deadline:'', description:'', eligibility:'',
      website:'', contactEmail:'', tags:[], attachments:[], facultyIds:[], programIds:[],
      degreeLevels:[], archived:false, createdAt: new Date().toISOString().slice(0,10)
    };

    const facCheckboxes = state.faculties.map(f => `
      <label class="flex items-start gap-2 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
        <input type="checkbox" data-fac="${f.id}" ${g.facultyIds?.includes(f.id)?'checked':''}>
        <div><div class="text-sm font-medium">${esc(f.name)}</div><div class="text-xs text-slate-500">${f.programs.length} programs</div></div>
      </label>`).join('');

    const progCheckboxes = state.faculties.map(f => `
      <details class="card p-2 mb-2" ${g.programIds?.some(pid=>f.programs.find(p=>p.id===pid))?'open':''}>
        <summary class="cursor-pointer text-xs font-semibold text-slate-500">${esc(f.name)}</summary>
        <div class="mt-2 grid grid-cols-1 md:grid-cols-2 gap-1">
          ${f.programs.map(p => `
            <label class="flex items-center gap-2 text-xs py-1">
              <input type="checkbox" data-prog="${p.id}" ${g.programIds?.includes(p.id)?'checked':''}>
              <span class="text-slate-400 mr-1">${esc(p.degree)}</span>${esc(p.name)}
            </label>`).join('')}
        </div>
      </details>`).join('');

    const degCheckboxes = allDegrees().map(d => `
      <label class="flex items-center gap-2 text-xs"><input type="checkbox" data-deg="${esc(d)}" ${g.degreeLevels?.includes(d)?'checked':''}>${esc(d)}</label>
    `).join('');

    $('#grant-form-body').innerHTML = `
      <form id="grant-form" class="p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">${id?'Edit grant':'Add new grant'}</h2>
          <button type="button" class="btn btn-ghost" id="close-form"><i data-lucide="x"></i></button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="md:col-span-2"><label class="text-xs font-semibold">Title</label><input class="input mt-1" name="title" value="${esc(g.title)}" required></div>
          <div><label class="text-xs font-semibold">Funding Organization</label><input class="input mt-1" name="organization" value="${esc(g.organization)}" required></div>
          <div><label class="text-xs font-semibold">Country</label><input class="input mt-1" name="country" value="${esc(g.country)}" required></div>
          <div>
            <label class="text-xs font-semibold">Category</label>
            <select class="select mt-1" name="category">${state.categories.map(c => `<option ${g.category===c?'selected':''}>${esc(c)}</option>`).join('')}</select>
          </div>
          <div>
            <label class="text-xs font-semibold">Deadline</label>
            <input class="input mt-1" type="date" name="deadline" value="${esc(g.deadline)}" required>
          </div>
          <div><label class="text-xs font-semibold">Currency</label><input class="input mt-1" name="currency" value="${esc(g.currency)}" placeholder="USD"></div>
          <div><label class="text-xs font-semibold">Amount</label><input class="input mt-1" type="number" name="amount" value="${g.amount||0}"></div>
          <div class="md:col-span-2"><label class="text-xs font-semibold">Amount note</label><input class="input mt-1" name="amountNote" value="${esc(g.amountNote||'')}"></div>
          <div class="md:col-span-2"><label class="text-xs font-semibold">Description</label><textarea class="textarea mt-1" name="description" rows="3" required>${esc(g.description)}</textarea></div>
          <div class="md:col-span-2"><label class="text-xs font-semibold">Eligibility</label><textarea class="textarea mt-1" name="eligibility" rows="2">${esc(g.eligibility)}</textarea></div>
          <div><label class="text-xs font-semibold">Website URL</label><input class="input mt-1" name="website" value="${esc(g.website)}" placeholder="https://"></div>
          <div><label class="text-xs font-semibold">Contact email</label><input class="input mt-1" name="contactEmail" value="${esc(g.contactEmail)}"></div>
          <div class="md:col-span-2"><label class="text-xs font-semibold">Tags (comma-separated)</label><input class="input mt-1" name="tags" value="${esc((g.tags||[]).join(', '))}"></div>
          <div class="md:col-span-2"><label class="text-xs font-semibold">Attachment URLs (one per line: name | url)</label><textarea class="textarea mt-1" name="attachments" rows="2">${esc((g.attachments||[]).map(a=>`${a.name} | ${a.url}`).join('\n'))}</textarea></div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-semibold">Eligible Faculties (whole-faculty)</label>
            <div class="mt-1 max-h-48 overflow-y-auto card p-2">${facCheckboxes}</div>
          </div>
          <div>
            <label class="text-xs font-semibold">Specific Programs (optional)</label>
            <div class="mt-1 max-h-48 overflow-y-auto">${progCheckboxes}</div>
          </div>
        </div>

        <div>
          <label class="text-xs font-semibold">Eligible Degree Levels</label>
          <div class="flex flex-wrap gap-3 mt-1">${degCheckboxes}</div>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <label class="flex items-center gap-2 text-xs"><input type="checkbox" name="archived" ${g.archived?'checked':''}> Archived</label>
          <div class="ml-auto flex gap-2">
            <button type="button" class="btn btn-secondary" id="close-form"><i data-lucide="x"></i>Cancel</button>
            <button type="submit" class="btn btn-primary"><i data-lucide="save"></i>${id?'Save changes':'Create grant'}</button>
          </div>
        </div>
      </form>`;

    $('#grant-form-modal').classList.remove('hidden');
    if (window.lucide) lucide.createIcons();

    const closeForm = () => $('#grant-form-modal').classList.add('hidden');
    $$('#close-form').forEach(b => b.addEventListener('click', closeForm));
    $('#grant-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const facultyIds = $$('input[data-fac]', e.target).filter(i=>i.checked).map(i=>i.dataset.fac);
      const programIds = $$('input[data-prog]', e.target).filter(i=>i.checked).map(i=>i.dataset.prog);
      const degreeLevels = $$('input[data-deg]', e.target).filter(i=>i.checked).map(i=>i.dataset.deg);
      const attachments = String(fd.get('attachments')||'').split('\n').map(l => l.trim()).filter(Boolean).map(l => {
        const [name, url] = l.split('|').map(s=>s.trim()); return { name: name||'Attachment', url: url||'#' };
      });
      const updated = {
        id: id || uid('g'),
        title: fd.get('title').trim(),
        organization: fd.get('organization').trim(),
        country: fd.get('country').trim(),
        category: fd.get('category'),
        currency: fd.get('currency').trim() || 'USD',
        amount: parseFloat(fd.get('amount')) || 0,
        amountNote: fd.get('amountNote').trim(),
        deadline: fd.get('deadline'),
        description: fd.get('description').trim(),
        eligibility: fd.get('eligibility').trim(),
        website: fd.get('website').trim(),
        contactEmail: fd.get('contactEmail').trim(),
        tags: String(fd.get('tags')||'').split(',').map(t=>t.trim()).filter(Boolean),
        attachments,
        facultyIds, programIds, degreeLevels,
        archived: !!fd.get('archived'),
        createdAt: id ? (state.grants.find(x=>x.id===id)?.createdAt || new Date().toISOString().slice(0,10)) : new Date().toISOString().slice(0,10)
      };

      if (id) {
        const idx = state.grants.findIndex(x => x.id === id);
        state.grants[idx] = updated;
        logActivity('edit', `Updated grant "${updated.title}"`);
        toast('Grant updated', 'success');
      } else {
        state.grants.unshift(updated);
        logActivity('create', `Created grant "${updated.title}"`);
        toast('Grant created', 'success');
      }
      storage.save(LS_KEYS.grants, state.grants);
      closeForm();
      render();
    });
  }

  /* -----------------------------------------------------------
   *  NOTIFICATIONS
   * --------------------------------------------------------- */
  function buildNotifications() {
    const items = [];
    activeGrants().forEach(g => {
      const d = daysUntil(g.deadline);
      if (d !== null && d >= 0 && d <= 7) {
        items.push({ icon: 'alarm-clock', title: 'Closing soon', text: `${g.title} — ${d} day${d===1?'':'s'} left`, id: g.id, kind: 'warn' });
      }
    });
    const recents = [...state.grants].sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||'')).slice(0,3);
    recents.forEach(g => items.push({ icon:'sparkles', title:'New grant added', text:g.title, id:g.id, kind:'info' }));
    return items.slice(0, 12);
  }
  function refreshNotifBadge() {
    const items = buildNotifications();
    $('#notif-dot').classList.toggle('hidden', items.length === 0);
  }
  function renderNotifPanel() {
    const items = buildNotifications();
    $('#notif-panel').innerHTML = `
      <div class="px-1 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
        <p class="text-sm font-bold">Notifications</p>
      </div>
      <div class="space-y-1">
        ${items.length === 0 ? `<p class="text-xs text-slate-500 px-2 py-3">No notifications</p>` :
          items.map(n => `
            <button class="w-full text-left px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-start gap-2" data-grant="${n.id}">
              <i data-lucide="${n.icon}" class="w-4 h-4 mt-0.5 text-petra-600"></i>
              <div class="min-w-0">
                <p class="text-xs font-semibold">${esc(n.title)}</p>
                <p class="text-xs text-slate-500 truncate">${esc(n.text)}</p>
              </div>
            </button>`).join('')}
      </div>`;
    if (window.lucide) lucide.createIcons();
  }

  /* -----------------------------------------------------------
   *  CHARTS — exposed on window so view HTML can trigger
   * --------------------------------------------------------- */
  const chartInstances = {};
  function destroyChart(key) { if (chartInstances[key]) { chartInstances[key].destroy(); delete chartInstances[key]; } }

  window.__renderDashboardCharts = function() {
    const grants = activeGrants();
    // Category
    const catCounts = {};
    grants.forEach(g => catCounts[g.category] = (catCounts[g.category]||0)+1);
    const catLabels = Object.keys(catCounts);
    destroyChart('cat');
    const catCtx = document.getElementById('chart-category');
    if (catCtx) chartInstances.cat = new Chart(catCtx, {
      type: 'bar',
      data: { labels: catLabels, datasets: [{ label:'Grants', data: catLabels.map(k=>catCounts[k]), backgroundColor:'#3a6fea', borderRadius:6 }] },
      options: { plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true, ticks:{precision:0}}}, maintainAspectRatio:false }
    });

    // Status
    const statusCounts = { Open:0, 'Closing Soon':0, Closed:0 };
    state.grants.forEach(g => statusCounts[grantStatus(g)]++);
    destroyChart('status');
    const stCtx = document.getElementById('chart-status');
    if (stCtx) chartInstances.status = new Chart(stCtx, {
      type: 'doughnut',
      data: { labels: Object.keys(statusCounts), datasets:[{ data: Object.values(statusCounts), backgroundColor:['#16a34a','#f59e0b','#ef4444'] }] },
      options: { plugins:{legend:{position:'bottom'}}, maintainAspectRatio:false }
    });
  };

  window.__renderAnalyticsCharts = function() {
    const grants = activeGrants();
    const countryCounts = {}; grants.forEach(g=>countryCounts[g.country]=(countryCounts[g.country]||0)+1);
    const catCounts = {}; grants.forEach(g=>catCounts[g.category]=(catCounts[g.category]||0)+1);
    const monthCounts = {}; grants.forEach(g => { const m = (g.deadline||'').slice(0,7); if (m) monthCounts[m]=(monthCounts[m]||0)+1; });
    const months = Object.keys(monthCounts).sort();
    const facCounts = state.faculties.map(f => ({ name:f.name, count: grants.filter(g=>(g.facultyIds||[]).includes(f.id)).length }));

    destroyChart('axc');
    chartInstances.axc = new Chart(document.getElementById('ax-country'), {
      type:'bar',
      data:{ labels:Object.keys(countryCounts), datasets:[{label:'Grants', data:Object.values(countryCounts), backgroundColor:'#2553cf', borderRadius:6}] },
      options:{ indexAxis:'y', plugins:{legend:{display:false}}, maintainAspectRatio:false, scales:{x:{beginAtZero:true,ticks:{precision:0}}} }
    });

    destroyChart('axcat');
    chartInstances.axcat = new Chart(document.getElementById('ax-category'), {
      type:'pie',
      data:{ labels:Object.keys(catCounts), datasets:[{ data:Object.values(catCounts), backgroundColor:['#3a6fea','#16a34a','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16'] }] },
      options:{ plugins:{legend:{position:'right', labels:{boxWidth:12}}}, maintainAspectRatio:false }
    });

    destroyChart('axtl');
    chartInstances.axtl = new Chart(document.getElementById('ax-timeline'), {
      type:'line',
      data:{ labels:months, datasets:[{label:'Deadlines', data:months.map(m=>monthCounts[m]), borderColor:'#3a6fea', backgroundColor:'rgba(58,111,234,0.18)', fill:true, tension:.35 }] },
      options:{ plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,ticks:{precision:0}}}, maintainAspectRatio:false }
    });

    destroyChart('axf');
    chartInstances.axf = new Chart(document.getElementById('ax-faculty'), {
      type:'bar',
      data:{ labels:facCounts.map(x=>x.name), datasets:[{label:'Grants', data:facCounts.map(x=>x.count), backgroundColor:'#1d3a82', borderRadius:6}] },
      options:{ indexAxis:'y', plugins:{legend:{display:false}}, maintainAspectRatio:false, scales:{x:{beginAtZero:true,ticks:{precision:0}}} }
    });
  };

  /* -----------------------------------------------------------
   *  EXPORT
   * --------------------------------------------------------- */
  function exportCSV() {
    const cols = ['id','title','organization','country','category','currency','amount','deadline','status','website','contactEmail'];
    const list = applyFilters(activeGrants());
    const rows = [cols.join(',')];
    list.forEach(g => {
      const status = grantStatus(g);
      const r = cols.map(c => {
        const v = c === 'status' ? status : g[c];
        return `"${String(v ?? '').replace(/"/g,'""')}"`;
      });
      rows.push(r.join(','));
    });
    const blob = new Blob([rows.join('\n')], { type:'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `petra-grants-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast('CSV exported', 'success');
  }

  /* -----------------------------------------------------------
   *  GLOBAL EVENT DELEGATION
   * --------------------------------------------------------- */
  document.addEventListener('click', (e) => {
    // Nav links
    const nav = e.target.closest('.nav-link');
    if (nav && nav.dataset.route) {
      e.preventDefault();
      navigate(nav.dataset.route);
      $('#sidebar').classList.add('-translate-x-full');
      $('#sidebar-backdrop').classList.add('hidden');
      return;
    }

    // Grant detail open
    const openTrigger = e.target.closest('[data-grant], [data-grant-open]');
    if (openTrigger && !e.target.closest('.bookmark-btn') && !e.target.closest('[data-edit]') && !e.target.closest('[data-archive]') && !e.target.closest('[data-delete]')) {
      const id = openTrigger.dataset.grant || openTrigger.dataset.grantOpen;
      if (id) { openGrant(id); return; }
    }

    if (e.target.closest('#close-modal')) { closeGrant(); return; }
    if (e.target === $('#grant-modal')) { closeGrant(); return; }
    if (e.target === $('#grant-form-modal')) { $('#grant-form-modal').classList.add('hidden'); return; }

    // Bookmark
    const bm = e.target.closest('.bookmark-btn, [data-bookmark]');
    if (bm) {
      e.stopPropagation();
      const id = bm.dataset.id || bm.dataset.bookmark;
      if (state.bookmarks.has(id)) state.bookmarks.delete(id); else state.bookmarks.add(id);
      storage.save(LS_KEYS.bookmarks, Array.from(state.bookmarks));
      toast(state.bookmarks.has(id) ? 'Bookmarked' : 'Bookmark removed', 'success');
      // Refresh icons
      if (location.hash.startsWith('#favorites')) render();
      else if ($('#grant-modal').classList.contains('hidden') === false) openGrant(id); // re-render modal
      else render();
      return;
    }

    // View toggle
    const viewBtn = e.target.closest('[data-view]');
    if (viewBtn) { state.filters.view = viewBtn.dataset.view; render(); return; }

    // Reset filters
    if (e.target.closest('#reset-filters')) {
      Object.assign(state.filters, { q:'', faculty:'', program:'', degree:'', country:'', category:'', status:'', sort:'deadline-asc', page:1 });
      $('#global-search').value = '';
      render(); return;
    }

    // Export
    if (e.target.closest('#export-csv')) { exportCSV(); return; }

    // Pagination
    if (e.target.closest('#page-prev')) { state.filters.page = Math.max(1, state.filters.page-1); render(); return; }
    if (e.target.closest('#page-next')) { state.filters.page += 1; render(); return; }

    // Admin actions
    const edit = e.target.closest('[data-edit]');
    if (edit && state.user) { e.stopPropagation(); openGrantForm(edit.dataset.edit); return; }

    const arch = e.target.closest('[data-archive]');
    if (arch && state.user) {
      const id = arch.dataset.archive;
      const g = state.grants.find(x=>x.id===id);
      if (g) { g.archived = !g.archived; storage.save(LS_KEYS.grants, state.grants);
        logActivity(g.archived?'archive':'restore', `${g.archived?'Archived':'Restored'} "${g.title}"`);
        toast(g.archived?'Grant archived':'Grant restored', 'success'); render(); }
      return;
    }

    const del = e.target.closest('[data-delete]');
    if (del && state.user) {
      const id = del.dataset.delete;
      const g = state.grants.find(x=>x.id===id);
      if (g && confirm(`Delete "${g.title}" permanently?`)) {
        state.grants = state.grants.filter(x => x.id !== id);
        storage.save(LS_KEYS.grants, state.grants);
        logActivity('delete', `Deleted "${g.title}"`);
        toast('Grant deleted', 'success'); render();
      }
      return;
    }

    if (e.target.closest('#new-grant-btn')) { openGrantForm(); return; }

    // Faculty/program shortcut filter
    const filterFac = e.target.closest('[data-filter-faculty]');
    if (filterFac) { state.filters.faculty = filterFac.dataset.filterFaculty; state.filters.page=1; navigate('grants'); return; }
    const filterProg = e.target.closest('[data-filter-program]');
    if (filterProg) { state.filters.program = filterProg.dataset.filterProgram; state.filters.page=1; navigate('grants'); return; }

    // Theme toggle
    if (e.target.closest('#theme-toggle')) {
      const next = document.documentElement.classList.toggle('dark') ? 'dark' : 'light';
      storage.save(LS_KEYS.theme, next);
      // Re-render charts to refresh colors if any chart screen visible
      if (location.hash.includes('analytics')) window.__renderAnalyticsCharts?.();
      if (location.hash === '' || location.hash === '#dashboard') window.__renderDashboardCharts?.();
      return;
    }

    // Notif panel
    if (e.target.closest('#notif-btn')) {
      const panel = $('#notif-panel');
      panel.classList.toggle('hidden');
      if (!panel.classList.contains('hidden')) renderNotifPanel();
      return;
    }
    if (!e.target.closest('#notif-panel') && !e.target.closest('#notif-btn')) {
      $('#notif-panel').classList.add('hidden');
    }

    // Sidebar toggle (mobile)
    if (e.target.closest('#sidebar-toggle')) {
      $('#sidebar').classList.toggle('-translate-x-full');
      $('#sidebar-backdrop').classList.toggle('hidden');
      return;
    }
    if (e.target.closest('#sidebar-backdrop')) {
      $('#sidebar').classList.add('-translate-x-full');
      $('#sidebar-backdrop').classList.add('hidden');
      return;
    }

    // Logout
    if (e.target.closest('#logout-btn')) {
      logActivity('logout', `Signed out`);
      state.user = null; storage.remove(LS_KEYS.auth);
      updateAuthUI();
      toast('Signed out', 'success');
      navigate('dashboard');
      return;
    }
  });

  // Filter selects
  document.addEventListener('change', (e) => {
    const sel = e.target.closest('[data-filter]');
    if (sel) {
      const key = sel.dataset.filter;
      state.filters[key] = sel.value;
      if (key === 'faculty') state.filters.program = ''; // reset
      state.filters.page = 1;
      render();
      return;
    }
    // Profile (matching)
    if (e.target.id === 'profile-faculty') {
      state.profile.facultyId = e.target.value;
      state.profile.programId = '';
      storage.save(LS_KEYS.profile, state.profile);
      render(); return;
    }
    if (e.target.id === 'profile-program') {
      state.profile.programId = e.target.value;
      storage.save(LS_KEYS.profile, state.profile);
      render(); return;
    }
  });

  // Search
  $('#global-search').addEventListener('input', (e) => {
    state.filters.q = e.target.value;
    state.filters.page = 1;
    // suggestions
    const box = $('#search-suggestions');
    const q = e.target.value.trim().toLowerCase();
    if (!q) { box.classList.add('hidden'); }
    else {
      const matches = activeGrants().filter(g => g.title.toLowerCase().includes(q) || g.organization.toLowerCase().includes(q)).slice(0,6);
      box.innerHTML = matches.length ? matches.map(g => `
        <button class="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm" data-grant="${g.id}">
          <span class="font-medium">${esc(g.title)}</span>
          <span class="block text-xs text-slate-500">${esc(g.organization)} · ${esc(g.country)}</span>
        </button>`).join('') : `<div class="px-3 py-2 text-sm text-slate-500">No matches</div>`;
      box.classList.remove('hidden');
    }
    if (location.hash.startsWith('#grants') || location.hash === '' || location.hash === '#dashboard') render();
  });
  $('#global-search').addEventListener('blur', () => setTimeout(()=>$('#search-suggestions').classList.add('hidden'), 150));
  $('#global-search').addEventListener('focus', (e) => { if (e.target.value) $('#search-suggestions').classList.remove('hidden'); });

  // Login submit
  document.addEventListener('submit', async (e) => {
    if (e.target.id === 'login-form') {
      e.preventDefault();
      const fd = new FormData(e.target);
      const username = fd.get('username');
      const password = fd.get('password');
      const u = state.users.find(x => x.username === username);
      const hash = await sha256(password);
      if (u && u.passwordHash === hash) {
        state.user = { username: u.username, name: u.name, role: u.role };
        storage.save(LS_KEYS.auth, state.user);
        logActivity('login', `Signed in`);
        toast(`Welcome, ${u.name}`, 'success');
        updateAuthUI();
        navigate('admin');
      } else {
        toast('Invalid credentials', 'error');
      }
    }
  });

  /* -----------------------------------------------------------
   *  AUTH UI
   * --------------------------------------------------------- */
  function updateAuthUI() {
    const isAuth = !!state.user;
    $$('.admin-only').forEach(el => el.classList.toggle('hidden', !isAuth));
    $('#auth-link').classList.toggle('hidden', isAuth);
    $('#user-chip').classList.toggle('hidden', !isAuth);
    if (isAuth) {
      $('#user-name').textContent = state.user.name;
      $('#user-initials').textContent = (state.user.name || 'A').slice(0,1).toUpperCase();
    }
  }

  /* -----------------------------------------------------------
   *  BOOT
   * --------------------------------------------------------- */
  function boot() {
    // Theme
    const theme = storage.load(LS_KEYS.theme, 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    $('#footer-year').textContent = new Date().getFullYear();

    syncStatuses();
    updateAuthUI();
    if (window.lucide) lucide.createIcons();

    if (!location.hash) location.hash = 'dashboard';
    render();

    // Closing-soon alerts on launch
    const closing = activeGrants().filter(g => { const d = daysUntil(g.deadline); return d!==null && d>=0 && d<=7; });
    if (closing.length) toast(`${closing.length} grant${closing.length===1?'':'s'} closing within 7 days`, 'warn');
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
