import { findMigrator, migrate } from "./migration/index.js";
import { readPackageJson } from "./packageJson.js";

type Options = {
  directory: string;
  demoContent: DemoContent;
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

// get the first two arguments
const [, , directory, demoContent] = process.argv;

if (!directory) {
  console.error("directory argument missing");
  process.exit(1);
}

if (!demoContent) {
  console.error("demoContent argument missing");
  process.exit(1);
}

const validDemoContent = ["false", "markdown", "mdx"];
if (!validDemoContent.includes(demoContent)) {
  console.error("demoContent must be one of false, markdown, mdx");
  process.exit(1);
}

let demoContentValue: DemoContent = false;
if (demoContent !== "false") {
  demoContentValue = demoContent as DemoContent;
}

console.log(`Install in ${directory} with demo content ${demoContentValue}`);

install({
  directory,
  demoContent: demoContentValue,
});
