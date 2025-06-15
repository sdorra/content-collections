import Counter from "$lib/Counter.svelte";
import rehypeAttrs from "rehype-attr";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import type { Plugin } from "svelte-exmarkdown";
import { gfmPlugin } from "svelte-exmarkdown/gfm";

// Custom Element Plugin for content-collections

export const markdownPlugins: Plugin[] = [
  gfmPlugin(),
  {
    rehypePlugin: [rehypeSlug],
  },
  {
    rehypePlugin: [rehypeAttrs, { properties: "attr" }],
  },
  {
    rehypePlugin: [rehypeRaw],
  },
  {
    renderer: {
      counter: Counter,
    },
  },
];
