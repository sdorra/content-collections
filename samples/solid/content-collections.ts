import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMarkdown } from "@content-collections/markdown";

const posts = defineCollection({
  name: "posts",
  directory: "src/content/posts",
  include: "*.md",
  schema: (z) => ({
    title: z.string(),
    summary: z.string(),
    date: z.string(),
    author: z.string(),
  }),
  transform: async (post, ctx) => {
    const html = await compileMarkdown(ctx, post);
    return {
      ...post,
      html,
    };
  },
});

export default defineConfig({
  collections: [posts],
});
