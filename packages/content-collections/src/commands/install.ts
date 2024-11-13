#!/usr/bin/env node
import { createMigrator, type Option } from "@content-collections/installer";
import { input, select } from "@inquirer/prompts";
import chalk from "chalk";
import { Listr } from "listr2";

async function ask(option: Option) {
  if (option.type === "list") {
    const result = await select({
      message: option.description || `Select an ${option.name}`,
      default: option.defaultValue,
      choices: option.choices,
    });
    if (typeof result !== "string") {
      throw new Error("Invalid selection, the result must be a string");
    }

    return result;
  }

  return input({
    default: option.defaultValue,
    message: option.description || `Enter ${option.name}`,
  });
}

export default async function install(directory: string) {
  console.log("Searching for migrator in", directory);
  const migrator = await createMigrator(directory);

  console.log();
  console.log(
    "Found migrator",
    chalk.bold(migrator.name) + ",",
    "collecting options",
  );
  const migration = await migrator.createMigration(ask);
  console.log();
  console.log("Migration tasks:");

  const tasks = new Listr(
    migration.map((t) => ({
      title: chalk.bold(t.name),
      task: async (_, task) => {
        const result = await t.run();
        if (result.status === "skipped") {
          task.skip(`${chalk.bold(t.name)}: ${result.message} [SKIPPED]`);
        } else if (result.status === "error") {
          throw new Error(`${chalk.bold(t.name)}: ${result.message} [ERROR]`);
        }
      },
    })),
    {
      concurrent: false,
      collectErrors: "minimal",
      exitOnError: false,
    },
  );

  await tasks.run();
  if (tasks.errors.length > 0) {
    console.log();
    console.error("Errors occurred during migration");
    process.exit(1);
  }
}
