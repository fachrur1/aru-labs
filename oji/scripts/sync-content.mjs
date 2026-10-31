/**
 * Fetches published content from the CMS build endpoint and writes it to
 * `src/content-data/content.json`.
 *
 * Environment:
 *   OJI_CONTENT_ENDPOINT  Full URL of the build endpoint. Defaults to
 *                         https://oji.is-cool.dev/api/build/content
 *   OJI_BUILD_TOKEN       Bearer token (required when the endpoint is remote)
 *   OJI_ALLOW_STALE_CONTENT=1
 *                         Keep the existing snapshot instead of failing when
 *                         the endpoint is unreachable. Use for local builds.
 *
 * The build fails by default when content cannot be fetched, so a deploy can
 * never silently publish an empty site.
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outFile = resolve(here, '..', 'src', 'content-data', 'content.json');

const endpoint =
  process.env.OJI_CONTENT_ENDPOINT ??
  'https://oji.is-cool.dev/api/build/content';
const token = process.env.OJI_BUILD_TOKEN;
const allowStale = process.env.OJI_ALLOW_STALE_CONTENT === '1';

const isRemote = /^https?:\/\//.test(endpoint);

async function main() {
  if (isRemote && !token) {
    if (allowStale) {
      console.warn('[sync-content] no OJI_BUILD_TOKEN; skipping (stale allowed)');
      return;
    }
    throw new Error(
      'OJI_BUILD_TOKEN is required to fetch content from the CMS endpoint.',
    );
  }

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(endpoint, { headers });
  } catch (error) {
    if (allowStale) {
      console.warn(`[sync-content] unreachable (${error.message}); stale allowed`);
      return;
    }
    throw error;
  }

  if (!response.ok) {
    if (allowStale) {
      console.warn(`[sync-content] HTTP ${response.status}; stale allowed`);
      return;
    }
    throw new Error(`Content endpoint returned HTTP ${response.status}`);
  }

  const content = await response.json();

  // Guard against a truncated or malformed payload shipping an empty site.
  if (!content?.projects || !Array.isArray(content.projects)) {
    throw new Error('Content endpoint returned no projects array.');
  }

  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
  console.log(
    `[sync-content] wrote ${content.projects.length} projects to ${outFile}`,
  );
}

main().catch(async (error) => {
  if (allowStale) {
    try {
      await readFile(outFile, 'utf8');
      console.warn(`[sync-content] ${error.message}; keeping existing snapshot`);
      return;
    } catch {
      /* fall through to hard failure */
    }
  }
  console.error(`[sync-content] ${error.message}`);
  process.exit(1);
});
