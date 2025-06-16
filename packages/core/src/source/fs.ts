import { readFile } from "node:fs/promises";
import path, { basename, dirname, extname } from "node:path";
import picomatch from "picomatch";
import { CollectError } from "src/events";
import { ConfiguredParser, getParser } from "src/parser";
import { Modification } from "src/types";
import { isDefined, posixToNativePath } from "src/utils";
import { glob } from "tinyglobby";
import { MetaBase, RawDocument, SourceFactory, SyncFn, Watcher } from "./api";
import chokidar from "chokidar";

export type FileSystemSourceOptions = {
  directory: string;
  parser: ConfiguredParser;
  include: string | string[];
  exclude?: string | string[];
};

export type FileSystemMeta = MetaBase & {
  filePath: string;
  fileName: string;
  directory: string;
  path: string;
  extension: string;
};

export type ExtendedFileSystemContext = {
  directory: string;
};

function createIncludePattern(options: FileSystemSourceOptions) {
  return Array.isArray(options.include) ? options.include : [options.include];
}

function createIgnorePattern(
  options: FileSystemSourceOptions,
): Array<string> | undefined {
  if (options.exclude) {
    if (Array.isArray(options.exclude)) {
      return options.exclude;
    } else {
      return [options.exclude];
    }
  }
  return undefined;
}

export function defineFileSystemSource(
  options: FileSystemSourceOptions,
): SourceFactory<FileSystemMeta, ExtendedFileSystemContext> {
  return ({ baseDirectory, emitter }) => {
    const collectionDirectory = path.join(baseDirectory, options.directory);

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

    function createPath(path: string, ext: string) {
      let p = path.slice(0, -ext.length);
      if (p.endsWith("/index")) {
        p = p.slice(0, -6);
      }
      return p;
    }

    function createMeta(filePath: string): FileSystemMeta {
      const ext = extname(filePath);

      let extension = ext;
      if (extension.startsWith(".")) {
        extension = extension.slice(1);
      }

      return {
        id: filePath,
        filePath,
        fileName: basename(filePath),
        directory: dirname(filePath),
        extension,
        path: createPath(filePath, ext),
      };
    }

    async function collectFile(
      directory: string,
      filePath: string,
    ): Promise<RawDocument<FileSystemMeta> | null> {
      const absolutePath = path.join(directory, filePath);

      const file = await read(absolutePath);
      if (!file) {
        return null;
      }

      try {
        const parser = getParser(options.parser);
        const data = await parser.parse(file);

        return {
          data,
          _meta: createMeta(filePath),
        };
      } catch (error) {
        emitter.emit("collector:parse-error", {
          filePath: path.join(directory, filePath),
          error: new CollectError("Parse", String(error)),
        });
        return null;
      }
    }

    async function documents() {
      const include = createIncludePattern(options);

      const filePaths = await glob(include, {
        cwd: collectionDirectory,
        onlyFiles: true,
        absolute: false,
        ignore: createIgnorePattern(options),
      });

      const promises = filePaths.map((filePath) =>
        collectFile(collectionDirectory, posixToNativePath(filePath)),
      );

      const docs = await Promise.all(promises);
      return docs.filter(isDefined);
    }

    function createDocument(
      modification: Modification,
      relativePath: string,
    ): Promise<RawDocument<FileSystemMeta> | null> {
      if (modification === "delete") {
        return Promise.resolve({
          data: {},
          _meta: createMeta(posixToNativePath(relativePath)),
        });
      }

      return collectFile(collectionDirectory, posixToNativePath(relativePath));
    }

    async function watch(sync: SyncFn<FileSystemMeta>): Promise<Watcher> {
      const collectionPath = path.resolve(collectionDirectory);

      const watcherInstance = chokidar.watch(collectionDirectory, {
        ignored: createIgnorePattern(options),
        persistent: true,
        ignoreInitial: true,
      });

      const include = createIncludePattern(options);
      const matcher = picomatch(include);

      const eventHandler = async (type: Modification, fileName: string) => {
        const resolvedFilePath = path.resolve(fileName);
        if (!resolvedFilePath.startsWith(collectionPath)) {
          return; // Ignore events outside the collection directory
        }
        const relativePath = path.relative(collectionPath, resolvedFilePath);
        if (!matcher(relativePath)) {
          return; // Ignore events that do not match defined collection patterns
        }
        const doc = await createDocument(type, relativePath);
        if (!doc) {
          return; // Skip if document creation failed
        }
        await sync(type, doc);
      };

      watcherInstance.on("add", (fileName) => eventHandler("create", fileName));
      watcherInstance.on("change", (fileName) => eventHandler("update", fileName));
      watcherInstance.on("unlink", (fileName) => eventHandler("delete", fileName));
      watcherInstance.on("error", (error) => {
        emitter.emit("watcher:subscribe-error", {
          paths: [collectionDirectory],
          error: error instanceof Error ? error : new Error(String(error)),
        });
      });

      return {
        unsubscribe: async () => {
          await watcherInstance.close();
        },
      };
    }

    function extendContext(document: RawDocument<FileSystemMeta>) {
      return {
        directory: document._meta.directory,
      };
    }

    return {
      documents,
      extendContext,
      watch,
    };
  };
}
