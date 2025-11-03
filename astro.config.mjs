import { defineConfig } from 'astro/config';

// Update `site` to match your GitHub Pages URL (e.g. https://your-user.github.io/portfolio)
export default defineConfig({
  site: 'https://savoi.github.io',
  base: '/portfolio',
  output: 'static',
  trailingSlash: 'never'
});
