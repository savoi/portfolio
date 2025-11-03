# Portfolio

Personal portfolio scaffolded with [Astro](https://astro.build). It ships with structured sections for projects, blog posts, and other curious artefacts, all ready for deployment to GitHub Pages.

## Getting started

```bash
pnpm install # or npm install / yarn install
pnpm dev      # run the local dev server
```

## Project structure

```
└── src
    ├── content
    │   ├── blog          # Markdown posts (content collections)
    │   ├── projects      # Structured project data (JSON)
    │   └── artefacts     # Misc artefacts (JSON)
    ├── layouts           # Shared page layout
    ├── pages             # Astro pages (index, projects, blog, artefacts)
    └── styles            # Global styles
```

Update the placeholder URLs inside `astro.config.mjs` and the sample content files with your own details.

## Deployment

This project is configured for static output, making it ideal for GitHub Pages. Build and deploy with:

```bash
pnpm build
```

The generated site will live in `dist/`. Push that directory to the `gh-pages` branch (or enable GitHub Actions) to publish.

See the notes in the deployment section of the pull request for more tips.
