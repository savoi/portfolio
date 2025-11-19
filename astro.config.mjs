import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://savoi.github.io',
  output: 'static',
  trailingSlash: 'never',
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});