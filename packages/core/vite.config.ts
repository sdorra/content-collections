import { defineConfig } from "vitest/config";

const excludes = [
  "**/node_modules/**",
  "**/tmp/**",
  "**/.content-collections/**",
  "**/__tests__/**",
  "**/types.ts",
];

if (process.env.ENABLE_WATCHER_TESTS !== "true") {
  excludes.push("**/watcher.ts");
}

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
