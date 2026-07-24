# Blog post contract

The single source of truth for the format of Claude-written dev-blog posts that syndicate to [silly.ninja](https://silly.ninja). It applies to:

- [`the-library/blog/`](https://github.com/N3rdage/the-library/tree/main/blog) → published under `/library/{slug}/`
- [`bonsaiGame/blog/`](https://github.com/N3rdage/bonsaiGame/tree/main/blog) → published under `/bonsai/{slug}/`

Source repos link here rather than carrying their own copy. If this document and a repo-local convention ever disagree, **this document wins** — fix the repo.

Decision record: `drew-os/DECISIONS.md` → *Syndicated blog post format* (2026-07-24).

---

## The deal

Source repos are canonical: posts are written, fixed, and owned there. drew-blog's sync is a read-only aggregator that **validates and decorates — it never repairs**. A post that violates this contract fails the sync loudly and gets fixed upstream. That trade is deliberate: posts are Claude-authored, so the contract enforces itself via each repo's standing instructions, and the tooling stays trivial.

## Directory layout

```
blog/
├── YYYY-MM-DD-NN-slug.md     ← posts (the only files that syndicate)
├── images/                   ← all post images
└── anything-else             ← ignored by sync (BACKLOG.md, sources/, notes…)
```

Only files matching `^\d{4}-\d{2}-\d{2}-\d{2}-.+\.md$` directly in `blog/` are treated as posts. Everything else is invisible to the site — park working material wherever you like.

## Filename & slug

`YYYY-MM-DD-NN-slug.md` — date, two-digit same-day sequence, then the slug (lowercase, hyphen-separated).

**Filenames and slugs are stable after publish.** They are the durable identifiers that cross-links and site URLs hang off. Retitle a post if you must; never rename the file or change the slug.

## Frontmatter

All fields required unless marked optional.

```yaml
---
title: The 3D Viewer Is Mostly Arithmetic
description: >-
  One or two sentences. Feeds the site's post listings, RSS,
  and OG cards. Standfirst material, not a summary of every section.
date: 2026-06-09          # matches the filename date
author: Claude
reviewed_by: Drew
slug: the-3d-viewer-is-mostly-arithmetic   # matches the filename remainder
tags: [math, gamemaker, 3d]
---
```

Rules:

- `date` must equal the filename date; `slug` must equal the filename remainder. The sync checks both — a mismatch is a failed sync, not a judgement call.
- `tags` is a flat lowercase list. Sub-series membership is a tag, not a title prefix: what used to be a `[Math]` title prefix is now `tags: [math]` with a clean `title`. (Filenames keep their `-math-` segment — filenames are stable, see above.)
- `author` / `reviewed_by` render as a visible attribution block on the site ("Written by Claude, reviewed by Drew"). The honesty is the point — don't omit them.

## Body

- **No H1.** The site layout renders `title`; an H1 in the body double-renders it. Start at `##`. (On raw GitHub the frontmatter `title:` still shows at the top of the file.)
- **Images:** relative, into the sibling images directory — `![alt](./images/foo.png)`. Always include meaningful alt text. The sync copies `blog/images/` alongside the posts, so these references resolve both on GitHub and on the site.
- **Cross-links to sibling posts:** relative to the file — `[How to Bend a Trunk](./2026-05-08-01-math-how-to-bend-a-trunk.md)`. These render correctly on GitHub; the sync rewrites them to site URLs (`/{stream}/{slug}/`). Don't hand-write silly.ninja URLs in post bodies.
- External links, code fences, tables: plain CommonMark, nothing exotic. The site pipeline supports `:::note` callout directives if you want them, but posts must still read sensibly as raw markdown on GitHub.

## What the sync adds (so you don't)

Stamped at sync time, never written in source posts: `stream`, `canonicalUrl` (the GitHub blob URL), `sourceRepo`, and the `date` → `pubDate` mapping for the site schema. Source posts stay clean of aggregator concerns.

## Checklist for a new post

1. Filename `YYYY-MM-DD-NN-slug.md` in `blog/`, images in `blog/images/`.
2. Frontmatter complete; `date` and `slug` agree with the filename.
3. No H1 in the body; first heading is `##`.
4. Relative image paths and relative sibling-post links only.
5. Merged to `main` → the post appears on silly.ninja with no further action.
