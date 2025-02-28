import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path, { join } from "path";

export type CacheFn = {
  /**
   * @deprecated Use the overloaded function with `name` as the first parameter instead.
   * Without the additional `name` parameter it can lead to cache collisions.
   * This function will be removed in a future version.
   *
   * @see https://github.com/sdorra/content-collections/issues/505
   */
  <TInput, TOutput>(
    input: TInput,
    compute: (input: TInput) => Promise<TOutput> | TOutput,
    name?: string,
  ): Promise<TOutput>;
  <TInput, TOutput>(
    name: string,
    input: TInput,
    compute: (input: TInput) => Promise<TOutput> | TOutput,
  ): Promise<TOutput>;
};

type ComputeFn = (input: unknown) => Promise<unknown> | unknown;

type ModernCache = <TInput, TOutput>(
  name: string,
  input: TInput,
  compute: (input: TInput) => Promise<TOutput> | TOutput,
) => Promise<TOutput>;

export function createCacheFn(cache: ModernCache): CacheFn {
  return (
    arg1: string | unknown,
    arg2: unknown | ComputeFn,
    arg3?: ComputeFn | string,
  ) => {
    let name: string = "";
    let input: unknown;
    let fn: ComputeFn | undefined;

    if (typeof arg1 === "string" && typeof arg3 === "function") {
      // modern cache syntax
      name = arg1;
      input = arg2;
      fn = arg3 as ComputeFn;
    } else {
      // legacy cache syntax
      input = arg1;
      fn = arg2 as ComputeFn;
      if (typeof arg3 === "string") {
        name = arg3;
      }
    }

    return cache(name, input, fn);
  };
}

export function noopCache<TInput, TOutput>(
  arg1: string | TInput,
  arg2: TInput | ((input: TInput) => Promise<TOutput> | TOutput),
  arg3?: (input: TInput) => Promise<TOutput> | TOutput,
): Promise<TOutput> | TOutput {
  let computeFn: (input: TInput) => Promise<TOutput> | TOutput;
  let input: TInput;

  if (typeof arg1 === "string") {
    input = arg2 as TInput;
    computeFn = arg3 as (input: TInput) => Promise<TOutput> | TOutput;
  } else {
    input = arg1 as TInput;
    computeFn = arg2 as (input: TInput) => Promise<TOutput> | TOutput;
  }

  return computeFn(input);
}

function createKey(config: string, name: string, input: unknown): string {
  return (
    createHash("sha256")
      // we add the config hash to the input hash to ensure that the cache is
      // invalidated when the config changes
      .update(config)
      .update(name)
      .update(JSON.stringify(input))
      .digest("hex")
  );
}

// @visibleForTesting
export async function createCacheDirectory(directory: string) {
  const cacheDirectory = path.join(directory, ".content-collections", "cache");
  if (!existsSync(cacheDirectory)) {
    await mkdir(cacheDirectory, { recursive: true });
  }
  return cacheDirectory;
}

function fileName(input: string): string {
  return input.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

type Mapping = {
  [collection: string]: {
    [file: string]: string[];
  };
};

async function readMapping(mappingPath: string): Promise<Mapping> {
  if (existsSync(mappingPath)) {
    try {
      return JSON.parse(await readFile(mappingPath, "utf-8"));
    } catch (e) {
      console.error(
        "Failed to parse the cache mapping. We will recreate the cache.",
      );
    }
  }
  return {};
}

export async function createCacheManager(
  baseDirectory: string,
  configChecksum: string,
) {
  const cacheDirectory = await createCacheDirectory(baseDirectory);

  const mappingPath = join(cacheDirectory, "mapping.json");

  const mapping = await readMapping(mappingPath);

  async function flush() {
    await writeFile(mappingPath, JSON.stringify(mapping));
  }

  function cache(collection: string, file: string) {
    const directory = join(
      cacheDirectory,
      fileName(collection),
      fileName(file),
    );

    let collectionMapping = mapping[collection];
    if (!collectionMapping) {
      collectionMapping = {};
      mapping[collection] = collectionMapping;
    }

    let fileMapping = collectionMapping[file];
    if (!fileMapping) {
      fileMapping = [];
      collectionMapping[file] = fileMapping;
    }

    let newFileMapping: string[] = [];

    const cacheFn: CacheFn = createCacheFn(async (name, input, fn) => {
      const key = createKey(configChecksum, name, input);

      newFileMapping.push(key);

      const filePath = join(directory, `${key}.cache`);

      if (fileMapping?.includes(key) || newFileMapping.includes(key)) {
        if (existsSync(filePath)) {
          try {
            return JSON.parse(await readFile(filePath, "utf-8"));
          } catch (e) {
            console.error(
              "Failed to parse the cache file. We will recompute the value.",
            );
          }
        }
      }

      const output = await fn(input);
      if (!existsSync(directory)) {
        await mkdir(directory, { recursive: true });
      }

      await writeFile(filePath, JSON.stringify(output));

      return output;
    });

    const tidyUp = async () => {
      const filesToDelete =
        fileMapping?.filter((key) => !newFileMapping.includes(key)) || [];

      for (const key of filesToDelete) {
        const filePath = join(directory, `${key}.cache`);
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      }

      if (collectionMapping) {
        collectionMapping[file] = newFileMapping;
      }
    };

    return {
      cacheFn,
      tidyUp,
    };
  }
  return {
    cache,
    flush,
  };
}

export type CacheManager = Awaited<ReturnType<typeof createCacheManager>>;
export type Cache = ReturnType<CacheManager["cache"]>;
