import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createBuilder as origCreateBuilder } from "./builder";
import path from "node:path";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { createEmitter, type Emitter } from "./events";

describe("builder", () => {
  afterEach(async () => {
    if (existsSync("tmp")) {
      await fs.rm("tmp", { recursive: true });
    }
  });

  async function createBuilder(name: string) {
    const configPath = path.join(__dirname, "__tests__", name + ".ts");
    const outputDir = path.join(
      __dirname,
      "__tests__",
      ".content-collections",
      "generated-" + name
    );
    const builder = await origCreateBuilder(configPath, {
      configName: name + ".mjs",
      outputDir,
    });
    return {
      builder,
      outputDir,
    };
  }

  it("should create builder with the default output directory", async () => {
    const configPath = path.join(__dirname, "__tests__", "config.002.ts");
    const emitter: Emitter = createEmitter();

    const events: Array<{
      outputDirectory: string;
    }> = [];
    emitter.on("builder:created", (event) => {
      events.push(event);
    });

    await origCreateBuilder(
      configPath,
      {
        configName: "default-config.mjs",
      },
      emitter
    );

    await vi.waitUntil(() => events.length > 0);

    const event = events[0]
    if (!event) {
      throw new Error("Event is undefined");
    }
    expect(event.outputDirectory).toBe(
      path.join(__dirname, "__tests__", ".content-collections", "generated")
    );
  });

  describe("build", () => {
    it("should build", async () => {
      const { builder, outputDir } = await createBuilder("config.002");
      await builder.build();

      const { allPosts } = await import(path.resolve(outputDir, "index.js"));
      expect(allPosts.length).toBe(1);
    });

    it("should call onSuccess", async () => {
      const { builder, outputDir } = await createBuilder("config.004");
      await builder.build();

      const { allPosts, allAuthors } = await import(
        path.resolve(outputDir, "index.js")
      );

      expect(allPosts.length).toBe(1);
      const postsLength = await fs.readFile(
        path.join("tmp", "posts.length"),
        "utf-8"
      );
      expect(postsLength).toBe("1");

      expect(allAuthors.length).toBe(1);
      const authorsLength = await fs.readFile(
        path.join("tmp", "authors.length"),
        "utf-8"
      );
      expect(authorsLength).toBe("1");
    });

    it("should emit build:start and build:end", async () => {
      const { builder } = await createBuilder("config.002");
      const events: Array<string> = [];

      builder.on("builder:start", (event) => {
        events.push("builder:start");
        expect(event.startedAt).toBeDefined();
      });
      builder.on("builder:end", (event) => {
        events.push("builder:end");
        expect(event.startedAt).toBeDefined();
        expect(event.endedAt).toBeDefined();
      });

      await builder.build();

      expect(events).toEqual(["builder:start", "builder:end"]);
    });

    it("should resolve to default output directory", async () => {});
  });

  describe("sync", () => {
    beforeEach(async () => {
      const sourceDir = path.join("tmp", "sources", "posts");
      if (!existsSync(sourceDir)) {
        await fs.mkdir(sourceDir, { recursive: true });
      }

      const configPath = path.join(__dirname, "__tests__", "config.002.ts");
      await fs.copyFile(configPath, path.join("tmp", "config.ts"));
      await fs.copyFile(
        path.join(__dirname, "__tests__", "sources", "posts", "first.md"),
        path.join(sourceDir, "first.md")
      );
    });

    it("should sync new files", async () => {
      const builder = await origCreateBuilder(path.join("tmp", "config.ts"), {
        configName: "sync.new.file.ts",
        cacheDir: path.join("tmp", "cache"),
        outputDir: path.join("tmp", "output-new"),
      });

      await builder.build();

      const newFile = path.join("tmp", "sources", "posts", "second.md");
      await fs.writeFile(newFile, "---\ntitle: Second\n---\nSecond post");

      const synced = await builder.sync("create", newFile);
      expect(synced).toBe(true);

      await builder.build();

      const { allPosts } = await import(
        path.resolve("tmp", "output-new", "index.js")
      );

      expect(allPosts.length).toBe(2);
    });

    it("should sync deleted files", async () => {
      const builder = await origCreateBuilder(path.join("tmp", "config.ts"), {
        configName: "sync.rm.file.ts",
        cacheDir: path.join("tmp", "cache"),
        outputDir: path.join("tmp", "output-rm"),
      });

      await builder.build();

      const rmFile = path.join("tmp", "sources", "posts", "first.md");
      await fs.rm(rmFile);

      const synced = await builder.sync("delete", rmFile);
      expect(synced).toBe(true);

      await builder.build();

      const { allPosts } = await import(
        path.resolve("tmp", "output-rm", "index.js")
      );

      expect(allPosts.length).toBe(0);
    });

    it("should return false on sync without previous build", async () => {
      const builder = await origCreateBuilder(path.join("tmp", "config.ts"), {
        configName: "sync.no.build.ts",
        cacheDir: path.join("tmp", "cache"),
        outputDir: path.join("tmp", "output-no-build"),
      });

      const newFile = path.join("tmp", "sources", "posts", "second.md");
      await fs.writeFile(newFile, "---\ntitle: Second\n---\nSecond post");

      expect(await builder.sync("create", newFile)).toBe(false);
    });
  });

  describe("watch", () => {
    const watcherOptions = vi.hoisted(() => ({
      paths: [] as Array<string>,
      configPaths: [] as Array<string>,
    }));

    // we mock the watcher module, because it causes problems in some situations
    // we test the watcher module separately
    vi.mock("./watcher", async () => {
      return {
        createWatcher: async (
          _: Emitter,
          configPaths: Array<string>,
          paths: Array<string>
        ) => {
          watcherOptions.paths = paths;
          watcherOptions.configPaths = configPaths;
          return {
            unsubscribe: vi.fn(),
          };
        },
      };
    });

    beforeEach(() => {
      watcherOptions.paths = [];
      watcherOptions.configPaths = [];
    });

    it("should return watcher", async () => {
      const { builder } = await createBuilder("config.002");

      const watcher = await builder.watch();
      expect(watcher).toBeTruthy();
    });

    it("should pass the collection directories to the watcher", async () => {
      const { builder } = await createBuilder("config.002");

      await builder.watch();

      expect(watcherOptions.paths).toEqual([
        path.join(__dirname, "__tests__", "sources", "posts"),
      ]);
    });

    it("should pass the configuration paths to the watcher", async () => {
      const { builder } = await createBuilder("config.002");

      const watcher = await builder.watch();
      await watcher.unsubscribe();

      expect(watcherOptions.configPaths).toEqual([
        path.join("src", "__tests__", "config.002.ts"),
      ]);
    });

    it("should recompile the configuration after the configuration has changed", async () => {
      const configPath = path.join(__dirname, "__tests__", "config.002.ts");
      const outputDir = path.join(
        __dirname,
        "__tests__",
        ".content-collections",
        "generated-config-rebuild-on-config-change"
      );

      const emitter = createEmitter();

      const builder = await origCreateBuilder(
        configPath,
        {
          configName: "rebuild-on-change.mjs",
          outputDir,
        },
        emitter
      );

      await builder.build();

      const compiledConfiguration = path.join(
        __dirname,
        "__tests__",
        ".content-collections",
        "cache",
        "rebuild-on-change.mjs"
      );

      const { mtimeMs } = await fs.lstat(compiledConfiguration);

      emitter.emit("watcher:config-changed", {
        filePath: configPath,
        modification: "create",
      });

      await builder.build();

      const { mtimeMs: newMtimeMs } = await fs.lstat(compiledConfiguration);

      expect(newMtimeMs).toBeGreaterThan(mtimeMs);
    });

    it("should reconnect watcher after configuration has changed", async () => {
      const configPath = path.join(__dirname, "__tests__", "config.002.ts");
      const outputDir = path.join(
        __dirname,
        "__tests__",
        ".content-collections",
        "reconnect-watcher-on-config-change"
      );

      const emitter = createEmitter();

      const builder = await origCreateBuilder(
        configPath,
        {
          configName: "reconnect-watcher-on-config-change.mjs",
          outputDir,
        },
        emitter
      );

      await builder.build();
      const watcher = await builder.watch();

      emitter.emit("watcher:config-changed", {
        filePath: configPath,
        modification: "create",
      });

      await builder.build();

      await watcher.unsubscribe();
    });
  });
});
