import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMarkdown } from "@content-collections/markdown";

const posts = defineCollection({
  name: "posts",
  directory: "content",
  include: "*.md",
  schema: (z) => ({
    title: z.string(),
    summary: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    author: z.string(),
  }),
  transform: async (document, context) => {
    const html = await compileMarkdown(context, document);
    const slug = document._meta.path;
    return {
      ...document,
      html,
      slug,
    };
  },
});

export default defineConfig({
  collections: [posts],
});
