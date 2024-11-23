import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { tmpdirTest } from "./__tests__/tmpdir";
import { createDefaultImport, createNamedImport } from "./import";
import { extension, serializableSchema, serialize } from "./serializer";

describe("serializer", () => {
  it("should pass valid json", () => {
    const json = {
      a: 1,
      b: "string",
      c: true,
      d: null,
      e: {
        f: "nested",
      },
      g: [1, 2, 3],
    };

    const result = serializableSchema.safeParse(json);
    expect(result.success).toBe(true);
  });

  it("should allow undefined values", () => {
    const json = {
      a: undefined,
    };

    const result = serializableSchema.safeParse(json);
    expect(result.success).toBe(true);
  });

  it("should allow date values", () => {
    const json = {
      a: new Date(),
    };

    const result = serializableSchema.safeParse(json);
    expect(result.success).toBe(true);
  });

  it("should allow map values", () => {
    const map = new Map<string, string>();
    map.set("a", "b");

    const json = {
      a: map,
    };

    const result = serializableSchema.safeParse(json);
    expect(result.success).toBe(true);
  });

  it("should allow set values", () => {
    const set = new Set<string>();
    set.add("a");

    const json = {
      a: set,
    };

    const result = serializableSchema.safeParse(json);
    expect(result.success).toBe(true);
  });

  it("should allow bigint values", () => {
    const json = {
      a: BigInt(1),
    };

    const result = serializableSchema.safeParse(json);
    expect(result.success).toBe(true);
  });

  it("should fail if object contains a function", () => {
    const json = {
      a: () => {},
    };

    const result = serializableSchema.safeParse(json);
    expect(result.success).toBe(false);
  });

  describe("serialize", () => {
    async function writeAndImport(tmpdir: string, object: unknown) {
      const result = serialize([object]);
      const filePath = path.join(tmpdir, `test.${extension}`);
      await fs.writeFile(tmpdir + `/test.${extension}`, result);

      const imported = await import(filePath + `?x=${Date.now()}`);
      return imported.default;
    }

    tmpdirTest("should serialize a simple object", async ({ tmpdir }) => {
      const object = {
        firstName: "Tricia",
        lastName: "McMillan",
      };

      const imported = await writeAndImport(tmpdir, object);
      expect(imported).toEqual([object]);
    });

    tmpdirTest("should serialize an object with a date", async ({ tmpdir }) => {
      const object = {
        date: new Date("2021-01-01"),
      };

      const imported = await writeAndImport(tmpdir, object);
      expect(imported).toEqual([object]);
      expect(imported[0].date).toBeInstanceOf(Date);
    });

    tmpdirTest("should serialize an object with a map", async ({ tmpdir }) => {
      const map = new Map<string, string>();
      map.set("a", "b");

      const object = {
        map,
      };

      const imported = await writeAndImport(tmpdir, object);
      expect(imported).toEqual([object]);
      expect(imported[0].map).toBeInstanceOf(Map);
    });

    tmpdirTest("should serialize an object with a set", async ({ tmpdir }) => {
      const set = new Set<string>();
      set.add("a");

      const object = {
        set,
      };

      const imported = await writeAndImport(tmpdir, object);
      expect(imported).toEqual([object]);
      expect(imported[0].set).toBeInstanceOf(Set);
    });

    tmpdirTest(
      "should serialize an object with a bigint",
      async ({ tmpdir }) => {
        const object = {
          bigint: BigInt(1),
        };

        const imported = await writeAndImport(tmpdir, object);
        expect(imported).toEqual([object]);
        expect(imported[0].bigint).toBeTypeOf("bigint");
      },
    );

    tmpdirTest(
      "should serialize an object with an import",
      async ({ tmpdir }) => {
        const object = {
          name: "sample",
          fso: createDefaultImport("node:fs/promises"),
        };

        const imported = await writeAndImport(tmpdir, object);
        expect(imported).toEqual([{ name: "sample", fso: fs }]);
      },
    );

    tmpdirTest(
      "should serialize an object with an a nested import",
      async ({ tmpdir }) => {
        const object = {
          name: "sample",
          imports: {
            fso: createDefaultImport("node:fs/promises"),
          },
        };

        const [imported] = await writeAndImport(tmpdir, object);
        expect(imported.imports.fso).toEqual(fs);
      },
    );

    tmpdirTest(
      "should serialize an object with multiple imports",
      async ({ tmpdir }) => {
        const object = {
          name: "sample",
          imports: {
            fs: createDefaultImport("node:fs/promises"),
            path: createDefaultImport("node:path"),
          },
        };

        const [imported] = await writeAndImport(tmpdir, object);
        expect(imported.imports.fs).toEqual(fs);
        expect(imported.imports.path).toEqual(path);
      },
    );

    tmpdirTest(
      "should serialize an object with an array of imports",
      async ({ tmpdir }) => {
        const object = {
          name: "sample",
          imports: [
            createDefaultImport("node:fs/promises"),
            createDefaultImport("node:path"),
          ],
        };

        const [imported] = await writeAndImport(tmpdir, object);
        expect(imported.imports[0]).toEqual(fs);
        expect(imported.imports[1]).toEqual(path);
      },
    );

    tmpdirTest(
      "should serialize an object with an name import",
      async ({ tmpdir }) => {
        const object = {
          name: "sample",
          join: createNamedImport("join", "node:path"),
        };

        const [imported] = await writeAndImport(tmpdir, object);
        expect(imported.join).toEqual(path.join);
      },
    );
  });
});
