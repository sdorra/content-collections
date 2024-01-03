import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Writer, createWriter } from "./writer";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";

describe("writer", () => {
  let writer: Writer;

  beforeEach(async () => {
    if (existsSync("tmp")) {
      await fs.rm("tmp", { recursive: true });
    }
    writer = await createWriter("tmp");
  });

  afterEach(async () => {
    if (existsSync("tmp")) {
      await fs.rm("tmp", { recursive: true });
    }
  });

  async function readJson(path: string) {
    const content = await fs.readFile(path, "utf-8");
    return JSON.parse(content);
  }

  it("should write data files", async () => {
    const collections = [
      {
        name: "test",
        documents: [
          {
            document: "one",
          },
          {
            document: "two",
          },
          {
            document: "three",
          },
        ],
      },
      {
        name: "sample",
        documents: [
          {
            document: "four",
          },
          {
            document: "five",
          },
          {
            document: "six",
          },
        ],
      },
    ];

    await writer.createDataFiles(collections);

    const allTests = await readJson("tmp/allTests.json");
    expect(allTests).toEqual(["one", "two", "three"]);

    const allSamples = await readJson("tmp/allSamples.json");
    expect(allSamples).toEqual(["four", "five", "six"]);
  });

  it("should write javascript file", async () => {
    await fs.writeFile(
      "tmp/allTests.json",
      JSON.stringify(["one", "two", "three"])
    );
    await fs.writeFile(
      "tmp/allSamples.json",
      JSON.stringify(["four", "five", "six"])
    );

    const collections = [
      {
        name: "test",
      },
      {
        name: "sample",
      },
    ];

    await writer.createJavaScriptFile({ collections });

    // @ts-ignore the file is generated before
    const indexJs = await import("./tmp/index.js");

    expect(indexJs.allTests).toEqual(["one", "two", "three"]);
    expect(indexJs.allSamples).toEqual(["four", "five", "six"]);
  });

  it("should write type definition file", async () => {
    const collections = [
      {
        name: "test",
        typeName: "Test",
      },
      {
        name: "sample",
        typeName: "Sample",
      },
    ];

    await writer.createTypeDefinitionFile({
      collections,
      path: "./tmp/config.ts",
      generateTypes: true,
    });

    const content = await fs.readFile("tmp/index.d.ts", "utf-8");
    expect(content).toContain("export type Test =");
    expect(content).toContain("export type Sample =");
  });

  it("should not write type definition file", async () => {
    const collections = [
      {
        name: "test",
        typeName: "Test",
      }
    ];

    await writer.createTypeDefinitionFile({
      collections,
      path: "./tmp/config.ts",
      generateTypes: false,
    });

    expect(existsSync("tmp/index.d.ts")).toBe(false);
  });
});
