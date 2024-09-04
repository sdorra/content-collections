import { defineCollection, defineConfig } from "@content-collections/core";

const posts = defineCollection({
  name: "posts",
  directory: "sources/posts",
  include: "**/*.md(x)?",
  schema: (z) => ({
    title: z.string(),
  }),
  transform: async (doc, {collection}) => {
    const docs = await collection.documents();
    const idx = docs.findIndex(d => doc._meta.filePath === d._meta.filePath);
    return {
      ...doc,
      prev: idx > 0 ? docs[idx - 1] : null,
      next: idx < docs.length - 1 ? docs[idx + 1] : null,
    };
  },
});

export default defineConfig({
  collections: [posts],
});
