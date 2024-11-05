import { PackageJson } from "src/packageJson.js";
import { ZodObject, ZodRawShape } from "zod";
import { Migrator } from "./migrator.js";
import { migratorNextJS } from "./next.js";
import { migratorQwik } from "./qwik.js";
import { migratorRemix } from "./remix.js";
import { migratorSolid } from "./solid.js";
import { migratorVite } from "./vite.js";

const migrators = [migratorNextJS, migratorRemix, migratorQwik, migratorSolid, migratorVite];

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
