import { defineCollection, defineConfig } from "@content-collections/core";
import { compile } from "@mdx-js/mdx";

const integrations = defineCollection({
  name: "integrations",
  directory: "../integrations",
  include: "*/README.md",
  schema: (z) => ({
    title: z.string(),
    description: z.string().optional(),
    linkText: z.string().optional(),
  }),
  transform: async (context, data) => {
    const body = String(
      await compile(data.content, {
        outputFormat: "function-body",
      })
    );
    let linkText = data.linkText;
    if (!linkText) {
      linkText = data.title;
    }
    const href = `/docs/integrations/${data._meta.directory}`;
    const name = data._meta.directory;
    return {
      title: data.title,
      description: data.description,
      href,
      linkText,
      name,
      body,
    };
  },
});

const samples = defineCollection({
  name: "samples",
  directory: "../samples",
  include: "*/README.md",
  schema: (z) => ({
    title: z.string(),
    description: z.string().optional(),
    linkText: z.string().optional(),
  }),
  transform: async (context, data) => {
    const body = String(
      await compile(data.content, {
        outputFormat: "function-body",
      })
    );
    let linkText = data.linkText;
    if (!linkText) {
      linkText = data.title;
    }
    const href = `/docs/samples/${data._meta.directory}`;
    const name = data._meta.directory;
    return {
      title: data.title,
      description: data.description,
      href,
      linkText,
      name,
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
    description: z.string().optional(),
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
  collections: [integrations, samples, docs],
});
