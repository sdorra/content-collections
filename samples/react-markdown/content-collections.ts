import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";

const posts = defineCollection({
  name: "posts",
  directory: "content",
  include: "*.md",
  schema: z.object({
    title: z.string(),
    date: z.string(),
  }),
});

export default defineConfig({
  collections: [posts],
});
