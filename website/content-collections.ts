import { defineCollection, defineConfig } from "@content-collections/core";
import { compile } from "@mdx-js/mdx";

const docs = defineCollection({
  name: "docs",
  directory: "docs",
  include: "**/*.mdx",
  schema: (z) =>
    z.object({
      title: z.string(),
    }),
  transform: async (context, data) => {
    const content = await context.content();
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
