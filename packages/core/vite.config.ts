import { defineConfig } from "vitest/config";

const excludes = ["**/__tests__/**", "**/types.ts", "**/*.test.ts", "**/*.test-d.ts"];

export default defineConfig({
  test: {
    coverage: {
      include: ["src/**/*.ts"],
      exclude: excludes,
    },
    testTimeout: 10_000,
    projects: [
      {
        test: {
          name: "core",
          pool: "threads",
          include: ["src/**/*.test.ts", "src/**/*.test-d.ts"],
          exclude: ["src/watcher.test.ts"],
        }
      },
      {
        extends: true,
        test: {
          name: "watcher",
          pool: 'forks',
          include: ["src/watcher.test.ts"]
        },
      },
    ],
  },
});
