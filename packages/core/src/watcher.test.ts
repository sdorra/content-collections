import * as watcherImpl from "@parcel/watcher";
import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, vi } from "vitest";
import { tmpdirTest } from "./__tests__/tmpdir";
import { createEmitter, Events } from "./events";
import { Modification } from "./types";
import { createWatcher as createOrigWatcher, Watcher } from "./watcher";

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
      callback: watcherImpl.SubscribeCallback,
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

  async function syncFn(modification: Modification, path: string) {
    events.push(`${modification}:${path}`);
  }

  function findEvent(
    type: string,
    baseDirectory: string,
    pathName: string,
    eventArray = events,
  ) {
    return eventArray.find(
      (event) =>
        event.startsWith(`${type}:`) &&
        event.endsWith(path.join(baseDirectory, pathName)),
    );
  }

  let emitter = createEmitter<Events>();

  let watcher: Watcher | undefined = undefined;
  async function createWatcher(...args: Parameters<typeof createOrigWatcher>) {
    watcher = await createOrigWatcher(...args);
    return watcher;
  }

  beforeEach(() => {
    emitter = createEmitter<Events>();
    events.length = 0;
    params.subscribeError = undefined;
  });

  afterEach(async () => {
    if (watcher) {
      await watcher.unsubscribe();
    }
  });

  const mkdir = async (baseDirectory: string, pathName: string) => {
    const p = path.join(baseDirectory, pathName);
    await fs.mkdir(p, { recursive: true });

    return p;
  };

  tmpdirTest("should subscribe to directories", async ({ tmpdir }) => {
    const one = await mkdir(tmpdir, "one");
    const two = await mkdir(tmpdir, "two");

    const subscriptions: Array<string> = [];
    emitter.on("watcher:subscribed", ({ paths }) => {
      subscriptions.push(...paths);
    });

    await createWatcher(
      emitter,
      tmpdir,
      {
        inputPaths: [],
        collections: [{ directory: "one" }, { directory: "two" }],
      },
      syncFn,
    );

    expect(subscriptions).toEqual([one, two]);
  });

  tmpdirTest(
    "should not subscribe to child directories",
    async ({ tmpdir }) => {
      await mkdir(tmpdir, "one");

      const subscriptions: Array<string> = [];
      emitter.on("watcher:subscribed", ({ paths }) => {
        subscriptions.push(...paths);
      });

      await createWatcher(
        emitter,
        tmpdir,
        {
          inputPaths: [],
          collections: [{ directory: "." }, { directory: "one" }],
        },
        syncFn,
      );

      expect(subscriptions).toEqual([tmpdir]);
    },
  );

  tmpdirTest(
    "should not subscribe to duplicate directories",
    async ({ tmpdir }) => {
      await mkdir(tmpdir, "one");

      const subscriptions: Array<string> = [];
      emitter.on("watcher:subscribed", ({ paths }) => {
        subscriptions.push(...paths);
      });

      await createWatcher(
        emitter,
        tmpdir,
        {
          inputPaths: [],
          collections: [{ directory: "one" }, { directory: "one" }],
        },
        syncFn,
      );

      expect(subscriptions).toEqual([path.join(tmpdir, "one")]);
    },
  );

  tmpdirTest(
    "should subscribe to configuration directory",
    async ({ tmpdir }) => {
      const configDir = await mkdir(tmpdir, "config");
      const configFile = path.join(configDir, "config.ts");

      const subscriptions: Array<string> = [];
      emitter.on("watcher:subscribed", ({ paths }) => {
        subscriptions.push(...paths);
      });

      await createWatcher(
        emitter,
        tmpdir,
        {
          inputPaths: [configFile],
          collections: [],
        },
        syncFn,
      );

      expect(subscriptions).toEqual([configDir]);
    },
  );

  tmpdirTest(
    "should subscribe to configuration and collection directories",
    async ({ tmpdir }) => {
      const configDir = await mkdir(tmpdir, "config");
      const configFile = path.join(configDir, "config.ts");
      const one = await mkdir(tmpdir, "one");

      const subscriptions: Array<string> = [];
      emitter.on("watcher:subscribed", ({ paths }) => {
        subscriptions.push(...paths);
      });

      await createWatcher(
        emitter,
        tmpdir,
        {
          inputPaths: [configFile],
          collections: [{ directory: "one" }],
        },
        syncFn,
      );

      expect(subscriptions).toEqual([one, configDir]);
    },
  );

  tmpdirTest("should subscribe to parent directories", async ({ tmpdir }) => {
    const configFile = path.join(tmpdir, "config.ts");
    await mkdir(tmpdir, "one");

    const subscriptions: Array<string> = [];
    emitter.on("watcher:subscribed", ({ paths }) => {
      subscriptions.push(...paths);
    });

    await createWatcher(
      emitter,
      tmpdir,
      {
        inputPaths: [configFile],
        collections: [{ directory: "one" }],
      },
      syncFn,
    );

    expect(subscriptions).toEqual([tmpdir]);
  });

  tmpdirTest("should sync create event", async ({ tmpdir }) => {
    await createWatcher(
      emitter,
      tmpdir,
      {
        inputPaths: [],
        collections: [{ directory: "." }],
      },
      syncFn,
    );

    await fs.writeFile(path.join(tmpdir, "foo"), "foo");

    await vi.waitUntil(() => findEvent("create", tmpdir, "foo"));

    expect(findEvent("create", tmpdir, "foo")).toBeTruthy();
  });

  tmpdirTest("should sync update event", async ({ tmpdir }) => {
    await createWatcher(
      emitter,
      tmpdir,
      {
        inputPaths: [],
        collections: [{ directory: "." }],
      },
      syncFn,
    );

    await fs.writeFile(path.join(tmpdir, "foo"), "foo", "utf-8");
    await vi.waitUntil(() => findEvent("create", tmpdir, "foo"), 2000);

    await fs.writeFile(path.join(tmpdir, "foo"), "bar", "utf-8");
    await vi.waitUntil(() => findEvent("update", tmpdir, "foo"), 2000);

    expect(findEvent("update", tmpdir, "foo")).toBeTruthy();
  });

  tmpdirTest("should sync delete event", async ({ tmpdir }) => {
    await fs.writeFile(path.join(tmpdir, "foo"), "foo");

    await createWatcher(
      emitter,
      tmpdir,
      {
        inputPaths: [],
        collections: [{ directory: "." }],
      },
      syncFn,
    );

    await fs.rm(path.join(tmpdir, "foo"));

    await vi.waitUntil(() => findEvent("delete", tmpdir, "foo"));

    expect(findEvent("delete", tmpdir, "foo")).toBeTruthy();
  });

  tmpdirTest(
    "should sync events from multiple directories",
    async ({ tmpdir }) => {
      const one = await mkdir(tmpdir, "one");
      const two = await mkdir(tmpdir, "two");

      await createWatcher(
        emitter,
        tmpdir,
        {
          inputPaths: [],
          collections: [{ directory: "one" }, { directory: "two" }],
        },
        syncFn,
      );

      await fs.writeFile(path.join(one, "foo"), "foo");
      await fs.writeFile(path.join(two, "bar"), "bar");

      await vi.waitUntil(
        () =>
          findEvent("create", one, "foo") && findEvent("create", two, "bar"),
      );

      expect(findEvent("create", one, "foo")).toBeTruthy();
      expect(findEvent("create", two, "bar")).toBeTruthy();
    },
  );

  tmpdirTest(
    "should emit events from nested directories",
    async ({ tmpdir }) => {
      const foo = await mkdir(tmpdir, "foo");
      const bar = await mkdir(tmpdir, "bar");

      await createWatcher(
        emitter,
        tmpdir,
        {
          inputPaths: [],
          collections: [{ directory: "." }],
        },
        syncFn,
      );

      await fs.writeFile(path.join(foo, "baz"), "baz");
      await fs.writeFile(path.join(bar, "qux"), "qux");

      await vi.waitUntil(
        () =>
          findEvent("create", foo, "baz") && findEvent("create", bar, "qux"),
      );

      expect(findEvent("create", foo, "baz")).toBeTruthy();
      expect(findEvent("create", bar, "qux")).toBeTruthy();
    },
  );

  tmpdirTest("should emit an error, if subscribe fails", async ({ tmpdir }) => {
    params.subscribeError = new Error("subscribe error");

    const localEvents: Array<string> = [];
    emitter.on("watcher:subscribe-error", ({ paths, error }) => {
      localEvents.push(`${error.message}:${paths.join(",")}`);
    });

    await createWatcher(
      emitter,
      tmpdir,
      {
        inputPaths: [],
        collections: [{ directory: "." }],
      },
      syncFn,
    );

    await vi.waitUntil(() => localEvents.length > 0);

    expect(localEvents[0]).toBe(`subscribe error:${tmpdir}`);
  });

  tmpdirTest("should not sync events after unsubscribe", async ({ tmpdir }) => {
    await createWatcher(
      emitter,
      tmpdir,
      {
        inputPaths: [],
        collections: [{ directory: "." }],
      },
      syncFn,
    );

    await watcher?.unsubscribe();

    events.length = 0;

    await fs.writeFile(path.join(tmpdir, "baz"), "baz");
    await fs.writeFile(path.join(tmpdir, "qux"), "qux");

    // TODO: is 500ms enough? is there a better way, instead of waiting?
    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(events).toEqual([]);
  });

  tmpdirTest("should sync events after resubscribe", async ({ tmpdir }) => {
    const config = {
      inputPaths: [],
      collections: [{ directory: "." }],
    };

    await createWatcher(emitter, tmpdir, config, syncFn);
    await watcher?.unsubscribe();
    await createWatcher(emitter, tmpdir, config, syncFn);

    await fs.writeFile(path.join(tmpdir, "baz"), "baz");

    await vi.waitUntil(() => findEvent("create", tmpdir, "baz"));

    expect(findEvent("create", tmpdir, "baz")).toBeTruthy();
  });

  tmpdirTest("should emit unsubscribe event", async ({ tmpdir }) => {
    const localEvents: Array<string> = [];
    emitter.on("watcher:unsubscribed", ({ paths }) => {
      localEvents.push(`unsubscribed:${paths.join(",")}`);
    });

    await createWatcher(
      emitter,
      tmpdir,
      {
        inputPaths: [],
        collections: [{ directory: "." }],
      },
      syncFn,
    );

    await watcher?.unsubscribe();

    await vi.waitUntil(() => localEvents.length > 0);
    expect(localEvents[0]).toBe(`unsubscribed:${tmpdir}`);
  });
});
