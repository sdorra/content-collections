import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";

const posts = defineCollection({
  name: "posts",
  directory: "posts",
  include: "*.mdx",
  schema: (z) => ({
    title: z.string(),
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
  collections: [posts],
});
