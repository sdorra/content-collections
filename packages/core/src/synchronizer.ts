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
  function findCollectionAndDirectory(filePath: string) {
    const resolvedFilePath = path.resolve(filePath);
    for (const collection of collections) {
      const directories: Array<string> = [];
      if (typeof collection.directory === "string") {
        directories.push(collection.directory);
      } else {
        directories.push(...collection.directory);
      }

      for (const directory of directories) {
        const resolvedDirectory = path.resolve(baseDirectory, directory);
        if (resolvedFilePath.startsWith(resolvedDirectory)) {
          return {
            collection,
            directory,
          };
        }
      }
    }

    return null;
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
    const collectionAndDirectory = findCollectionAndDirectory(filePath);
    if (!collectionAndDirectory) {
      return null;
    }

    const { collection, directory } = collectionAndDirectory;
    const relativePath = createRelativePath(directory, filePath);
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

    const directories: Array<string> = [];
    if (typeof collection.directory === "string") {
      directories.push(collection.directory);
    } else {
      directories.push(...collection.directory);
    }

    let file: CollectionFile | null = null;
    for (const directory of directories) {
      file = await readCollectionFile(
        path.join(baseDirectory, directory),
        relativePath
      );
      if (file) {
        break;
      }
    }

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
