// vite.config.js
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "content-collections": path.resolve(
        __dirname,
        "./.content-collections/generated",
      ),
    },
  },
});
