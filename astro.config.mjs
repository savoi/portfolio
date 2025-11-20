import { defineConfig, envField } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://savoi.github.io',
  output: 'static',
  trailingSlash: 'never',
  env: {
    schema: {
      WIP: envField.number({ context: 'server', access: 'public', default: 0 })
    }
  },
  integrations: [
    react(),
    {
      name: 'coming-soon-prune',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          if (process.env.WIP !== '1') return;
          const fs = await import('node:fs/promises');

          const keep = new Set([
            'index.html',
            '_astro',
            'assets',
            'favicon.ico',
            'favicon-light.svg',
            'favicon-dark.svg',
            'apple-touch-icon.png',
            'site.webmanifest',
            'safari-pinned-tab.svg',
          ]);

          for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
            if (keep.has(entry.name) || entry.name.startsWith('favicon')) continue;

            const url = new URL(entry.name + (entry.isDirectory() ? '/' : ''), dir);
            await fs.rm(url, { recursive: true, force: true });
          }
          console.log('[WIP] pruned dist, kept:', [...keep].join(', '));
        }
      }
    }
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});