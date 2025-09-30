import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  format: "esm",
  dts: {
    // We need the types for zod/mini for serialization.
    // We bundle zod and its types to avoid mismatches with the user's zod version.
    resolve: ["zod/mini"],
  },
  outDir: "dist",
});
