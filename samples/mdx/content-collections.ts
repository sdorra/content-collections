import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { z } from "zod";

const posts = defineCollection({
  name: "posts",
  directory: "posts",
  include: "*.mdx",
  schema: z.object({
    title: z.string(),
    content: z.string(),
  }),
  transform: async (post, ctx) => {
    const content = await compileMDX(ctx, post);
    return {
      ...post,
      content,
    };
  },
});

export default defineConfig({
  content: [posts],
});
