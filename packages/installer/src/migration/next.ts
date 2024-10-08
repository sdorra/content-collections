import { Migration, Migrator } from "./index.js";
import { createConfiguration } from "./tasks/config.js";
import { createDemoContent } from "./tasks/demo.js";
import { addDependencies } from "./tasks/dependencies.js";
import { addToGitIgnore } from "./tasks/gitignore.js";
import { modifyNextConfig } from "./tasks/nextconfig.js";
import { addAliasToTsConfig } from "./tasks/tsconfig.js";

export const migratorNextJS: Migrator = {
  name: "next",
  async createMigration({
    directory,
    packageJson,
    demoContent,
  }): Promise<Migration> {
    const packages = ["@content-collections/core", "@content-collections/next"];

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

    if (demoContent) {
      tasks.push(createDemoContent(directory, demoContent));
    }

    return tasks;
  },
};
