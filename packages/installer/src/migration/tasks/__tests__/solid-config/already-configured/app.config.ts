import { defineConfig } from "@solidjs/start/config";
import contentCollections from "@content-collections/solid-start";

export default defineConfig({
  vite: {
    plugins: [contentCollections()],
  },
});
