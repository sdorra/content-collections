import { CollectionFile } from "./types";
import { AnyCollection, Context } from "./config";
import { isDefined } from "./utils";
import { Emitter } from "./events";
import { basename, dirname, extname } from "node:path";
import { z } from "zod";

export type TransformerEvents = {
  "transformer:validation-error": {
    collection: AnyCollection;
    file: CollectionFile;
    error: TransformError;
  };
  "transformer:error": {
    collection: AnyCollection;
    error: TransformError;
  };
};

type ParsedFile = {
  document: any;
};

export type ResolvedCollection = AnyCollection & {
  files: Array<CollectionFile>;
};

export type TransformedCollection = AnyCollection & {
  documents: Array<any>;
};

export type ErrorType = "Validation" | "Configuration" | "Transform";

export class TransformError extends Error {
  type: ErrorType;
  constructor(type: ErrorType, message: string) {
    super(message);
    this.type = type;
  }
}

function createPath(path: string, ext: string) {
  let p = path.slice(0, -ext.length);
  if (p.endsWith("/index")) {
    p = p.slice(0, -6);
  }
  return p;
}

export function createTransformer(emitter: Emitter) {
  function createSchema(schema: z.ZodRawShape) {
    return z.object({
      content: z.string(),
      ...schema,
    });
  }

  async function parseFile(
    collection: AnyCollection,
    file: CollectionFile
  ): Promise<ParsedFile | null> {
    const { data, path } = file;

    const schema = createSchema(collection.schema);

    let parsedData = await schema.safeParseAsync(data);
    if (!parsedData.success) {
      emitter.emit("transformer:validation-error", {
        collection,
        file,
        error: new TransformError("Validation", parsedData.error.message),
      });
      return null;
    }

    const ext = extname(path);

    let extension = ext;
    if (extension.startsWith(".")) {
      extension = extension.slice(1);
    }

    const document = {
      ...parsedData.data,
      _meta: {
        filePath: path,
        fileName: basename(path),
        directory: dirname(path),
        extension,
        path: createPath(path, ext),
      },
    };

    return {
      document,
    };
  }

  async function parseCollection(
    collection: ResolvedCollection
  ): Promise<TransformedCollection> {
    const promises = collection.files.map((file) =>
      parseFile(collection, file)
    );
    return {
      ...collection,
      documents: (await Promise.all(promises)).filter(isDefined),
    };
  }

  function createContext(
    collections: Array<TransformedCollection>,
  ): Context {
    return {
      documents: (collection) => {
        const resolved = collections.find((c) => c.name === collection.name);
        if (!resolved) {
          throw new TransformError(
            "Configuration",
            `Collection ${collection.name} not found, do you have registered it in your configuration?`
          );
        }
        return resolved.documents.map((doc) => doc.document);
      },
    };
  }

  async function transformCollection(
    collections: Array<TransformedCollection>,
    collection: TransformedCollection
  ) {
    if (collection.transform) {
      const docs = [];
      const context = createContext(collections);
      for (const doc of collection.documents) {
        try {
          docs.push({
            ...doc,
            document: await collection.transform(context, doc.document),
          });
        } catch (error) {
          if (error instanceof TransformError) {
            emitter.emit("transformer:error", {
              collection,
              error,
            });
          } else {
            emitter.emit("transformer:error", {
              collection,
              error: new TransformError("Transform", String(error)),
            });
          }
        }
      }
      return docs;
    }
    return collection.documents;
  }

  return async (untransformedCollections: Array<ResolvedCollection>) => {
    const promises = untransformedCollections.map((collection) =>
      parseCollection(collection)
    );
    const collections = await Promise.all(promises);

    for (const collection of collections) {
      collection.documents = await transformCollection(collections, collection);
    }

    return collections;
  };
}

export type Transformer = ReturnType<typeof createTransformer>;
