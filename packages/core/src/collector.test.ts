import { describe, it, expect } from "vitest";
import { createCollector } from "./collector";

describe("collector", () => {
  describe("collectFile", () => {
    it("should collect file", async () => {
      const { collectFile } = createCollector();

      const file = await collectFile(
        __dirname, "./__tests__/sources/test/001.md"
      );

      if (!file) {
        throw new Error("File not found");
      }

      expect(file.path).toBe("./__tests__/sources/test/001.md")
      expect(file.body.trim()).toBe("# One");
      expect(file.data.name).toBe("One");
    });

    it("should throw an error if file does not exist", async () => {
      const { collectFile } = createCollector();

      await expect(
        collectFile(
          __dirname, "./__tests__/sources/test/notfound.md"
        )
      ).rejects.toThrow("no such file or directory");
    });

    it("should capture the error and return null", async () => {
      const { collectFile } = createCollector(__dirname, (error) => {
        expect(error.type).toBe("Read");
        expect(error.message).toMatch(/no such file or directory/);
      });

      const file = await collectFile(
        __dirname, "./__tests__/sources/test/notfound.md"
      );
      expect(file).toBeNull();
    });
  });

  describe("collect", () => {
    const { collect } = createCollector(__dirname);

    it("should collect one collection", async () => {
      const collections = await collect([
        {
          directory: "./__tests__/sources/test/",
          include: "*.md",
        },
      ]);

      expect(collections).toHaveLength(1);
    });

    it("should collect two files", async () => {
      const [collection] = await collect([
        {
          directory: "./__tests__/sources/test/",
          include: "*.md",
        },
      ]);

      expect(collection?.files).toHaveLength(2);
    });

    it("should store file path", async () => {
      const [collection] = await collect([
        {
          directory: "./__tests__/sources/test/",
          include: "*.md",
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
        },
      ]);

      expect(collection?.files[0]?.body.trim()).toBe("# One");
      expect(collection?.files[1]?.body.trim()).toBe("# Two");
    });

    it("should collect single collection from multiple sources", async () => {
      const [collection] = await collect([
        {
          directory: "./__tests__/sources/test",
          include: ["001.md", "002.md"],
        },
      ]);

      expect(collection?.files).toHaveLength(2);
    });

    it("should collect multiple collections", async () => {
      const collections = await collect([
        {
          directory: "./__tests__/sources/test/",
          include: "*.md",
        },
        {
          directory: "./__tests__/sources/posts/",
          include: "*.md",
        },
      ]);

      expect(collections).toHaveLength(2);
    });
  });
});
