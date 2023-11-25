import { describe, expect, it } from "vitest";
import { defineCollection, defineConfig } from ".";
import { z } from "zod";
import path from "path";
import { run } from "./run";

describe("run", () => {
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
});
