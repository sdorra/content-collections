import { defineCollection, defineConfig } from "@content-collections/core";
import { type } from "arktype"

const characters = defineCollection({
  name: "characters",
  directory: "characters",
  include: "*.yaml",
  parser: "yaml",
  schema: type({
    id: "number",
    name: "string",
    status: "string",
    species: "string",
    "type": "string",
    gender: "string",
    origin: {
      name: "string",
      url: "string.url | string == 0"
    },
    location: {
      name: "string",
      url: "string.url | string == 0"
    },
    image: "string.url",
    episode: "string.url[]",
    url: "string.url",
    created: "string",
  }),
});

export default defineConfig({
  content: [characters],
});
