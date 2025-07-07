import chokidar from "chokidar";
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

// Instead of fully mocking chokidar, let's intercept specific behavior for error testing
const originalWatch = chokidar.watch;
vi.spyOn(chokidar, 'watch').mockImplementation((paths, options) => {
  const watcher = originalWatch(paths, options);

  if (params.subscribeError) {
    // Simulate error
    setTimeout(() => {
      watcher.emit('error', params.subscribeError);
    }, 10);
  }

  return watcher;
});

const WAIT_UNTIL_TIMEOUT = 2000;

describe(
  "watcher",
  {
    // the watcher tests are flaky on windows, so we retry them
    retry: 3,
    skip: process.platform === "win32",
  },
  () => {
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

    await vi.waitUntil(() => findEvent("create", tmpdir, "foo"), WAIT_UNTIL_TIMEOUT);

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
    await vi.waitUntil(() => findEvent("create", tmpdir, "foo"), WAIT_UNTIL_TIMEOUT);

    await fs.writeFile(path.join(tmpdir, "foo"), "bar", "utf-8");
    await vi.waitUntil(() => findEvent("update", tmpdir, "foo"), WAIT_UNTIL_TIMEOUT);

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

    await vi.waitUntil(() => findEvent("delete", tmpdir, "foo"), WAIT_UNTIL_TIMEOUT);

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
        WAIT_UNTIL_TIMEOUT
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
        WAIT_UNTIL_TIMEOUT
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

    await vi.waitUntil(() => localEvents.length > 0, WAIT_UNTIL_TIMEOUT);

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

    await vi.waitUntil(() => findEvent("create", tmpdir, "baz"), WAIT_UNTIL_TIMEOUT);

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

    await vi.waitUntil(() => localEvents.length > 0, WAIT_UNTIL_TIMEOUT);
    expect(localEvents[0]).toBe(`unsubscribed:${tmpdir}`);
  });

  tmpdirTest("should ignore events from node_modules directory", async ({ tmpdir }) => {
    await createWatcher(
      emitter,
      tmpdir,
      {
        inputPaths: [],
        collections: [{ directory: "." }],
      },
      syncFn,
    );

    const nodeModulesDir = await mkdir(tmpdir, "node_modules");
    await fs.writeFile(path.join(nodeModulesDir, "foo.js"), "console.log('foo')");

    // Wait to ensure no event is triggered
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(findEvent("create", nodeModulesDir, "foo.js")).toBeFalsy();
  });

  tmpdirTest("should ignore events from .git directory", async ({ tmpdir }) => {
    await createWatcher(
      emitter,
      tmpdir,
      {
        inputPaths: [],
        collections: [{ directory: "." }],
      },
      syncFn,
    );

    const gitDir = await mkdir(tmpdir, ".git");
    await fs.writeFile(path.join(gitDir, "foo"), "bar");

    // Wait to ensure no event is triggered
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(findEvent("create", gitDir, "foo")).toBeFalsy();
  });

  tmpdirTest("should ignore events from .next directory", async ({ tmpdir }) => {
    await createWatcher(
      emitter,
      tmpdir,
      {
        inputPaths: [],
        collections: [{ directory: "." }],
      },
      syncFn,
    );

    const nextDir = await mkdir(tmpdir, ".next");
    await fs.writeFile(path.join(nextDir, "foo.js"), "console.log('foo')");

    // Wait to ensure no event is triggered
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(findEvent("create", nextDir, "foo.js")).toBeFalsy();
  });
});
