import contentCollections from "@content-collections/vite";
import adapter from "@sveltejs/adapter-auto";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit({ adapter: adapter() }), contentCollections()],
  server: {
    port: 5178,
  },
});
