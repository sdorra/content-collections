import { defineCollection, defineConfig } from "@content-collections/core";
import { compile } from "@mdx-js/mdx";

const readme = defineCollection({
  name: "readme",
  directory: "../integrations",
  include: "*/README.md",
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
  collections: [readme, docs],
});
