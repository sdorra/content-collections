import { defineCollection, defineConfig } from "@content-collections/core";

const posts = defineCollection({
  name: "posts",
  typeName: "Post",
  schema: (z) => ({
    title: z.string().min(5),
    description: z.string().min(10),
    date: z
      .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.date()])
      .transform((val) => new Date(val)),
  }),
  directory: "sources/posts",
  include: "**/*.md(x)?",
});

export default defineConfig({
  collections: [posts],
});
