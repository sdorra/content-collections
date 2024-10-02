import fs from "node:fs/promises";
import { join } from "node:path";
import { describe, expect } from "vitest";
import { tmpdirTest } from "./__tests__/tmpdir.js";
import { modifyNextConfig } from "./nextconfig.js";

describe("next configuration", () => {
  async function prepare(tmpdir: string, name: string) {
    const source = join(__dirname, "__tests__", "next-config", name);

    // copy all files from source directory to tmpdir
    const files = await fs.readdir(source);
    for (const file of files) {
      await fs.copyFile(join(source, file), join(tmpdir, file));
    }
  }

  tmpdirTest(
    "should fail if next.config file is not found",
    async ({ tmpdir }) => {
      await expect(modifyNextConfig(tmpdir)).rejects.toThrow(
        "next.config.(js|mjs|ts) not found",
      );
    },
  );

  describe("next.config.js", () => {
    tmpdirTest("should add import", async ({ tmpdir }) => {
      await prepare(tmpdir, "001");

      const task = await modifyNextConfig(tmpdir);
      const changed = await task.run();

      const nextConfig = await fs.readFile(
        join(tmpdir, "next.config.js"),
        "utf-8",
      );

      expect(changed).toBe(true);
      expect(nextConfig).toContain(
        'const { withContentCollections } = require("@content-collections/next");',
      );
    });

    tmpdirTest(
      "should add withContentCollections to export",
      async ({ tmpdir }) => {
        await prepare(tmpdir, "001");

        const task = await modifyNextConfig(tmpdir);
        const changed = await task.run();

        const nextConfig = await fs.readFile(
          join(tmpdir, "next.config.js"),
          "utf-8",
        );

        expect(changed).toBe(true);
        expect(nextConfig).toContain(
          "module.exports = withContentCollections(nextConfig);",
        );
      },
    );

    tmpdirTest("should not modify if already modified", async ({ tmpdir }) => {
      await prepare(tmpdir, "004");

      const task = await modifyNextConfig(tmpdir);
      const changed = await task.run();

      expect(changed).toBe(false);
    });
  });

  describe("next.config.mjs", () => {
    tmpdirTest("should add import", async ({ tmpdir }) => {
      await prepare(tmpdir, "002");

      const task = await modifyNextConfig(tmpdir);
      const changed = await task.run();

      const nextConfig = await fs.readFile(
        join(tmpdir, "next.config.mjs"),
        "utf-8",
      );

      expect(changed).toBe(true);
      expect(nextConfig).toContain(
        'import { withContentCollections } from "@content-collections/next";',
      );
    });

    tmpdirTest(
      "should add withContentCollections to export",
      async ({ tmpdir }) => {
        await prepare(tmpdir, "002");

        const task = await modifyNextConfig(tmpdir);
        const changed = await task.run();

        const nextConfig = await fs.readFile(
          join(tmpdir, "next.config.mjs"),
          "utf-8",
        );

        expect(changed).toBe(true);
        expect(nextConfig).toContain(
          "export default withContentCollections(nextConfig);",
        );
      },
    );

    tmpdirTest("should not modify if already modified", async ({ tmpdir }) => {
      await prepare(tmpdir, "005");

      const task = await modifyNextConfig(tmpdir);
      const changed = await task.run();

      expect(changed).toBe(false);
    });
  });

  describe("next.config.ts", () => {
    tmpdirTest("should add import", async ({ tmpdir }) => {
      await prepare(tmpdir, "003");

      const task = await modifyNextConfig(tmpdir);
      const changed = await task.run();

      const nextConfig = await fs.readFile(
        join(tmpdir, "next.config.ts"),
        "utf-8",
      );

      expect(changed).toBe(true);
      expect(nextConfig).toContain(
        'import { withContentCollections } from "@content-collections/next";',
      );
    });

    tmpdirTest(
      "should add withContentCollections to export",
      async ({ tmpdir }) => {
        await prepare(tmpdir, "003");

        const task = await modifyNextConfig(tmpdir);
        const changed = await task.run();

        const nextConfig = await fs.readFile(
          join(tmpdir, "next.config.ts"),
          "utf-8",
        );

        expect(changed).toBe(true);
        expect(nextConfig).toContain(
          "export default withContentCollections(nextConfig);",
        );
      },
    );

    tmpdirTest("should not modify if already modified", async ({ tmpdir }) => {
      await prepare(tmpdir, "006");

      const task = await modifyNextConfig(tmpdir);
      const changed = await task.run();

      expect(changed).toBe(false);
    });
  });
});
