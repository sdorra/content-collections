import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMarkdown } from "@content-collections/markdown";
import { z } from "zod";

const posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: "*.md",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    author: z.string(),
    content: z.string(),
  }),
  transform: async (post, ctx) => {
    const content = await compileMarkdown(ctx, post);
    return {
      ...post,
      content,
    };
  },
});

export default defineConfig({
  collections: [posts],
});
