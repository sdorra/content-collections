#!/usr/bin/env node
import { createMigrator } from "@content-collections/installer";
import { input, select } from "@inquirer/prompts";
import chalk from "chalk";
import { Listr } from "listr2";
import { ZodDefault, ZodEnum, ZodTypeAny } from "zod";

async function ask(key: string, value?: ZodTypeAny) {
  if (!value) {
    throw new Error("No value provided");
  }

  let valueType = value;
  let defaultValueResolver = value._def.defaultValue;
  let description = value._def.description;

  if (value instanceof ZodDefault) {
    valueType = value._def.innerType;
    defaultValueResolver = value._def.defaultValue;

    if (!description) {
      description = valueType._def.description;
    }
  }

  const defaultValue = defaultValueResolver
    ? defaultValueResolver()
    : undefined;

  if (valueType instanceof ZodEnum) {
    return select({
      message: description || "Select an option",
      default: defaultValue,
      choices: valueType.options,
    });
  }

  return input({
    default: defaultValue,
    message: description || `Enter ${key}`,
  });
}

async function install() {
  console.log("Searching for migrator in", process.cwd());
  const migrator = await createMigrator(process.cwd());

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

install();
