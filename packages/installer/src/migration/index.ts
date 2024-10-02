import { PackageJson } from "src/packageJson.js";
import { migratorNextJS } from "./next.js";
import { Task } from "./tasks/index.js";

export type Migration = Array<Task>;

type MigratorContext = {
  directory: string;
  packageJson: PackageJson;
  demoContent: boolean;
};

export type Migrator = {
  name: string;
  createMigration: (context: MigratorContext) => Promise<Migration>;
};

export function findMigrator(packageJson: PackageJson): Migrator {
  if (packageJson.dependencies?.next) {
    return migratorNextJS;
  }
  throw new Error(`unsupported package ${packageJson.name}`);
}

export async function migrate(migration: Migration) {
  for (const task of migration) {
    console.log(`execute task ${task.name}`);
    await task.run();
  }
}
