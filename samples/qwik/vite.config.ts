import { qwikRouter } from "@qwik.dev/router/vite";
import { qwikVite } from "@qwik.dev/core/optimizer";
import contentCollections from "@content-collections/vite";
import { defineConfig, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig((): UserConfig => {
  return {
    plugins: [qwikRouter(), qwikVite(), tsconfigPaths(), contentCollections()],
    server: {
      headers: {
        "Cache-Control": "public, max-age=0",
      },
      port: 5180,
    },
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600",
      },
    },
  };
});
