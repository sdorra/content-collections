import path, { join } from "node:path";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";

export type CacheFn = <TInput, TOutput>(
  input: TInput,
  compute: (input: TInput) => Promise<TOutput> | TOutput
) => Promise<TOutput>;

function createKey(config: string, input: unknown): string {
  return (
    createHash("sha256")
      // we add the config hash to the input hash to ensure that the cache is
      // invalidated when the config changes
      .update(config)
      .update(JSON.stringify(input))
      .digest("hex")
  );
}

async function createCacheDirectory(directory: string) {
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

export async function createCacheManager(
  baseDirectory: string,
  configChecksum: string
) {
  const cacheDirectory = await createCacheDirectory(baseDirectory);

  let mapping: Mapping = {};

  const mappingPath = join(cacheDirectory, "mapping.json");
  if (existsSync(mappingPath)) {
    mapping = JSON.parse(await readFile(mappingPath, "utf-8"));
  }

  async function flush() {
    await writeFile(mappingPath, JSON.stringify(mapping));
  }

  function cache(collection: string, file: string) {
    const directory = join(
      cacheDirectory,
      fileName(collection),
      fileName(file)
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

    const cacheFn: CacheFn = async (input, fn) => {
      const key = createKey(configChecksum, input);

      newFileMapping.push(key);

      const filePath = join(directory, `${key}.cache`);

      if (fileMapping?.includes(key) || newFileMapping.includes(key)) {
        if (existsSync(filePath)) {
          return JSON.parse(await readFile(filePath, "utf-8"));
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
