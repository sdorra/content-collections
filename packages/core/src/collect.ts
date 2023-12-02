import matter from "gray-matter";
import fg from "fast-glob";
import { readFile } from "fs/promises";
import { AnyCollection } from "./config";
import path from "path";

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
