import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createBuilder as origCreateBuilder } from "./builder";
import path from "node:path";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";

// we mock the watcher module, because it causes problems in some situations
// we test the watcher module separately
vi.mock("./watcher", async () => {
  return {
    createWatcher: async (paths: Array<string>) => {
      return {
        paths,
        unsubscribe: async () => {},
      };
    },
  };
});

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
      ".mdx-collections",
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
  });

  describe("watch", () => {
    it("should return watcher", async () => {
      const { builder } = await createBuilder("config.002");

      const watcher = await builder.watch();
      expect(watcher).toBeTruthy();
    });

    it("should pass the collection directories to the watcher", async () => {
      const { builder } = await createBuilder("config.002");

      const watcher = await builder.watch();
      // @ts-ignore our mock returns a watcher with a paths property
      expect(watcher.paths).toEqual([
        path.join(__dirname, "__tests__", "sources", "posts"),
      ]);
    })
  });
});
