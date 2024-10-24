import fs from "fs/promises";
import { join } from "path";
import { describe, expect } from "vitest";
import { tmpdirTest } from "../../__tests__/tmpdir.js";
import { addToGitIgnore } from "./gitignore.js";

describe("gitignore", () => {

  tmpdirTest(
    "should have a name",
    async ({ tmpdir }) => {
      const task = addToGitIgnore(tmpdir);
      expect(task.name).toBe("Add .content-collections to .gitignore");
    },
  );

  tmpdirTest(
    "should add .content-collections to .gitignore",
    async ({ tmpdir }) => {
      const filePath = join(tmpdir, ".gitignore");
      await fs.writeFile(filePath, "node_modules\n");

      const result = await addToGitIgnore(tmpdir).run();
      expect(result.status).toBe("changed");

      const content = await fs.readFile(filePath, "utf-8");
      expect(content).toContain("node_modules\n");
      expect(content).toContain(".content-collections\n");
    },
  );

  tmpdirTest(
    "should skip .content-collections to .gitignore if already present",
    async ({ tmpdir }) => {
      const filePath = join(tmpdir, ".gitignore");
      await fs.writeFile(filePath, "node_modules\n.content-collections\n");

      const result = await addToGitIgnore(tmpdir).run();
      expect(result.status).toBe("skipped");

      const content = await fs.readFile(filePath, "utf-8");
      expect(content).toContain("node_modules\n");
      expect(content).toContain(".content-collections\n");
    },
  );

  tmpdirTest(
    "should skip if .gitignore does not exist",
    async ({ tmpdir }) => {
      const result = await addToGitIgnore(tmpdir).run();
      expect(result.status).toBe("skipped");
    },
  );

  tmpdirTest(
    "should add to parent .gitignore",
    async ({ tmpdir }) => {
      const filePath = join(tmpdir, ".gitignore");
      await fs.writeFile(filePath, "");

      const childDir = join(tmpdir, "child");

      const result = await addToGitIgnore(childDir).run();
      expect(result.status).toBe("changed");

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

      const result = await addToGitIgnore(childDir).run();
      expect(result.status).toBe("changed");

      const content = await fs.readFile(filePath, "utf-8");
      expect(content).toContain(".content-collections\n");
    },
  );
});
