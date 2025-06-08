import type { Plugin } from 'svelte-exmarkdown';
import rehypeSlug from 'rehype-slug';
// import remarkParse from 'remark-parse';
// import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
// import remarkCustomHeaderId from 'remark-custom-header-id';
// import remarkRehype from 'remark-rehype';
// import remarkStringify from 'rehype-stringify';
// import rehypeStringify from 'rehype-stringify';
import rehypeAttrs from 'rehype-attr';
// import rehypeSanitize from 'rehype-sanitize';
import Counter from '$lib/Counter.svelte';
// import DumpAst from './DumpAst.svelte';
import { gfmPlugin } from 'svelte-exmarkdown/gfm';
// import type remarkRehype from 'remark-rehype';
// import remarkSmartypants from 'remark-smartypants';

// rehype-attr https://github.com/jaywcjlove/rehype-attr
// Custom Element Plugin for content-collections

// export const markdownPlugins: Plugin[] = [gfmPlugin()];
export const markdownPlugins: Plugin[] = [
	gfmPlugin(),
	// {
	// 	remarkPlugin: [remarkAttr]
	// },
	{
		rehypePlugin: [rehypeSlug]
	},
	{
		rehypePlugin: [rehypeAttrs, { properties: 'attr' }]
	},
	{
		rehypePlugin: [rehypeRaw]
	},
	{
		renderer: {
			counter: Counter
		}
	}
];

// export const markdownPlugins: Plugin[] = [
// 	{
// 		remarkPlugin: [
// 			remarkGfm,
// 			remarkCustomHeaderId,
// 			remarkParse,
// 			// [remarkRehype, { allowDangerousHtml: false }]
// 			remarkRehype,
// 			{ allowDangerousHtml: false }
// 			//
// 		],
// 		// rehypePlugin: [rehypeRaw, rehypeSlug, rehypeAttrs, rehypeSanitize, rehypeStringify],
// 		rehypePlugin: [
// 			rehypeRaw,
// 			rehypeSanitize,
// 			rehypeAttrs,
// 			// [rehypeStringify, { allowDangerousHtml: true }]
// 			rehypeStringify,
// 			{ allowDangerousHtml: true }
// 			//
// 		],
// 		renderer: {
// 			counter: Counter
// 			// h1: DumpAst
// 		}
// 	}
// ];

// !!! ohne rehypeRaw keine Svelte Funktion, mit rehypeRaw kein Header Verlinkung
