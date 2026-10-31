import puppeteer from 'puppeteer';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const browser = await puppeteer.launch({ headless: true, executablePath: process.env.OJI_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', args: ['--no-proxy-server', '--disable-gpu'], timeout: 60000 });
const origin = process.env.OJI_TEST_URL || 'http://127.0.0.1:4321';
const routes = ['/', '/work/', '/portfolio/', '/exhibition/', '/about/', '/contact/', '/404', '/work/nala-2024/', '/work/ferrumium/', '/work/nala-2023/', '/work/photobioreactor/', '/work/nef-2023/'];
const widths = [1920, 1440, 1024, 768, 390, 320];
const results = [];
const errors = [];
await mkdir('docs/qa', { recursive: true });
try {
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error.message));
  for (const width of widths) {
    await page.setViewport({ width, height: width < 768 ? 844 : 1000, deviceScaleFactor: 1 });
    for (const route of routes) {
      const response = await page.goto(origin + route, { waitUntil: 'networkidle0' });
      assert.ok(response.status() < 400 || route === '/404', `${route}: ${response.status()}`);
      await page.evaluate(async () => { await document.fonts.ready; for (const image of document.images) { image.loading = 'eager'; } });
      await page.waitForFunction(() => [...document.images].every(image => image.complete));
      const state = await page.evaluate(() => ({
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        heading: document.querySelector('h1')?.textContent.trim(),
        broken: [...document.images].filter(image => !image.naturalWidth).map(image => image.src),
        main: Boolean(document.querySelector('main#main')),
      }));
      assert.ok(state.scrollWidth <= width + 1, `Overflow ${route} @${width}: ${state.scrollWidth}`);
      assert.ok(state.heading, `Missing h1 ${route}`);
      assert.ok(state.main, `Missing main ${route}`);
      assert.deepEqual(state.broken, [], `Broken images ${route}`);
      results.push({ route, width, ...state });
    }
    await page.goto(origin, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: `docs/qa/home-${width}.png` });
  }
  await page.setViewport({ width: 1440, height: 1000 });
  await page.goto(origin, { waitUntil: 'networkidle0' });
  const before = await page.$eval('[data-layer="clouds"]', element => element.style.transform);
  await page.evaluate(() => scrollTo({ top: 400, behavior: 'instant' }));
  await page.waitForFunction(before => document.querySelector('[data-layer="clouds"]').style.transform !== before, {}, before);
  const transforms = await page.$$eval('[data-hero] [data-layer]', elements => elements.map(element => ({ name: element.dataset.layer, transform: element.style.transform })));
  assert.ok(new Set(transforms.map(item => item.transform)).size >= 5, 'Independent parallax transforms');
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.waitForFunction(() => document.documentElement.dataset.motion === 'off');
  const reduced = await page.$$eval('[data-layer]', elements => elements.every(element => element.style.transform === 'translate3d(0px, 0px, 0) rotate(0deg) scale(1)'));
  assert.ok(reduced, 'Reduced motion leaves static composition');
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(origin, { waitUntil: 'networkidle0' });
  await page.click('.menu-toggle');
  assert.ok(await page.$eval('#mobile-menu', element => element.open));
  await page.keyboard.press('Escape');
  assert.equal(await page.$eval('#mobile-menu', element => element.open), false);
  await page.goto(origin + '/portfolio/', { waitUntil: 'networkidle0' });
  const filters = await page.$$eval('[aria-pressed]', elements => elements.filter(element => !element.hasAttribute('data-motion-toggle')).map(element => ({ text: element.textContent, selector: element.dataset.category || element.dataset.filter })));
  assert.ok(filters.length >= 2, 'Gallery offers populated filters');
  assert.deepEqual(errors, [], 'Browser runtime errors');
  await writeFile('docs/qa/public-results.json', JSON.stringify({ status: 'passed', checks: results.length, results, transforms, filters, errors }, null, 2));
  console.log(JSON.stringify({ status: 'passed', responsiveChecks: results.length, parallax: 'independent', reducedMotion: 'static', mobileMenu: 'Escape verified', filters, errors }, null, 2));
} finally { await browser.close(); }
