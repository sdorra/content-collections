import matter from "gray-matter";
import fg from "fast-glob";
import { readFile } from "fs/promises";
import { AnyCollection, Collection } from "dist";

export type CollectionFile = {
  data: Record<string, unknown>;
  body: string;
  path: string;
};

async function collectFile(filePath: string): Promise<CollectionFile> {
  const file = await readFile(filePath, "utf-8");
  const { data, content: body } = matter(file);

  return {
    data,
    body,
    path: filePath,
  };
}

async function resolveCollection<T extends FileCollection>(collection: T) {
  const filePaths = await fg(collection.sources);
  const promises = filePaths.map((filePath) => collectFile(filePath));
  return {
    ...collection,
    files: await Promise.all(promises),
  };
}

type FileCollection = Pick<AnyCollection, "sources">;

export async function collect<T extends FileCollection>(
  unresolvedCollections: Array<T>
) {
  const promises = unresolvedCollections.map((collection) =>
    resolveCollection(collection)
  );
  return await Promise.all(promises);
}
