import { z } from "zod";
import { defineMigrator } from "./migrator.js";
import { createConfiguration } from "./tasks/config.js";
import { createDemoContent } from "./tasks/demo.js";
import { addDependencies } from "./tasks/dependencies.js";
import { addToGitIgnore } from "./tasks/gitignore.js";
import { modifyNextConfig } from "./tasks/nextconfig.js";
import { addAliasToTsConfig } from "./tasks/tsconfig.js";

export const migratorNextJS = defineMigrator({
  name: "next",
  options: z.object({
    demoContent: z
      .enum(["none", "markdown", "mdx"])
      .default("markdown")
      .describe("Type of demo content"),
  }),
  isResponsible: (packageJson) => Boolean(packageJson.dependencies?.next),
  async createMigration({ directory, packageJson }, { demoContent }) {
    const packages = ["@content-collections/core", "@content-collections/next", "zod"];

    if (demoContent === "markdown") {
      packages.push("@content-collections/markdown");
    } else if (demoContent === "mdx") {
      packages.push("@content-collections/mdx");
    }

    const tasks = [
      addDependencies(directory, packageJson, [], packages),
      addAliasToTsConfig(directory),
      modifyNextConfig(directory),
      addToGitIgnore(directory),
      createConfiguration(directory, demoContent),
    ];

    if (demoContent !== "none") {
      tasks.push(createDemoContent(directory, demoContent));
    }

    return tasks;
  },
});
