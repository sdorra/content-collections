import { PackageJson } from "src/packageJson.js";
import { z, ZodObject, ZodRawShape } from "zod";
import { migratorNextJS } from "./next.js";
import { Migrator } from "./migrator.js";

export function findMigrator(
  packageJson: PackageJson,
): Migrator<ZodObject<ZodRawShape>, any> {
  if (packageJson.dependencies?.next) {
    return migratorNextJS;
  }
  throw new Error(`unsupported package ${packageJson.name}`);
}
