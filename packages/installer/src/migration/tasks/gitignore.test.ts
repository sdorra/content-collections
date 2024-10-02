import fs from "fs/promises";
import { join } from "path";
import { describe, expect } from "vitest";
import { tmpdirTest } from "./__tests__/tmpdir.js";
import { addToGitIgnore } from "./gitignore.js";
import exp from "constants";

describe("gitignore", () => {
  tmpdirTest(
    "should add .content-collections to .gitignore",
    async ({ tmpdir }) => {
      const filePath = join(tmpdir, ".gitignore");
      await fs.writeFile(filePath, "node_modules\n");

      const task = addToGitIgnore(tmpdir);
      const changed = await task?.run();

      expect(changed).toBe(true);

      const content = await fs.readFile(filePath, "utf-8");
      expect(content).toContain("node_modules\n");
      expect(content).toContain(".content-collections\n");
    },
  );

  tmpdirTest(
    "should not add .content-collections to .gitignore if already present",
    async ({ tmpdir }) => {
      const filePath = join(tmpdir, ".gitignore");
      await fs.writeFile(filePath, "node_modules\n.content-collections\n");

      const task = addToGitIgnore(tmpdir);
      const changed = await task?.run();

      expect(changed).toBe(false);

      const content = await fs.readFile(filePath, "utf-8");
      expect(content).toContain("node_modules\n");
      expect(content).toContain(".content-collections\n");
    },
  );

  tmpdirTest(
    "should not add .content-collections to .gitignore if .gitignore does not exist",
    async ({ tmpdir }) => {
      const task = addToGitIgnore(tmpdir);
      expect(task).toBe(null);
    },
  );

  tmpdirTest(
    "should add to parent .gitignore",
    async ({ tmpdir }) => {
      const filePath = join(tmpdir, ".gitignore");
      await fs.writeFile(filePath, "");

      const childDir = join(tmpdir, "child");

      const task = addToGitIgnore(childDir);
      const changed = await task?.run();

      expect(changed).toBe(true);

      const content = await fs.readFile(filePath, "utf-8");
      expect(content).toContain(".content-collections\n");
    },
  );

  tmpdirTest(
    "should add to grand parent .gitignore",
    async ({ tmpdir }) => {
      const filePath = join(tmpdir, ".gitignore");
      await fs.writeFile(filePath, "");

      const childDir = join(tmpdir, "a", "b", "c");

      const task = addToGitIgnore(childDir);
      const changed = await task?.run();

      expect(changed).toBe(true);

      const content = await fs.readFile(filePath, "utf-8");
      expect(content).toContain(".content-collections\n");
    },
  );
});
