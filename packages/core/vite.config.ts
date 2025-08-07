import { defineConfig } from "vitest/config";

const excludes = ["**/__tests__/**", "**/types.ts", "**/*.test.ts", "**/*.test-d.ts"];

function isWindowsCI() {
  return process.platform === "win32" && process.env.GITHUB_ACTIONS === "true";
}

export default defineConfig({
  test: {
    coverage: {
      include: ["src/**/*.ts"],
      exclude: excludes,
    },
    testTimeout: isWindowsCI() ? 10_000 : 5_000,
    poolMatchGlobs: [["**/watcher.test.ts", "forks"]],
  },
});
