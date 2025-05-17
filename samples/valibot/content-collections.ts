import { defineCollection, defineConfig } from "@content-collections/core";
import * as v from "valibot";

const characters = defineCollection({
  name: "characters",
  directory: "characters",
  include: "*.yaml",
  parser: "yaml",
  schema: v.object({
    id: v.number(),
    name: v.string(),
    status: v.string(),
    species: v.string(),
    type: v.string(),
    gender: v.string(),
    origin: v.object({
      name: v.string(),
      url: v.union([
        v.pipe(v.string(), v.url()),
        v.pipe(v.string(), v.length(0)),
      ]),
    }),
    location: v.object({
      name: v.string(),
      url: v.union([
        v.pipe(v.string(), v.url()),
        v.pipe(v.string(), v.length(0)),
      ]),
    }),
    image: v.pipe(v.string(), v.url()),
    episode: v.array(v.pipe(v.string(), v.url())),
    url: v.pipe(v.string(), v.url()),
    created: v.string(),
  }),
});

export default defineConfig({
  collections: [characters],
});
