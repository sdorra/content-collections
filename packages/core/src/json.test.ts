import { describe, it, expect } from "vitest";
import { jsonObjectScheme } from "./json";

describe("json", () => {
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

    const result = jsonObjectScheme.safeParse(json);
    expect(result.success).toBe(true);
  });

  it("should allow undefined values", () => {
    const json = {
      a: undefined,
    };

    const result = jsonObjectScheme.safeParse(json);
    expect(result.success).toBe(true);
  });

  it("should fail if object contains a date object", () => {
    const json = {
      a: new Date(),
    };

    const result = jsonObjectScheme.safeParse(json);
    expect(result.success).toBe(false);
  });

  it("should fail if object contains a function", () => {
    const json = {
      a: () => {},
    };

    const result = jsonObjectScheme.safeParse(json);
    expect(result.success).toBe(false);
  });
});
