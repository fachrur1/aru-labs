/**
 * Content access layer.
 *
 * The public site is statically generated. At build time `scripts/sync-content.mjs`
 * fetches published content from the CMS build endpoint and writes it to
 * `src/content-data/content.json` (git-ignored).
 *
 * When that snapshot exists it is the source of truth. Until the CMS is live —
 * or for local development — the committed seed in `src/data/projects.ts` is
 * used, so the site always builds with real content rather than placeholders.
 *
 * Both shapes are the same: `Project`, `categories`, `contact`, `profile`.
 */

import {
  projects as seedProjects,
  categories as seedCategories,
  contact as seedContact,
  profile as seedProfile,
  type Project,
} from '../data/projects';

export type { Project };

export type Content = {
  projects: Project[];
  categories: string[];
  contact: typeof seedContact;
  profile: typeof seedProfile;
};

let cached: Content | null = null;

async function load(): Promise<Content> {
  if (cached) return cached;

  try {
    const snapshots = import.meta.glob<Partial<Content>>('../content-data/content.json', { eager: true, import: 'default' });
    const data = snapshots['../content-data/content.json'] ?? {};

    // Only trust the snapshot if it actually carries projects, so a truncated
    // or malformed response can never ship an empty site.
    if (Array.isArray(data.projects) && data.projects.length > 0) {
      cached = {
        projects: data.projects,
        categories: data.categories ?? seedCategories,
        contact: data.contact ?? seedContact,
        profile: data.profile ?? seedProfile,
      };
      return cached;
    }
  } catch {
    // No snapshot present — fall through to the seed.
  }

  cached = {
    projects: seedProjects,
    categories: seedCategories,
    contact: seedContact,
    profile: seedProfile,
  };
  return cached;
}

export async function getContent(): Promise<Content> {
  return load();
}

export async function getProjects(): Promise<Project[]> {
  return (await load()).projects;
}

/** Only projects that are published and carry a category. */
export async function getPublishedProjects(): Promise<Project[]> {
  const { projects } = await load();
  return projects.filter((p) => p.status === 'published' && p.category.trim());
}

export async function getCategories(): Promise<string[]> {
  return (await load()).categories;
}

export async function getProfile() {
  return (await load()).profile;
}

export async function getContact() {
  return (await load()).contact;
}

export async function getProject(slug: string): Promise<Project | undefined> {
  const { projects } = await load();
  return projects.find((p) => p.slug === slug);
}

/** Previous / next project for the detail-page navigation. */
export async function getAdjacent(
  slug: string,
): Promise<{ prev?: Project; next?: Project }> {
  const projects = await getPublishedProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return {};
  return {
    prev: index > 0 ? projects[index - 1] : undefined,
    next: index < projects.length - 1 ? projects[index + 1] : undefined,
  };
}
