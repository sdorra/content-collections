import { CollectionFile } from "./types";
import { AnyCollection, Context } from "./config";
import { isDefined } from "./utils";
import { Emitter } from "./events";
import { basename, dirname, extname } from "node:path";
import { z } from "zod";
import { Parser, parsers } from "./parser";
import { CacheManager, Cache } from "./cache";
import { jsonObjectScheme } from "./json";

export type TransformerEvents = {
  "transformer:validation-error": {
    collection: AnyCollection;
    file: CollectionFile;
    error: TransformError;
  };
  "transformer:result-error": {
    collection: AnyCollection;
    document: any;
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

export type ErrorType = "Validation" | "Configuration" | "Transform" | "Result";

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

export function createTransformer(
  emitter: Emitter,
  cacheManager: CacheManager
) {
  function createSchema(parserName: Parser, schema: z.ZodRawShape) {
    const parser = parsers[parserName];
    if (!parser.hasContent) {
      return z.object(schema);
    }
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

    const schema = createSchema(collection.parser, collection.schema);

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
    cache: Cache
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
      cache: cache.cacheFn,
    };
  }

  async function transformCollection(
    collections: Array<TransformedCollection>,
    collection: TransformedCollection
  ) {
    if (collection.transform) {
      const docs = [];
      for (const doc of collection.documents) {
        const cache = cacheManager.cache(
          collection.name,
          doc.document._meta.path
        );
        const context = createContext(collections, cache);
        try {
          const document = await collection.transform(doc.document, context);
          docs.push({
            ...doc,
            document,
          });
          await cache.tidyUp();
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
      await cacheManager.flush();
      return docs;
    }

    return collection.documents;
  }

  async function validateDocuments(collection: AnyCollection, documents: Array<any>) {
    const docs = [];
    for (const doc of documents) {
      let parsedData = await jsonObjectScheme.safeParseAsync(doc.document);
      if (parsedData.success) {
        docs.push(doc);
      } else {
        emitter.emit("transformer:result-error", {
          collection,
          document: doc.document,
          error: new TransformError("Result", parsedData.error.message),
        });
      }
    }
    return docs;
  }

  return async (untransformedCollections: Array<ResolvedCollection>) => {
    const promises = untransformedCollections.map((collection) =>
      parseCollection(collection)
    );
    const collections = await Promise.all(promises);

    for (const collection of collections) {
      const documents = await transformCollection(collections, collection);
      collection.documents = await validateDocuments(collection, documents);
    }

    return collections;
  };
}

export type Transformer = ReturnType<typeof createTransformer>;
