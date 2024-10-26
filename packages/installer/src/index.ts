import { findMigrator } from "./migration/index.js";
import { readPackageJson } from "./packageJson.js";
import { Ask, resolveOptions } from "./migration/options.js";
export type { Option, InputOption, ListOption } from "./migration/options.js";

export async function createMigrator(directory: string) {
  const packageJson = await readPackageJson(directory);
  const migrator = findMigrator(packageJson);

  return {
    name: migrator.name,
    createMigration: async (ask: Ask) => {
      const options = await resolveOptions(migrator, ask);

      return migrator.createMigration(
        {
          directory,
          packageJson,
        },
        options,
      );
    }
  }
}
