import { AnyCollection } from "dist";
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

export type ErrorType = "Validation" | "Configuration" | "Transform";

export class CollectionError extends Error {
  type: string;
  constructor(type: ErrorType, message: string) {
    super(message);
    this.type = type;
  }
}

type ErrorHandler = (error: CollectionError) => void;

const throwingErrorHandler: ErrorHandler = (error) => {
  throw error;
};

function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

export async function collect(
  unresolvedCollections: Array<AnyCollection>,
  errorHandler = throwingErrorHandler
) {
  async function collectFile(
    collection: AnyCollection,
    filePath: string
  ): Promise<CollectionFile | null> {
    const file = await readFile(filePath, "utf-8");
    const { data, content } = matter(file);

    let parsedData = await collection.schema.safeParseAsync(data);
    if (!parsedData.success) {
      errorHandler(new CollectionError("Validation", parsedData.error.message));
      return null;
    }

    const document = {
      ...parsedData.data,
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
      files: (await Promise.all(promises)).filter(isDefined),
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
          throw new CollectionError(
            "Configuration",
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
      const files = [];
      for (const file of collection.files) {
        const context = createContext(collections, file);
        try {
          files.push({
            ...file,
            document: await collection.transform(context, file.document),
          });
        } catch (error) {
          if (error instanceof CollectionError) {
            errorHandler(error);
          } else {
            errorHandler(new CollectionError("Transform", String(error)));
          }
        }
      }
      return files;
    }
    return collection.files;
  }

  const promises = unresolvedCollections.map((collection) =>
    collectFromCollection(collection)
  );
  const collections = await Promise.all(promises);

  for (const collection of collections) {
    collection.files = await transformCollection(collections, collection);
  }

  return collections;
}
