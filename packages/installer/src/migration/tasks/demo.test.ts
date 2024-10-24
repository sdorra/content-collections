import fs from "fs/promises";
import { join } from "path";
import { describe, expect } from "vitest";
import { tmpdirTest } from "../../__tests__/tmpdir.js";
import { createDemoContent } from "./demo.js";
import { existsSync } from "fs";

describe("demo content", () => {
  tmpdirTest("should have a name", ({ tmpdir }) => {
    const task = createDemoContent(tmpdir, "markdown");
    expect(task.name).toBe("Create demo content");
  });

  tmpdirTest("should throw for unknown type", async ({ tmpdir }) => {
    // @ts-expect-error testing invalid type
    const task = createDemoContent(tmpdir, "unknown");
    await expect(task.run()).rejects.toThrow("Invalid content type: unknown");
  });

  tmpdirTest("should create demo content", async ({ tmpdir }) => {
    const result = await createDemoContent(tmpdir, "markdown").run();
    expect(result.status).toBe("changed");

    const contentDirectory = join(tmpdir, "content", "posts");
    const files = await fs.readdir(contentDirectory);
    expect(files).toEqual([
      "the-day-a-goat-hijacked-our-drone.md",
      "the-day-a-kangaroo-became-our-fitness-coach.md",
      "the-day-a-monkey-became-our-tour-guide.md",
      "the-day-a-parrot-became-our-translator.md",
      "when-a-penguin-tried-to-steal-my-lunch.md",
    ]);
  });

  tmpdirTest("should create demo content with mdx files", async ({ tmpdir }) => {
    const result = await createDemoContent(tmpdir, "mdx").run();
    expect(result.status).toBe("changed");

    const contentDirectory = join(tmpdir, "content", "posts");
    const files = await fs.readdir(contentDirectory);
    expect(files).toEqual([
      "the-day-a-goat-hijacked-our-drone.mdx",
      "the-day-a-kangaroo-became-our-fitness-coach.mdx",
      "the-day-a-monkey-became-our-tour-guide.mdx",
      "the-day-a-parrot-became-our-translator.mdx",
      "when-a-penguin-tried-to-steal-my-lunch.mdx",
    ]);
  });

  tmpdirTest("should skip if content already exists", async ({ tmpdir }) => {
    const task = createDemoContent(tmpdir, "markdown");
    await task.run();

    const result = await task.run();
    expect(result.status).toBe("skipped");
  });

  tmpdirTest("should add missing content", async ({ tmpdir }) => {
    const task = createDemoContent(tmpdir, "markdown");
    await task.run();

    const contentDirectory = join(tmpdir, "content", "posts");

    const post = join(contentDirectory, "the-day-a-goat-hijacked-our-drone.md");
    await fs.unlink(post);

    const result = await task.run();
    expect(result.status).toBe("changed");

    expect(existsSync(post)).toBe(true);
  });
});
