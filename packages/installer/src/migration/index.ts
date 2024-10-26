import { PackageJson } from "src/packageJson.js";
import { z, ZodObject, ZodRawShape } from "zod";
import { migratorNextJS } from "./next.js";
import { Migrator } from "./migrator.js";
import { migratorRemix } from "./remix.js";

const migrators = [migratorNextJS, migratorRemix];

export function findMigrator(
  packageJson: PackageJson,
): Migrator<ZodObject<ZodRawShape>, any> {
  for (const migrator of migrators) {
    if (migrator.isResponsible(packageJson)) {
      return migrator;
    }
  }
  throw new Error(`unsupported package ${packageJson.name}`);
}
