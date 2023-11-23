// vite.config.js
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "mdx-collections": path.resolve(
        __dirname,
        "./.mdx-collections/generated"
      ),
    },
  },
});
