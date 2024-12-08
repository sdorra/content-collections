import {
  createDefaultImport,
  defineCollection,
  defineConfig,
} from "@content-collections/core";
import { MDXContent } from "mdx/types";

const posts = defineCollection({
  name: "posts",
  directory: "./content/posts",
  include: "*.mdx",
  parser: "frontmatter-only",
  schema: (z) => ({
    title: z.string(),
    summary: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    author: z.string(),
  }),
  transform: ({ _meta, ...post }) => {
    const mdxContent = createDefaultImport<MDXContent>(`@/content/posts/${_meta.filePath}`);
    const slug = _meta.path;
    return {
      ...post,
      mdxContent,
      slug,
    };
  },
});

export default defineConfig({
  collections: [posts],
});
