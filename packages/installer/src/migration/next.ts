import { Migration, Migrator } from "./index.js";
import { createConfiguration } from "./tasks/config.js";
import { createDemoContent } from "./tasks/demo.js";
import { addDependencies } from "./tasks/dependencies.js";
import { addToGitIgnore } from "./tasks/gitignore.js";
import { Task } from "./tasks/index.js";
import { modifyNextConfig } from "./tasks/nextconfig.js";
import { addAliasToTsConfig } from "./tasks/tsconfig.js";

export const migratorNextJS: Migrator = {
  name: "next",
  async createMigration({
    directory,
    packageJson,
    demoContent,
  }): Promise<Migration> {
    const tasks: Array<Task> = [];

    const packages = ["@content-collections/core", "@content-collections/next"];

    if (demoContent) {
      packages.push("@content-collections/markdown");
    }

    const addDependenciesTask = addDependencies(
      directory,
      packageJson,
      [],
      packages,
    );
    tasks.push(addDependenciesTask);

    const tsConfigTask = addAliasToTsConfig(directory);
    if (tsConfigTask) {
      tasks.push(tsConfigTask);
    }

    const nextConfigTask = await modifyNextConfig(directory);
    tasks.push(nextConfigTask);

    const gitIgnoreTask = addToGitIgnore(directory);
    if (gitIgnoreTask) {
      tasks.push(gitIgnoreTask);
    }

    const configTask = createConfiguration(directory, demoContent);
    tasks.push(configTask);

    if (demoContent) {
      const demoContentTask = createDemoContent(directory);
      tasks.push(demoContentTask);
    }

    return tasks;
  },
};
