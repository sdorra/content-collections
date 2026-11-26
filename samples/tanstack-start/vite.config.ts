import contentCollections from "@content-collections/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5182,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    contentCollections(),
    tanstackStart(),
    viteReact(),
  ],
});
