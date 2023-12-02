import z from "zod";
import { defineCollection, defineConfig } from "@mdx-collections/core";

const posts = defineCollection({
  name: "posts",
  schema: z.object({
    title: z.string(),
  }),
  directory: "posts",
  include: "**/*.md(x)?",
});

export default defineConfig({
  collections: [posts],
});
