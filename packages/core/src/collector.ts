import fg from "fast-glob";
import { readFile } from "fs/promises";
import path from "path";
import { isDefined, orderByPath } from "./utils";
import { CollectionFile, FileCollection } from "./types";
import { Emitter } from "./events";
import { parsers } from "./parser";

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

  async function collectFile<T extends FileCollection>(
    collection: T,
    filePath: string
  ): Promise<CollectionFile | null> {
    const absolutePath = path.join(baseDirectory, collection.directory, filePath);

    const file = await read(absolutePath);
    if (!file) {
      return null;
    }

    try {
      const data = parsers[collection.parser].parse(file);

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

  async function resolveCollection<T extends FileCollection>(collection: T) {
    const collectionDirectory = path.join(baseDirectory, collection.directory);
    const filePaths = await fg(collection.include, {
      cwd: collectionDirectory,
      onlyFiles: true,
      absolute: false,
    });
    const promises = filePaths.map((filePath) =>
      collectFile(collection, filePath)
    );

    const files = await Promise.all(promises);

    return {
      ...collection,
      files: files.filter(isDefined).sort(orderByPath),
    };
  }

  async function collect<T extends FileCollection>(
    unresolvedCollections: Array<T>
  ) {
    const promises = unresolvedCollections.map((collection) =>
      resolveCollection(collection)
    );
    return await Promise.all(promises);
  }

  return {
    collect,
    collectFile,
  };
}

export type Collector = ReturnType<typeof createCollector>;
