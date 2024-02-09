import { defineCollection, defineConfig } from "@content-collections/core";

const characters = defineCollection({
  name: "characters",
  directory: "app/routes",
  include: "*.mdx",
  schema: (z) => ({
    name: z.string().min(1),
    origin: z.string().min(1),
    species: z.string().min(1),
    source: z.string().min(1).url(),
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform: ({ content: _, _meta, ...data }) => {
    const slug = _meta.path.replace("characters.", "");
    return {
      ...data,
      slug,
    };
  },
});

export default defineConfig({
  collections: [characters],
});
