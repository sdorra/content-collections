import { defineConfig } from "vitest/config";

const excludes = [
  "**/__spec__/**",
  "**/__tests__/**",
  "**/types.ts",
  "**/*.test.ts",
  "**/*.test-d.ts",
];

export default defineConfig({
  test: {
    include: [
      "src/**/*.test.ts",
      "src/**/*.test-d.ts",
      "src/**/*.spec.ts",
      "src/**/*.spec-d.ts",
    ],
    coverage: {
      include: ["src/**/*.ts"],
      exclude: excludes,
    },
    reporters: [
      "default",
      [
        "junit",
        { outputFile: "test-results/junit.xml" },
      ],
    ],
    testTimeout: 10_000,
  },
});
