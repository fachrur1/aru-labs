/**
 * One-off rewire: point every page and component at the CMS-aware content
 * loader (`src/lib/content.ts`) instead of importing the seed directly.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '..', 'src');

/** file -> [from, to] pairs applied to the frontmatter import block. */
const rewrites = [
  ['pages/index.astro', "import { projects } from '../data/projects';", "import { getPublishedProjects } from '../lib/content';"],
  ['pages/work/index.astro', "import { projects } from '../../data/projects';", "import { getPublishedProjects } from '../../lib/content';"],
  ['pages/portfolio/index.astro', "import { projects, categories } from '../../data/projects';", "import { getPublishedProjects, getCategories } from '../../lib/content';"],
  ['pages/exhibition/index.astro', "import { projects } from '../../data/projects';", "import { getPublishedProjects } from '../../lib/content';"],
  ['pages/about/index.astro', "import { profile } from '../../data/projects';", "import { getProfile } from '../../lib/content';"],
  ['pages/contact/index.astro', "import { contact } from '../../data/projects';", "import { getContact } from '../../lib/content';"],
  ['pages/work/[slug].astro', "import { projects, type Project } from '../../data/projects';", "import { getPublishedProjects, getProject, getAdjacent, type Project } from '../../lib/content';"],
  ['components/SiteFooter.astro', "import { contact } from '../data/projects';", "import { getContact } from '../lib/content';"],
  ['components/ProjectCard.astro', "import type { Project } from '../data/projects';", "import type { Project } from '../lib/content';"],
];

for (const [file, from, to] of rewrites) {
  const path = resolve(src, file);
  let text = await readFile(path, 'utf8');
  if (!text.includes(from)) {
    console.log(`skip ${file} (import not found)`);
    continue;
  }
  text = text.replace(from, to);
  await writeFile(path, text, 'utf8');
  console.log(`rewired ${file}`);
}
