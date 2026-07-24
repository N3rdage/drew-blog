// Fixture tests for tools/sync-blogs.mjs — run with `npm test`.
// Covers the contract checks (validation failures are atomic no-ops),
// decoration, sibling-link rewriting, exclusion rules, and image copying.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
	validatePost,
	rewriteSiblingLinks,
	decorateFrontmatter,
	syncStream,
	STREAMS,
} from './sync-blogs.mjs';

const VALID_POST = `---
title: A Valid Post
description: >-
  A folded-scalar description, as the bonsai posts use — the parser must
  handle real YAML, not just simple key-value lines.
date: 2026-05-08
author: Claude
reviewed_by: Drew
slug: a-valid-post
tags: [math, testing]
---

## First heading

Body with a sibling link to [another post](./2026-05-01-02-math-drawing-a-circle.md)
and one [with an anchor](./2026-04-23-01-upside-down-tree.md#some-section),
an ![image](./images/pic.png), and an
[external link](https://github.com/N3rdage/bonsaiGame/blob/main/README.md).
`;

function makeSourceRepo(tmp, files) {
	const blog = path.join(tmp, 'blog');
	fs.mkdirSync(blog, { recursive: true });
	for (const [name, content] of Object.entries(files)) {
		const target = path.join(blog, name);
		fs.mkdirSync(path.dirname(target), { recursive: true });
		fs.writeFileSync(target, content);
	}
	return tmp;
}

function tmpDir() {
	return fs.mkdtempSync(path.join(os.tmpdir(), 'sync-blogs-test-'));
}

// --- validation -------------------------------------------------------------

test('valid post with folded description passes', () => {
	const { data, body } = validatePost('2026-05-08-01-a-valid-post.md', VALID_POST);
	assert.equal(data.title, 'A Valid Post');
	assert.match(data.description, /folded-scalar description/);
	assert.equal(data.slug, 'a-valid-post');
	assert.match(body, /## First heading/);
});

test('missing description is rejected', () => {
	const post = VALID_POST.replace(/description: >-\n(  .*\n)+/m, '');
	assert.throws(
		() => validatePost('2026-05-08-01-a-valid-post.md', post),
		/missing 'description'/,
	);
});

test('date mismatch with filename is rejected', () => {
	assert.throws(
		() => validatePost('2026-05-09-01-a-valid-post.md', VALID_POST),
		/date '2026-05-08' != filename date '2026-05-09'/,
	);
});

test('slug mismatch with filename remainder is rejected', () => {
	assert.throws(
		() => validatePost('2026-05-08-01-different-slug.md', VALID_POST),
		/slug 'a-valid-post' != filename remainder 'different-slug'/,
	);
});

test('H1 in body is rejected', () => {
	const post = VALID_POST.replace('## First heading', '# Shouting Title');
	assert.throws(
		() => validatePost('2026-05-08-01-a-valid-post.md', post),
		/body contains an H1/,
	);
});

test('missing frontmatter is rejected', () => {
	assert.throws(
		() => validatePost('2026-05-08-01-a-valid-post.md', '## Just a body\n'),
		/missing frontmatter/,
	);
});

// --- transforms -------------------------------------------------------------

test('sibling links rewrite to stream URLs, anchors preserved, others untouched', () => {
	const body = validatePost('2026-05-08-01-a-valid-post.md', VALID_POST).body;
	const rewritten = rewriteSiblingLinks(body, 'bonsai');
	assert.match(rewritten, /\]\(\/bonsai\/math-drawing-a-circle\/\)/);
	assert.match(rewritten, /\]\(\/bonsai\/upside-down-tree\/#some-section\)/);
	// image refs and external links unchanged
	assert.match(rewritten, /!\[image\]\(\.\/images\/pic\.png\)/);
	assert.match(rewritten, /github\.com\/N3rdage\/bonsaiGame\/blob\/main\/README\.md/);
});

test('decoration maps date to pubDate and stamps canonical fields', () => {
	const { data } = validatePost('2026-05-08-01-a-valid-post.md', VALID_POST);
	const fm = decorateFrontmatter(data, '2026-05-08-01-a-valid-post.md', STREAMS.bonsai);
	assert.equal(fm.pubDate, '2026-05-08');
	assert.equal(fm.sourceRepo, 'N3rdage/bonsaiGame');
	assert.equal(
		fm.canonicalUrl,
		'https://github.com/N3rdage/bonsaiGame/blob/main/blog/2026-05-08-01-a-valid-post.md',
	);
	assert.equal(fm.date, undefined, 'source date field must not leak through');
});

// --- end-to-end sync --------------------------------------------------------

test('syncStream writes posts by slug, copies images, excludes non-posts', () => {
	const source = makeSourceRepo(tmpDir(), {
		'2026-05-08-01-a-valid-post.md': VALID_POST,
		'BACKLOG.md': '# Not a post\n',
		'sources/raw-notes.md': '# Working material\n',
		'images/pic.png': 'not-really-a-png',
	});
	const repoRoot = tmpDir();

	const result = syncStream('bonsai', source, { repoRoot });
	assert.equal(result.posts, 1);

	const targetDir = path.join(repoRoot, STREAMS.bonsai.targetDir);
	const written = fs.readdirSync(targetDir).sort();
	assert.deepEqual(written, ['a-valid-post.md', 'images']);
	assert.equal(
		fs.readFileSync(path.join(targetDir, 'images', 'pic.png'), 'utf-8'),
		'not-really-a-png',
	);
	const synced = fs.readFileSync(path.join(targetDir, 'a-valid-post.md'), 'utf-8');
	assert.match(synced, /^---\n/);
	assert.match(synced, /pubDate: 2026-05-08/);
	assert.match(synced, /canonicalUrl: /);
	assert.doesNotMatch(synced, /^# /m);
});

test('syncStream preserves README.md and removes stale posts on re-run', () => {
	const source = makeSourceRepo(tmpDir(), {
		'2026-05-08-01-a-valid-post.md': VALID_POST,
	});
	const repoRoot = tmpDir();
	const targetDir = path.join(repoRoot, STREAMS.library.targetDir);
	fs.mkdirSync(targetDir, { recursive: true });
	fs.writeFileSync(path.join(targetDir, 'README.md'), '# Generated directory\n');
	fs.writeFileSync(path.join(targetDir, 'stale-post.md'), 'left over from a previous sync');

	syncStream('library', source, { repoRoot });

	const written = fs.readdirSync(targetDir).sort();
	assert.deepEqual(written, ['README.md', 'a-valid-post.md']);
	assert.match(fs.readFileSync(path.join(targetDir, 'README.md'), 'utf-8'), /Generated/);
});

test('one invalid post fails the whole stream atomically — nothing written', () => {
	const source = makeSourceRepo(tmpDir(), {
		'2026-05-08-01-a-valid-post.md': VALID_POST,
		'2026-05-09-01-broken.md': '---\ntitle: Broken\n---\n\nMissing everything.\n',
	});
	const repoRoot = tmpDir();

	assert.throws(() => syncStream('bonsai', source, { repoRoot }), /contract violations/);
	assert.equal(
		fs.existsSync(path.join(repoRoot, STREAMS.bonsai.targetDir, 'a-valid-post.md')),
		false,
		'valid posts must not be written when any post fails',
	);
});
