import fs from "node:fs/promises";
import { InternalConfiguration } from "./applyConfig";
import path from "node:path";
import pluralize from "pluralize";
import { collect, isIncluded, sync } from "./collect";
import {
  TransformedCollection,
  transform,
} from "./transformer";
import { Modification } from "./types";

function createArrayConstName(name: string) {
  let suffix = name.charAt(0).toUpperCase() + name.slice(1);
  return "all" + pluralize(suffix);
}

async function createDataFiles(
  collections: Array<TransformedCollection>,
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
        collection.documents.map((doc) => doc.document),
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

export async function createRunner(
  configuration: InternalConfiguration,
  directory: string
) {
  await fs.mkdir(directory, { recursive: true });

  const resolved = await collect(configuration.collections);

  await createJavaScriptFile(configuration, directory);
  if (configuration.generateTypes) {
    await createTypeDefinitionFile(configuration, directory);
  }

  async function run() {
    const collections = await transform(resolved);

    await createDataFiles(collections, directory);

    for (const collection of collections) {
      if (collection.onSuccess) {
        await collection.onSuccess(
          collection.documents.map((doc) => doc.document)
        );
      }
    }
  }

  return {
    run,
    sync: async (event: Modification, path: string) => {
      for (const collection of resolved) {
        if (isIncluded(collection, path)) {
          await sync(collection, event, path);
          await run();
        }
      }
    },
  };
}
