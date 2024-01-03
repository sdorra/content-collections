import matter from "gray-matter";
import fg from "fast-glob";
import { readFile } from "fs/promises";
import { AnyCollection } from "./config";
import path from "path";
import { ErrorHandler, isDefined, throwingErrorHandler } from "./utils";
import { CollectionFile } from "./types";

export type ErrorType = "Parse" | "Read";

export class CollectError extends Error {
  type: string;
  constructor(type: ErrorType, message: string) {
    super(message);
    this.type = type;
  }
}

type FileCollection = Pick<AnyCollection, "directory" | "include">;

export function createCollector(
  baseDirectory: string = ".",
  errorHandler: ErrorHandler = throwingErrorHandler
) {
  async function read(path: string) {
    try {
      return await readFile(path, "utf-8");
    } catch (error) {
      errorHandler(new CollectError("Read", String(error)));
      return null;
    }
  }

  function parse(file: string) {
    const { data, content } = matter(file);

    return {
      data,
      body: content,
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

    const { data, body } = parse(file);

    return {
      data,
      body,
      path: filePath,
    };
  }

  async function resolveCollection<T extends FileCollection>(collection: T) {
    const collectionDirectory = path.join(baseDirectory, collection.directory);
    const filePaths = await fg(collection.include, {
      cwd: collectionDirectory,
      onlyFiles: true,
      absolute: false,
    });
    const promises = filePaths.map((filePath) =>
      collectFile(collectionDirectory, filePath)
    );

    const files = await Promise.all(promises);

    return {
      ...collection,
      files: files.filter(isDefined),
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
