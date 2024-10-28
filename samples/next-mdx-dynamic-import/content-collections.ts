import { defineCollection, defineConfig } from "@content-collections/core";

const posts = defineCollection({
  name: "posts",
  directory: "./content/posts",
  include: "*.mdx",
  schema: (z) => ({
    title: z.string(),
    summary: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    author: z.string(),
  }),
  transform: ({ content: _, _meta, ...post }) => {
    const slug = _meta.path;
    return {
      ...post,
      slug
    };
  },
});

export default defineConfig({
  collections: [posts],
});
