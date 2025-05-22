import * as bundleRequire from "bundle-require";
import { existsSync } from "node:fs";
import { copyFile, readFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, vi } from "vitest";
import { tmpdirTest } from "./__tests__/tmpdir";
import { compile } from "./esbuild";

type Params = {
  tsConfig?: unknown;
};

const params = vi.hoisted(() => {
  return {
    tsConfig: undefined,
  } as Params;
});

vi.mock("bundle-require", async (importOriginal) => {
  const orig = await importOriginal<typeof bundleRequire>();
  return {
    ...orig,
    loadTsConfig: (directory?: string) => {
      if (params.tsConfig !== undefined) {
        return params.tsConfig;
      }
      if (directory) {
        return orig.loadTsConfig(directory);
      }
      return orig.loadTsConfig();
    },
  };
});

describe("esbuild", () => {
  afterEach(() => {
    params.tsConfig = undefined;
  });

  async function compileFile(tmpdir: string, name: string) {
    const p = path.join(__dirname, "__tests__", "esbuild", name);

    let configPath = p + ".ts";
    if (!existsSync(configPath)) {
      configPath = path.join(p, "index.ts");
    }

    const output = path.join(tmpdir, "out.mjs");

    await compile(configPath, output);

    return output;
  }

  async function compileAndImportFile(tmpdir: string, name: string) {
    const output = await compileFile(tmpdir, name);
    const mod = await import(output);
    return mod.default;
  }

  tmpdirTest("should compile simple module", async ({ tmpdir }) => {
    const output = await compileAndImportFile(tmpdir, "simple");
    expect(output).toBe("hello world");
  });

  tmpdirTest(
    "should compile module with external module",
    async ({ tmpdir }) => {
      const output = await compileAndImportFile(tmpdir, "external");
      expect(output).toBe("helloWorld");
    },
  );

  tmpdirTest("should compile with internal module", async ({ tmpdir }) => {
    const output = await compileAndImportFile(tmpdir, "internal");
    expect(output).toBe("hello world");
  });

  tmpdirTest("should compile with tsconfig paths", async ({ tmpdir }) => {
    const output = await compileAndImportFile(tmpdir, "tsconfigPaths");
    expect(output).toBe("hello world");
  });

  tmpdirTest("should compile with dynamic import", async ({ tmpdir }) => {
    const output = await compileAndImportFile(tmpdir, "dynamicImport");
    expect(await output()).toBe("hello world");
  });

  tmpdirTest(
    "should use loadTsConfig without parameters",
    async ({ tmpdir }) => {
      const source = path.join(__dirname, "__tests__", "esbuild", "simple.ts");
      const target = path.join(tmpdir, "simple.ts");
      await copyFile(source, target);

      const config = path.join(tmpdir, "config.mjs");
      await compile(target, config);

      const mod = await import(config);
      expect(mod.default).toBe("hello world");
    },
  );

  tmpdirTest(
    "should compile with dynamic import from alias",
    async ({ tmpdir }) => {
      const output = await compileFile(tmpdir, "aliasDynamicImport");
      const content = await readFile(output, "utf-8");
      expect(content).includes('import("@alias")');
    },
  );

  tmpdirTest("should use empty paths", async ({ tmpdir }) => {
    params.tsConfig = {
      data: {},
    };
    const output = await compileAndImportFile(tmpdir, "simple");
    expect(output).toBe("hello world");
  });

  tmpdirTest("should return configuration path", async ({ tmpdir }) => {
    const configPath = path.join(
      __dirname,
      "__tests__",
      "esbuild",
      "simple.ts",
    );
    const output = path.join(tmpdir, "out.mjs");

    const paths = await compile(configPath, output);
    expect(paths.map((p) => path.resolve(p))).toEqual([configPath]);
  });

  tmpdirTest(
    "should return configuration and imported path",
    async ({ tmpdir }) => {
      const directory = path.join(__dirname, "__tests__", "esbuild");
      const configPath = path.join(directory, "internal.ts");
      const imported = path.join(directory, "simple.ts");
      const output = path.join(tmpdir, "out.mjs");

      const paths = await compile(configPath, output);
      expect(paths.map((p) => path.resolve(p))).toEqual([imported, configPath]);
    },
  );
});
