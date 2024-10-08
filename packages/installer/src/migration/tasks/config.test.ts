import { existsSync } from "fs";
import fs from "fs/promises";
import { join } from "path";
import { describe, expect } from "vitest";
import { tmpdirTest } from "./__tests__/tmpdir.js";
import { createConfiguration } from "./config.js";

describe("config", () => {
  tmpdirTest("should have a name", async ({ tmpdir }) => {
    const task = createConfiguration(tmpdir, false);
    expect(task.name).toBe("Create configuration file");
  });

  tmpdirTest(
    "should create content-collections configuration",
    async ({ tmpdir }) => {
      const result = await createConfiguration(tmpdir, false).run();
      expect(result.status).toBe("changed");

      const filePath = join(tmpdir, "content-collections.ts");
      expect(existsSync(filePath)).toBe(true);
    },
  );

  tmpdirTest(
    "should skip if configuration already exists",
    async ({ tmpdir }) => {
      const filePath = join(tmpdir, "content-collections.ts");
      await fs.writeFile(filePath, "");

      const result = await createConfiguration(tmpdir, false).run();
      expect(result.status).toBe("skipped");
    },
  );

  tmpdirTest(
    "should create content-collections configuration without demo content",
    async ({ tmpdir }) => {
      const result = await createConfiguration(tmpdir, false).run();
      expect(result.status).toBe("changed");

      const filePath = join(tmpdir, "content-collections.ts");
      const content = await fs.readFile(filePath, "utf-8");
      expect(content).toContain("collections: [/* posts */]");
    },
  );

  tmpdirTest(
    "should create content-collections configuration with demo content",
    async ({ tmpdir }) => {
      const result = await createConfiguration(tmpdir, true).run();
      expect(result.status).toBe("changed");

      const filePath = join(tmpdir, "content-collections.ts");
      const content = await fs.readFile(filePath, "utf-8");
      expect(content).toContain('name: "posts"');
    },
  );
});
