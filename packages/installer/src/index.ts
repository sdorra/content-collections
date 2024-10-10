import { ZodTypeAny } from "zod";
import { findMigrator } from "./migration/index.js";
import { readPackageJson } from "./packageJson.js";

export type Ask = (key: string, value?: ZodTypeAny) => Promise<unknown>;

async function resolveOptions(ask: Ask, schema: ZodTypeAny) {
  const options: any = {};

  const shape = schema._def.shape();
  for (const key in shape) {
    const value = await ask(key, shape[key]);
    options[key] = value;
  }
  return schema.parse(options);
}

export async function createMigrator(directory: string) {
  const packageJson = await readPackageJson(directory);
  const migrator = findMigrator(packageJson);

  return {
    name: migrator.name,
    createMigration: async (ask: Ask) => {
      const options = await resolveOptions(ask, migrator.options);

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
