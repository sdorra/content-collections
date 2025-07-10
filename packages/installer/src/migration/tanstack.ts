import { z } from "zod";
import { defineMigrator } from "./migrator.js";
import { createConfiguration } from "./tasks/config.js";
import { createDemoContent } from "./tasks/demo.js";
import { addDependencies } from "./tasks/dependencies.js";
import { addToGitIgnore } from "./tasks/gitignore.js";
import { modifyVinxiConfig } from "./tasks/vinxi.js";
import { addAliasToTsConfig } from "./tasks/tsconfig.js";
import { modifyViteConfig } from "./tasks/viteconfig.js";

export const migratorTanStack = defineMigrator({
  name: "tanstack",
  options: z.object({
    demoContent: z
      .enum(["none", "markdown", "mdx"])
      .default("markdown")
      .describe("Type of demo content"),
  }),
  isResponsible: (packageJson) =>
    Boolean(packageJson.dependencies?.["@tanstack/react-start"]) ||
    Boolean(packageJson.devDependencies?.["@tanstack/react-start"]) ||
    Boolean(packageJson.dependencies?.["@tanstack/solid-start"]) ||
    Boolean(packageJson.devDependencies?.["@tanstack/solid-start"]),
  async createMigration({ directory, packageJson }, { demoContent }) {
    const packages = [
      "@content-collections/core",
      "@content-collections/vite",
      "zod",
    ];

    if (demoContent === "markdown") {
      packages.push("@content-collections/markdown");
    } else if (demoContent === "mdx") {
      packages.push("@content-collections/mdx");
    }


    const tasks = [
      addDependencies(directory, packageJson, [], packages),
      addAliasToTsConfig(directory),
      modifyViteConfig(directory, "vite"),
      addToGitIgnore(directory),
      createConfiguration(directory, demoContent),
    ];

    if (demoContent !== "none") {
      tasks.push(createDemoContent(directory, demoContent));
    }

    return tasks;
  },
});
