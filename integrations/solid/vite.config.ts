import { defineConfig } from "@solidjs/start/config";
import contentCollections from "@content-collections/vite";

export default defineConfig({
  plugins: [contentCollections()]
});
