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
    date: z
      .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.date()])
      .transform((val) => new Date(val)),
    author: z.string(),
  }),
  directory: "posts",
  include: "**/*.md(x)?",
  transform: async (context, post) => {
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
      content: (await context.content()).trim(),
    };
  },
});

export default defineConfig({
  collections: [authors, posts],
});
