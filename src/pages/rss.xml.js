import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getAllPosts } from '../lib/posts';

// Combined feed across all three streams. Per-stream feeds: /rss/{stream}.xml
export async function GET(context) {
	const posts = await getAllPosts();
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			title: post.title,
			description: post.description,
			pubDate: post.pubDate,
			link: post.url,
		})),
	});
}
