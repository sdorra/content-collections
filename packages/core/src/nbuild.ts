import os from "node:os";
import path from "node:path";
import pLimit from "p-limit";
import { Cache, createCacheManager } from "./cache";
import { AnyCollection, Context } from "./config";
import {
  Options as ConfigurationOptions,
  createConfigurationReader,
  defaultConfigName,
  InternalConfiguration,
} from "./configurationReader";
import { createEmitter, type Emitter, TransformError } from "./events";
import { serializableSchema } from "./serializer";
import {
  MetaBase,
  RawDocument,
  SyncFn,
  Watcher,
} from "./source";
import { ValidatedCollection, ValidatedDocument } from "./types";
import { isDefined } from "./utils";
import { createWriter } from "./writer";

type Options = ConfigurationOptions & {
  outputDir?: string;
};

function resolveOutputDir(baseDirectory: string, options: Options) {
  if (options.outputDir) {
    return options.outputDir;
  }
  return path.join(baseDirectory, ".content-collections", "generated");
}

function orderById(a: RawDocument<MetaBase>, b: RawDocument<MetaBase>) {
  return a._meta.id.localeCompare(b._meta.id);
}

// TODO: check export
export async function createInternalBuilder(
  configuration: InternalConfiguration,
  baseDirectory: string,
  options: Options,
  emitter: Emitter,
) {
  const outputDirectory = resolveOutputDir(baseDirectory, options);

  const limit = pLimit(os.cpus().length);

  emitter.emit("builder:created", {
    createdAt: Date.now(),
    configurationPath: configuration.path,
    outputDirectory: outputDirectory,
  });

  const cacheManager = await createCacheManager(
    baseDirectory,
    configuration.checksum,
  );

  const writer = await createWriter(outputDirectory);

  let validatedCollections: ValidatedCollection[] = [];

  async function validateCollections() {;
    for (const collection of configuration.collections) {
      const resolvedSource = collection.source({
        baseDirectory,
        emitter
      });
      const rawDocuments = await limit(() => resolvedSource.documents());
      const documents = (
        await Promise.all(
          rawDocuments.map((rawDocument) =>
            limit(() => validateRawDocument(collection, rawDocument)),
          ),
        )
      )
        .filter(isDefined)
        .sort(orderById);

      validatedCollections.push({
        ...collection,
        resolvedSource,
        documents,
      });
    }
  }

  function createContext(
    collection: ValidatedCollection,
    cache: Cache,
    document: ValidatedDocument,
  ): Context<unknown> {
    const baseContext: Context<unknown> = {
      documents: (collection) => {
        const resolved = validatedCollections.find(
          (c) => c.name === collection.name,
        );
        if (!resolved) {
          throw new TransformError(
            "Configuration",
            `Collection ${collection.name} not found, do you have registered it in your configuration?`,
          );
        }
        return resolved.documents;
      },
      collection: {
        name: collection.name,
        // @ts-expect-error not every source has a directory
        directory: collection.source.directory,
        documents: async () => {
          return collection.documents.map((doc) => doc.document);
        },
      },
      cache: cache.cacheFn,
    };

    if (collection.resolvedSource.extendContext) {
      const extendedContext = collection.resolvedSource.extendContext(document);
      return {
        ...baseContext,
        ...extendedContext,
      };
    } else {
      return baseContext;
    }
  }

  async function buildDocument(
    collection: ValidatedCollection,
    document: ValidatedDocument,
  ) {
    // transform the document
    const transform = collection.transform;
    if (transform) {
      const cache = cacheManager.cache(collection.name, document._meta.id);
      const context = createContext(collection, cache, document);
      try {
        document = await transform(document, context);
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

    const transformedValidationResult =
      await serializableSchema["~standard"].validate(document);

    if (transformedValidationResult.issues) {
      emitter.emit("transformer:result-error", {
        collection,
        document,
        error: new TransformError(
          "Result",
          transformedValidationResult
            .issues!.map((issue) => issue.message)
            .join(", "),
        ),
      });

      return null;
    }

    // We keep using the document, because `transformedValidationResult.value`
    // would remove things like our import symbols.
    return document;
  }

  async function buildCollection(collection: ValidatedCollection) {
    const documents = (
      await Promise.all(
        collection.documents.map((document) =>
          limit(() => buildDocument(collection, document)),
        ),
      )
    ).filter(isDefined);

    await cacheManager.flush();

    if (collection.onSuccess) {
      await collection.onSuccess(documents);
    }

    await writer.createDataFile(collection.name, documents);

    return {
      ...collection,
      documents,
    };
  }

  async function validateRawDocument(
    collection: AnyCollection,
    rawDocument: RawDocument<MetaBase>,
  ): Promise<ValidatedDocument | null> {
    // validate the document
    const validationResult = await collection.schema["~standard"].validate(
      rawDocument.data,
    );

    if (validationResult.issues) {
      emitter.emit("transformer:validation-error", {
        collection,
        file: {
          data: rawDocument.data,
          path: rawDocument._meta.id,
        },
        // TODO: check for better issue formatting
        error: new TransformError(
          "Validation",
          validationResult.issues!.map((issue) => issue.message).join(", "),
        ),
      });

      return null;
    }

    const result = validationResult.value as ValidatedDocument;
    result._meta = rawDocument._meta;

    // TODO: dirty hack if content is not defined in the schema,
    // most validation libraries will remove the content property.
    // Before StandardSchema, we have added a content property to the schema,
    // after StandardSchema, we have added the property from the parser after validation.
    // But now, the parsing happens in the source, we have to find a better way to handle this.

    if (rawDocument.data.content !== undefined) {
      result.content = rawDocument.data.content;
    }

    return result;
  }

  async function buildCollections(reCreateCollections = false) {
    const startedAt = Date.now();
    emitter.emit("builder:start", {
      startedAt,
    });

    if (reCreateCollections) {
      validatedCollections = [];
      await validateCollections();
    }

    for (const collection of validatedCollections) {
      await buildCollection(collection);
    }

    await writer.createJavaScriptFile(configuration);
    await writer.createTypeDefinitionFile(configuration);

    const stats = validatedCollections.reduce(
      (acc, collection) => {
        acc.collections++;
        acc.documents += collection.documents.length;
        return acc;
      },
      {
        collections: 0,
        documents: 0,
      },
    );

    emitter.emit("builder:end", {
      startedAt,
      endedAt: Date.now(),
      stats,
    });
  }

  function build() {
    return buildCollections(true);
  }

  function createSyncFn(collection: ValidatedCollection): SyncFn<MetaBase> {
    async function deleteDoc(document: RawDocument<MetaBase>) {
      const idx = collection.documents.findIndex(
        (doc) => doc._meta.id === document._meta.id,
      );
      if (idx !== -1) {
        collection.documents.splice(idx, 1);
        await buildCollections();
      }
    }

    async function updateDoc(document: RawDocument<MetaBase>) {
      const validatedDocument = await validateRawDocument(collection, document);
      if (validatedDocument) {
        const idx = collection.documents.findIndex(
          (doc) => doc._meta.id === validatedDocument._meta.id,
        );
        if (idx !== -1) {
          collection.documents[idx] = validatedDocument;
          await buildCollections();
        }
      }
    }

    async function createDoc(document: RawDocument<MetaBase>) {
      const validatedDocument = await validateRawDocument(collection, document);
      if (validatedDocument) {
        collection.documents.push(validatedDocument);
        collection.documents.sort(orderById);
        await buildCollections();
      }
    }

    const syncFns = {
      delete: deleteDoc,
      update: updateDoc,
      create: createDoc,
    };

    return async (modification, document) => {
      await syncFns[modification](document);
    };
  }

  async function watch() {
    // TODO: check for configuration changes

    const watchers: Array<Watcher> = [];
    for (const collection of validatedCollections) {
      if (!collection.resolvedSource.watch) {
        continue; // Skip collections that do not support watching
      }
      const syncFn = createSyncFn(collection);
      const watcher = await collection.resolvedSource.watch(syncFn);
      if (watcher) {
        watchers.push(watcher);
      }
    }

    return {
      unsubscribe: () => {
        return Promise.all(watchers.map((watcher) => watcher.unsubscribe()));
      },
    };
  }

  return {
    build,
    // TODO: sync
    watch,
    on: emitter.on,
  };
}

export async function createBuilder(
  configurationPath: string,
  options: Options = {
    configName: defaultConfigName,
  },
  emitter: Emitter = createEmitter(),
) {
  const readConfiguration = createConfigurationReader();
  const baseDirectory = path.dirname(configurationPath);
  const configuration = await readConfiguration(configurationPath, options);

  return createInternalBuilder(configuration, baseDirectory, options, emitter);
}

export type Builder = Awaited<ReturnType<typeof createBuilder>>;
