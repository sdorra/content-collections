import { assertType, test } from "vitest";
import type { Serializable } from "./serializer";
import { describe } from "node:test";

describe("Serializable", () => {
  test("should accept objects with arrays", () => {
    const obj = {
      items: [1, 2, 3],
    };

    assertType<Serializable>(obj);
  });

  test("should accept objects with readonly arrays", () => {
    const obj = {
      items: Object.freeze([1, 2, 3]),
    };

    assertType<Serializable>(obj);
  });
});
