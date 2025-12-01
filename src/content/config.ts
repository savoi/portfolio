import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      publishDate: z.coerce.date(),
      draft: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
      heroImage: image().optional(),
    }),
});

const projects = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    image: z.object({
      src: z.string(),
      alt: z.string(),
    }).optional(),
    thumb: z.object({
      src: z.string(),
      alt: z.string(),
    }).optional(),
    order: z.number().default(0),
    tech: z.array(z.string()),
    links: z
      .object({
        demo: z.string().url().optional(),
        source: z.string().url().optional(),
        caseStudy: z.string().url().optional(),
      })
      .default({}),
  }),
});

const artefacts = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    type: z.string(),
    year: z.number().optional(),
    link: z.string().url().optional(),
    linkText: z.string().optional(),
  }),
});

export const collections = { blog, projects, artefacts };
