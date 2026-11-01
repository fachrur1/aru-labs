/**
 * tests/public-smoke.mjs — browser smoke test of the BUILT site (dist/).
 * Run after `npm run build`:
 *   node tests/public-smoke.mjs
 *
 * Verifies:
 *   1. Public homepage renders all sections from content (fallback mode when
 *      no Supabase env is configured — proves the site still works standalone).
 *   2. The work modal opens and shows the project's full structured content.
 *   3. /admin serves the dashboard app and does not crash without config.
 *   4. No fatal console errors on either page.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.pdf': 'application/pdf', '.ttf': 'font/ttf', '.woff2': 'font/woff2'
};

function serve(distDir) {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    let file = path.join(distDir, p);
    if (!file.startsWith(distDir)) { res.writeHead(403).end(); return; }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      const idx = path.join(file, 'index.html');
      if (fs.existsSync(idx)) file = idx;
      else { res.writeHead(404).end('not found'); return; }
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, () => resolve({ server, port: server.address().port })));
}

let failures = 0;
const check = (name, pass, detail = '') => {
  console.log(`  ${pass ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!pass) failures++;
};

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('dist/index.html not found — run `npm run build` first.');
  process.exit(1);
}

const { server, port } = await serve(DIST);
const base = `http://127.0.0.1:${port}`;
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

try {
  // ---------------- public homepage ----------------
  console.log('\n[public] homepage renders CMS content');
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(`${base}/index.html`, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.waitForFunction(
    () => document.getElementById('cms-hero-title')?.textContent?.includes('Fachrurrozy'),
    { timeout: 20000 }
  );

  const heroTitle = await page.$eval('#cms-hero-title', el => el.textContent.trim());
  check('hero title', heroTitle.includes('Muhammad') && heroTitle.includes('Fachrurrozy'), heroTitle);

  const counts = await page.evaluate(() => ({
    education: document.querySelectorAll('#cms-education-container > div').length,
    skills: document.querySelectorAll('#cms-skills-container > div').length,
    works: document.querySelectorAll('#cms-works-container > div').length,
    photo: document.querySelectorAll('#cms-photography-container > div').length,
    orgs: document.querySelectorAll('#cms-orgs-container > div').length,
    photographyHeading: document.getElementById('cms-photography-heading')?.textContent?.trim() || '',
    photographyDescription: document.getElementById('cms-photography-description')?.textContent?.trim() || '',
    counter: document.getElementById('works-counter')?.textContent?.trim() || '',
    about: document.getElementById('cms-about-body')?.textContent?.trim().slice(0, 40) || '',
    contactEmail: document.getElementById('cms-contact-email')?.getAttribute('href') || ''
  }));
  check('education entries (2)', counts.education === 2, `${counts.education}`);
  check('skill groups (5)', counts.skills === 5, `${counts.skills}`);
  check('works slides (12)', counts.works === 12, `${counts.works}`);
  check('works counter "1 / 12"', counts.counter === '1 / 12', counts.counter);
  check('photography tiles (6)', counts.photo === 6, `${counts.photo}`);
  check('organization cards (2)', counts.orgs === 2, `${counts.orgs}`);
  check('Photography heading has fallback', counts.photographyHeading === 'Photography', counts.photographyHeading);
  check('Photography description has fallback', counts.photographyDescription.startsWith('The Symbiosis of Engineering'), counts.photographyDescription.slice(0, 52));
  check('about body rendered', counts.about.length > 10, counts.about);
  check('contact email link', counts.contactEmail.startsWith('mailto:'), counts.contactEmail);

  // work modal: the CMS can order projects and experiences together, so
  // verify the modal against the actual first visible slide rather than a
  // fixed project title.
  const firstSlideTitle = await page.$eval('#cms-works-container [data-slide="0"] h3', el => el.textContent.trim());
  await page.evaluate(() => window.openWorkModal && window.openWorkModal(0));
  await page.waitForSelector('.modal-overlay .modal-content', { timeout: 10000 });
  const modalText = await page.$eval('.modal-overlay .modal-content', el => el.innerText);
  check('modal opens with first slide title', modalText.includes(firstSlideTitle), firstSlideTitle);
  check('modal shows Role meta', /Role/i.test(modalText));
  check('modal shows structured block', /Problem/i.test(modalText));
  await page.keyboard.press('Escape').catch(() => {});

  // CV button points at the CV pdf in fallback mode
  const cvHref = await page.$eval('a[download]', a => a.getAttribute('href'));
  check('Download CV href', /CV_Muhammad_Fachrurrozy\.pdf/.test(cvHref) || cvHref.endsWith('.pdf'), cvHref);

  const fatal = errors.filter(e => !/favicon|net::ERR|404|Failed to load resource/i.test(e));
  check('no fatal console errors', fatal.length === 0, fatal.slice(0, 2).join(' | '));

  // ---------------- admin app ----------------
  console.log('\n[admin] /admin serves the dashboard app');
  const admin = await browser.newPage();
  await admin.setViewport({ width: 1440, height: 900 });
  const adminErrors = [];
  admin.on('pageerror', e => adminErrors.push(e.message));
  admin.on('console', m => { if (m.type() === 'error') adminErrors.push(m.text()); });

  const resp = await admin.goto(`${base}/admin/`, { waitUntil: 'networkidle2', timeout: 60000 });
  check('admin responds 200', resp.status() === 200, `status ${resp.status()}`);
  await new Promise(r => setTimeout(r, 1500));
  const adminBody = await admin.evaluate(() => document.body.innerText.trim());
  check('admin renders UI', adminBody.length > 40, adminBody.slice(0, 70).replace(/\n/g, ' '));
  const adminFatal = adminErrors.filter(e => !/favicon|net::ERR|404|Failed to load resource/i.test(e));
  check('admin: no fatal console errors', adminFatal.length === 0, adminFatal.slice(0, 2).join(' | '));
} finally {
  await browser.close();
  server.close();
}

console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll smoke checks passed ✓');
process.exit(failures ? 1 : 0);
