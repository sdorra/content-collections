import { defineConfig, defineSingleton } from "@content-collections/core";
import { z } from "zod";


const settings = defineSingleton({
  name: "settings",
  typeName: "Settings",
  filePath: "content/settings.yaml",
  parser: "yaml",
  schema: z.object({
    siteName: z.string(),
    theme: z.enum(["light", "dark"]),
  }),
});

export default defineConfig({
  collections: [settings],
});
