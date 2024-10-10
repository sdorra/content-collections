import { describe, expect, it } from "vitest";
import { findMigrator } from "./index.js";

describe("findMigrator", () => {
  it("should find next.js migrator", () => {
    const migrator = findMigrator({
      name: "next.js",
      dependencies: {
        next: "14.3.1",
      },
    });
    expect(migrator).not.toBe(null);
  });

  it("should throw error if migrator could not be found", () => {
    expect(() =>
      findMigrator({
        name: "something",
      }),
    ).toThrowError("unsupported package something");
  });
});
