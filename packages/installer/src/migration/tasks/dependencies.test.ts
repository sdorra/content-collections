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

  it("should have a name", async () => {
    const task = addDependencies("directory", {} as any, [], []);
    expect(task.name).toBe("Install dependencies");
  });

  it("should skip if dependencies already installed", async () => {
    const packageJson: PackageJson = {
      name: "something",
      dependencies: {
        core: "1.0.0",
        next: "2.0.0"
      },
    }

    const result = await addDependencies("directory", packageJson, ["core", "next"], []).run();
    expect(result.status).toBe("skipped");
    expect(packageManager.addDependencies).not.toBeCalled();
    expect(packageManager.addDevDependencies).not.toBeCalled();
  });

  it("should skip if dev dependencies already installed", async () => {
    const packageJson: PackageJson = {
      name: "something",
      devDependencies: {
        core: "1.0.0",
        next: "2.0.0"
      },
    }

    const result = await addDependencies("directory", packageJson, [], ["core", "next"]).run();
    expect(result.status).toBe("skipped");
    expect(packageManager.addDependencies).not.toBeCalled();
    expect(packageManager.addDevDependencies).not.toBeCalled();
  });

  it("should skip if dependencies or dev dependencies already installed", async () => {
    const packageJson: PackageJson = {
      name: "something",
      dependencies: {
        core: "1.0.0",
      },
      devDependencies: {
        next: "2.0.0"
      },
    }

    const result = await addDependencies("directory", packageJson, ["core"], ["next"]).run();
    expect(result.status).toBe("skipped");
    expect(packageManager.addDependencies).not.toBeCalled();
    expect(packageManager.addDevDependencies).not.toBeCalled();
  });

  it("should add dependencies", async () => {
    const packageJson: PackageJson = {
      name: "something"
    }

    const result = await addDependencies("directory", packageJson, ["core"], ["next"]).run();
    expect(result.status).toBe("changed");
    expect(packageManager.addDependencies).toHaveBeenCalledWith("core");
    expect(packageManager.addDevDependencies).toHaveBeenCalledWith("next");
  });

});
