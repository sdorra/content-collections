import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { createWatcher } from "./watcher";
import { Modification } from "./types";

const isEnabled = process.env.ENABLE_WATCHER_TESTS === "true";

describe.runIf(isEnabled)("watcher", () => {
  const directories: Array<string> = [];

  const events: Array<string> = [];
  let build = false;

  async function syncFn(
    modification: Modification,
    path: string
  ): Promise<boolean> {
    events.push(`${modification}:${path}`);
      return !path.endsWith("-ignore");
  }

  async function buildFn() {
    build = true;
    return;
  }

  function findEvent(type: string, path: string) {
    return events.find(
      (event) => event.startsWith(`${type}:`) && event.endsWith(path)
    );
  }

  beforeEach(() => {
    events.length = 0;
    build = false;
  });

  afterEach(async () => {
    for (const directory of directories.reverse()) {
      if (existsSync(directory)) {
        await fs.rm(directory, { recursive: true });
      }
    }
    directories.length = 0;
  });

  const mkdir = async (path: string) => {
    if (existsSync(path)) {
      await fs.rm(path, { recursive: true });
    }
    await fs.mkdir(path);

    directories.push(path);
  };

  it("should not build", async () => {
    await mkdir("tmp");

    const watcher = await createWatcher(["tmp"], syncFn, buildFn);

    await watcher.unsubscribe();

    expect(build).toBe(false);
  });

  it("should not build for untracked file", async () => {
    await mkdir("tmp");

    const watcher = await createWatcher(["tmp"], syncFn, buildFn);

    // we create one file and wait for the event
    // because we receive often a event for the directory
    await fs.writeFile("tmp/foo-ignore", "foo");
    await vi.waitUntil(() => findEvent("create", "tmp/foo-ignore"));

    // we reset the build flag and create a second file
    build = false;
    await fs.writeFile("tmp/bar-ignore", "foo");
    await vi.waitUntil(() => findEvent("create", "tmp/bar-ignore"));

    await watcher.unsubscribe();

    expect(build).toBe(false);
  });

  it("should emit create event", async () => {
    await mkdir("tmp");

    const watcher = await createWatcher(["tmp"], syncFn, buildFn);
    await fs.writeFile("tmp/foo", "foo");

    await vi.waitUntil(() => findEvent("create", "tmp/foo"));

    await watcher.unsubscribe();

    expect(findEvent("create", "tmp/foo")).toBeTruthy();
    expect(build).toBe(true);
  });

  it("should emit update event", async () => {
    await mkdir("tmp");

    const watcher = await createWatcher(["tmp"], syncFn, buildFn);

    await fs.writeFile("tmp/foo", "foo", "utf-8");
    await vi.waitUntil(() => findEvent("create", "tmp/foo"), 2000);

    await fs.writeFile("tmp/foo", "bar", "utf-8");
    await vi.waitUntil(() => findEvent("update", "tmp/foo"), 2000);

    await watcher.unsubscribe();

    expect(findEvent("update", "tmp/foo")).toBeTruthy();
    expect(build).toBe(true);
  });

  it("should emit delete event", async () => {
    await mkdir("tmp");
    await fs.writeFile("tmp/foo", "foo");

    const watcher = await createWatcher(["tmp"], syncFn, buildFn);
    await fs.rm("tmp/foo");

    await vi.waitUntil(() => findEvent("delete", "tmp/foo"));

    await watcher.unsubscribe();

    expect(findEvent("delete", "tmp/foo")).toBeTruthy();
    expect(build).toBe(true);
  });

  it("should emit events from multiple directories", async () => {
    await mkdir("tmp-one");
    await mkdir("tmp-two");

    const watcher = await createWatcher(["tmp-one", "tmp-two"], syncFn, buildFn);
    await fs.writeFile("tmp-one/foo", "foo");
    await fs.writeFile("tmp-two/bar", "bar");

    await vi.waitUntil(
      () =>
        findEvent("create", "tmp-one/foo") && findEvent("create", "tmp-two/bar")
    );

    await watcher.unsubscribe();

    expect(findEvent("create", "tmp-one/foo")).toBeTruthy();
    expect(findEvent("create", "tmp-two/bar")).toBeTruthy();
    expect(build).toBe(true);
  });

  it("should emit events from nested directories", async () => {
    await mkdir("tmp");
    await mkdir("tmp/foo");
    await mkdir("tmp/bar");

    const watcher = await createWatcher(["tmp"], syncFn, buildFn);
    await fs.writeFile("tmp/foo/baz", "baz");
    await fs.writeFile("tmp/bar/qux", "qux");

    await vi.waitUntil(
      () =>
        findEvent("create", "tmp/foo/baz") && findEvent("create", "tmp/bar/qux")
    );

    await watcher.unsubscribe();

    expect(findEvent("create", "tmp/foo/baz")).toBeTruthy();
    expect(findEvent("create", "tmp/bar/qux")).toBeTruthy();
    expect(build).toBe(true);
  });
});
