#!/usr/bin/env node
// Sync syndicated blog posts from source repos into the content collections.
//
// Contract (normative): docs/BLOG_POST_CONTRACT.md
// This script VALIDATES and DECORATES — it never repairs. If any post in any
// stream violates the contract, nothing is written and the run exits 1; the
// fix happens upstream in the source repo.
//
// Usage:
//   node tools/sync-blogs.mjs --library <path-to-the-library> --bonsai <path-to-bonsaiGame>
// Either stream may be omitted; only supplied streams are synced.
//
// Per stream, for files in <src>/blog/ matching YYYY-MM-DD-NN-slug.md:
//   validate:  required frontmatter, date == filename date, slug == filename
//              remainder, no H1 in the body
//   decorate:  date -> pubDate, stamp canonicalUrl + sourceRepo
//   rewrite:   relative sibling-post links ./<post>.md -> /{stream}/{slug}/
//   images:    copy <src>/blog/images/ alongside the posts
// The target directory is rebuilt from scratch each run (README.md preserved),
// so upstream deletions and renames propagate. Deterministic and idempotent.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const STREAMS = {
	library: {
		sourceRepo: 'N3rdage/the-library',
		targetDir: 'src/content/library',
	},
	bonsai: {
		sourceRepo: 'N3rdage/bonsaiGame',
		targetDir: 'src/content/bonsai',
	},
};

