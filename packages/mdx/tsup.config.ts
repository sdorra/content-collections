import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/react/server.tsx", "src/react/client.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  external: ["react"],
  outDir: "dist",
});
