import {
  describe,
  expect,
  vitest,
} from "vitest";
import { createWriter } from "./writer";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { tmpdirTest } from "./__tests__/tmpdir";

describe("writer", () => {
  async function readJson(directory: string, filePath: string) {
    const content = await fs.readFile(path.join(directory, filePath), "utf-8");
    return JSON.parse(content);
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

    const allTests = await readJson(tmpdir, "allTests.json");
    expect(allTests).toEqual(["one", "two", "three"]);

    const allSamples = await readJson(tmpdir, "allSamples.json");
    expect(allSamples).toEqual(["four", "five", "six"]);
  });

  tmpdirTest("should write javascript file", async ({ tmpdir }) => {
    await fs.writeFile(
      path.join(tmpdir, "allTests.json"),
      JSON.stringify(["one", "two", "three"])
    );
    await fs.writeFile(
      path.join(tmpdir, "allSamples.json"),
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
