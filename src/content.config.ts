import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const photos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: 'src/content/photos' }),
  schema: z.object({
    title: z.string(),
    year: z.number().default(2026),
    image: z.string(),
    category: z.string().default('Landscape'),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: 'src/content/pages' }),
  schema: z.object({
    title: z.string(),
    headline: z.string().optional(),
    portrait: z.string().optional(),
    intro: z.string().optional(),
    email: z.string().optional(),
    location: z.string().optional(),
    instagram: z.string().optional(),
    projectLink: z.string().optional(),
  }),
});

export const collections = { photos, pages };
