import matter from "gray-matter";
import fg from "fast-glob";
import { readFile } from "fs/promises";
import { AnyCollection } from "./config";
import path from "path";
import { isDefined, orderByPath } from "./utils";
import { CollectionFile } from "./types";
import { Emitter } from "./events";
import { parse, stringify } from "yaml";

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

type FileCollection = Pick<AnyCollection, "directory" | "include">;

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

  function parseFile(file: string) {
    const { data, content } = matter(file, {
      engines: {
        yaml: {
          parse,
          stringify,
        },
      },
    });

    return {
      ...data,
      content,
    };
  }

  async function collectFile(
    directory: string,
    filePath: string
  ): Promise<CollectionFile | null> {
    const file = await read(path.join(directory, filePath));
    if (!file) {
      return null;
    }

    try {
      const data = parseFile(file);

      return {
        data,
        path: filePath,
      };
    } catch (error) {
      emitter.emit("collector:parse-error", {
        filePath: path.join(directory, filePath),
        error: new CollectError("Parse", String(error)),
      });
      return null;
    }
  }

  async function resolveDirectory<T extends FileCollection>(
    collection: T,
    directory: string
  ) {
    const collectionDirectory = path.join(baseDirectory, directory);

    const filePaths = await fg(collection.include, {
      cwd: collectionDirectory,
      onlyFiles: true,
      absolute: false,
    });
    const promises = filePaths.map((filePath) =>
      collectFile(collectionDirectory, filePath)
    );

    return Promise.all(promises);
  }

  async function resolveCollection<T extends FileCollection>(collection: T) {
    let files: Array<CollectionFile | null> = [];
    if (typeof collection.directory === "string") {
      files = await resolveDirectory(collection, collection.directory);
    } else {
      const promises = collection.directory.map((directory) =>
        resolveDirectory(collection, directory)
      );
      const resolved = await Promise.all(promises);
      files = resolved.flat();
    }

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
