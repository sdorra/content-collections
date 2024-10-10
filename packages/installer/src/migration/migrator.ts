import type { PackageJson } from "src/packageJson.js";
import type { z, ZodObject, ZodRawShape, ZodTypeAny } from "zod";
import type { Task } from "./tasks/index.js";

export type Migration = Array<Task>;

type MigratorContext = {
  directory: string;
  packageJson: PackageJson;
};

export function defineMigrator<TOptions extends ZodObject<ZodRawShape>>(
  migrator: Migrator<TOptions>,
) {
  return migrator;
}

export type Migrator<
  TOptionsSchema extends ZodTypeAny,
  TOptions = z.infer<TOptionsSchema>,
> = {
  name: string;
  options: TOptionsSchema;
  createMigration: (
    context: MigratorContext,
    options: TOptions,
  ) => Promise<Migration>;
};
