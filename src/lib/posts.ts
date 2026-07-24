// Gathers posts across all three streams into one shape for combined
// listings (homepage firehose) and feeds. Sorting is strictly
// reverse-chronological — no stream gets special ordering (the point is
// the site stays alive between Drew's posts).
import { getCollection } from 'astro:content';
import { STREAM_IDS, postUrl, type StreamId } from './streams';

export interface StreamPost {
	stream: StreamId;
	url: string;
	title: string;
	description: string;
	pubDate: Date;
}

export async function getAllPosts(): Promise<StreamPost[]> {
	const perStream = await Promise.all(
		STREAM_IDS.map(async (stream) => {
			const posts = await getCollection(stream);
			return posts.map((post) => ({
				stream,
				url: postUrl(stream, post.id),
				title: post.data.title,
				description: post.data.description,
				pubDate: post.data.pubDate,
			}));
		}),
	);
	return perStream
		.flat()
		.sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
}
