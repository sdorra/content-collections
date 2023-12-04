import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { defineCollection, defineConfig } from ".";
import { z } from "zod";
import path from "path";
import { createRunner } from "./run";
import fs from "fs";
import exp from "constants";

describe("run", () => {
  let counter = 0;
  let genDirectory = `generated`;

  beforeEach(() => {
    genDirectory = `generated-${counter++}`;
  });

  afterAll(() => {
    const directory = path.join(
      __dirname,
      "__tests__",
      "sources",
      "test",
      ".mdx-collections"
    );
    // fs.rmdirSync(directory, { recursive: true });
  });

  async function run(configuration: any, directory: string) {
    const runner = await createRunner(configuration, directory);
    await runner.run();
  }

  it("should run", async () => {
    const directory = path.join(__dirname, "__tests__", "sources", "test");

    const config = defineConfig({
      collections: [
        defineCollection({
          name: "test",
          schema: z.object({
            name: z.string(),
          }),
          directory,
          include: "**/*.md",
        }),
      ],
    });

    const generated = path.join(directory, ".mdx-collections", genDirectory);

    const inernalConfig = {
      collections: config.collections,
      path: __filename,
    };

    await run(inernalConfig, generated);

    const collections = await import(path.join(generated, "index.js"));
    expect(collections.allTests.length).toBe(2);
    expect(collections.allTests[0].name).toBe("One");
    expect(collections.allTests[1].name).toBe("Two");
  });

  it("should create type definitions", async () => {
    const directory = path.join(__dirname, "__tests__", "sources", "test");

    const config = defineConfig({
      collections: [
        defineCollection({
          name: "test",
          schema: z.object({
            name: z.string(),
          }),
          directory,
          include: "**/*.md",
        }),
      ],
      generateTypes: true,
    });

    const generated = path.join(directory, ".mdx-collections", genDirectory);

    const inernalConfig = {
      ...config,
      path: __filename,
    };

    await run(inernalConfig, generated);

    const types = path.join(generated, "index.d.ts");



    const stat = fs.statSync(types);
    expect(stat.isFile()).toBe(true);
    expect(stat.size).toBeGreaterThan(0);
  });

  it("should call onSuccess", async () => {
    const directory = path.join(__dirname, "__tests__", "sources", "test");

    let names: Array<string> = [];

    const posts = defineCollection({
      name: "sample",
      schema: z.object({
        name: z.string(),
      }),
      directory,
      include: "**/*.md",
      onSuccess: (documents) => {
        names = documents.map((d) => d.name);
      },
    });

    const config = defineConfig({
      collections: [posts],
    });

    const generated = path.join(directory, ".mdx-collections", genDirectory);

    const inernalConfig = {
      collections: config.collections,
      path: __filename,
    };

    await run(inernalConfig, generated);

    expect(names).toEqual(["One", "Two"]);
  });

  it("should call onSuccess with transform function", async () => {
    const directory = path.join(__dirname, "__tests__", "sources", "test");

    let names: Array<string> = [];

    const posts = defineCollection({
      name: "sample",
      schema: z.object({
        name: z.string(),
      }),
      directory,
      include: "**/*.md",
      transform: async (_, document) => {
        return {
          ...document,
          upper: document.name.toUpperCase(),
        };
      },
      onSuccess: async (documents) => {
        names = documents.map((d) => d.upper);
      },
    });

    const config = defineConfig({
      collections: [posts],
    });

    const generated = path.join(directory, ".mdx-collections", genDirectory);

    const inernalConfig = {
      collections: config.collections,
      path: __filename,
    };

    await run(inernalConfig, generated);

    expect(names).toEqual(["ONE", "TWO"]);
  });

  it("should sync", async () => {
    const directory = path.join(__dirname, "__tests__", "sources", "test");

    const config = defineConfig({
      collections: [
        defineCollection({
          name: "test",
          schema: z.object({
            name: z.string(),
          }),
          directory,
          include: "**/*.md",
        }),
      ],
    });

    const generated = path.join(directory, ".mdx-collections", genDirectory);

    const inernalConfig = {
      collections: config.collections,
      path: __filename,
    };

    const runner = await createRunner(inernalConfig, generated);
    await runner.run();

    await runner.sync("removed", path.join(directory, "001.md"));

    const collections = await import(path.join(generated, "index.js"));

    expect(collections.allTests.length).toBe(1);
    expect(collections.allTests[0].name).toBe("Two");
  });
});
