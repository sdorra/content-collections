import { describe, expect, vi, beforeEach } from "vitest";
import fs from "node:fs/promises";
import { createWatcher } from "./watcher";
import { Modification } from "./types";
import { Events, createEmitter } from "./events";
import { tmpdirTest } from "./__tests__/tmpdir";
import path from "node:path";

import * as watcherImpl from "@parcel/watcher";
import { set } from "zod";

type Params = {
  subscribeError?: Error;
};

const params = vi.hoisted(() => {
  return {
    subscribeError: undefined,
  } as Params;
});

vi.mock("@parcel/watcher", async (importOriginal) => {
  const orig = await importOriginal<typeof watcherImpl>();
  return {
    ...orig,
    subscribe: async (
      path: string,
      callback: watcherImpl.SubscribeCallback
    ) => {
      if (params.subscribeError) {
        callback(params.subscribeError, []);
      } else {
        return orig.subscribe(path, callback);
      }
    },
  };
});

describe("watcher", () => {
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

  function findEvent(
    type: string,
    baseDirectory: string,
    pathName: string,
    eventArray = events
  ) {
    return eventArray.find(
      (event) =>
        event.startsWith(`${type}:`) &&
        event.endsWith(path.join(baseDirectory, pathName))
    );
  }

  let emitter = createEmitter<Events>();

  beforeEach(() => {
    emitter = createEmitter<Events>();
    events.length = 0;
    build = false;
    params.subscribeError = undefined;
  });

  const mkdir = async (baseDirectory: string, pathName: string) => {
    const p = path.join(baseDirectory, pathName);
    await fs.mkdir(p, { recursive: true });

    return p;
  };

  tmpdirTest("should not build", async ({ tmpdir }) => {
    const watcher = await createWatcher(emitter, [], [tmpdir], syncFn, buildFn);

    await watcher.unsubscribe();

    expect(build).toBe(false);
  });

  tmpdirTest("should not build for untracked file", async ({ tmpdir }) => {
    const watcher = await createWatcher(emitter, [], [tmpdir], syncFn, buildFn);

    // we create one file and wait for the event
    // because we receive often a event for the directory
    await fs.writeFile(path.join(tmpdir, "foo-ignore"), "foo");
    await vi.waitUntil(() => findEvent("create", tmpdir, "foo-ignore"));

    // we reset the build flag and create a second file
    build = false;
    await fs.writeFile(path.join(tmpdir, "bar-ignore"), "foo");
    await vi.waitUntil(() => findEvent("create", tmpdir, "bar-ignore"));

    await watcher.unsubscribe();

    expect(build).toBe(false);
  });

  tmpdirTest("should emit create event", async ({ tmpdir }) => {
    const watcher = await createWatcher(emitter, [], [tmpdir], syncFn, buildFn);
    await fs.writeFile(path.join(tmpdir, "foo"), "foo");

    await vi.waitUntil(() => findEvent("create", tmpdir, "foo"));

    await watcher.unsubscribe();

    expect(findEvent("create", tmpdir, "foo")).toBeTruthy();
    expect(build).toBe(true);
  });

  tmpdirTest("should emit update event", async ({ tmpdir }) => {
    const watcher = await createWatcher(emitter, [], [tmpdir], syncFn, buildFn);

    await fs.writeFile(path.join(tmpdir, "foo"), "foo", "utf-8");
    await vi.waitUntil(() => findEvent("create", tmpdir, "foo"), 2000);

    await fs.writeFile(path.join(tmpdir, "foo"), "bar", "utf-8");
    await vi.waitUntil(() => findEvent("update", tmpdir, "foo"), 2000);

    await watcher.unsubscribe();

    expect(findEvent("update", tmpdir, "foo")).toBeTruthy();
    expect(build).toBe(true);
  });

  tmpdirTest("should emit delete event", async ({ tmpdir }) => {
    await fs.writeFile(path.join(tmpdir, "foo"), "foo");

    const watcher = await createWatcher(emitter, [], [tmpdir], syncFn, buildFn);
    await fs.rm(path.join(tmpdir, "foo"));

    await vi.waitUntil(() => findEvent("delete", tmpdir, "foo"));

    await watcher.unsubscribe();

    expect(findEvent("delete", tmpdir, "foo")).toBeTruthy();
    expect(build).toBe(true);
  });

  tmpdirTest(
    "should emit events from multiple directories",
    async ({ tmpdir }) => {
      const one = await mkdir(tmpdir, "one");
      const two = await mkdir(tmpdir, "two");

      const watcher = await createWatcher(
        emitter,
        [],
        [one, two],
        syncFn,
        buildFn
      );
      await fs.writeFile(path.join(one, "foo"), "foo");
      await fs.writeFile(path.join(two, "bar"), "bar");

      await vi.waitUntil(
        () => findEvent("create", one, "foo") && findEvent("create", two, "bar")
      );

      await watcher.unsubscribe();

      expect(findEvent("create", one, "foo")).toBeTruthy();
      expect(findEvent("create", two, "bar")).toBeTruthy();
      expect(build).toBe(true);
    }
  );

  tmpdirTest(
    "should emit events from nested directories",
    async ({ tmpdir }) => {
      const foo = await mkdir(tmpdir, "foo");
      const bar = await mkdir(tmpdir, "bar");

      const watcher = await createWatcher(
        emitter,
        [],
        [tmpdir],
        syncFn,
        buildFn
      );
      await fs.writeFile(path.join(foo, "baz"), "baz");
      await fs.writeFile(path.join(bar, "qux"), "qux");

      await vi.waitUntil(
        () => findEvent("create", foo, "baz") && findEvent("create", bar, "qux")
      );

      await watcher.unsubscribe();

      expect(findEvent("create", foo, "baz")).toBeTruthy();
      expect(findEvent("create", bar, "qux")).toBeTruthy();
      expect(build).toBe(true);
    }
  );

  tmpdirTest(
    "should file change event to event emitter",
    async ({ tmpdir }) => {
      const localEvents: Array<string> = [];
      emitter.on("watcher:file-changed", ({ modification, filePath }) =>
        localEvents.push(`${modification}:${filePath}`)
      );

      const watcher = await createWatcher(
        emitter,
        [],
        [tmpdir],
        syncFn,
        buildFn
      );
      await fs.writeFile(path.join(tmpdir, "foo"), "foo");

      await vi.waitUntil(() => findEvent("create", tmpdir, "foo", localEvents));

      await watcher.unsubscribe();

      expect(findEvent("create", tmpdir, "foo", localEvents)).toBeTruthy();
    }
  );

  tmpdirTest("should emit an error, if subscribe fails", async ({ tmpdir }) => {
    params.subscribeError = new Error("subscribe error");

    const localEvents: Array<string> = [];
    emitter.on("watcher:subscribe-error", ({ paths, error }) => {
      localEvents.push(`${error.message}:${paths.join(",")}`);
    });

    await createWatcher(emitter, [], [tmpdir], syncFn, buildFn);

    await vi.waitUntil(() => localEvents.length > 0);

    expect(localEvents[0]).toBe(`subscribe error:${tmpdir}`);
  });

  tmpdirTest(
    "should emit config change event to event emitter",
    async ({ tmpdir }) => {
      const localEvents: Array<string> = [];
      emitter.on("watcher:config-changed", ({ modification, filePath }) =>
        localEvents.push(`${modification}:${filePath}`)
      );

      const config = path.join(tmpdir, "config.ts");

      const watcher = await createWatcher(
        emitter,
        [config],
        [],
        syncFn,
        buildFn
      );
      await fs.writeFile(config, "foo");
      await vi.waitUntil(() => findEvent("create", tmpdir, "config.ts", localEvents));
      await watcher.unsubscribe();

      expect(findEvent("create", tmpdir, "config.ts", localEvents)).toBeTruthy();
    }
  );

  tmpdirTest(
    "should build after config change",
    async ({ tmpdir }) => {
      const localEvents: Array<string> = [];
      emitter.on("watcher:config-changed", ({ modification, filePath }) =>
        localEvents.push(`${modification}:${filePath}`)
      );

      const config = path.join(tmpdir, "config.ts");

      const watcher = await createWatcher(
        emitter,
        [config],
        [],
        syncFn,
        buildFn
      );
      await fs.writeFile(config, "foo");
      await vi.waitUntil(() => findEvent("create", tmpdir, "config.ts", localEvents));
      await watcher.unsubscribe();

      expect(build).toBe(true);
    }
  );
});
