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
          if (process.env.WIP === '1') {
            const fs = await import('node:fs/promises');
            for (const entry of await fs.readdir(dir)) {
              if (entry !== 'index.html' && entry !== 'favicon.svg') {
                try {
                  await fs.rm(new URL(entry + '/', dir), { recursive: true, force: true });
                } catch {}
              }
            }
          }
        }
      }
    }
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});