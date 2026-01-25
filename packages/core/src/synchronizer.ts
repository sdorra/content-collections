import path from "node:path";
import picomatch from "picomatch";
import { AnyContent, isSingleton } from "./config";
import { CollectionFile } from "./types";
import { orderByPath } from "./utils";

type ResolvedSource = AnyContent & { files: Array<CollectionFile> };

type AnyFileReader = (source: AnyContent, filePath: string) => Promise<CollectionFile | null>;

export function createSynchronizer(
  readCollectionFile: AnyFileReader,
  collections: Array<ResolvedSource>,
  baseDirectory: string = ".",
) {
  function findCollections(filePath: string) {
    const resolvedFilePath = path.resolve(filePath);
    return collections.filter((collection) => {
      if (isSingleton(collection)) {
        return (
          resolvedFilePath === path.resolve(baseDirectory, collection.filePath)
        );
      }
      return resolvedFilePath.startsWith(
        path.resolve(baseDirectory, collection.directory),
      );
    });
  }

  function createRelativePath(collectionPath: string, filePath: string) {
    const resolvedCollectionPath = path.resolve(baseDirectory, collectionPath);
    const resolvedFilePath = path.resolve(filePath);

    let relativePath = resolvedFilePath.slice(resolvedCollectionPath.length);
    if (relativePath.startsWith(path.sep)) {
      relativePath = relativePath.slice(path.sep.length);
    }
    return relativePath;
  }

  function resolve(filePath: string) {
    const collections = findCollections(filePath);

    return collections
      .map((collection) => {
        const relativePath = isSingleton(collection)
          ? path.basename(collection.filePath)
          : createRelativePath(collection.directory, filePath);
        return {
          collection,
          relativePath,
        };
      })
      .filter(({ collection, relativePath }) => {
        if (isSingleton(collection)) {
          return true;
        }
        return picomatch.isMatch(relativePath, collection.include, {
          // @see https://github.com/sdorra/content-collections/issues/602
          windows: process.platform === "win32",
          ignore: collection.exclude,
        });
      });
  }

  function deleted(filePath: string) {
    const resolvedCollections = resolve(filePath);

    if (resolvedCollections.length === 0) {
      return false;
    }

    let changed = false;
    for (const { collection, relativePath } of resolvedCollections) {
      if (isSingleton(collection)) {
        if (collection.files.length > 0) {
          collection.files = [];
          changed = true;
        }
        continue;
      }
      const index = collection.files.findIndex(
        (file) => file.path === relativePath,
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
      const index = collection.files.findIndex((file) => file.path === relativePath);

      const file = await readCollectionFile(collection, relativePath);

      if (file) {
        changed = true;

        if (isSingleton(collection)) {
          collection.files = [file];
        } else {
          if (index === -1) {
            collection.files.push(file);
            collection.files.sort(orderByPath);
          } else {
            collection.files[index] = file;
          }
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
