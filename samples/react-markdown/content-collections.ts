import { defineCollection, defineConfig } from "@content-collections/core";

const posts = defineCollection({
  name: "posts",
  directory: "content",
  include: "*.md",
  schema: (z) => ({
    title: z.string(),
    date: z.date(),
  }),
});

export default defineConfig({
  collections: [posts],
});
