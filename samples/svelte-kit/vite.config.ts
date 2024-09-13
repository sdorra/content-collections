import contentCollections from "@content-collections/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit(), contentCollections()],
  server: {
    port: 5178,
  },
});
