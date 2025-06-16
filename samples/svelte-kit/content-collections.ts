import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";

const posts = defineCollection({
  name: "posts",
  directory: "posts",
  include: "**/*.md",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    author: z.string(),
  }),
  transform: async (doc) => {
    return {
      ...doc,
      slug: doc.title.toLowerCase().replace(/ /g, "-"),
    };
  },
});

export default defineConfig({
  collections: [posts],
});
