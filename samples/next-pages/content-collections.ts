import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";

const posts = defineCollection({
  name: "posts",
  directory: "src/content/posts",
  include: "*.mdx",
  schema: (z) => ({
    title: z.string(),
    summary: z.string(),
    date: z.string(),
    author: z.string(),
  }),
  transform: async (post, ctx) => {
    const code = await compileMDX(ctx, post)
    return {
      ...post,
      code
    }
  }
});

export default defineConfig({
  collections: [posts],
});