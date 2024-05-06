import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import contentCollections from "@content-collections/remix-vite";

export default defineConfig({
  plugins: [remix(), tsconfigPaths(), contentCollections()],
  server: {
    port: 5176,
  },
});
