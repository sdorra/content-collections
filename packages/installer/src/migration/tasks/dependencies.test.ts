import { describe, it, expect, vi } from "vitest";
import { PackageJson } from "src/packageJson.js";
import { addDependencies } from "./dependencies.js";

const packageManager = {
  name: "mock",
  addDependencies: vi.fn(),
  addDevDependencies: vi.fn()
};

vi.mock("../utils/packageManager.js", () => ({
  detectPackageManager: () => packageManager
}));


describe("dependencies", () => {

  it("should not add dependencies if already installed", async () => {
    const packageJson: PackageJson = {
      name: "something",
      dependencies: {
        core: "1.0.0",
        next: "2.0.0"
      },
    }

    const task = await addDependencies("directory", packageJson, ["core", "next"], []);
    const changed = await task.run();

    expect(changed).toBe(false);
    expect(packageManager.addDependencies).not.toBeCalled();
    expect(packageManager.addDevDependencies).not.toBeCalled();
  });

  it("should not add dev dependencies if already installed", async () => {
    const packageJson: PackageJson = {
      name: "something",
      devDependencies: {
        core: "1.0.0",
        next: "2.0.0"
      },
    }

    const task = await addDependencies("directory", packageJson, [], ["core", "next"]);
    const changed = await task.run();

    expect(changed).toBe(false);
    expect(packageManager.addDependencies).not.toBeCalled();
    expect(packageManager.addDevDependencies).not.toBeCalled();
  });

  it("should not add dependencies or dev dependencies if already installed", async () => {
    const packageJson: PackageJson = {
      name: "something",
      dependencies: {
        core: "1.0.0",
      },
      devDependencies: {
        next: "2.0.0"
      },
    }

    const task = await addDependencies("directory", packageJson, ["core"], ["next"]);
    const changed = await task.run();

    expect(changed).toBe(false);
    expect(packageManager.addDependencies).not.toBeCalled();
    expect(packageManager.addDevDependencies).not.toBeCalled();
  });

  it("should add dependencies", async () => {
    const packageJson: PackageJson = {
      name: "something"
    }

    const task = await addDependencies("directory", packageJson, ["core"], ["next"]);
    const changed = await task.run();

    expect(changed).toBe(true);
    expect(packageManager.addDependencies).toHaveBeenCalledWith("core");
    expect(packageManager.addDevDependencies).toHaveBeenCalledWith("next");
  });

});
