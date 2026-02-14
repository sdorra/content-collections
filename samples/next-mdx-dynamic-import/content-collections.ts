import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";

const posts = defineCollection({
  name: "posts",
  directory: "./content/posts",
  include: "*.mdx",
  parser: "frontmatter-only",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    author: z.string(),
  }),
  transform: ({ _meta, ...post }) => {
    const slug = _meta.path;
    return {
      ...post,
      slug,
    };
  },
});

export default defineConfig({
  content: [posts],
});
