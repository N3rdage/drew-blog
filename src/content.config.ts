import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One schema for all three streams (drew / library / bonsai). The stream
// itself is implied by the collection, not stored in frontmatter — local
// posts stay untouched and synced posts can't mislabel themselves.
// Syndicated fields (author, reviewed_by, canonicalUrl, sourceRepo) are
// optional and simply absent on locally-authored posts.
// Contract for syndicated sources: docs/BLOG_POST_CONTRACT.md
const postSchema = ({ image }: { image: () => any }) =>
	z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.optional(image()),
		// Alt text for the hero. Omit to default to the title (good for
		// image SEO); set to "" to mark a purely decorative hero.
		heroAlt: z.string().optional(),
		// Pre-generated social card in /public, e.g. "/og/my-post.png".
		// Generate with: node tools/og-generate.js "Title" "Subtitle" <path>
		ogImage: z.string().optional(),
		tags: z.array(z.string()).default([]),
		// Syndicated-stream fields — stamped by the sync, never hand-written.
		author: z.string().optional(),
		reviewed_by: z.string().optional(),
		canonicalUrl: z.string().url().optional(),
		sourceRepo: z.string().optional(),
	});

// README.md in the synced directories documents them as generated —
// exclude it from the loader so it never renders as a post.
const syncedGlob = (base: string) =>
	glob({ base, pattern: ['**/*.{md,mdx}', '!**/README.md'] });

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: postSchema,
});

// Synced from source repos by tools/sync-blogs.mjs (PR 2) — do not edit by hand.
const library = defineCollection({
	loader: syncedGlob('./src/content/library'),
	schema: postSchema,
});

const bonsai = defineCollection({
	loader: syncedGlob('./src/content/bonsai'),
	schema: postSchema,
});

export const collections = { blog, library, bonsai };
