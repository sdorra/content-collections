import { defineCollection } from "@content-collections/core";

const collection = defineCollection({
  name: "posts",
  typeName: "Post",
  schema: (z) => ({
    title: z.string().min(5),
    description: z.string().min(10),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
  transform: (doc) => {
    return {
      ...doc,
    };
  },
  directory: "posts",
  include: "**/*.md(x)?",
});

export default collection;