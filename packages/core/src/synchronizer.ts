import micromatch from "micromatch";
import { CollectionFile, FileCollection, ResolvedCollection } from "./types";
import path from "node:path";
import { orderByPath } from "./utils";

type CollectionFileReader<T extends FileCollection> = (
  collection: T,
  filePath: string
) => Promise<CollectionFile | null>;

export function createSynchronizer<T extends FileCollection>(
  readCollectionFile: CollectionFileReader<T>,
  collections: Array<ResolvedCollection<T>>,
  baseDirectory: string = "."
) {
  function findCollections(filePath: string) {
    const resolvedFilePath = path.resolve(filePath);
    return collections.filter((collection) => {
      return resolvedFilePath.startsWith(
        path.resolve(baseDirectory, collection.directory)
      );
    });
  }

  function createRelativePath(collectionPath: string, filePath: string) {
    const resolvedCollectionPath = path.resolve(baseDirectory, collectionPath);
    const resolvedFilePath = path.resolve(filePath);

    let relativePath = resolvedFilePath.slice(resolvedCollectionPath.length);
    if (relativePath.startsWith("/")) {
      relativePath = relativePath.slice(1);
    }
    return relativePath;
  }

  function resolve(filePath: string) {
    const collections = findCollections(filePath);

    return collections
      .map((collection) => {
        const relativePath = createRelativePath(collection.directory, filePath);
        return {
          collection,
          relativePath,
        };
      })
      .filter(({ collection, relativePath }) => {
        return micromatch.isMatch(relativePath, collection.include);
      });
  }

  function deleted(filePath: string) {
    const resolvedCollections = resolve(filePath);

    if (resolvedCollections.length === 0) {
      return false;
    }

    let changed = false;
    for (const { collection, relativePath } of resolvedCollections) {
      const index = collection.files.findIndex(
        (file) => file.path === relativePath
      );
      const deleted = collection.files.splice(index, 1);

      if (deleted.length > 0) {
        changed = true;
      }
    }
    return changed;
  }

  async function changed(filePath: string) {
    const resolvedCollections = resolve(filePath);

    if (resolvedCollections.length === 0) {
      return false;
    }

    let changed = false;

    for (const { collection, relativePath } of resolvedCollections) {
      const index = collection.files.findIndex(
        (file) => file.path === relativePath
      );

      const file = await readCollectionFile(collection, relativePath);

      if (file) {
        changed = true;

        if (index === -1) {
          collection.files.push(file);
          collection.files.sort(orderByPath);
        } else {
          collection.files[index] = file;
        }
      }
    }

    return changed;
  }

  return {
    deleted,
    changed,
  };
}

export type Synchronizer = ReturnType<typeof createSynchronizer>;
