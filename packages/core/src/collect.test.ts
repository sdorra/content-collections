import { describe, it, expect } from "vitest";
import { collect } from "./collect";
import { defineCollection } from ".";
import { z } from "zod";
import path from "node:path";

describe("collect", () => {
  it("should collect", async () => {
    const sample = defineCollection({
      name: "sample",
      schema: z.object({
        name: z.string(),
      }),
      sources: path.join(__dirname, "./__tests__/sources/test/*.md"),
    });

    const collections = await collect([sample]);
    expect(collections).toHaveLength(1);

    const collection = collections[0];
    if (!collection) {
      throw new Error("Collection not found");
    }
    expect(collection.files).toHaveLength(2);
    const [one, two] = collection.files;
    if (!one || !two) {
      throw new Error("Files not found");
    }

    expect(one.document.name).toBe("One");
    expect(one.content.trim()).toBe("# One");
    expect(two.document.name).toBe("Two");
    expect(two.content.trim()).toBe("# Two");
  });

  it("should collect single collection from multiple sources", async () => {
    const directory = path.join(__dirname, "./__tests__/sources/test/");
    const sample = defineCollection({
      name: "sample",
      schema: z.object({
        name: z.string(),
      }),
      sources: [path.join(directory, "001.md"), path.join(directory, "002.md")],
    });

    const [collection] = await collect([sample]);
    expect(collection?.files).toHaveLength(2);
  });

  it("should transform the document", async () => {
    const sample = defineCollection({
      name: "sample",
      schema: z.object({
        name: z.string(),
      }),
      sources: path.join(__dirname, "./__tests__/sources/test/*.md"),
      transform: (context, document) => {
        return {
          ...document,
          name: document.name.toUpperCase(),
        };
      },
    });

    const [collection] = await collect([sample]);
    expect(collection?.files[0]?.document.name).toBe("ONE");
  });

  it("should add the content to the document", async () => {
    const sample = defineCollection({
      name: "sample",
      schema: z.object({
        name: z.string(),
      }),
      sources: path.join(__dirname, "./__tests__/sources/test/*.md"),
      transform: async (context, document) => {
        return {
          ...document,
          content: await context.content(),
        };
      },
    });

    const [collection] = await collect([sample]);
    expect(collection?.files[0]?.document.content.trim()).toBe("# One");
  });

  it("should collect with multiple collections", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: z.object({
        title: z.string(),
        author: z.string(),
      }),
      sources: path.join(__dirname, "./__tests__/sources/posts/*.md"),
    });

    const authors = defineCollection({
      name: "authors",
      schema: z.object({
        ref: z.string(),
        displayName: z.string(),
      }),
      sources: path.join(__dirname, "./__tests__/sources/authors/*.md"),
    });

    const collections = await collect([posts, authors]);
    expect(collections).toHaveLength(2);

    expect(collections[0]?.files).toHaveLength(1);
    expect(collections[1]?.files).toHaveLength(1);
  });

  it("should transform with collection references", async () => {
    const authors = defineCollection({
      name: "authors",
      schema: z.object({
        ref: z.string(),
        displayName: z.string(),
      }),
      sources: path.join(__dirname, "./__tests__/sources/authors/*.md"),
    });

    const posts = defineCollection({
      name: "posts",
      schema: z.object({
        title: z.string(),
        author: z.string(),
      }),
      sources: path.join(__dirname, "./__tests__/sources/posts/*.md"),
      transform: async (context, document) => {
        const author = await context.documents(authors).find(a => a.ref === document.author);
        return {
          ...document,
          author: author?.displayName,
        };
      }
    });

    const collections = await collect([authors, posts]);
    expect(collections[1]?.files[0]?.document.author).toBe("Tricia Marie McMillan");
  });
});
