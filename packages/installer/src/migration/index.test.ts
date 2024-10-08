import { describe, expect, it, vi } from "vitest";
import { findMigrator, migrate } from "./index.js";

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

describe("migrate", () => {
  it("should execute tasks", async () => {
    const task = {
      name: "test",
      run: () =>
        Promise.resolve({
          status: "changed" as const,
          message: "jo",
        }),
    };
    const spy = vi.spyOn(task, "run");

    await migrate([task]);
    expect(spy).toBeCalled();
  });
});
