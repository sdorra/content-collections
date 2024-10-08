import { PackageJson } from "src/packageJson.js";
import { describe, expect, it } from "vitest";
import { migratorNextJS } from "./next.js";

describe("next.js migrator", () => {
  const packageJson: PackageJson = {
    name: "something",
  };

  it("should return tasks without demo content", async () => {
    const migration = await migratorNextJS.createMigration({
      directory: "directory",
      packageJson,
      demoContent: false,
    });

    const names = migration.map((task) => task.name);
    expect(names).toEqual([
      "Install dependencies",
      "Add alias to tsconfig",
      "Modify next configuration",
      "Add .content-collections to .gitignore",
      "Create configuration file",
    ]);
  });

  it("should return tasks with demo content", async () => {
    const migration = await migratorNextJS.createMigration({
      directory: "directory",
      packageJson,
      demoContent: true,
    });

    const names = migration.map((task) => task.name);
    expect(names).toEqual([
      "Install dependencies",
      "Add alias to tsconfig",
      "Modify next configuration",
      "Add .content-collections to .gitignore",
      "Create configuration file",
      "Create demo content",
    ]);
  });

  it("should add markdown package with demo content", async () => {
    const migration = await migratorNextJS.createMigration({
      directory: "directory",
      packageJson,
      demoContent: true,
    });

    const addDependenciesTask = migration.find((task) => task.name === "Install dependencies");
    if (!addDependenciesTask) {
      throw new Error("Task not found");
    }

    // @ts-expect-error - we know it's there
    const dependencies = addDependenciesTask.devDependencies;
    expect(dependencies).toContain("@content-collections/markdown");
  });

  it("should not add markdown package without demo content", async () => {
    const migration = await migratorNextJS.createMigration({
      directory: "directory",
      packageJson,
      demoContent: false,
    });

    const addDependenciesTask = migration.find((task) => task.name === "Install dependencies");
    if (!addDependenciesTask) {
      throw new Error("Task not found");
    }

    // @ts-expect-error - we know it's there
    const dependencies = addDependenciesTask.devDependencies;
    expect(dependencies).not.toContain("@content-collections/markdown");
  });

  it("should add core and next packages", async () => {
    const migration = await migratorNextJS.createMigration({
      directory: "directory",
      packageJson,
      demoContent: false,
    });

    const addDependenciesTask = migration.find((task) => task.name === "Install dependencies");
    if (!addDependenciesTask) {
      throw new Error("Task not found");
    }

    // @ts-expect-error - we know it's there
    const dependencies = addDependenciesTask.devDependencies;
    expect(dependencies).toContain("@content-collections/core");
    expect(dependencies).toContain("@content-collections/next");
  });
});
