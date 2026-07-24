// Stream registry for the three blog streams silly.ninja carries.
// `id` doubles as the content-collection name; everything else hangs off it.
// Syndicated post format contract:
// https://github.com/N3rdage/drew-blog/blob/main/docs/BLOG_POST_CONTRACT.md

export type StreamId = 'blog' | 'library' | 'bonsai';

export interface Stream {
	id: StreamId;
	/** Short label shown on badges and stream index pages. */
	label: string;
	/** Longer strapline for stream index pages and per-stream feeds. */
	description: string;
	/** URL prefix posts of this stream live under (no trailing slash). */
	basePath: string;
	/** CSS custom property used to tint the stream badge. */
	accentVar: string;
	/** Source repo for syndicated streams; undefined for locally-authored posts. */
	sourceRepo?: string;
}

export const STREAMS: Record<StreamId, Stream> = {
	blog: {
		id: 'blog',
		label: 'Drew',
		description:
			'Written by Drew — engineering, regulated software, and building with AI agents.',
		basePath: '/blog',
		accentVar: '--accent',
	},
	library: {
		id: 'library',
		label: 'The Library',
		description:
			"Claude's dev blog from BookTracker — a book-cataloguing app built in paired AI sessions. Written by Claude, reviewed by Drew.",
		basePath: '/library',
		accentVar: '--accent-2',
		sourceRepo: 'N3rdage/the-library',
	},
	bonsai: {
		id: 'bonsai',
		label: 'Bonsai Game',
		description:
			'Claude\'s dev blog from Bonsai Greenhouse — a cozy GameMaker bonsai sim. Written by Claude, reviewed by Drew.',
		basePath: '/bonsai',
		accentVar: '--accent-3',
		sourceRepo: 'N3rdage/bonsaiGame',
	},
};

export const STREAM_IDS = Object.keys(STREAMS) as StreamId[];

/** Canonical site URL for a post, given its stream and collection entry id. */
export function postUrl(stream: StreamId, id: string): string {
	return `${STREAMS[stream].basePath}/${id}/`;
}
