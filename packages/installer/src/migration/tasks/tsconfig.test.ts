import JSONC, { CommentObject } from "comment-json";
import fs from "node:fs/promises";
import { join } from "node:path";
import { describe, expect } from "vitest";
import { tmpdirTest } from "../../__tests__/tmpdir.js";
import { addAliasToTsConfig } from "./tsconfig.js";

describe("tsconfig", () => {
  async function prepare(tmpdir: string, name: string) {
    const source = join(__dirname, "__tests__", "tsconfig", name);

    // copy all files from source directory to tmpdir
    const files = await fs.readdir(source);
    for (const file of files) {
      await fs.copyFile(join(source, file), join(tmpdir, file));
    }
  }

  async function readTsConfig(tmpdir: string) {
    const tsconfigPath = join(tmpdir, "tsconfig.json");
    return JSONC.parse(await fs.readFile(tsconfigPath, "utf-8")) as any;
  }

  tmpdirTest("should have a name", async ({ tmpdir }) => {
    await prepare(tmpdir, "002");
    const task = addAliasToTsConfig(tmpdir);
    expect(task.name).toBe("Add alias to tsconfig");
  });

  tmpdirTest(
    "should skip  directory without tsconfig.json",
    async ({ tmpdir }) => {
      await prepare(tmpdir, "001");
      const result = await addAliasToTsConfig(tmpdir).run();
      expect(result.status).toBe("skipped");
    },
  );

  tmpdirTest("should add alias", async ({ tmpdir }) => {
    await prepare(tmpdir, "002");
    const result = await addAliasToTsConfig(tmpdir).run();

    expect(result.status).toBe("changed");

    const tsconfig = await readTsConfig(tmpdir);
    expect(tsconfig.compilerOptions.paths["content-collections"]).toEqual([
      "./.content-collections/generated",
    ]);
  });

  tmpdirTest("should add alias without compilerOptions", async ({ tmpdir }) => {
    await prepare(tmpdir, "003");
    const result = await addAliasToTsConfig(tmpdir).run();
    expect(result.status).toBe("changed");

    const tsconfig = await readTsConfig(tmpdir);
    expect(tsconfig.compilerOptions.paths["content-collections"]).toEqual([
      "./.content-collections/generated",
    ]);
  });

  tmpdirTest("should add alias to existing paths", async ({ tmpdir }) => {
    await prepare(tmpdir, "004");
    const result = await addAliasToTsConfig(tmpdir).run();
    expect(result.status).toBe("changed");

    const tsconfig = await readTsConfig(tmpdir);
    expect(tsconfig.compilerOptions.paths["content-collections"]).toEqual([
      "./.content-collections/generated",
    ]);
  });

  tmpdirTest(
    "should skip if alias already exists",
    async ({ tmpdir }) => {
      await prepare(tmpdir, "005");

      const result = await addAliasToTsConfig(tmpdir).run();
      expect(result.status).toBe("skipped");

      const tsconfig = await readTsConfig(tmpdir);
      expect(tsconfig.compilerOptions.paths["content-collections"]).toEqual([
        "./.content-collections/generated",
      ]);
    },
  );

  tmpdirTest(
    "should error if alias is pointing elsewhere",
    async ({ tmpdir }) => {
      await prepare(tmpdir, "006");

      const result = await addAliasToTsConfig(tmpdir).run();
      expect(result.status).toBe("error");
    },
  );
});
