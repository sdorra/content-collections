import { readFile } from "fs/promises";
import path from "node:path";
import { glob } from "tinyglobby";
import { AnyContent, isSingleton } from "./config";
import { Emitter } from "./events";
import { getParser } from "./parser";
import { CollectionFile, FileCollection } from "./types";
import { isDefined, orderByPath, posixToNativePath } from "./utils";

export type CollectorEvents = {
  "collector:read-error": {
    filePath: string;
    error: CollectError;
  };
  "collector:parse-error": {
    filePath: string;
    error: CollectError;
  };
};

export type ErrorType = "Parse" | "Read";

export class CollectError extends Error {
  type: ErrorType;
  constructor(type: ErrorType, message: string) {
    super(message);
    this.type = type;
  }
}

export function createCollector(emitter: Emitter, baseDirectory: string = ".") {
  async function read(filePath: string) {
    try {
      return await readFile(filePath, "utf-8");
    } catch (error) {
      emitter.emit("collector:read-error", {
        filePath,
        error: new CollectError("Read", String(error)),
      });
      return null;
    }
  }

  async function collectCollectionFile<T extends FileCollection>(
    collection: T,
    filePath: string,
  ): Promise<CollectionFile | null> {
    const absolutePath = path.join(
      baseDirectory,
      collection.directory,
      filePath,
    );

    const file = await read(absolutePath);
    if (!file) {
      return null;
    }

    try {
      const parser = getParser(collection.parser);
      const data = await parser.parse(file);

      return {
        data,
        path: filePath,
      };
    } catch (error) {
      emitter.emit("collector:parse-error", {
        filePath: path.join(collection.directory, filePath),
        error: new CollectError("Parse", String(error)),
      });
      return null;
    }
  }

  async function collectSingletonFile(
    singleton: Extract<AnyContent, { filePath: string; optional?: boolean }>,
  ): Promise<CollectionFile | null> {
    const absolutePath = path.join(baseDirectory, singleton.filePath);
    const file = await read(absolutePath);
    if (!file) {
      if (singleton.optional) {
        return null;
      }

      throw new CollectError(
        "Read",
        `Singleton file not found at path: ${singleton.filePath}`,
      );
    }

    try {
      const parser = getParser(singleton.parser);
      const data = await parser.parse(file);
      return {
        data,
        path: path.basename(singleton.filePath),
      };
    } catch (error) {
      emitter.emit("collector:parse-error", {
        filePath: singleton.filePath,
        error: new CollectError("Parse", String(error)),
      });
      return null;
    }
  }

  async function collectFile(source: AnyContent, filePath: string) {
    if (isSingleton(source)) {
      return collectSingletonFile(source);
    }
    return collectCollectionFile(source, filePath);
  }

  function createIgnorePattern<T extends FileCollection>(
    collection: T,
  ): Array<string> | undefined {
    if (collection.exclude) {
      if (Array.isArray(collection.exclude)) {
        return collection.exclude;
      } else {
        return [collection.exclude];
      }
    }
    return undefined;
  }

  async function resolveCollection<T extends FileCollection>(collection: T) {
    const collectionDirectory = path.join(baseDirectory, collection.directory);

    const include = Array.isArray(collection.include)
      ? collection.include
      : [collection.include];

    const filePaths = await glob(include, {
      cwd: collectionDirectory,
      onlyFiles: true,
      absolute: false,
      ignore: createIgnorePattern(collection),
    });
    const promises = filePaths.map((filePath) =>
      collectCollectionFile(collection, posixToNativePath(filePath)),
    );

    const files = await Promise.all(promises);

    return {
      ...collection,
      files: files.filter(isDefined).sort(orderByPath),
    };
  }

  async function resolveSingleton(
    singleton: Extract<AnyContent, { filePath: string }>,
  ) {
    const file = await collectSingletonFile(singleton);
    return {
      ...singleton,
      files: file ? [file] : [],
    };
  }

  async function collect(unresolvedCollections: Array<AnyContent>) {
    const promises = unresolvedCollections.map((collection) => {
      if (isSingleton(collection)) {
        return resolveSingleton(collection);
      }
      return resolveCollection(collection);
    });
    return await Promise.all(promises);
  }

  return {
    collect,
    collectFile,
  };
}

export type Collector = ReturnType<typeof createCollector>;
