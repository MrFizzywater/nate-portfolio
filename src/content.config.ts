import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const prints = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: 'src/content/prints' }),
  schema: z.object({
    title: z.string(),
    series: z.string().default('Atmospheres'),
    year: z.number().default(2026),
    image: z.string().default('/uploads/placeholder.jpg'),
    gallery: z.array(z.string()).default([]),
    editionType: z.enum(['Limited Edition', 'Open Edition', 'Archival Display']).default('Limited Edition'),
    paper: z.string().default('Hahnemühle Photo Rag 308gsm'),
    sizes: z.array(z.string()).default(['12x18 in', '16x24 in']),
    stripeUrl: z.string().optional(),
    priceNote: z.string().default('CAD $120.00+'),
    featured: z.boolean().default(true),
    flavorText: z.string().optional(),
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

export const collections = { prints, archive };
