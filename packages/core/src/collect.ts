import { AnyCollection } from "dist";
import { InternalConfiguration } from "./applyConfig";
import { readFile } from "fs/promises";
import matter from "gray-matter";
import fg from "fast-glob";
import { Context } from "./config";

type CollectionFile = {
  document: any;
  content: string;
};

export type ResolvedCollection = AnyCollection & {
  files: Array<CollectionFile>;
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

async function collectFromCollection(
  collection: AnyCollection
): Promise<ResolvedCollection> {
  const filePaths = await fg(collection.sources);
  const promises = filePaths.map((filePath) =>
    collectFile(collection, filePath)
  );
  return {
    ...collection,
    files: await Promise.all(promises),
  };
}

function createContext(
  collections: Array<ResolvedCollection>,
  file: CollectionFile
): Context {
  return {
    content: async () => file.content,
    documents: (collection) => {
      const resolved = collections.find((c) => c.name === collection.name);
      if (!resolved) {
        throw new Error(
          `Collection ${collection.name} not found, do you have registered it in your configuration?`
        );
      }
      return resolved.files.map((file) => file.document);
    },
  };
}

async function transformCollection(
  collections: Array<ResolvedCollection>,
  collection: ResolvedCollection
) {
  if (collection.transform) {
    for (const file of collection.files) {
      const context = createContext(collections, file);
      file.document = await collection.transform(context, file.document);
    }
  }
}

export async function collect(unresolvedCollections: Array<AnyCollection>) {
  const promises = unresolvedCollections.map((collection) =>
    collectFromCollection(collection)
  );
  const collections = await Promise.all(promises);

  for (const collection of collections) {
    await transformCollection(collections, collection);
  }

  return collections;
}
