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
    "should return name",
    async ({ tmpdir }) => {
      const task = modifyNextConfig(tmpdir);
      expect(task.name).toBe("Modify next configuration");
    },
  );

  tmpdirTest(
    "should error if next.config file is not found",
    async ({ tmpdir }) => {
      const result = await modifyNextConfig(tmpdir).run();
      expect(result.status).toBe("error");
    },
  );

  describe("next.config.js", () => {
    tmpdirTest("should add import", async ({ tmpdir }) => {
      await prepare(tmpdir, "001");

      const result = await modifyNextConfig(tmpdir).run();
      expect(result.status).toBe("changed");

      const nextConfig = await fs.readFile(
        join(tmpdir, "next.config.js"),
        "utf-8",
      );
      expect(nextConfig).toContain(
        'const { withContentCollections } = require("@content-collections/next");',
      );
    });

    tmpdirTest(
      "should add withContentCollections to export",
      async ({ tmpdir }) => {
        await prepare(tmpdir, "001");

        const result = await modifyNextConfig(tmpdir).run();
        expect(result.status).toBe("changed");

        const nextConfig = await fs.readFile(
          join(tmpdir, "next.config.js"),
          "utf-8",
        );
        expect(nextConfig).toContain(
          "module.exports = withContentCollections(nextConfig);",
        );
      },
    );

    tmpdirTest("should not modify if already modified", async ({ tmpdir }) => {
      await prepare(tmpdir, "004");

      const result = await modifyNextConfig(tmpdir).run();
      expect(result.status).toBe("skipped");
    });
  });

  describe("next.config.mjs", () => {
    tmpdirTest("should add import", async ({ tmpdir }) => {
      await prepare(tmpdir, "002");

      const result = await modifyNextConfig(tmpdir).run();
      expect(result.status).toBe("changed");

      const nextConfig = await fs.readFile(
        join(tmpdir, "next.config.mjs"),
        "utf-8",
      );
      expect(nextConfig).toContain(
        'import { withContentCollections } from "@content-collections/next";',
      );
    });

    tmpdirTest(
      "should add withContentCollections to export",
      async ({ tmpdir }) => {
        await prepare(tmpdir, "002");

        const result = await modifyNextConfig(tmpdir).run();
        expect(result.status).toBe("changed");

        const nextConfig = await fs.readFile(
          join(tmpdir, "next.config.mjs"),
          "utf-8",
        );
        expect(nextConfig).toContain(
          "export default withContentCollections(nextConfig);",
        );
      },
    );

    tmpdirTest("should not modify if already modified", async ({ tmpdir }) => {
      await prepare(tmpdir, "005");

      const result = await modifyNextConfig(tmpdir).run();
      expect(result.status).toBe("skipped");
    });
  });

  describe("next.config.ts", () => {
    tmpdirTest("should add import", async ({ tmpdir }) => {
      await prepare(tmpdir, "003");

      const result = await modifyNextConfig(tmpdir).run();
      expect(result.status).toBe("changed");

      const nextConfig = await fs.readFile(
        join(tmpdir, "next.config.ts"),
        "utf-8",
      );
      expect(nextConfig).toContain(
        'import { withContentCollections } from "@content-collections/next";',
      );
    });

    tmpdirTest(
      "should add withContentCollections to export",
      async ({ tmpdir }) => {
        await prepare(tmpdir, "003");

        const result = await modifyNextConfig(tmpdir).run();
        expect(result.status).toBe("changed");

        const nextConfig = await fs.readFile(
          join(tmpdir, "next.config.ts"),
          "utf-8",
        );
        expect(nextConfig).toContain(
          "export default withContentCollections(nextConfig);",
        );
      },
    );

    tmpdirTest("should not modify if already modified", async ({ tmpdir }) => {
      await prepare(tmpdir, "006");

      const result = await modifyNextConfig(tmpdir).run();
      expect(result.status).toBe("skipped");
    });
  });
});
