import { describe, it, expect } from "vitest";
import { createCache } from "./cache";
import { tmpdirTest } from "./__tests__/tmpdir";

describe("cache", () => {
  it("noop cache should not cache at all", async () => {
    let counter = 0;

    function increase() {
      counter++;
      return counter;
    }

    const cache = await createCache("none", "tmp");
    expect(await cache(1, increase)).toBe(1);
    expect(await cache(1, increase)).toBe(2);
  });

  it("memory cache should cache in memory", async () => {
    let counter = 0;

    function increase() {
      counter++;
      return counter;
    }

    const cache = await createCache("memory", "tmp");
    expect(await cache(1, increase)).toBe(1);
    expect(await cache(1, increase)).toBe(1);
  });

  it("memory cache should reset", async () => {
    let counter = 0;

    function increase() {
      counter++;
      return counter;
    }

    let cache = await createCache("memory", "tmp");
    expect(await cache(1, increase)).toBe(1);
    expect(await cache(1, increase)).toBe(1);

    cache = await createCache("memory", "tmp");
    expect(await cache(1, increase)).toBe(2);
    expect(await cache(1, increase)).toBe(2);
  });

  tmpdirTest("file cache should cache", async ({ tmpdir }) => {
    let counter = 0;

    function increase() {
      counter++;
      return counter;
    }

    let cache = await createCache("file", tmpdir);
    expect(await cache(1, increase)).toBe(1);
    expect(await cache(1, increase)).toBe(1);
  });

  tmpdirTest("file cache should cache, event after recreation", async ({ tmpdir }) => {
    let counter = 0;

    function increase() {
      counter++;
      return counter;
    }

    let cache = await createCache("file", tmpdir);
    expect(await cache(1, increase)).toBe(1);
    expect(await cache(1, increase)).toBe(1);

    increase();

    cache = await createCache("file", tmpdir);
    expect(await cache(1, increase)).toBe(1);
    expect(await cache(1, increase)).toBe(1);
  });
});
