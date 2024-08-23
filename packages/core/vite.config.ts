import { defineConfig } from "vitest/config";

const excludes = [
  "**/__tests__/**",
  "**/types.ts",
  "**/*.test.ts",
];

export default defineConfig({
  test: {
    coverage: {
      include: ["src/**/*.ts"],
      exclude: excludes
    },
    poolMatchGlobs: [
      ["**/watcher.test.ts", "forks"],
    ],
  },
});
