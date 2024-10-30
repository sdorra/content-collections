import path from "path";
import { beforeEach, describe, expect, it } from "vitest";
import { createCollector } from "./collector";
import { Events, createEmitter } from "./events";
import { FileCollection } from "./types";

describe("collector", () => {
  let emitter = createEmitter<Events>();

  beforeEach(() => {
    emitter = createEmitter<Events>();
  });

  const sampleCollection: FileCollection = {
    directory: "./__tests__/sources",
    include: "**/*.md",
    parser: "frontmatter",
  };

  describe("collectFile", () => {
    it("should collect file", async () => {
      const { collectFile } = createCollector(emitter, __dirname);

      const file = await collectFile(sampleCollection, "test/001.md");

      if (!file) {
        throw new Error("File not found");
      }

      expect(file.path).toBe("test/001.md");
      expect(file.data.content?.trim()).toBe("# One");
      expect(file.data.name).toBe("One");
    });

    it("should throw an error if file does not exist", async () => {
      emitter.on("collector:read-error", ({ error }) => {
        throw error;
      });
      const { collectFile } = createCollector(emitter);

      await expect(
        collectFile(sampleCollection, "test/notfound.md"),
      ).rejects.toThrow("no such file or directory");
    });

    it("should capture the error and return null", async () => {
      emitter.on("collector:read-error", ({ error }) => {
        expect(error.type).toBe("Read");
        expect(error.message).toMatch(/no such file or directory/);
      });

      const { collectFile } = createCollector(emitter, __dirname);
      const file = await collectFile(sampleCollection, "test/notfound.md");
      expect(file).toBeNull();
    });

    it("should capture the parse error", async () => {
      emitter.on("collector:parse-error", ({ error }) => {
        expect(error.type).toBe("Parse");
        expect(error.message).toMatch(/^YAMLParseError:/);
      });

      const { collectFile } = createCollector(emitter, __dirname);
      const file = await collectFile(
        sampleCollection,
        "test/broken-frontmatter",
      );
      expect(file).toBeNull();
    });
  });

  describe("collect", () => {
    const { collect } = createCollector(emitter, __dirname);

    it("should collect one collection", async () => {
      const collections = await collect([
        {
          directory: "./__tests__/sources/test/",
          include: "*.md",
          parser: "frontmatter",
        },
      ]);

      expect(collections).toHaveLength(1);
    });

    it("should collect two files", async () => {
      const [collection] = await collect([
        {
          directory: "./__tests__/sources/test/",
          include: "*.md",
          parser: "frontmatter",
        },
      ]);

      expect(collection?.files).toHaveLength(2);
    });

    it("should store file path", async () => {
      const [collection] = await collect([
        {
          directory: "./__tests__/sources/test/",
          include: "*.md",
          parser: "frontmatter",
        },
      ]);

      expect(collection?.files[0]?.path).toMatch(/001\.md$/);
      expect(collection?.files[1]?.path).toMatch(/002\.md$/);
    });

    it("should parse frontmatter", async () => {
      const [collection] = await collect([
        {
          directory: "./__tests__/sources/test/",
          include: "*.md",
          parser: "frontmatter",
        },
      ]);

      expect(collection?.files[0]?.data.name).toBe("One");
      expect(collection?.files[1]?.data.name).toBe("Two");
    });

    it("should store body", async () => {
      const [collection] = await collect([
        {
          directory: "./__tests__/sources/test/",
          include: "*.md",
          parser: "frontmatter",
        },
      ]);

      expect(collection?.files[0]?.data.content?.trim()).toBe("# One");
      expect(collection?.files[1]?.data.content?.trim()).toBe("# Two");
    });

    it("should collect single collection from multiple sources", async () => {
      const [collection] = await collect([
        {
          directory: "./__tests__/sources/test",
          include: ["001.md", "002.md"],
          parser: "frontmatter",
        },
      ]);

      expect(collection?.files).toHaveLength(2);
    });

    it("should sort files by name", async () => {
      const [collection] = await collect([
        {
          directory: "./__tests__/sources/test",
          include: ["002.md", "001.md"],
          parser: "frontmatter",
        },
      ]);

      const paths = collection?.files.map((file) => file.path);
      expect(paths).toEqual(["001.md", "002.md"]);
    });

    it("should collect multiple collections", async () => {
      const collections = await collect([
        {
          directory: "./__tests__/sources/test/",
          include: "*.md",
          parser: "frontmatter",
        },
        {
          directory: "./__tests__/sources/posts/",
          include: "*.md",
          parser: "frontmatter",
        },
      ]);

      expect(collections).toHaveLength(2);
    });

    it("should exclude file", async () => {
      const [collection] = await collect([
        {
          directory: "./__tests__/sources/test/",
          include: "*.md",
          exclude: "002.md",
          parser: "frontmatter",
        },
      ]);

      expect(collection?.files).toHaveLength(1);
    });

    it("should exclude multiple files", async () => {
      const [collection] = await collect([
        {
          directory: "./__tests__/sources/test/",
          include: "*.md",
          exclude: ["001.md", "002.md"],
          parser: "frontmatter",
        },
      ]);

      expect(collection?.files).toHaveLength(0);
    });

    it("should exclude files which matches glob", async () => {
      const [collection] = await collect([
        {
          directory: "./__tests__/sources/test/",
          include: "*.md",
          exclude: "00?.md",
          parser: "frontmatter",
        },
      ]);

      expect(collection?.files).toHaveLength(0);
    });

    it("should use native separator for collected paths", async () => {
      // tinyglobby uses path.posix internally, so we have to convert the paths
      // this test would fail on Windows if we didn't convert the paths
      const [collection] = await collect([
        {
          directory: "./__tests__/sources/",
          include: "test/*.md",
          parser: "frontmatter",
        },
      ]);

      const paths = collection?.files.map((file) => file.path);
      expect(paths).toEqual([
        path.join("test", "001.md"),
        path.join("test", "002.md"),
      ]);
    });
  });

  it("should treat dates as string", async () => {
    const { collectFile } = createCollector(emitter, __dirname);

    const file = await collectFile(sampleCollection, "books/hgttg.md");

    if (!file) {
      throw new Error("File not found");
    }

    expect(typeof file.data.published).toBe("string");
  });
});
