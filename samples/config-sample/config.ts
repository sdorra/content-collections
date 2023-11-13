import z from "zod";
import { defineCollection } from "@mdx-collections/core";

const schema = z
.object({
  title: z.string().min(5),
  description: z.string().min(10),
  date: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.date()])
    .transform((val) => new Date(val)),
})
.transform((val) => ({
  ...val,
  upper: val.title.toUpperCase(),
}));

const posts = defineCollection({
  name: "posts",
  typeName: "Post",
  schema,
  sources: "posts/**/*.md(x)?",
});

export default {
  collections: [posts],
};
