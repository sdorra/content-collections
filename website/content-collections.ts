import { defineCollection, defineConfig } from "@content-collections/core";
import rehypeShiki from "@shikijs/rehype";
import { compile } from "@mdx-js/mdx";

async function mdx(content: string) {
  return String(
    await compile(content, {
      outputFormat: "function-body",
      rehypePlugins: [[rehypeShiki, { theme: "one-dark-pro" }]],
    })
  );
}

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
  transform: async (_, data) => {
    const body = await mdx(data.content);

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
  transform: async (context, data) => {
    const body = await mdx(data.content);

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

export default defineConfig({
  collections: [integrations, samples],
});
