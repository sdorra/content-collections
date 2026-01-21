import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";


const settings = defineCollection({
  name: "settings",
  type: "singleton",
  typeName: "Settings",
  directory: "content",
  include: "settings.yaml",
  parser: "yaml",
  schema: z.object({
    siteName: z.string(),
    theme: z.enum(["light", "dark"]),
  }),
});

export default defineConfig({
  collections: [settings],
});
