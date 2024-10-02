import { describe, it, expect } from "vitest";
import { tmpdirTest } from "./__tests__/tmpdir.js";
import { join } from "path";
import { createConfiguration } from "./config.js";
import { existsSync } from "fs";
import fs from "fs/promises";

describe("config", () => {
  tmpdirTest("should create content-collections configuration", async ({ tmpdir }) => {
    const task = createConfiguration(tmpdir);
    const changed = await task.run();

    expect(changed).toBe(true);

    const filePath = join(tmpdir, "content-collections.ts");
    expect(existsSync(filePath)).toBe(true);
  });

  tmpdirTest("should not create content-collections configuration if already exists", async ({ tmpdir }) => {
    const filePath = join(tmpdir, "content-collections.ts");
    await fs.writeFile(filePath, "");

    const task = createConfiguration(tmpdir);
    const changed = await task.run();

    expect(changed).toBe(false);
  });
});
