import { z } from "zod";
import { defineMigrator } from "./migrator.js";
import { createConfiguration } from "./tasks/config.js";
import { createDemoContent } from "./tasks/demo.js";
import { addDependencies } from "./tasks/dependencies.js";
import { addToGitIgnore } from "./tasks/gitignore.js";
import { addAliasToTsConfig } from "./tasks/tsconfig.js";
import { modifyViteConfig } from "./tasks/viteconfig.js";

export const migratorRemix = defineMigrator({
  name: "remix",
  options: z.object({
    demoContent: z
      .enum(["none", "markdown", "mdx"])
      .default("markdown")
      .describe("Type of demo content"),
  }),
  isResponsible: (packageJson) => {
    const dependencies = Object.keys(packageJson.dependencies || {});
    const devDependencies = Object.keys(packageJson.devDependencies || {});

    // Check both dependencies and devDependencies
    return [...dependencies, ...devDependencies].filter(
      (dep) => dep.startsWith("@remix-run") || dep.startsWith("@react-router/"),
    ).length > 0;
  },
  async createMigration({ directory, packageJson }, { demoContent }) {
    const packages = [
      "@content-collections/core",
      "@content-collections/remix-vite",
    ];

    if (demoContent === "markdown") {
      packages.push("@content-collections/markdown");
    } else if (demoContent === "mdx") {
      packages.push("@content-collections/mdx");
    }

    const tasks = [
      addDependencies(directory, packageJson, [], packages),
      addAliasToTsConfig(directory),
      modifyViteConfig(directory, "remix-vite"),
      addToGitIgnore(directory),
      createConfiguration(directory, demoContent),
    ];

    if (demoContent !== "none") {
      tasks.push(createDemoContent(directory, demoContent));
    }

    return tasks;
  },
});
