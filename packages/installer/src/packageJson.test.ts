import fs from "fs/promises";
import path from "path";
import { describe, expect } from "vitest";
import { tmpdirTest } from "./__tests__/tmpdir.js";
import { readPackageJson } from "./packageJson.js";

describe("readPackage.json", () => {
  tmpdirTest("should read simple package.json", async ({ tmpdir }) => {
    const packageJsonPath = path.join(tmpdir, "package.json");

    await fs.writeFile(
      packageJsonPath,
      JSON.stringify({
        name: "test",
      }),
    );

    const packageJson = await readPackageJson(tmpdir);
    expect(packageJson.name).toEqual("test");
  });

  tmpdirTest("should read more complex package.json", async ({ tmpdir }) => {
    const packageJsonPath = path.join(tmpdir, "package.json");

    await fs.writeFile(
      packageJsonPath,
      JSON.stringify({
        name: "sample",
        dependencies: {
          react: "^17.0.2",
        },
        devDependencies: {
          "@types/react": "^17.0.2",
        },
      }),
    );

    const packageJson = await readPackageJson(tmpdir);
    expect(packageJson.name).toEqual("sample");
    expect(packageJson.dependencies).toEqual({ react: "^17.0.2" });
    expect(packageJson.devDependencies).toEqual({ "@types/react": "^17.0.2" });
  });

  tmpdirTest(
    "should throw error if package.json is missing",
    async ({ tmpdir }) => {
      try {
        await readPackageJson(tmpdir);
      } catch (error: any) {
        expect(error.message).toEqual(
          "package.json not found in current directory",
        );
      }
    },
  );

  tmpdirTest(
    "should throw error if package.json could not be parsed",
    async ({ tmpdir }) => {
      const packageJsonPath = path.join(tmpdir, "package.json");

      await fs.writeFile(packageJsonPath, "invalid json");

      try {
        await readPackageJson(tmpdir);
      } catch (error: any) {
        expect(error.message).contains("not valid JSON");
      }
    },
  );

  tmpdirTest(
    "should throw error if package.json is not valid",
    async ({ tmpdir }) => {
      const packageJsonPath = path.join(tmpdir, "package.json");

      await fs.writeFile(
        packageJsonPath,
        JSON.stringify({
          name: "sample",
          dependencies: {
            react: 1,
          },
        }),
      );

      try {
        await readPackageJson(tmpdir);
      } catch (error: any) {
        expect(error.message).contains("invalid_type");
      }
    },
  );
});
