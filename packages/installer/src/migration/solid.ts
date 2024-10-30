import { z } from "zod";
import { defineMigrator } from "./migrator.js";
import { createConfiguration } from "./tasks/config.js";
import { createDemoContent } from "./tasks/demo.js";
import { addDependencies } from "./tasks/dependencies.js";
import { addToGitIgnore } from "./tasks/gitignore.js";
import { modifySolidStartConfig } from "./tasks/solid.js";
import { addAliasToTsConfig } from "./tasks/tsconfig.js";

export const migratorSolid = defineMigrator({
  name: "qwik",
  options: z.object({
    demoContent: z
      .enum(["none", "markdown"])
      .default("markdown")
      .describe("Type of demo content"),
  }),
  isResponsible: (packageJson) =>
    Boolean(packageJson.dependencies?.["@solidjs/start"]) ||
    Boolean(packageJson.devDependencies?.["@solidjs/start"]),
  async createMigration({ directory, packageJson }, { demoContent }) {
    const packages = [
      "@content-collections/core",
      "@content-collections/solid-start",
    ];

    if (demoContent === "markdown") {
      packages.push("@content-collections/markdown");
    }

    const tasks = [
      addDependencies(directory, packageJson, [], packages),
      addAliasToTsConfig(directory),
      modifySolidStartConfig(directory),
      addToGitIgnore(directory),
      createConfiguration(directory, demoContent),
    ];

    if (demoContent !== "none") {
      tasks.push(createDemoContent(directory, demoContent));
    }

    return tasks;
  },
});
