import { defineCollection, defineConfig } from "@content-collections/core";
import { compile } from "@mdx-js/mdx";

const docs = defineCollection({
  name: "docs",
  directory: "docs",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
  }),
  transform: async (context, { content, ...data }) => {
    const body = String(
      await compile(content, {
        outputFormat: "function-body",
      })
    );
    return {
      ...data,
      body,
    };
  },
});

export default defineConfig({
  collections: [docs],
});
