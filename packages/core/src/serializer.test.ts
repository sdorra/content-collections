import { describe, it, expect } from "vitest";
import { serializableSchema, serialize, extension } from "./serializer";
import { tmpdirTest } from "./__tests__/tmpdir";
import fs from "node:fs/promises";
import path from "node:path";

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

  it("should fail if object contains a date object", () => {
    const json = {
      a: new Date(),
    };

    const result = serializableSchema.safeParse(json);
    expect(result.success).toBe(false);
  });

  it("should fail if object contains a function", () => {
    const json = {
      a: () => {},
    };

    const result = serializableSchema.safeParse(json);
    expect(result.success).toBe(false);
  });

  tmpdirTest("should serialize a valid object", async ({tmpdir}) => {
    const object = {
      firstName: "Tricia",
      lastName: "McMillan",
    };

    const result = serialize([object]);
    const filePath = path.join(tmpdir, `test.${extension}`);
    await fs.writeFile(tmpdir + `/test.${extension}`, result);

    const imported = await import(filePath + `?x=${Date.now()}`);
    expect(imported.default).toEqual([object]);
  });
});
