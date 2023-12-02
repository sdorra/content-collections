import { describe, it, expect } from "vitest";
import { collect } from "./collect";
import { defineCollection } from "./config";
import { z } from "zod";
import path from "node:path";


describe("collect", () => {

  it("should collect one collection", async () => {
    const collections = await collect([{
      sources: path.join(__dirname, "./__tests__/sources/test/*.md")
    }]);

    expect(collections).toHaveLength(1);
  });

  it("should collect two files", async () => {
    const [collection] = await collect([{
      sources: path.join(__dirname, "./__tests__/sources/test/*.md")
    }]);

    expect(collection?.files).toHaveLength(2);
  });

  it("should store file path", async () => {
    const [collection] = await collect([{
      sources: path.join(__dirname, "./__tests__/sources/test/*.md")
    }]);

    expect(collection?.files[0]?.path).toMatch(/001\.md$/);
    expect(collection?.files[1]?.path).toMatch(/002\.md$/);
  });

  it("should parse frontmatter", async () => {
    const [collection] = await collect([{
      sources: path.join(__dirname, "./__tests__/sources/test/*.md")
    }]);

    expect(collection?.files[0]?.data.name).toBe("One");
    expect(collection?.files[1]?.data.name).toBe("Two");
  });

  it("should store body", async () => {
    const [collection] = await collect([{
      sources: path.join(__dirname, "./__tests__/sources/test/*.md")
    }]);

    expect(collection?.files[0]?.body.trim()).toBe("# One");
    expect(collection?.files[1]?.body.trim()).toBe("# Two");
  });

  it("should collect single collection from multiple sources", async () => {
    const directory = path.join(__dirname, "./__tests__/sources/test/");
    const [collection] = await collect([{
      sources: [path.join(directory, "001.md"), path.join(directory, "002.md")],
    }]);

    expect(collection?.files).toHaveLength(2);
  });

  it("should collect multiple collections", async () => {
    const collections = await collect([{
      sources: path.join(__dirname, "./__tests__/sources/test/*.md")
    }, {
      sources: path.join(__dirname, "./__tests__/sources/posts/*.md")
    }]);

    expect(collections).toHaveLength(2);
  });

});

describe.skip("old collect", () => {



});
