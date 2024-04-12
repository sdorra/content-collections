import { defineCollection, defineConfig } from "@content-collections/core";
import rehypeShiki from "@shikijs/rehype";
import { Options, compileMDX } from "@content-collections/mdx";

const mdxOptions: Options = {
  rehypePlugins: [[rehypeShiki, { theme: "one-dark-pro" }]],
};

const integrations = defineCollection({
  name: "integrations",
  directory: "../integrations",
  include: "*/README.md",
  schema: (z) => ({
    title: z.string(),
    description: z.string().optional(),
    linkText: z.string().optional(),
    icon: z.string().optional(),
  }),
  transform: async (data, ctx) => {
    const body = await compileMDX(ctx, data, mdxOptions);

    let linkText = data.linkText;
    if (!linkText) {
      linkText = data.title;
    }
    const href = `/docs/integrations/${data._meta.directory}`;
    const name = data._meta.directory;
    return {
      title: data.title,
      description: data.description,
      icon: data.icon,
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
    stackBlitz: z
      .object({
        file: z.string(),
      })
      .optional(),
  }),
  transform: async (data, ctx) => {
    const body = await compileMDX(ctx, data, mdxOptions);

    let linkText = data.linkText;
    if (!linkText) {
      linkText = data.title;
    }
    const href = `/docs/samples/${data._meta.directory}`;
    const name = data._meta.directory;
    return {
      title: data.title,
      description: data.description,
      stackBlitz: data.stackBlitz,
      href,
      linkText,
      name,
      body,
    };
  },
});

const docs = defineCollection({
  name: "docs",
  directory: "../docs",
  include: "**/*.md",
  schema: (z) => ({
    title: z.string(),
    linkText: z.string().optional(),
    description: z.string().optional(),
  }),
  transform: async (data, ctx) => {
    const body = await compileMDX(ctx, data, mdxOptions);

    let linkText = data.linkText;
    if (!linkText) {
      linkText = data.title;
    }

    const href = `/docs/main/${data._meta.path}`;

    return {
      title: data.title,
      description: data.description,
      linkText,
      body,
      href,
      name: data._meta.path
    };
  },
});

export default defineConfig({
  collections: [integrations, samples, docs],
});
