import { defineConfig, type UserConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import contentCollections from "@content-collections/vite";

export default defineConfig((): UserConfig => {
  return {
    plugins: [qwikCity(), qwikVite(), tsconfigPaths(), contentCollections()],
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
