import { describe, expect, it } from "vitest";
import { defineCollection, defineConfig } from ".";
import { z } from "zod";
import path from "path";
import { createRunner } from "./run";

describe("run", () => {

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
          sources: [path.join(directory, "**/*.md")],
        }),
      ],
    });

    const generated = path.join(directory, ".mdx-collections", "generated");

    const inernalConfig = {
      collections: config.collections,
      path: __filename,
    };

    await run(inernalConfig, generated);

    const collections = await import(path.join(generated, "index.js"));
    // TODO should by plural
    expect(collections.allTests.length).toBe(2);
    expect(collections.allTests[0].name).toBe("One");
    expect(collections.allTests[1].name).toBe("Two");
  });

  it("should call onSuccess", async () => {
    const directory = path.join(__dirname, "__tests__", "sources", "test");

    let names: Array<string> = [];

    const posts = defineCollection({
      name: "sample",
      schema: z.object({
        name: z.string(),
      }),
      sources: [path.join(directory, "**/*.md")],
      onSuccess: (documents) => {
        names = documents.map((d) => d.name);
      }
    });

    const config = defineConfig({
      collections: [posts],
    });

    const generated = path.join(directory, ".mdx-collections", "generated");

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
      sources: [path.join(directory, "**/*.md")],
      transform: async (_, document) => {
        return {
          ...document,
          upper: document.name.toUpperCase(),
        };
      },
      onSuccess: async (documents) => {
        names = documents.map((d) => d.upper);
      }
    });

    const config = defineConfig({
      collections: [posts],
    });

    const generated = path.join(directory, ".mdx-collections", "generated");

    const inernalConfig = {
      collections: config.collections,
      path: __filename,
    };

    await run(inernalConfig, generated);

    expect(names).toEqual(["ONE", "TWO"]);
  });
});
