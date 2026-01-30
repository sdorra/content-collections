import { StandardSchemaV1 } from "@standard-schema/spec";
import os from "node:os";
import { basename, dirname, extname, join } from "node:path";
import pLimit from "p-limit";
import { Cache, CacheManager } from "./cache";
import { AnyContent, CollectionContext, Context, SkippedSignal, SingletonContext, isSingleton, skippedSymbol, Singleton } from "./config";
import { Emitter } from "./events";
import { deprecated } from "./features";
import { getParser } from "./parser";
import { serializableSchema } from "./serializer";
import { CollectionFile } from "./types";
import { isDefined } from "./utils";

export type TransformerEvents = {
  "transformer:validation-error": {
    collection: AnyContent;
    file: CollectionFile;
    error: TransformError;
  };
  "transformer:singleton-warning": {
    collection: AnyContent;
  };
  "transformer:result-error": {
    collection: AnyContent;
    document: any;
    error: TransformError;
  };
  "transformer:error": {
    collection: AnyContent;
    error: TransformError;
  };
  "transformer:document-skipped": {
    collection: AnyContent;
    filePath: string;
    reason?: string;
  };
};

type ParsedFile = {
  document: any;
};

export type ResolvedCollection = AnyContent & {
  files: Array<CollectionFile>;
};

export type TransformedCollection = AnyContent & {
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

function isSkippedSignal(signal: any): signal is SkippedSignal {
  return signal[skippedSymbol] === true;
}

function createPath(path: string, ext: string) {
  let p = path.slice(0, -ext.length);
  if (p.endsWith("/index")) {
    p = p.slice(0, -6);
  }
  return p;
}

type WithContent = {
  content: unknown;
};

function isContentDefined(value: unknown): value is WithContent {
  return value !== null && typeof value === "object" && "content" in value;
}

function formatValidationErrorMessage(
  issues: ReadonlyArray<StandardSchemaV1.Issue>,
): string {
  return issues
    // we have always a path, the only case where it is empty is when the root type is wrong
    // and we enforce object as root type
    .map((issue) => `- ${issue.path}: ${issue.message}`)
    .join("\n");
}

export function createTransformer(
  emitter: Emitter,
  cacheManager: CacheManager,
) {
  const deprecatedWarnings = new Set<string>();

  function warnImplicitContentProperty(collection: AnyContent) {
    const key = `implicitContentProperty:${collection.name}`;
    if (deprecatedWarnings.has(key)) {
      return;
    }
    deprecatedWarnings.add(key);
    deprecated("implicitContentProperty");
  }

  async function parseFile(
    collection: AnyContent,
    file: CollectionFile,
  ): Promise<ParsedFile | null> {
    const { data, path } = file;

    const parsedData = await collection.schema["~standard"].validate(data);
    if (parsedData.issues) {
      emitter.emit("transformer:validation-error", {
        collection,
        file,
        error: new TransformError(
          "Validation",
          formatValidationErrorMessage(parsedData.issues),
        ),
      });
      return null;
    }

    let values = parsedData.value;

    const parser = getParser(collection.parser);

    // if the parser has content and the content property is not defined in the schema
    // we add it implicitly from the raw data, but warn the user that this is deprecated
    if (parser.hasContent && !isContentDefined(values)) {
      warnImplicitContentProperty(collection);

      // if the content property is implicitly added, we need to validate its type
      if (typeof data.content !== "string") {
        emitter.emit("transformer:validation-error", {
          collection,
          file,
          error: new TransformError(
            "Validation",
            `The content property is not a string`,
          ),
        });
        return null;
      }

      values = {
        // @ts-expect-error we can only spread on objects
        ...values,
        content: data.content,
      };
    }

    const ext = extname(path);

    let extension = ext;
    if (extension.startsWith(".")) {
      extension = extension.slice(1);
    }

    const document = {
      // @ts-expect-error we can only spread on objects
      ...values,
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
    collection: ResolvedCollection,
  ): Promise<TransformedCollection> {
    const promises = collection.files.map((file) =>
      parseFile(collection, file),
    );
    return {
      ...collection,
      documents: (await Promise.all(promises)).filter(isDefined),
    };
  }

  function createContext(
    collections: Array<TransformedCollection>,
    collection: TransformedCollection,
    cache: Cache,
  ): CollectionContext<unknown> | SingletonContext<unknown> {
    const base: Context<unknown> = {
      documents: (source) => {
        const resolved = collections.find((c) => c.name === source.name);
        if (!resolved) {
          throw new TransformError(
            "Configuration",
            `Collection ${source.name} not found, do you have registered it in your configuration?`,
          );
        }
        return resolved.documents.map((doc) => doc.document);
      },
      cache: cache.cacheFn,
      skip: (reason?: string) => ({
        [skippedSymbol]: true,
        reason,
      }),
    };

    if (isSingleton(collection)) {
      return {
        ...base,
        singleton: {
          name: collection.name,
          filePath: collection.filePath,
          directory: dirname(collection.filePath),
          document: async () => {
            return collection.documents[0]?.document;
          },
        },
      };
    }

    return {
      ...base,
      collection: {
        name: collection.name,
        directory: collection.directory,
        documents: async () => {
          return collection.documents.map((doc) => doc.document);
        },
      },
    };
  }

  async function transformDocument(
    collections: Array<TransformedCollection>,
    collection: TransformedCollection,
    transform: (data: any, context: CollectionContext<unknown> | SingletonContext<unknown>) => any,
    doc: any,
  ) {
    const cache = cacheManager.cache(collection.name, doc.document._meta.path);
    const context = createContext(collections, collection, cache);
    try {
      const document = isSingleton(collection)
        ? await transform(doc.document, context as SingletonContext<unknown>)
        : await transform(doc.document, context as CollectionContext<unknown>);
      await cache.tidyUp();
      if (isSkippedSignal(document)) {
        emitter.emit("transformer:document-skipped", {
          collection,
          filePath: join(
            isSingleton(collection)
              ? dirname(collection.filePath)
              : collection.directory,
            doc.document._meta.filePath
          ),
          reason: document.reason,
        });
      } else {
        return {
          ...doc,
          document,
        };
      }
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

  async function transformCollection(
    collections: Array<TransformedCollection>,
    collection: TransformedCollection,
  ) {
    const transform = collection.transform;
    if (transform) {
      const limit = pLimit(os.cpus().length);

      const typedTransform = transform as (
        data: any,
        context: CollectionContext<unknown> | SingletonContext<unknown>,
      ) => any;

      const docs = collection.documents.map((doc) =>
        limit(() => transformDocument(collections, collection, typedTransform, doc)),
      );

      const transformed = await Promise.all(docs);
      await cacheManager.flush();
      // document might be undefined if an error occurred
      return transformed.filter(isDefined);
    }

    return collection.documents;
  }

  async function validateDocuments(
    collection: AnyContent,
    documents: Array<any>,
  ) {
    const docs = [];
    for (const doc of documents) {
      let parsedData = await serializableSchema.safeParseAsync(doc.document);
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
      parseCollection(collection),
    );
    const collections = await Promise.all(promises);

    for (const collection of collections) {
      const documents = await transformCollection(collections, collection);
      collection.documents = await validateDocuments(collection, documents);

      if (isSingleton(collection)) {
        
        if (collection.documents.length === 0) {
          emitter.emit("transformer:singleton-warning", {
            collection,
          });
        }
      }
    }

    return collections;
  };
}

export type Transformer = ReturnType<typeof createTransformer>;
