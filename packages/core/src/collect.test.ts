import { describe, it, expect } from "vitest";
import { collect, isIncluded, sync } from "./collect";
import path from "node:path";

describe("collect", () => {
  it("should collect one collection", async () => {
    const collections = await collect([
      {
        directory: path.join(__dirname, "./__tests__/sources/test/"),
        include: "*.md",
      },
    ]);

    expect(collections).toHaveLength(1);
  });

  it("should collect two files", async () => {
    const [collection] = await collect([
      {
        directory: path.join(__dirname, "./__tests__/sources/test/"),
        include: "*.md",
      },
    ]);

    expect(collection?.files).toHaveLength(2);
  });

  it("should store file path", async () => {
    const [collection] = await collect([
      {
        directory: path.join(__dirname, "./__tests__/sources/test/"),
        include: "*.md",
      },
    ]);

    expect(collection?.files[0]?.path).toMatch(/001\.md$/);
    expect(collection?.files[1]?.path).toMatch(/002\.md$/);
  });

  it("should parse frontmatter", async () => {
    const [collection] = await collect([
      {
        directory: path.join(__dirname, "./__tests__/sources/test/"),
        include: "*.md",
      },
    ]);

    expect(collection?.files[0]?.data.name).toBe("One");
    expect(collection?.files[1]?.data.name).toBe("Two");
  });

  it("should store body", async () => {
    const [collection] = await collect([
      {
        directory: path.join(__dirname, "./__tests__/sources/test/"),
        include: "*.md",
      },
    ]);

    expect(collection?.files[0]?.body.trim()).toBe("# One");
    expect(collection?.files[1]?.body.trim()).toBe("# Two");
  });

  it("should collect single collection from multiple sources", async () => {
    const directory = path.join(__dirname, "./__tests__/sources/test");
    const [collection] = await collect([
      {
        directory,
        include: ["001.md", "002.md"],
      },
    ]);

    expect(collection?.files).toHaveLength(2);
  });

  it("should collect multiple collections", async () => {
    const collections = await collect([
      {
        directory: path.join(__dirname, "./__tests__/sources/test/"),
        include: "*.md",
      },
      {
        directory: path.join(__dirname, "./__tests__/sources/posts/"),
        include: "*.md",
      },
    ]);

    expect(collections).toHaveLength(2);
  });
});

describe("isIncluded", () => {
  it("should return true for included file", () => {
    const collection = {
      directory: path.join(__dirname, "./__tests__/sources/test/"),
      include: "*.md",
    };

    expect(
      isIncluded(collection, path.join(collection.directory, "001.md"))
    ).toBe(true);
  });

  it("should return false for excluded file", () => {
    const collection = {
      directory: path.join(__dirname, "./__tests__/sources/test/"),
      include: "*.md",
    };

    expect(
      isIncluded(collection, path.join(collection.directory, "001.html"))
    ).toBe(false);
  });

  it("should return false for file outside of directory", () => {
    const collection = {
      directory: path.join(__dirname, "./__tests__/sources/test/"),
      include: "*.md",
    };

    expect(
      isIncluded(collection, path.join(__dirname, "collect.test.ts"))
    ).toBe(false);
  });
});

describe("sync", () => {
  it("should add file", async () => {
    const collection = {
      directory: path.join(__dirname, "./__tests__/sources/test/"),
      include: "*.md",
      files: [],
    };

    await sync(collection, "added", path.join(collection.directory, "001.md"));

    expect(collection.files).toHaveLength(1);
  });

  it("should change file", async () => {
    const collection = {
      directory: path.join(__dirname, "./__tests__/sources/test/"),
      include: "*.md",
      files: [
        {
          path: "001.md",
          data: {},
          body: "",
        },
      ],
    };

    await sync(
      collection,
      "changed",
      path.join(collection.directory, "001.md")
    );

    const file = collection.files[0];
    console.log(file);
    expect(file?.data).toHaveProperty("name");
  });

  it("should remove file", async () => {
    const collection = {
      directory: path.join(__dirname, "./__tests__/sources/test/"),
      include: "*.md",
      files: [
        {
          path: "001.md",
          data: {},
          body: "",
        },
      ],
    };

    await sync(
      collection,
      "removed",
      path.join(collection.directory, "001.md")
    );

    expect(collection.files).toHaveLength(0);
  });

  it("should throw error for file outside of directory", async () => {
    const collection = {
      directory: path.join(__dirname, "./__tests__/sources/test/"),
      include: "*.md",
      files: [],
    };

    expect(() =>
      sync(collection, "added", path.join(__dirname, "collect.test.ts"))
    ).toThrowError("Path is not in collection directory");
  });
});
