import watcher from "@parcel/watcher";
import { readFile } from "node:fs/promises";
import path, { basename, dirname, extname } from "node:path";
import { CollectError } from "src/collector";
import { ConfiguredParser, getParser } from "src/parser";
import { isDefined, posixToNativePath } from "src/utils";
import { glob } from "tinyglobby";
import {
  MetaBase,
  RawDocument,
  Source,
  sourceContext,
  SyncFn,
  Watcher,
} from "./api";

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
): Source<FileSystemMeta> {
  const { baseDirectory, emitter } = sourceContext();

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

  function orderByPath(
    a: RawDocument<FileSystemMeta>,
    b: RawDocument<FileSystemMeta>,
  ) {
    return a._meta.path.localeCompare(b._meta.path);
  }

  async function documents() {
    const include = Array.isArray(options.include)
      ? options.include
      : [options.include];

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
    return docs.filter(isDefined).sort(orderByPath);
  }

  async function watch(sync: SyncFn): Promise<Watcher | null> {
    const subscription = await watcher.subscribe(
      collectionDirectory,
      async (error, events) => {
        if (error) {
          emitter.emit("watcher:subscribe-error", {
            paths: [collectionDirectory],
            error,
          });
          return;
        }

        for (const event of events) {
          const { type, path } = event;
          await sync(type, path);
        }
      },
    );

    return subscription;
  }

  return {
    documents,
    watch,
  };
}
