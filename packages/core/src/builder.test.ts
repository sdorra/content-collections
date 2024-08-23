import { describe, it, expect, beforeEach, afterEach, vi, Mock } from "vitest";
import path from "node:path";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { createEmitter, Events, type Emitter } from "./events";
import { tmpdirTest } from "./__tests__/tmpdir";
import * as build from "./build";
import * as watcher from "./watcher";
import {
  ConfigurationReloadError,
  createBuilder as origCreateBuilder,
} from "./builder";
import exp from "node:constants";

vi.mock("./build", async (importOriginal) => {
  const orig = await importOriginal<typeof build>();
  return {
    ...orig,
    build: vi.fn(),
  };
});

vi.mock("./watcher", async (importOriginal) => {
  const orig = await importOriginal<typeof watcher>();
  const unsubscribe = vi.fn();
  return {
    ...orig,
    unsubscribe,
    createWatcher: vi.fn(() => ({
      unsubscribe,
    })),
  };
});

const baseDirectory = path.join(__dirname, "__tests__");

let emitter: Emitter = createEmitter();

beforeEach(() => {
  emitter = createEmitter();
});

afterEach(() => {
  vi.clearAllMocks();
});

function doCreateBuilder(tmpdir: string, configName: string) {
  const configuration = path.join(baseDirectory, configName);

  // TODO: rename back to createBuilder
  return origCreateBuilder(
    configuration,
    {
      configName: "default-config.mjs",
      outputDir: tmpdir,
    },
    emitter
  );
}

describe("build", () => {
  it("should create builder with the defaults", async () => {
    const now = Date.now();

    const events: Array<Events["builder:created"]> = [];

    emitter.on("builder:created", (event) => {
      events.push(event);
    });

    const configuration = path.join(baseDirectory, "config.002.ts");

    // TODO: rename back to createBuilder
    await origCreateBuilder(configuration, undefined, emitter);

    expect(events.length).toBe(1);

    const event = events[0];
    if (!event) {
      throw new Error("Event is undefined");
    }

    expect(event.createdAt).toBeGreaterThanOrEqual(now);
    expect(event.configurationPath).toBe(configuration);
    expect(event.outputDirectory).toBe(
      path.join(baseDirectory, ".content-collections", "generated")
    );
  });

  tmpdirTest("should delegate builder.build to ./build", async ({ tmpdir }) => {
    // TODO: rename back to createBuilder
    const builder = await origCreateBuilder(
      path.join(baseDirectory, "config.002.ts"),
      {
        configName: "default-config.mjs",
        outputDir: tmpdir,
      },
      emitter
    );

    await builder.build();

    expect(build.build).toBeCalled();
  });
});

