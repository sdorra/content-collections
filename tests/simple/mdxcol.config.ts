import z from "zod";
import { defineCollection, defineConfig } from "@mdx-collections/core";

const posts = defineCollection({
  name: "posts",
  typeName: "Post",
  schema: z
    .object({
      title: z.string().min(5),
      description: z.string().min(10),
      date: z
        .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.date()])
        .transform((val) => new Date(val)),
    })
    .transform((val) => ({
      ...val,
      upper: val.title.toUpperCase(),
    })),
  sources: "posts/**/*.md(x)?",
  transform: (post, content) => ({
    ...post,
    lower: post.upper.toLowerCase(),
    content: content.trim(),
  }),
});

export default defineConfig({
  collections: [posts],
});
