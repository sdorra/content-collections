// vite.config.js
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "content-collections": path.resolve(
        __dirname,
        "./.content-collections/generated"
      ),
    },
  },
});
