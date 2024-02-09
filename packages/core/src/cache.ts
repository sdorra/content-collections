import { CacheFn } from "./config";
import path, { join } from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";

export function createNoopCache(): CacheFn {
  return async (input, fn) => {
    return fn(input);
  };
}

function createFileCache(directory: string): CacheFn {
  return async (input, fn) => {
    const inputHash = createHash("sha256")
      .update(JSON.stringify(input))
      .digest("hex");

    const filePath = join(directory, `${inputHash}.cache`);
    if (existsSync(filePath)) {
      return JSON.parse(await readFile(filePath, "utf-8"));
    }

    const output = await fn(input);
    await writeFile(filePath, JSON.stringify(output));
    return output;
  };
}

function createMemoryCache(): CacheFn {
  const inMemoryCache = new Map();
  return async (input, fn) => {
    if (inMemoryCache.has(input)) {
      return inMemoryCache.get(input);
    }

    const output = await fn(input);
    inMemoryCache.set(input, output);
    return output;
  };
}

async function createCacheDirectory(directory: string) {
  const cacheDirectory = path.join(directory, ".content-collections", "cache");
  if (!existsSync(cacheDirectory)) {
    await mkdir(cacheDirectory, { recursive: true });
  }
  return cacheDirectory;
}

export async function createCache(
  cache: string,
  directory: string
): Promise<CacheFn> {
  if (cache === "none") {
    return createNoopCache();
  }

  if (cache === "file") {
    return createFileCache(await createCacheDirectory(directory));
  }

  return createMemoryCache();
}
