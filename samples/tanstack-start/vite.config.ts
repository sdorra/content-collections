import contentCollections from "@content-collections/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from '@tanstack/react-start/plugin/vite'

export default defineConfig({
  server: {
    port: 5182
  },
    plugins: [
      contentCollections(),
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      tanstackStart()
    ],
});
