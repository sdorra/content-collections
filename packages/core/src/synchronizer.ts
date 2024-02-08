import micromatch from "micromatch";
import { CollectionFile, FileCollection, ResolvedCollection } from "./types";
import path from "node:path";
import { orderByPath } from "./utils";

type CollectionFileReader = (
  directory: string,
  filePath: string
) => Promise<CollectionFile | null>;

export function createSynchronizer<T extends FileCollection>(
  readCollectionFile: CollectionFileReader,
  collections: Array<ResolvedCollection<T>>,
  baseDirectory: string = "."
) {
  function findCollection(filePath: string) {
    const resolvedFilePath = path.resolve(filePath);
    return collections.find((collection) => {
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
    const collection = findCollection(filePath);
    if (!collection) {
      return null;
    }

    const relativePath = createRelativePath(collection.directory, filePath);
    if (!micromatch.isMatch(relativePath, collection.include)) {
      return null;
    }

    return {
      collection,
      relativePath,
    };
  }

  function deleted(filePath: string) {
    const resolved = resolve(filePath);
    if (!resolved) {
      return false;
    }

    const { collection, relativePath } = resolved;

    const index = collection.files.findIndex(
      (file) => file.path === relativePath
    );
    const deleted = collection.files.splice(index, 1);

    return deleted.length > 0;
  }

  async function changed(filePath: string) {
    const resolved = resolve(filePath);
    if (!resolved) {
      return false;
    }

    const { collection, relativePath } = resolved;
    const index = collection.files.findIndex(
      (file) => file.path === relativePath
    );

    const file = await readCollectionFile(
      path.join(baseDirectory, collection.directory),
      relativePath
    );

    if (!file) {
      return false;
    }

    if (index === -1) {
      collection.files.push(file);
      collection.files.sort(orderByPath);
    } else {
      collection.files[index] = file;
    }

    return true;
  }

  return {
    deleted,
    changed,
  };
}

export type Synchronizer = ReturnType<typeof createSynchronizer>;
