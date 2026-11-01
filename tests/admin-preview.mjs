/**
 * tests/admin-preview.mjs — renders the REAL admin dashboard against a mocked
 * Supabase backend (request interception) and captures UI screenshots.
 *
 * Build first with dummy env (the admin reads config at build time):
 *   VITE_SUPABASE_URL=https://mock.supabase.co VITE_SUPABASE_ANON_KEY=dummy \
 *     npx vite build
 *   node tests/admin-preview.mjs
 *
 * Screenshots land in docs/qa/cms/. No network, no real credentials needed.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'docs/qa/cms');
fs.mkdirSync(OUT, { recursive: true });

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.pdf': 'application/pdf', '.ttf': 'font/ttf'
};

function serve(distDir) {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    let file = path.join(distDir, p);
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      const idx = path.join(file, 'index.html');
      if (fs.existsSync(idx)) file = idx;
      else { res.writeHead(404).end('nf'); return; }
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(r => server.listen(0, () => r({ server, port: server.address().port })));
}

// ---------------------------------------------------------------------------
// Fixtures derived from the real portfolio content
// ---------------------------------------------------------------------------
const legacy = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/data.json'), 'utf-8'));
const UID = '11111111-1111-4111-8111-111111111111';
const now = Date.now();
const iso = (daysAgo) => new Date(now - daysAgo * 864e5).toISOString();
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

const catByWork = new Map();
legacy.works.forEach((w, i) => {
  const name = w.category || 'Other';
  if (!catByWork.has(name)) {
    catByWork.set(name, `cat-${catByWork.size}`);
  }
});
const projectCats = [...catByWork.entries()].map(([name, id], i) => ({
  id, kind: 'project', name, slug: slug(name), icon: null, sort_order: i * 10
}));
const skillCats = legacy.skills.map((g, i) => ({
  id: `scat-${i}`, kind: 'skill_group', name: g.category, slug: slug(g.category),
  icon: g.icon || 'category', sort_order: i * 10
}));

const EXPERIENCE_CATS = new Set(['Community', 'Organization']);
const projects = [];
const experiences = [];
legacy.works.forEach((w, i) => {
  const base = {
    sort_order: i * 10, display_priority: 0, status: 'published',
    technologies: w.tags || [], featured: i === 0, include_in_works: true,
    created_at: iso(120 - i * 5), updated_at: iso(Math.max(0, 6 - i))
  };
  if (EXPERIENCE_CATS.has(w.category)) {
    experiences.push({
      ...base, id: `exp-${i}`, slug: slug(w.title), title: w.title,
      organization_name: w.title.split('—')[0].trim(), position: 'Member',
      short_description: w.short_desc, employment_type: w.category,
      description: w.description, responsibilities: '', achievements: '',
      skills: w.tags || [], location: '', start_date: null, end_date: null,
      currently_working: false, logo_url: '', media: [], external_links: []
    });
  } else {
    projects.push({
      ...base, id: `proj-${i}`, slug: slug(w.title), title: w.title,
      short_description: w.short_desc, full_description: w.description,
      category_id: catByWork.get(w.category), start_date: null, completion_date: null,
      location: '', role: '', team: '', tools: [], technical_skills: [],
      methodology: '', technical_specifications: '', key_achievements: '',
      project_outcomes: '', thumbnail_url: '', thumbnail_alt: '', cover_url: '',
      cover_alt: '', video_url: null, live_url: null, github_url: null,
      documentation_url: null, publication_url: null, related_resources: []
    });
  }
});

const fixtures = {
  admin_users: [{ user_id: UID, role: 'admin', created_at: iso(30) }],
  profiles: [{
    id: 'prof-1', is_primary: true, status: 'published',
    full_name: 'Muhammad Fachrurrozy', hero_line1: 'Muhammad', hero_line2: 'Fachrurrozy',
    professional_headline: 'Engineering Physics Student at Universitas Gadjah Mada',
    short_intro: 'Focused on Renewable Energy, 3D Design, Internet of Thing, and GIS Analysis',
    about_heading: 'About My Focus', about_body: legacy.about.body,
    profile_photo_url: 'https://fachrur.is-a.dev/assets/images/1781134665469_2024_0102_07221000__1_.jpg',
    profile_photo_alt: 'Muhammad Fachrurrozy', professional_interests: ['Renewable Energy', 'GIS'],
    areas_of_expertise: ['Energy Systems', '3D Design'], location: 'Yogyakarta',
    availability_status: 'Open for collaboration', updated_at: iso(2)
  }],
  projects,
  project_media: [
    { id: 'pm-1', project_id: 'proj-0', url: 'https://fachrur.is-a.dev/assets/images/1781133046207_WhatsApp-Image-2026-06-09-at-08.30.50-1.jpg', caption: 'Field installation', alt: 'Agrovoltaic field', sort_order: 10 }
  ],
  experiences,
  education: legacy.education.map((e, i) => ({
    id: `edu-${i}`, institution: e.institution, degree: '', field_of_study: e.major,
    start_date: i === 0 ? '2022-01-01' : '2019-01-01',
    graduation_date: i === 0 ? null : '2022-01-01',
    description: '', achievements: '', relevant_coursework: [], logo_url: null,
    documents: [], display_order: i * 10, status: 'published', updated_at: iso(10)
  })),
  skills: legacy.skills.flatMap((g, gi) => g.items.map((name, i) => ({
    id: `sk-${gi}-${i}`, name, category_id: `scat-${gi}`, proficiency_level: null,
    proficiency_percent: null, show_proficiency: false, description: '', icon_url: null,
    related_projects: [], sort_order: i * 10, status: 'published', updated_at: iso(20)
  }))),
  organizations: legacy.organizations.map((o, i) => ({
    id: `org-${i}`, slug: slug(o.name), organization_name: o.name, position: o.role,
    organization_type: 'Student organization', description: '', responsibilities: '',
    achievements: '', start_date: null, end_date: null, logo_url: null,
    related_experiences: [], external_links: [], sort_order: i * 10,
    status: 'published', updated_at: iso(15)
  })),
  gallery: legacy.photography.map((p, i) => ({
    id: `gal-${i}`, title: p.title, description: '', category_id: null, location: '',
    capture_date: null, image_url: '', alt_text: '', featured: i === 0,
    sort_order: i * 10, status: 'published', updated_at: iso(8)
  })),
  content_categories: [...projectCats, ...skillCats],
  site_settings: [
    { key: 'text_alignment', value: 'text-justify', label: 'Body text alignment', updated_at: iso(3) },
    { key: 'contact_heading', value: legacy.contact.heading, label: 'Contact heading', updated_at: iso(3) },
    { key: 'contact_body', value: legacy.contact.body, label: 'Contact body', updated_at: iso(3) },
    { key: 'contact_email', value: legacy.contact.email, label: 'Contact email', updated_at: iso(3) }
  ],
  social_links: [
    { id: 'sl-1', platform: 'email', label: 'Email', url: `mailto:${legacy.contact.email}`, icon: 'mail', sort_order: 10, visible: true, updated_at: iso(3) },
    { id: 'sl-2', platform: 'linkedin', label: 'LinkedIn', url: legacy.contact.linkedin, icon: 'linkedin', sort_order: 20, visible: true, updated_at: iso(3) },
    { id: 'sl-3', platform: 'instagram', label: 'Instagram', url: legacy.contact.instagram, icon: 'instagram', sort_order: 30, visible: true, updated_at: iso(3) }
  ],
  documents: [{
    id: 'doc-1', title: 'Curriculum Vitae — Muhammad Fachrurrozy', description: 'Active CV',
    doc_type: 'cv', file_url: 'https://fachrur.is-a.dev/CV_Muhammad_Fachrurrozy.pdf',
    storage_path: 'documents/cv-muhammad-fachrurrozy.pdf', mime_type: 'application/pdf',
    file_size: 43418, version: '1.0', is_active: true, uploaded_at: iso(30), updated_at: iso(30)
  }],
  site_images: [
    { key: 'profile_image', url: fixturesProfilePhoto(), alt: 'Portrait', caption: '', updated_at: iso(3) },
    { key: 'unila', url: 'https://fachrur.is-a.dev/assets/images/1781134048921_____PENGUMUMAN_PEMENANG_LOMBA_KARYA_TULIS_ILMIAH___Hello__young_scientist____After_going_through.jpg', alt: 'EXPO award', caption: '', updated_at: iso(3) }
  ]
};
function fixturesProfilePhoto() {
  return 'https://fachrur.is-a.dev/assets/images/1781134665469_2024_0102_07221000__1_.jpg';
}

// ---------------------------------------------------------------------------
// Mock Supabase (PostgREST + Auth) over request interception
// ---------------------------------------------------------------------------
const SESSION = {
  access_token: 'mock-access-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'mock-refresh',
  user: {
    id: UID, aud: 'authenticated', role: 'authenticated',
    email: 'admin@example.com', app_metadata: {}, user_metadata: {},
    created_at: iso(30)
  }
};

function mockSupabase(url, method, headers, postBody) {
  const CORS = {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': '*',
    'access-control-expose-headers': 'content-range, content-type'
  };
  if (method === 'OPTIONS') return { status: 204, headers: CORS, body: '' };

  const u = new URL(url);
  if (u.pathname.startsWith('/auth/v1/')) {
    if (u.pathname === '/auth/v1/user' || u.pathname === '/auth/v1/token') {
      return { status: 200, headers: { ...CORS, 'content-type': 'application/json' }, body: JSON.stringify(SESSION) };
    }
    return { status: 200, headers: { ...CORS, 'content-type': 'application/json' }, body: '{}' };
  }

  const table = u.pathname.replace('/rest/v1/', '').split('/')[0];
  let rows = [...(fixtures[table] || [])];
  for (const [k, v] of u.searchParams) {
    const m = /^eq\.(.*)$/.exec(v);
    if (m && k !== 'select') rows = rows.filter(r => String(r[k]) === m[1]);
    const inM = /^in\.(.*)$/.exec(v);
    if (inM && k !== 'select') {
      const vals = inM[1].replace(/^\(|\)$/g, '').split(',');
      rows = rows.filter(r => vals.includes(String(r[k])));
    }
  }
  const order = u.searchParams.get('order');
  if (order) {
    for (const part of order.split(',')) {
      const [col, dir] = part.split('.');
      rows.sort((a, b) => {
        const x = a[col] ?? '', y = b[col] ?? '';
        return (x > y ? 1 : x < y ? -1 : 0) * (dir === 'desc' ? -1 : 1);
      });
    }
  }
  const total = rows.length;
  const offset = Number(u.searchParams.get('offset') || 0);
  const limit = u.searchParams.get('limit');
  rows = rows.slice(offset, limit ? offset + Number(limit) : undefined);

  const headersOut = {
    ...CORS,
    'content-type': 'application/json',
    'content-range': `${offset}-${offset + rows.length - 1}/${total}`
  };
  const accept = String((headers && (headers.Accept || headers.accept)) || '');
  const single = accept.includes('vgrst.object');
  if (single) {
    if (!rows.length) return { status: 406, headers: headersOut, body: '{}' };
    return { status: 200, headers: headersOut, body: JSON.stringify(rows[0]) };
  }
  if (method === 'HEAD') return { status: 200, headers: headersOut, body: '' };
  if (method === 'POST') return { status: 201, headers: headersOut, body: JSON.stringify(postBody || rows) };
  return { status: 200, headers: headersOut, body: JSON.stringify(rows) };
}

// ---------------------------------------------------------------------------
// Screenshots
// ---------------------------------------------------------------------------
const { server, port } = await serve(DIST);
const base = `http://127.0.0.1:${port}`;
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

async function shot({ name, hash, seedSession = true, width = 1440, height = 900, waitMs = 1200 }) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  await page.setRequestInterception(true);
  page.on('request', req => {
    const url = req.url();
    if (url.startsWith('https://mock.supabase.co')) {
      let body = null;
      try { body = req.method() === 'POST' ? JSON.parse(req.postData() || '{}') : null; } catch { body = null; }
      const res = mockSupabase(url, req.method(), req.headers(), body);
      req.respond({ status: res.status, headers: res.headers, body: res.body }).catch(() => {});
    } else {
      req.continue().catch(() => {});
    }
  });
  if (seedSession) {
    await page.evaluateOnNewDocument((key, sess) => {
      localStorage.setItem(key, JSON.stringify(sess));
    }, 'sb-mock-auth-token', SESSION);
  }
  await page.goto(`${base}/admin/index.html${hash}`, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, waitMs));
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file });
  const text = await page.evaluate(() => document.body.innerText.slice(0, 120).replace(/\n/g, ' '));
  if (name === '08-settings') {
    const labels = await page.$$eval('.known-region .field-label', nodes => nodes.map(node => node.textContent.trim()));
    if (!labels.includes('Photography heading') || !labels.includes('Photography description')) {
      throw new Error(`Photography settings fields missing: ${labels.join(', ')}`);
    }
    console.log('✓ Website Settings exposes editable Photography heading and description');
  }
  if (name === '07-work') {
    const unified = await page.evaluate(() => ({
      heading: document.querySelector('.work-page .page-title')?.textContent.trim(),
      workNavCount: [...document.querySelectorAll('.nav-item')].filter((n) => n.textContent.includes('Projects & Experiences')).length,
      tabs: [...document.querySelectorAll('.work-tabs [data-tab]')].map((n) => n.textContent.trim()),
      sections: document.querySelectorAll('.work-list-section').length,
    }));
    if (unified.heading !== 'Projects & Experiences' || unified.workNavCount !== 1 || unified.sections !== 2 || unified.tabs.join(',') !== 'All,Projects,Experiences') {
      throw new Error(`Unified work page failed: ${JSON.stringify(unified)}`);
    }
    await page.click('.work-tabs [data-tab="projects"]');
    await page.waitForFunction(() => document.querySelectorAll('.work-list-section').length === 1 && document.querySelector('.work-list-section .card-title')?.textContent.includes('Projects'));
    await page.click('.work-tabs [data-tab="experiences"]');
    await page.waitForFunction(() => document.querySelectorAll('.work-list-section').length === 1 && document.querySelector('.work-list-section .card-title')?.textContent.includes('Experiences'));
    await page.click('[data-act="new-experience"]');
    await page.waitForFunction(() => document.querySelector('.page-title')?.textContent === 'New experience');
    console.log('✓ unified Projects & Experiences page: one nav item, both tabs filter correctly, experience create form opens');
    await page.goto(`${base}/admin/index.html#/work/projects`);
    await page.waitForFunction(() => document.querySelectorAll('.work-list-section').length === 1 && document.querySelector('.work-list-section .card-title')?.textContent.includes('Projects'));
  }
  console.log(`✓ ${name}.png  ← ${text}`);
  await page.close();
  return file;
}

const files = [];
files.push(await shot({ name: '01-login', hash: '#/login', seedSession: false }));
files.push(await shot({ name: '02-dashboard', hash: '#/dashboard', waitMs: 1800 }));
files.push(await shot({ name: '03-projects', hash: '#/projects', waitMs: 1800 }));
files.push(await shot({ name: '04-project-form', hash: '#/projects/new', waitMs: 1800 }));
files.push(await shot({ name: '05-documents', hash: '#/documents', waitMs: 1500 }));
files.push(await shot({ name: '06-dashboard-mobile', hash: '#/dashboard', width: 390, height: 844, waitMs: 1800 }));
files.push(await shot({ name: '07-work', hash: '#/work', waitMs: 2200 }));
files.push(await shot({ name: '08-settings', hash: '#/settings', waitMs: 1800 }));

await browser.close();
server.close();
console.log('\nScreenshots saved in docs/qa/cms/');
