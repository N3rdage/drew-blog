import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE } from '../../consts';
import { STREAMS, postUrl } from '../../lib/streams';

// Feed filenames are the public-facing stream names; 'drew' maps to the
// local 'blog' collection so the URL reads naturally.
const FEEDS = {
	drew: 'blog',
	library: 'library',
	bonsai: 'bonsai',
};

export function getStaticPaths() {
	return Object.keys(FEEDS).map((stream) => ({ params: { stream } }));
}

export async function GET(context) {
	const collection = FEEDS[context.params.stream];
	const meta = STREAMS[collection];
	const posts = (await getCollection(collection)).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);
	return rss({
		title: `${meta.label} — ${SITE_TITLE}`,
		description: meta.description,
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: postUrl(collection, post.id),
		})),
	});
}
