import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMarkdown } from "@content-collections/markdown";
import { z } from "zod";

const characters = defineCollection({
  name: "characters",
  directory: "characters",
  include: "*.md",
  schema: z.object({
    name: z.string().min(1),
    origin: z.string().min(1),
    species: z.string().min(1),
    source: z.string().min(1).url(),
  }),
  transform: async (document, context) => {
    const content = await compileMarkdown(context, document);
    return {
      ...document,
      content,
    };
  },
});

const posts = defineCollection({
  name: "posts",
  directory: "posts",
  include: "**/*.md",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
  }),
  transform: async (doc) => {
    return {
      ...doc,
      slug: doc.title.toLowerCase().replace(/ /g, "-"),
    };
  },
});

export default defineConfig({
  collections: [characters, posts],
});
