import contentCollections from "@content-collections/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [contentCollections(), sveltekit()],
  server: {
    port: 5178,
    fs: {
      strict: false,
    },
  },
});
