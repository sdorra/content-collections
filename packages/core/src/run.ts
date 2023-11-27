import fg from "fast-glob";
import fs from "node:fs/promises";
import { AnyCollection, Context } from "./config";
import { InternalConfiguration } from "./applyConfig";
import matter from "gray-matter";
import { readFile } from "fs/promises";
import path from "node:path";
import pluralize from "pluralize";

function createArrayConstName(name: string) {
  let suffix = name.charAt(0).toUpperCase() + name.slice(1);
  return "all" + pluralize(suffix);
}

async function createDataFiles(
  collections: Array<CollectionResult>,
  directory: string
) {
  for (const collection of collections) {
    const dataPath = path.join(
      directory,
      `${createArrayConstName(collection.collection.name)}.json`
    );
    await fs.writeFile(dataPath, JSON.stringify(collection.files.map(f => f.document), null, 2));
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

type CollectionFile = {
  document: any;
  content: string;
};

async function collectFile(
  collection: AnyCollection,
  filePath: string
): Promise<CollectionFile> {
  const file = await readFile(filePath, "utf-8");
  const { data, content } = matter(file);

  let parsedData = await collection.schema.parseAsync(data);

  const document = {
    ...parsedData,
    _meta: {
      path: filePath,
    },
  };

  return {
    document,
    content,
  };
}

type CollectionResult = {
  files: Array<CollectionFile>;
  collection: AnyCollection;
};

async function collectFromCollection(collection: AnyCollection): Promise<CollectionResult> {
  const filePaths = await fg(collection.sources);
  const promises = filePaths.map((filePath) =>
    collectFile(collection, filePath)
  );
  return {
    files: await Promise.all(promises),
    collection,
  };
}

function createContext(
  collections: Array<CollectionResult>,
  file: CollectionFile
): Context {
  return {
    content: async () => file.content,
    documents: (collection) => {
      const resolved = collections.find((c) => c.collection.name === collection.name);
      if (!resolved) {
        throw new Error(`Collection ${collection.name} not found, do you have registered it in your configuration?`);
      }
      return resolved.files.map((file) => file.document);
    },
  };
}

async function transformCollection(
  collections: Array<CollectionResult>,
  collection: AnyCollection,
  files: Array<CollectionFile>
) {
  if (collection.transform) {
    for (const file of files) {
      const context = createContext(collections, file);
      file.document = await collection.transform(context, file.document);
    }
  }
}

async function collect(configuration: InternalConfiguration) {
  const promises = configuration.collections.map((collection) =>
    collectFromCollection(collection)
  );
  const collections = await Promise.all(promises);

  for (const { collection, files } of collections) {
    await transformCollection(collections, collection, files);
  }

  return collections;
}

export async function run(
  configuration: InternalConfiguration,
  directory: string
) {
  await fs.mkdir(directory, { recursive: true });

  const collections = await collect(configuration);

  await createDataFiles(collections, directory);
  await createJavaScriptFile(configuration, directory);
  if (configuration.generateTypes) {
    await createTypeDefinitionFile(configuration, directory);
  }
}
