import matter from "gray-matter";
import fg from "fast-glob";
import { readFile } from "fs/promises";
import { AnyCollection } from "./config";
import path from "path";
import micromatch from "micromatch";
import { Modification } from ".";
import { c } from "vitest/dist/reporters-5f784f42.js";

export type CollectionFile = {
  data: Record<string, unknown>;
  body: string;
  path: string;
};

async function collectFile(
  directory: string,
  filePath: string
): Promise<CollectionFile> {
  const file = await readFile(path.join(directory, filePath), "utf-8");
  const { data, content: body } = matter(file);

  return {
    data,
    body,
    path: filePath,
  };
}

async function resolveCollection<T extends FileCollection>(collection: T) {
  const filePaths = await fg(collection.include, {
    cwd: collection.directory,
    onlyFiles: true,
    absolute: false,
  });
  const promises = filePaths.map((filePath) =>
    collectFile(collection.directory, filePath)
  );
  return {
    ...collection,
    files: await Promise.all(promises),
  };
}

type FileCollection = Pick<AnyCollection, "directory" | "include">;

export async function collect<T extends FileCollection>(
  unresolvedCollections: Array<T>
) {
  const promises = unresolvedCollections.map((collection) =>
    resolveCollection(collection)
  );
  return await Promise.all(promises);
}

function createRelativePath(directory: string, filePath: string) {
  if (!filePath.startsWith(directory)) {
    throw new Error("Path is not in collection directory");
  }
  let relativePath = filePath.slice(directory.length);
  if (relativePath.startsWith("/")) {
    relativePath = relativePath.slice(1);
  }
  return relativePath;
}

export function isIncluded(collection: FileCollection, path: string) {
  if (path.startsWith(collection.directory)) {
    const relativePath = createRelativePath(collection.directory, path);
    return micromatch.isMatch(relativePath, collection.include);
  }
  return false;
}

type ResolvedCollection<T extends FileCollection> = T & {
  files: Array<CollectionFile>;
};

async function syncFile<T extends FileCollection>(
  collection: ResolvedCollection<T>,
  modification: Modification,
  path: string
) {
  if ("added" === modification) {
    const file = await collectFile(collection.directory, path);
    collection.files.push(file);
  } else if ("changed" === modification) {
    const file = await collectFile(collection.directory, path);
    const index = collection.files.findIndex((file) => file.path === path);
    collection.files[index] = file;
  } else if ("removed" === modification) {
    const index = collection.files.findIndex((file) => file.path === path);
    collection.files.splice(index, 1);
  }
}

export function sync<T extends FileCollection>(
  collection: ResolvedCollection<T>,
  modification: Modification,
  path: string
) {
  const relativePath = createRelativePath(collection.directory, path);
  return syncFile(collection, modification, relativePath);
}
