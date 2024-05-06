import { defineCollection, defineConfig } from "@content-collections/core";

const characters = defineCollection({
  name: "characters",
  directory: "characters",
  include: "*.md",
  schema: (z) => ({
    name: z.string().min(1),
    origin: z.string().min(1),
    species: z.string().min(1),
    source: z.string().min(1).url(),
  }),
});

export default defineConfig({
  collections: [characters],
});
