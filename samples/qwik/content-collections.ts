import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDXWithQwik } from "@content-collections/mdx";

const characters = defineCollection({
  name: "characters",
  directory: "characters",
  include: "*.mdx",
  schema: (z) => ({
    name: z.string().min(1),
    origin: z.string().min(1),
    species: z.string().min(1),
    source: z.string().min(1).url(),
  }),
  transform: async (document, context) => {
    console.log("DOCUMENT", document);
    console.log("CONTEXT", context);
    const mdx = await compileMDXWithQwik(context, document, {
      qwikOptimizer: {
        // Additional Qwik optimizer configuration can go here
      },
      // Other MDX options can still be provided:
      remarkPlugins: [],
      rehypePlugins: [],
    });
    return {
      ...document,
      mdx,
    };
  },
});

export default defineConfig({
  collections: [characters],
});
