import { findMigrator, migrate } from "./migration/index.js";
import { readPackageJson } from "./packageJson.js";

type Options = {
  directory: string;
  demoContent: boolean;
};

async function install(options: Options) {
  const packageJson = await readPackageJson(options.directory);
  const migrator = findMigrator(packageJson);

  console.log(`Using migrator ${migrator.name}`);
  const migration = await migrator.createMigration({
    ...options,
    packageJson,
  });

  console.log(`Start migration with ${migration.length} tasks`);
  await migrate(migration);
}

install({
  directory: "/Users/sdorra/Desktop/installer-test",
  demoContent: true,
});

// install(process.cwd());
