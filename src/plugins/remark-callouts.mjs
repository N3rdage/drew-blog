/**
 * Turns remark-directive container directives into styled callout boxes.
 *
 *   :::note
 *   A note / callout.
 *   :::
 *
 *   :::aside
 *   A side tangent — renders as a semantic <aside>.
 *   :::
 *
 * Supported names: note, tip, warning, aside.
 * An optional label becomes a heading-ish title:  :::warning[Heads up]
 */

const KNOWN = new Set(['note', 'tip', 'warning', 'aside']);

export function remarkCallouts() {
	return (tree) => {
		const walk = (node) => {
			if (!node || typeof node !== 'object') return;

			if (
				(node.type === 'containerDirective' ||
					node.type === 'leafDirective') &&
				KNOWN.has(node.name)
			) {
				const data = node.data || (node.data = {});
				data.hName = node.name === 'aside' ? 'aside' : 'div';
				data.hProperties = {
					className: ['callout', `callout-${node.name}`],
				};

				// A `[Label]` after the directive name becomes a .callout-title.
				const labelNode = node.children?.find(
					(c) => c.data?.directiveLabel,
				);
				if (labelNode) {
					labelNode.data.hName = 'p';
					labelNode.data.hProperties = { className: ['callout-title'] };
				}
			}

			if (Array.isArray(node.children)) node.children.forEach(walk);
		};
		walk(tree);
	};
}