describe("sync", () => {
  tmpdirTest("should rebuild on file change", async ({ tmpdir }) => {
    const builder = await doCreateBuilder(tmpdir, "config.002.ts");

    await builder.build();
    expect(build.build).toBeCalledTimes(1);

    const synced = await builder.sync(
      "create",
      path.join(baseDirectory, "sources", "posts", "first.md")
    );
    expect(synced).toBe(true);

    expect(build.build).toBeCalledTimes(2);
  });

  tmpdirTest("should rebuild on file deletion", async ({ tmpdir }) => {
    const builder = await doCreateBuilder(tmpdir, "config.002.ts");

    await builder.build();
    expect(build.build).toBeCalledTimes(1);

    const synced = await builder.sync(
      "delete",
      path.join(baseDirectory, "sources", "posts", "first.md")
    );
    expect(synced).toBe(true);

    expect(build.build).toBeCalledTimes(2);
  });

  tmpdirTest("should emit watcher:file-changed event", async ({ tmpdir }) => {
    const builder = await doCreateBuilder(tmpdir, "config.002.ts");

    const events: Array<Events["watcher:file-changed"]> = [];
    emitter.on("watcher:file-changed", (event) => {
      events.push(event);
    });

    await builder.build();

    const filePath = path.join(baseDirectory, "sources", "posts", "first.md");
    await builder.sync("create", filePath);

    expect(events.length).toBe(1);

    const [event] = events;
    if (!event) {
      throw new Error("Event is undefined");
    }

    expect(event.filePath).toBe(filePath);
    expect(event.modification).toBe("create");
  });

  tmpdirTest("should not rebuild on unknown file", async ({ tmpdir }) => {
    const builder = await doCreateBuilder(tmpdir, "config.002.ts");

    await builder.build();
    expect(build.build).toBeCalledTimes(1);

    const synced = await builder.sync("create", "unknown.md");
    expect(synced).toBe(false);

    expect(build.build).toBeCalledTimes(1);
  });

  tmpdirTest(
    "should not emit watcher:file-changed event on unknown file",
    async ({ tmpdir }) => {
      const builder = await doCreateBuilder(tmpdir, "config.002.ts");

      const events: Array<Events["watcher:file-changed"]> = [];
      emitter.on("watcher:file-changed", (event) => {
        events.push(event);
      });

      await builder.build();

      await builder.sync("create", "unknown.md");

      expect(events.length).toBe(0);
    }
  );

  tmpdirTest("should rebuild on file creation", async ({ tmpdir }) => {
    const sourceConfigurationPath = path.join(baseDirectory, "config.002.ts");
    const targetConfigurationPath = path.join(tmpdir, "config.002.ts");

    await fs.copyFile(sourceConfigurationPath, targetConfigurationPath);

    const targetDir = path.join(tmpdir, "sources", "posts");
    await fs.mkdir(targetDir, { recursive: true });

    await fs.copyFile(
      path.join(baseDirectory, "sources", "posts", "first.md"),
      path.join(targetDir, "second.md")
    );

    const builder = await origCreateBuilder(
      targetConfigurationPath,
      {
        configName: "default-config.mjs",
        outputDir: tmpdir,
      },
      emitter
    );

    await builder.build();
    expect(build.build).toBeCalledTimes(1);

    const synced = await builder.sync(
      "create",
      path.join(targetDir, "second.md")
    );
    expect(synced).toBe(true);

    expect(build.build).toBeCalledTimes(2);
  });

  tmpdirTest(
    "should build on file change without prior build",
    async ({ tmpdir }) => {
      const builder = await doCreateBuilder(tmpdir, "config.002.ts");

      const synced = await builder.sync(
        "create",
        path.join(baseDirectory, "sources", "posts", "first.md")
      );
      expect(synced).toBe(true);

      expect(build.build).toBeCalledTimes(1);
    }
  );

  tmpdirTest("should build on configuration change", async ({ tmpdir }) => {
    const builder = await doCreateBuilder(tmpdir, "config.002.ts");

    const synced = await builder.sync(
      "update",
      path.join(baseDirectory, "config.002.ts")
    );
    expect(synced).toBe(true);

    expect(build.build).toBeCalledTimes(1);
  });

  tmpdirTest("should emit watcher:config-changed event", async ({ tmpdir }) => {
    const builder = await doCreateBuilder(tmpdir, "config.002.ts");

    const configurationPath = path.join(baseDirectory, "config.002.ts");

    const events: Array<Events["watcher:config-changed"]> = [];
    emitter.on("watcher:config-changed", (event) => {
      events.push(event);
    });

    await builder.build();

    await builder.sync("update", configurationPath);

    expect(events.length).toBe(1);

    const [event] = events;
    if (!event) {
      throw new Error("Event is undefined");
    }

    expect(event.filePath).toBe(configurationPath);
    expect(event.modification).toBe("update");
  });

  tmpdirTest("should emit watcher:config-error event", async ({ tmpdir }) => {
    const sourceConfigurationPath = path.join(baseDirectory, "config.002.ts");
    const targetConfigurationPath = path.join(tmpdir, "config.002.ts");

    await fs.copyFile(sourceConfigurationPath, targetConfigurationPath);

    const builder = await origCreateBuilder(
      targetConfigurationPath,
      {
        configName: "default-config.mjs",
        outputDir: tmpdir,
      },
      emitter
    );

    const events: Array<Events["watcher:config-reload-error"]> = [];
    emitter.on("watcher:config-reload-error", (event) => {
      events.push(event);
    });

    await fs.writeFile(targetConfigurationPath, "invalid configuration");

    const synced = await builder.sync("update", targetConfigurationPath);
    expect(synced).toBe(false);
    expect(events.length).toBe(1);

    const [event] = events;
    if (!event) {
      throw new Error("Event is undefined");
    }

    expect(event.configurationPath).toBe(targetConfigurationPath);
    expect(event.error).toBeInstanceOf(ConfigurationReloadError);
  });

  tmpdirTest(
    "should reconnect watcher after configuration change",
    async ({ tmpdir }) => {
      const builder = await doCreateBuilder(tmpdir, "config.002.ts");

      await builder.watch();
      expect(watcher.createWatcher).toBeCalledTimes(1);

      await builder.sync("update", path.join(baseDirectory, "config.002.ts"));

      expect(watcher.createWatcher).toBeCalledTimes(2);
    }
  );
});

describe("watch", () => {
  tmpdirTest("should delegate to watcher", async ({ tmpdir }) => {
    const builder = await doCreateBuilder(tmpdir, "config.002.ts");

    await builder.watch();

    expect(watcher.createWatcher).toBeCalled();
  });

  tmpdirTest("should delegate unsubscribe to wrapped watcher", async ({ tmpdir }) => {
    const builder = await doCreateBuilder(tmpdir, "config.002.ts");

    const w = await builder.watch();

    await w.unsubscribe();

    // @ts-expect-error unsubscribe is only available in the mock
    expect(watcher.unsubscribe).toBeCalledTimes(1);
  });
});
