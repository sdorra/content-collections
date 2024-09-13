import contentCollections from "@content-collections/solid-start";
import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  vite: {
    plugins: [contentCollections()],
  },
});
