import fs from "node:fs/promises";
import { join } from "node:path";
import { describe, expect } from "vitest";
import { tmpdirTest } from "../../__tests__/tmpdir.js";
import { modifyViteConfig } from "./viteconfig.js";

describe("vite configuration", () => {
  async function prepare(tmpdir: string, name: string) {
    const source = join(__dirname, "__tests__", "vite-config", name);

    // copy all files from source directory to tmpdir
    const files = await fs.readdir(source);
    for (const file of files) {
      let targetFilename = file;
      if (file.endsWith("_")) {
        targetFilename = file.slice(0, -1);
      }
      await fs.copyFile(join(source, file), join(tmpdir, targetFilename));
    }
  }

  tmpdirTest(
    "should return name",
    async ({ tmpdir }) => {
      const task = modifyViteConfig(tmpdir, "vite");
      expect(task.name).toBe("Modify vite configuration");
    },
  );

  tmpdirTest(
    "should error if vite.config file is not found",
    async ({ tmpdir }) => {
      const result = await modifyViteConfig(tmpdir, "vite").run();
      expect(result.status).toBe("error");
    },
  );

  describe("vite.config.js", () => {

    tmpdirTest("should adjust remix vite config", async ({ tmpdir }) => {
      await prepare(tmpdir, "remix");

      const result = await modifyViteConfig(tmpdir, "remix-vite").run();
      expect(result.status).toBe("changed");

      const viteConfig = await fs.readFile(
        join(tmpdir, "vite.config.ts"),
        "utf-8",
      );

      expect(viteConfig).toContain(
        'import contentCollections from "@content-collections/remix-vite";',
      );
      expect(viteConfig).toContain(
        "plugins: [remix(), tsconfigPaths(), contentCollections()]",
      );
    });

    tmpdirTest("should adjust svelte-kit vite config", async ({ tmpdir }) => {
      await prepare(tmpdir, "svelte-kit");

      const result = await modifyViteConfig(tmpdir, "vite").run();
      expect(result.status).toBe("changed");

      const viteConfig = await fs.readFile(
        join(tmpdir, "vite.config.ts"),
        "utf-8",
      );
      expect(viteConfig).toContain(
        'import contentCollections from "@content-collections/vite";',
      );
      expect(viteConfig).toContain(
        "plugins: [sveltekit(), contentCollections()]",
      );
    });

    tmpdirTest("should adjust qwik vite config", async ({ tmpdir }) => {
      await prepare(tmpdir, "qwik");

      const result = await modifyViteConfig(tmpdir, "vite").run();
      expect(result.status).toBe("changed");

      const viteConfig = await fs.readFile(
        join(tmpdir, "vite.config.ts"),
        "utf-8",
      );

      expect(viteConfig).toContain(
        'import contentCollections from "@content-collections/vite";',
      );
      expect(viteConfig).toContain(
        "plugins: [qwikCity(), qwikVite(), tsconfigPaths(), contentCollections()]",
      );
    });

    tmpdirTest("should adjust vite config", async ({ tmpdir }) => {
      await prepare(tmpdir, "vite");

      const result = await modifyViteConfig(tmpdir, "vite").run();
      expect(result.status).toBe("changed");

      const viteConfig = await fs.readFile(
        join(tmpdir, "vite.config.ts"),
        "utf-8",
      );

      expect(viteConfig).toContain(
        'import contentCollections from "@content-collections/vite";',
      );
      expect(viteConfig).toContain(
        "plugins: [contentCollections()]",
      );
    });

    tmpdirTest("should adjust vite react config", async ({ tmpdir }) => {
      await prepare(tmpdir, "vite-react");

      const result = await modifyViteConfig(tmpdir, "vite").run();
      expect(result.status).toBe("changed");

      const viteConfig = await fs.readFile(
        join(tmpdir, "vite.config.js"),
        "utf-8",
      );

      expect(viteConfig).toContain(
        'import contentCollections from "@content-collections/vite";',
      );
      expect(viteConfig).toContain(
        "plugins: [react(), contentCollections()]",
      );
    });

    tmpdirTest("should return error for missing defineConfig function", async ({ tmpdir }) => {
      await prepare(tmpdir, "without-define-config");

      const result = await modifyViteConfig(tmpdir, "vite").run();
      expect(result.status).toBe("error");
      expect(result.message).toContain("could not find defineConfig");
    });

    tmpdirTest("should return error for missing config object", async ({ tmpdir }) => {
      await prepare(tmpdir, "without-config-object");

      const result = await modifyViteConfig(tmpdir, "vite").run();
      expect(result.status).toBe("error");
      expect(result.message).toContain("First argument of defineConfig is missing");
    });

    tmpdirTest("should return error for wrong type of plugins", async ({ tmpdir }) => {
      await prepare(tmpdir, "wrong-type-of-plugins");

      const result = await modifyViteConfig(tmpdir, "vite").run();
      expect(result.status).toBe("error");
      expect(result.message).toContain("plugins property is not an ArrayExpression");
    });

    tmpdirTest("should work with function expressions", async ({ tmpdir }) => {
      await prepare(tmpdir, "with-function-expression");

      const result = await modifyViteConfig(tmpdir, "vite").run();
      expect(result.status).toBe("changed");

      const viteConfig = await fs.readFile(
        join(tmpdir, "vite.config.ts"),
        "utf-8",
      );

      expect(viteConfig).toContain(
        'import contentCollections from "@content-collections/vite";',
      );
      expect(viteConfig).toContain(
        "plugins: [contentCollections()]",
      );
    });

    tmpdirTest("should skip if already installed", async ({ tmpdir }) => {
      await prepare(tmpdir, "already-installed");

      const result = await modifyViteConfig(tmpdir, "vite").run();
      expect(result.status).toBe("skipped");
    });

    tmpdirTest("should return error for wrong type of config object", async ({ tmpdir }) => {
      await prepare(tmpdir, "wrong-type-of-config-object");

      const result = await modifyViteConfig(tmpdir, "vite").run();
      expect(result.status).toBe("error");
      expect(result.message).toContain("First argument of defineConfig is not an ObjectExpression");
    });

    tmpdirTest("should return error for wrong type of plugins property", async ({ tmpdir }) => {
      await prepare(tmpdir, "wrong-type-of-plugins-property");

      const result = await modifyViteConfig(tmpdir, "vite").run();
      expect(result.status).toBe("error");
      expect(result.message).toContain("plugins property is not an ObjectProperty or Property");
    });

  });

});
