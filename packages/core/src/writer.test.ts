import { describe, expect, vitest } from "vitest";
import { createDataFile, createWriter } from "./writer";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { tmpdirTest } from "./__tests__/tmpdir";
import { extension } from "./serializer";

describe("writer", () => {
  async function readDataFile(directory: string, fileName: string) {
    const filePath = path.join(directory, `${fileName}.${extension}`);
    const dataFile = await import(filePath + `?x=${Date.now()}`);
    return dataFile.default;
  }

  tmpdirTest("should write data files", async ({ tmpdir }) => {
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

    const writer = await createWriter(tmpdir);
    await writer.createDataFiles(collections);

    const allTests = await readDataFile(tmpdir, "allTests");
    expect(allTests).toEqual(["one", "two", "three"]);

    const allSamples = await readDataFile(tmpdir, "allSamples");
    expect(allSamples).toEqual(["four", "five", "six"]);
  });

  function writeDataFile(directory: string, name: string, documents: Array<unknown>) {
    return createDataFile(directory, {
      name,
      documents: documents.map((document) => ({ document })),
    });
  }

  tmpdirTest("should write javascript file", async ({ tmpdir }) => {
    await writeDataFile(tmpdir, "tests", ["one", "two", "three"]);
    await writeDataFile(tmpdir, "samples", ["four", "five", "six"]);

    const collections = [
      {
        name: "test",
      },
      {
        name: "sample",
      },
    ];

    const writer = await createWriter(tmpdir);
    await writer.createJavaScriptFile({ collections });

    // @ts-ignore the file is generated before
    const indexJs = await import(path.join(tmpdir, "index.js"));

    expect(indexJs.allTests).toEqual(["one", "two", "three"]);
    expect(indexJs.allSamples).toEqual(["four", "five", "six"]);
  });

  tmpdirTest("should write type definition file", async ({ tmpdir }) => {
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

    const writer = await createWriter(tmpdir);
    await writer.createTypeDefinitionFile({
      collections,
      path: path.join(tmpdir, "config.ts"),
      generateTypes: true,
    });

    const content = await fs.readFile(path.join(tmpdir, "index.d.ts"), "utf-8");
    expect(content).toContain("export type Test =");
    expect(content).toContain("export type Sample =");
  });

  tmpdirTest("should not write type definition file", async ({ tmpdir }) => {
    const collections = [
      {
        name: "test",
        typeName: "Test",
      },
    ];

    const writer = await createWriter(tmpdir);
    await writer.createTypeDefinitionFile({
      collections,
      path: path.join(tmpdir, "config.ts"),
      generateTypes: false,
    });

    expect(existsSync(path.join(tmpdir, "index.d.ts"))).toBe(false);
  });

  describe("os specific", () => {
    tmpdirTest(
      "should write import with / instead of \\ on windows",
      async ({ tmpdir }) => {
        vitest.mock("node:path", async (importOriginal) => {
          const origin = await importOriginal<typeof import("node:path")>();
          return {
            default: {
              ...origin,
              sep: origin.win32.sep,
              relative: origin.win32.relative,
            },
          };
        });

        const collections = [
          {
            name: "test",
            typeName: "Test",
          },
        ];

        const writer = await createWriter(tmpdir);
        await writer.createTypeDefinitionFile({
          collections,
          path: path.join(tmpdir, "sub", "config.ts"),
          generateTypes: true,
        });

        const content = await fs.readFile(
          path.join(tmpdir, "index.d.ts"),
          "utf-8"
        );
        expect(content).toContain(
          'import configuration from "./sub/config.ts";'
        );
      }
    );

    tmpdirTest(
      "should write import with / on posix based systems",
      async ({ tmpdir }) => {
        vitest.mock("node:path", async (importOriginal) => {
          const origin = await importOriginal<typeof import("node:path")>();
          return {
            default: {
              ...origin,
              sep: origin.posix.sep,
              relative: origin.posix.relative,
            },
          };
        });

        const collections = [
          {
            name: "test",
            typeName: "Test",
          },
        ];

        const writer = await createWriter(tmpdir);
        await writer.createTypeDefinitionFile({
          collections,
          path: path.join(tmpdir, "sub", "config.ts"),
          generateTypes: true,
        });

        const content = await fs.readFile(
          path.join(tmpdir, "index.d.ts"),
          "utf-8"
        );
        expect(content).toContain(
          'import configuration from "./sub/config.ts";'
        );
      }
    );
  });
});
