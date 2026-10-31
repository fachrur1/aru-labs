import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { JSDOM } from 'jsdom';

const root = fileURLToPath(new URL('../', import.meta.url));

test('published collection contains the original, artwork-backed project records', async () => {
  const dataPath = path.join(root, 'src/data/projects.ts');
  assert.ok(fs.existsSync(dataPath), 'The published project collection must exist');
  const source = fs.readFileSync(dataPath, 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  const { projects, categories, profile, contact } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
  assert.deepEqual(projects.map(({ slug }) => slug).sort(), ['ferrumium', 'nala-2023', 'nala-2024', 'nef-2023', 'photobioreactor']);
  assert.equal(new Set(projects.map(({ slug }) => slug)).size, projects.length);
  assert.deepEqual(categories, [...new Set(projects.filter(p => p.status === 'published' && p.category.trim()).map(p => p.category))]);
  const original = JSON.parse(fs.readFileSync(path.join(root, '../content/data.json'), 'utf8'));
  const site = JSON.parse(fs.readFileSync(path.join(root, '../content/core/site.json'), 'utf8'));
  assert.deepEqual(contact, site.contact && { email: site.contact.email, linkedin: site.contact.linkedin, instagram: site.contact.instagram });
  assert.match(profile.background, /Engineering Physics/);
  assert.match(profile.background, /Universitas Gadjah Mada/);
  assert.ok(fs.existsSync(path.join(root, 'public', profile.image)));
  for (const project of projects) {
    assert.equal(project.status, 'published');
    assert.ok(project.year && project.role && project.description && project.color);
    assert.ok(project.tools.every(tool => original.works.some(work => work.tags.includes(tool))));
    assert.ok(project.gallery.length > 0, `${project.slug} has original artwork`);
    assert.ok(fs.existsSync(path.join(root, 'public', project.cover)), `${project.slug} cover exists`);
    for (const image of project.gallery) {
      assert.ok(image.alt && image.caption);
      assert.ok(fs.existsSync(path.join(root, 'public', image.src)), image.src);
    }
  }
  assert.ok(!categories.some(category => /photography|motion|experimental/i.test(category)), 'No empty disciplines');
});

test('all supporting public routes have page content and shared navigation', () => {
  for (const route of ['work/index', 'portfolio/index', 'work/[slug]', 'exhibition/index', 'about/index', 'contact/index', '404']) {
    const file = path.join(root, `src/pages/${route}.astro`);
    assert.ok(fs.existsSync(file), `${route} must exist`);
    const page = fs.readFileSync(file, 'utf8');
    assert.match(page, /<Base /, `${route} uses SEO layout`);
    assert.match(page, /<SiteHeader\s*\/>/, `${route} includes navigation`);
    assert.match(page, /<SiteFooter/, `${route} includes footer`);
    assert.match(page, /<h1 /, `${route} has a heading`);
    assert.match(page, /id="main"/, `${route} has a skip-link target`);
  }
});

test('portfolio filters synchronize URL, pressed state, visibility, and browser history', async () => {
  const pagePath = path.join(root, 'src/pages/portfolio/index.astro');
  assert.ok(fs.existsSync(pagePath), 'The filterable portfolio page must exist');
  const source = fs.readFileSync(pagePath, 'utf8');
  const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'Portfolio ships working native filter controls');
  const { outputText } = ts.transpileModule(script, { compilerOptions: { target: ts.ScriptTarget.ES2022 } });
  const dom = new JSDOM('<div data-portfolio><div data-filter-controls hidden><button data-category="" aria-pressed="true">All</button><button data-category="Character design" aria-pressed="false">Character</button><button data-category="Product design" aria-pressed="false">Product</button></div><p data-filter-count></p><article data-project-category="Character design"></article><article data-project-category="Product design"></article></div>', { url: 'https://oji.is-cool.dev/portfolio/?category=Character%20design', runScripts: 'outside-only' });
  dom.window.eval(outputText);
  const { document, history, location, PopStateEvent } = dom.window;
  const buttons = [...document.querySelectorAll('button')];
  const cards = [...document.querySelectorAll('article')];
  assert.equal(document.querySelector('[data-filter-controls]').hidden, false);
  assert.equal(buttons[1].getAttribute('aria-pressed'), 'true');
  assert.deepEqual(cards.map(card => card.hidden), [false, true]);
  buttons[2].click();
  assert.equal(new URL(location.href).searchParams.get('category'), 'Product design');
  assert.deepEqual(cards.map(card => card.hidden), [true, false]);
  assert.equal(buttons[2].getAttribute('aria-pressed'), 'true');
  assert.match(document.querySelector('[data-filter-count]').textContent, /1 project/);
  buttons[0].click();
  assert.equal(new URL(location.href).searchParams.has('category'), false);
  assert.deepEqual(cards.map(card => card.hidden), [false, false]);
  history.replaceState({}, '', '?category=Character%20design');
  dom.window.dispatchEvent(new PopStateEvent('popstate'));
  assert.deepEqual(cards.map(card => card.hidden), [false, true]);
  history.replaceState({}, '', '?category=not-a-category');
  dom.window.dispatchEvent(new PopStateEvent('popstate'));
  assert.equal(buttons[0].getAttribute('aria-pressed'), 'true');
  assert.deepEqual(cards.map(card => card.hidden), [false, false]);
  assert.equal(new URL(location.href).searchParams.has('category'), false);
  dom.window.close();
});
