import { CollectionFile } from "./types";
import { AnyCollection, Context } from "./config";
import { isDefined } from "./utils";
import { Emitter } from "./events";

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
}

type ParsedFile = {
  document: any;
  content: string;
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

export function createTransformer(emitter: Emitter) {
  async function parseFile(
    collection: AnyCollection,
    file: CollectionFile
  ): Promise<ParsedFile | null> {
    const { data, body, path } = file;

    let parsedData = await collection.schema.safeParseAsync(data);
    if (!parsedData.success) {
      emitter.emit("transformer:validation-error", {
        collection,
        file,
        error: new TransformError("Validation", parsedData.error.message),
      });
      return null;
    }

    const document = {
      ...parsedData.data,
      _meta: {
        path,
      },
    };

    return {
      document,
      content: body,
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
    file: ParsedFile
  ): Context {
    return {
      content: async () => file.content,
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
      for (const doc of collection.documents) {
        const context = createContext(collections, doc);
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
