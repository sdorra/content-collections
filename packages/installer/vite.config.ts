import { defineConfig } from "vitest/config";

const excludes = [
  "**/__tests__/**",
  "**/types.ts",
  "**/*.test.ts",
  "**/scripts/**",
];

export default defineConfig({
  test: {
    coverage: {
      include: ["src/**/*.ts"],
      exclude: excludes,
    },
  },
});
