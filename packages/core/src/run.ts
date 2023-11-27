import fs from "node:fs/promises";
import { InternalConfiguration } from "./applyConfig";
import path from "node:path";
import pluralize from "pluralize";
import { ResolvedCollection, collect } from "./collect";

function createArrayConstName(name: string) {
  let suffix = name.charAt(0).toUpperCase() + name.slice(1);
  return "all" + pluralize(suffix);
}

async function createDataFiles(
  collections: Array<ResolvedCollection>,
  directory: string
) {
  for (const collection of collections) {
    const dataPath = path.join(
      directory,
      `${createArrayConstName(collection.name)}.json`
    );
    await fs.writeFile(
      dataPath,
      JSON.stringify(
        collection.files.map((f) => f.document),
        null,
        2
      )
    );
  }
}

async function createJavaScriptFile(
  configuration: InternalConfiguration,
  directory: string
) {
  const collections = configuration.collections.map(({ name }) =>
    createArrayConstName(name)
  );

  let content = "";
  for (const name of collections) {
    content += `import ${name} from "./${name}.json";\n`;
  }
  content += "\n";
  content += "export { " + collections.join(", ") + " };\n";

  await fs.writeFile(path.join(directory, "index.js"), content, "utf-8");
}

async function createTypeDefinitionFile(
  configuration: InternalConfiguration,
  directory: string
) {
  const importPath = path.relative(directory, configuration.path);
  let content = `import mdxConfiguration from "${importPath}";
import { GetTypeByName } from "@mdx-collections/core";
`;

  const collections = configuration.collections;
  for (const collection of collections) {
    content += `\n`;
    content += `export type ${collection.typeName} = GetTypeByName<typeof mdxConfiguration, "${collection.name}">;\n`;
    content += `export declare const ${createArrayConstName(
      collection.name
    )}: Array<${collection.typeName}>;\n`;
  }

  content += "\n";
  // https://github.com/microsoft/TypeScript/issues/38592
  content += "export {};\n";

  await fs.writeFile(path.join(directory, "index.d.ts"), content, "utf-8");
}

export async function run(
  configuration: InternalConfiguration,
  directory: string
) {
  await fs.mkdir(directory, { recursive: true });

  const collections = await collect(configuration.collections);

  await createDataFiles(collections, directory);
  await createJavaScriptFile(configuration, directory);
  if (configuration.generateTypes) {
    await createTypeDefinitionFile(configuration, directory);
  }
}
