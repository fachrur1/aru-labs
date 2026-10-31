// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

/**
 * OJI — creative portfolio.
 *
 * Deployed as a single Cloudflare Worker (see wrangler.jsonc). Static pages are
 * served from Workers Assets; CMS API routes live under src/pages/api/.
 *
 * Styling is plain CSS driven by design tokens (src/styles/tokens.css), so the
 * Tailwind integration is disabled — the legacy repo root has a Tailwind config
 * that Astro would otherwise pick up from the parent directory.
 */
export default defineConfig({
  output: 'static',
  // OJI manages its own signed session cookie (D1-backed). Astro's built-in
  // session driver would provision an unused Cloudflare KV namespace.
  session: false,
  // UI prototype is static. Opt into Workers only for backend integration.
  adapter: process.env.OJI_CLOUDFLARE === '1' ? cloudflare({
    imageService: { build: 'compile', runtime: 'passthrough' },
  }) : undefined,
  build: {
    assets: '_assets',
  },
  vite: {
    build: {
      assetsInlineLimit: 2048,
    },
  },
});
