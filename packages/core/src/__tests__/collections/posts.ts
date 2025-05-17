import { defineCollection } from "@content-collections/core";
import { z } from "zod";

const collection = defineCollection({
  name: "posts",
  typeName: "Post",
  schema: z.object({
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
