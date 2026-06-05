/**
 * Opens external links in a new tab so readers don't lose the blog.
 *
 * Any <a> whose href is an absolute http(s) URL gets
 *   target="_blank" rel="noopener noreferrer"
 * Internal links (/paths, #anchors, footnote backrefs) are untouched.
 */
export function rehypeExternalLinks() {
	return (tree) => {
		const walk = (node) => {
			if (
				node.type === 'element' &&
				node.tagName === 'a' &&
				typeof node.properties?.href === 'string' &&
				/^https?:\/\//i.test(node.properties.href)
			) {
				node.properties.target = '_blank';
				node.properties.rel = ['noopener', 'noreferrer'];
			}
			if (Array.isArray(node.children)) node.children.forEach(walk);
		};
		walk(tree);
	};
}
