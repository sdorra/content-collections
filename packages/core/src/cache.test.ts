import { describe, expect } from "vitest";
import { createCacheDirectory, createCacheManager } from "./cache";
import { tmpdirTest } from "./__tests__/tmpdir";
import path from "node:path";
import { existsSync } from "node:fs";
import { readdir, writeFile } from "node:fs/promises";

describe("cacheManager", () => {
  tmpdirTest("should create cacheManager", async ({ tmpdir }) => {
    const cacheManager = await createCacheManager(tmpdir, "configChecksum");
    expect(cacheManager).toBeDefined();
  });

  tmpdirTest("should create cache directory", async ({ tmpdir }) => {
    await createCacheManager(tmpdir, "configChecksum");
    const dir = path.join(tmpdir, ".content-collections", "cache");
    expect(existsSync(dir)).toBe(true);
  });

  tmpdirTest("should not create file directory", async ({ tmpdir }) => {
    const cacheManager = await createCacheManager(tmpdir, "configChecksum");
    cacheManager.cache("collection", "file");
    const dir = path.join(
      tmpdir,
      ".content-collections",
      "cache",
      "collection",
      "file"
    );
    expect(existsSync(dir)).toBe(false);
  });

  tmpdirTest("should create file directory", async ({ tmpdir }) => {
    const cacheManager = await createCacheManager(tmpdir, "configChecksum");
    const cache = cacheManager.cache("collection", "file");
    await cache.cacheFn("input", () => "output");
    const dir = path.join(
      tmpdir,
      ".content-collections",
      "cache",
      "collection",
      "file"
    );
    expect(existsSync(dir)).toBe(true);
  });

  tmpdirTest("should cache", async ({ tmpdir }) => {
    const cacheManager = await createCacheManager(tmpdir, "configChecksum");
    const cache = cacheManager.cache("collection", "file");

    let counter = 0;

    function inc() {
      counter++;
      return counter;
    }

    expect(await cache.cacheFn("input", inc)).toBe(1);
    expect(await cache.cacheFn("input", inc)).toBe(1);
  });

  tmpdirTest("should compute if key changes", async ({ tmpdir }) => {
    const cacheManager = await createCacheManager(tmpdir, "configChecksum");
    const cache = cacheManager.cache("collection", "file");

    let counter = 0;

    function inc() {
      counter++;
      return counter;
    }

    expect(await cache.cacheFn("i-1", inc)).toBe(1);
    expect(await cache.cacheFn("i-2", inc)).toBe(2);
  });

  tmpdirTest("should cache across sessions", async ({ tmpdir }) => {
    let cacheManager = await createCacheManager(tmpdir, "configChecksum");
    let cache = cacheManager.cache("collection", "file");

    let counter = 0;

    function inc() {
      counter++;
      return counter;
    }

    expect(await cache.cacheFn("i-1", inc)).toBe(1);
    await cache.tidyUp();
    await cacheManager.flush();

    cacheManager = await createCacheManager(tmpdir, "configChecksum");
    cache = cacheManager.cache("collection", "file");

    counter = 42;
    expect(await cache.cacheFn("i-1", inc)).toBe(1);
  });

  tmpdirTest(
    "should compute if config checksum changes",
    async ({ tmpdir }) => {
      let cacheManager = await createCacheManager(tmpdir, "configChecksum");
      let cache = cacheManager.cache("collection", "file");

      let counter = 0;

      function inc() {
        counter++;
        return counter;
      }

      expect(await cache.cacheFn("i-1", inc)).toBe(1);
      await cache.tidyUp();
      await cacheManager.flush();

      cacheManager = await createCacheManager(tmpdir, "changed");
      cache = cacheManager.cache("collection", "file");

      expect(await cache.cacheFn("i-1", inc)).toBe(2);
    }
  );

  tmpdirTest("should tidy up", async ({ tmpdir }) => {
    const cacheManager = await createCacheManager(tmpdir, "configChecksum");
    let cache = cacheManager.cache("collection", "file");

    await cache.cacheFn("i-1", () => "output");
    await cache.tidyUp();

    const dir = path.join(
      tmpdir,
      ".content-collections",
      "cache",
      "collection",
      "file"
    );

    const files = await readdir(dir);
    expect(files).toHaveLength(1);

    cache = cacheManager.cache("collection", "file");

    await cache.cacheFn("i-2", () => "output");
    await cache.tidyUp();

    expect(await readdir(dir)).toHaveLength(1);
  });

  tmpdirTest(
    "should not fail, if cache mapping is broken",
    async ({ tmpdir }) => {
      const cacheDir = await createCacheDirectory(tmpdir);
      const mappingPath = path.join(cacheDir, "mapping.json");
      await writeFile(mappingPath, "broken");

      const cacheManager = await createCacheManager(tmpdir, "configChecksum");
      const cache = cacheManager.cache("collection", "file");
      expect(await cache.cacheFn("input", () => "output")).toBe("output");
    }
  );
});
