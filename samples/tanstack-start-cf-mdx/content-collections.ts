import {
  createDefaultImport,
  defineCollection,
  defineConfig,
  WriterHook,
} from "@content-collections/core";
import { MDXContent } from "mdx/types";
import { z } from "zod";

const posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: "*.mdx",
  parser: "frontmatter-only",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    author: z.string(),
  }),
  transform: async ({ _meta, ...post }) => {
    // TODO: check why typescript aliases don't work here
    // and we have to use relative paths
    const mdx = createDefaultImport<MDXContent>(
      `../../content/posts/${_meta.filePath}`,
    );
    return {
      ...post,
      slug: _meta.path,
      mdx,
    };
  },
});

const serverOnlyHook: WriterHook = async ({ fileType, content }) => {
  if (fileType === "typeDefinition") {
    return { content };
  }
  return {
    content: `import '@tanstack/react-start/server-only';\n\n${content}`,
  };
};

export default defineConfig({
  content: [posts],
  hooks: {
    writer: [serverOnlyHook],
  },
});
