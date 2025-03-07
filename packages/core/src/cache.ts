import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path, { join } from "node:path";

type Options = {
  key: string;
};

export type CacheFn = <TInput, TOutput>(
  input: TInput,
  compute: (input: TInput) => Promise<TOutput> | TOutput,
  options?: Options,
) => Promise<TOutput>;

function createKey(config: string, input: unknown, key: string): string {
  return (
    createHash("sha256")
      // we add the config hash to the input hash to ensure that the cache is
      // invalidated when the config changes
      .update(config)
      .update(JSON.stringify(input))
      .update(key)
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

    const cacheFn: CacheFn = async (input, fn, options) => {
      const key = createKey(configChecksum, input, options?.key || "");

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
    };

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
