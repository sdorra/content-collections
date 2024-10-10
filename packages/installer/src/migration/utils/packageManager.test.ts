import { spawn } from "node:child_process";
import { detect } from "package-manager-detector/detect";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { detectPackageManager } from "./packageManager.js";

vi.mock("node:child_process", () => {
  return {
    spawn: vi.fn(() => {
      return {
        on: vi.fn((event, callback) => {
          if (event === "exit") {
            callback(0);
          }
        }),
      };
    }),
  };
});

vi.mock("package-manager-detector/detect", () => ({
  detect: vi.fn(),
}));

function usePM(name: string | null) {
  // @ts-expect-error
  detect.mockReturnValueOnce(name ? { name } : null);
}

describe("dependencies", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should call yarn add", async () => {
    usePM("yarn");

    const packageManager = await detectPackageManager("directory");
    await packageManager.addDependencies("core", "next");

    expect(spawn).toHaveBeenCalledOnce();
    expect(spawn).toHaveBeenCalledWith("yarn", ["add", "core", "next"], {
      cwd: "directory",
    });
  });

  it("should call npm install", async () => {
    usePM("npm");

    const packageManager = await detectPackageManager("directory");
    await packageManager.addDependencies("core", "next");

    expect(spawn).toHaveBeenCalledOnce();
    expect(spawn).toHaveBeenCalledWith("npm", ["install", "core", "next"], {
      cwd: "directory",
    });
  });

  it("should call pnpm add -D", async () => {
    usePM("pnpm");

    const packageManager = await detectPackageManager("directory");
    await packageManager.addDevDependencies("core", "next");

    expect(spawn).toHaveBeenCalledOnce();
    expect(spawn).toHaveBeenCalledWith("pnpm", ["add", "-D", "core", "next"], {
      cwd: "directory",
    });
  });

  it("should use npm if no package manager detected", async () => {
    usePM(null);

    const packageManager = await detectPackageManager("directory");
    await packageManager.addDependencies("react");

    expect(spawn).toHaveBeenCalledOnce();
    expect(spawn).toHaveBeenCalledWith("npm", ["install", "react"], {
      cwd: "directory",
    });
  });

  it("should throw if command fails", async () => {
    const packageManager = await detectPackageManager("directory");
    // @ts-expect-error
    spawn.mockImplementationOnce(() => {
      return {
        on: vi.fn((event, callback) => {
          if (event === "exit") {
            callback(1);
          }
        }),
      };
    });

    await expect(packageManager.addDependencies("core")).rejects.toThrow(
      "Command failed with code 1",
    );
  });
});
