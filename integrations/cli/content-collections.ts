import { defineCollection, defineConfig } from "@content-collections/core";

const authors = defineCollection({
  name: "authors",
  schema: (z) => ({
    ref: z.string(),
    displayName: z.string(),
    email: z.string().email(),
  }),
  directory: "authors",
  include: "*.md",
});

const posts = defineCollection({
  name: "posts",
  typeName: "Post",
  schema: (z) => ({
    title: z.string().min(5),
    description: z.string().min(10),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    author: z.string(),
  }),
  directory: "posts",
  include: "**/*.md(x)?",
  transform: async (post, context) => {
    const author = context
      .documents(authors)
      .find((author) => author.ref === post.author);

    if (!author) {
      throw new Error(`Author not found: ${post.author}`);
    }

    return {
      ...post,
      author: {
        displayName: author.displayName,
        email: author.email,
      },
      upper: post.title.toUpperCase(),
      lower: post.title.toLowerCase(),
      content: post.content.trim(),
    };
  },
});

const categories = defineCollection({
  name: "categories",
  directory: "categories",
  include: "*.yml",
  parser: "yaml",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
  }),
});

export default defineConfig({
  collections: [authors, posts, categories],
});
