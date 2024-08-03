import { defineConfig } from "vitest/config";

const excludes = [
  "**/node_modules/**",
  "**/tmp/**",
  "**/.content-collections/**",
  "**/__tests__/**",
  "**/types.ts",
];

export default defineConfig({
  test: {
    coverage: {
      exclude: excludes
    },
    poolMatchGlobs: [
      ["**/watcher.test.ts", "forks"],
    ],
  },
});
