import contentCollections from "@content-collections/remix-vite";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths(), contentCollections()],
  server: {
    port: 5183,
  },
});
