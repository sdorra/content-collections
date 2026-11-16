import fs from "node:fs/promises";
import { join } from "node:path";
import { describe, expect } from "vitest";
import { tmpdirTest } from "../../__tests__/tmpdir.js";
import { addSubpathImport } from "./packageimports.js";

describe("package imports", () => {
  async function prepare(tmpdir: string, name: string) {
    const source = join(__dirname, "__tests__", "package-imports", name);
    await fs.copyFile(
      join(source, "package.json"),
      join(tmpdir, "package.json"),
    );
  }

  function readPackageJson(tmpdir: string) {
    return fs.readFile(join(tmpdir, "package.json"), "utf-8");
  }

  tmpdirTest("should add subpath import", async ({ tmpdir }) => {
    await prepare(tmpdir, "simple");
    const result = await addSubpathImport(tmpdir).run();

    const content = await readPackageJson(tmpdir);

    expect(result.status).toBe("changed");
    expect(JSON.parse(content).imports).toEqual({
      "#content-collections": "./.content-collections/generated/index.js",
    });
  });

  tmpdirTest("should keep the formatting of package.json", async ({ tmpdir }) => {
    await prepare(tmpdir, "simple");
    await addSubpathImport(tmpdir).run();

    const content = await readPackageJson(tmpdir);

    expect(content).toContain('\n\t"name": "simple"');
    expect(content.endsWith("}\n")).toBe(true);
  });

  tmpdirTest("should keep existing subpath imports", async ({ tmpdir }) => {
    await prepare(tmpdir, "with-imports");
    const result = await addSubpathImport(tmpdir).run();

    const content = await readPackageJson(tmpdir);

    expect(result.status).toBe("changed");
    expect(JSON.parse(content).imports).toEqual({
      "#lib/*": "./src/lib/*",
      "#content-collections": "./.content-collections/generated/index.js",
    });
  });

  tmpdirTest(
    "should skip if subpath import already exists",
    async ({ tmpdir }) => {
      await prepare(tmpdir, "already-configured");
      const result = await addSubpathImport(tmpdir).run();

      expect(result.status).toBe("skipped");
    },
  );

  tmpdirTest(
    "should error if subpath import is configured with a different value",
    async ({ tmpdir }) => {
      await prepare(tmpdir, "with-different-import");
      const result = await addSubpathImport(tmpdir).run();

      expect(result.status).toBe("error");
      expect(result.message).toContain(
        "#content-collections subpath import already exists with different value",
      );
    },
  );

  tmpdirTest("should error if package.json is not found", async ({ tmpdir }) => {
    const result = await addSubpathImport(tmpdir).run();

    expect(result.status).toBe("error");
    expect(result.message).toContain("could not find package.json");
  });
});
