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

const archive = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: 'src/content/archive' }),
  schema: z.object({
    title: z.string(),
    category: z.string().default('Music Video'),
    year: z.number().default(2026),
    coverImage: z.string().default('/uploads/placeholder.jpg'),
    videoUrl: z.string().optional(),
    role: z.string().default('Director / Editor'),
    client: z.string().optional(),
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
  }),
});

export const collections = { photos, archive, pages };