const POST_FILE = /^(\d{4}-\d{2}-\d{2})-\d{2}-(.+)\.md$/;
const REQUIRED_FIELDS = ['title', 'description', 'date', 'author', 'reviewed_by', 'slug', 'tags'];
// ](./2026-05-08-01-some-slug.md) or ](./2026-05-08-01-some-slug.md#anchor)
const SIBLING_LINK = /\]\(\.\/(\d{4}-\d{2}-\d{2}-\d{2})-([^)#\s]+)\.md(#[^)\s]*)?\)/g;

/** Normalise a frontmatter date (YAML may parse it as a Date object). */
function toDateString(value) {
	if (value instanceof Date) return value.toISOString().slice(0, 10);
	return String(value);
}

/** Split frontmatter and body. Returns null if there is no frontmatter block. */
export function splitFrontmatter(raw) {
	if (!raw.startsWith('---\n')) return null;
	const end = raw.indexOf('\n---\n', 4);
	if (end === -1) return null;
	return { frontmatter: raw.slice(4, end), body: raw.slice(end + 5) };
}

/**
 * Validate one post against the contract.
 * Returns { data, body } on success; throws with a per-post message on failure.
 */
export function validatePost(filename, raw) {
	const match = POST_FILE.exec(filename);
	if (!match) throw new Error(`${filename}: not a post filename`);
	const [, fileDate, fileSlug] = match;

	const parts = splitFrontmatter(raw);
	if (!parts) throw new Error(`${filename}: missing frontmatter block`);

	let data;
	try {
		data = YAML.parse(parts.frontmatter);
	} catch (err) {
		throw new Error(`${filename}: frontmatter is not valid YAML (${err.message})`);
	}

	const problems = [];
	for (const field of REQUIRED_FIELDS) {
		if (data?.[field] === undefined || data[field] === null || data[field] === '') {
			problems.push(`missing '${field}'`);
		}
	}
	if (data?.date !== undefined && toDateString(data.date) !== fileDate) {
		problems.push(`date '${toDateString(data.date)}' != filename date '${fileDate}'`);
	}
	if (data?.slug !== undefined && data.slug !== fileSlug) {
		problems.push(`slug '${data.slug}' != filename remainder '${fileSlug}'`);
	}
	if (data?.tags !== undefined && !Array.isArray(data.tags)) {
		problems.push(`'tags' must be a list`);
	}
	if (/^# /m.test(parts.body)) {
		problems.push('body contains an H1 (title belongs in frontmatter only)');
	}
	if (problems.length) {
		throw new Error(`${filename}: ${problems.join('; ')}`);
	}
	return { data, body: parts.body };
}

/** Rewrite relative sibling-post links to site URLs for the given stream. */
export function rewriteSiblingLinks(body, stream) {
	return body.replace(SIBLING_LINK, (_m, _date, slug, anchor) => {
		return `](/${stream}/${slug}/${anchor ?? ''})`;
	});
}

/** Build the decorated frontmatter for the synced copy of a post. */
export function decorateFrontmatter(data, filename, streamConfig) {
	return {
		title: data.title,
		description: data.description,
		pubDate: toDateString(data.date),
		tags: data.tags,
		author: data.author,
		reviewed_by: data.reviewed_by,
		canonicalUrl: `https://github.com/${streamConfig.sourceRepo}/blob/main/blog/${filename}`,
		sourceRepo: streamConfig.sourceRepo,
	};
}

/**
 * Sync one stream from a source checkout. Two-phase: validate everything
 * first (throwing an aggregate error on any violation), then write.
 */
export function syncStream(stream, sourcePath, { repoRoot = REPO_ROOT } = {}) {
	const config = STREAMS[stream];
	if (!config) throw new Error(`unknown stream '${stream}'`);
	const blogDir = path.join(sourcePath, 'blog');
	if (!fs.existsSync(blogDir)) {
		throw new Error(`${stream}: source blog directory not found at ${blogDir}`);
	}

	// Phase 1 — read and validate every post; collect all errors, fail atomically.
	const postFiles = fs
		.readdirSync(blogDir, { withFileTypes: true })
		.filter((entry) => entry.isFile() && POST_FILE.test(entry.name))
		.map((entry) => entry.name)
		.sort();

	const posts = [];
	const errors = [];
	for (const filename of postFiles) {
		const raw = fs.readFileSync(path.join(blogDir, filename), 'utf-8');
		try {
			const { data, body } = validatePost(filename, raw);
			posts.push({ filename, data, body });
		} catch (err) {
			errors.push(err.message);
		}
	}
	if (errors.length) {
		throw new Error(`${stream}: contract violations — fix upstream:\n  ${errors.join('\n  ')}`);
	}

	// Phase 2 — rebuild the target directory (README.md preserved).
	const targetDir = path.join(repoRoot, config.targetDir);
	fs.mkdirSync(targetDir, { recursive: true });
	for (const entry of fs.readdirSync(targetDir)) {
		if (entry === 'README.md') continue;
		fs.rmSync(path.join(targetDir, entry), { recursive: true, force: true });
	}

	for (const post of posts) {
		const frontmatter = decorateFrontmatter(post.data, post.filename, config);
		const body = rewriteSiblingLinks(post.body, stream);
		const output = `---\n${YAML.stringify(frontmatter).trimEnd()}\n---\n\n${body.trimStart()}`;
		fs.writeFileSync(path.join(targetDir, `${post.data.slug}.md`), output);
	}

	// Images: copy blog/images/ alongside the posts so ./images/ refs resolve.
	const sourceImages = path.join(blogDir, 'images');
	if (fs.existsSync(sourceImages)) {
		fs.cpSync(sourceImages, path.join(targetDir, 'images'), { recursive: true });
	}

	return { stream, posts: posts.length };
}

function parseArgs(argv) {
	const args = {};
	for (let i = 0; i < argv.length; i += 2) {
		const flag = argv[i];
		const value = argv[i + 1];
		if (!flag?.startsWith('--') || !value) {
			throw new Error(`usage: sync-blogs.mjs [--library <path>] [--bonsai <path>]`);
		}
		args[flag.slice(2)] = value;
	}
	return args;
}

// CLI entry point (skipped when imported by tests).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	try {
		const args = parseArgs(process.argv.slice(2));
		const requested = Object.keys(args).filter((key) => key in STREAMS);
		if (!requested.length) {
			throw new Error(`usage: sync-blogs.mjs [--library <path>] [--bonsai <path>]`);
		}
		for (const stream of requested) {
			const result = syncStream(stream, path.resolve(args[stream]));
			console.log(`synced ${result.stream}: ${result.posts} posts`);
		}
	} catch (err) {
		console.error(err.message);
		process.exit(1);
	}
}
