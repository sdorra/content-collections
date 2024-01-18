import { sveltekit } from "@sveltejs/kit/vite";
import contentCollections from "@content-collections/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit(), contentCollections()],
  server: {
    port: 5178,
  },
});
