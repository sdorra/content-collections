import { describe, it, expect } from "vitest";
import { CollectionError, collect } from "./collect";
import { defineCollection } from "./config";
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

  it("should collect meta fields", async () => {
    const sample = defineCollection({
      name: "sample",
      schema: z.object({
        name: z.string(),
      }),
      sources: path.join(__dirname, "./__tests__/sources/test/*.md"),
    });

    const [collection] = await collect([sample]);
    expect(collection?.files[0]?.document._meta.path).toBe(
      path.join(__dirname, "./__tests__/sources/test/001.md")
    );
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
          test: "test",
          name: document.name.toUpperCase(),
        };
      },
    });

    const [collection] = await collect([sample]);
    const doc = collection?.files[0]?.document;
    expect(doc.test).toBe("test");
    expect(doc.name).toBe("ONE");
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
        const author = await context
          .documents(authors)
          .find((a) => a.ref === document.author);
        return {
          ...document,
          author: author?.displayName,
        };
      },
    });

    const collections = await collect([authors, posts]);
    expect(collections[1]?.files[0]?.document.author).toBe(
      "Tricia Marie McMillan"
    );
  });

  it("should throw if document validation fails", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: z.object({
        name: z.string(),
      }),
      sources: path.join(__dirname, "./__tests__/sources/posts/*.md"),
    });

    await expect(collect([posts])).rejects.toThrowError(/invalid_type/);
  });

  it("should capture validation error", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: z.object({
        name: z.string(),
      }),
      sources: path.join(__dirname, "./__tests__/sources/posts/*.md"),
    });

    const errors: Array<CollectionError> = [];
    await collect([posts], (error) => errors.push(error));
    expect(errors[0]?.type).toBe("Validation");
  });

  it("should not hold invalid documents", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: z.object({
        name: z.string(),
      }),
      sources: path.join(__dirname, "./__tests__/sources/posts/*.md"),
    });

    const [collection] = await collect([posts], () => {});
    expect(collection?.files).toHaveLength(0);
  });

  it("should report an error if a collection is not registered", async () => {
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
      }),
      sources: path.join(__dirname, "./__tests__/sources/posts/*.md"),
      transform: async (context, document) => {
        const allAuthors = await context.documents(authors);
        return {
          ...document,
          allAuthors,
        };
      },
    });

    const errors: Array<CollectionError> = [];
    await collect([posts], (error) => errors.push(error));
    expect(errors[0]?.type).toBe("Configuration");
  });

  it("should report an transform error", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: z.object({
        title: z.string(),
      }),
      sources: path.join(__dirname, "./__tests__/sources/posts/*.md"),
      transform: (doc) => {
        throw new Error("Something went wrong");
        return doc;
      },
    });

    const errors: Array<CollectionError> = [];
    await collect([posts], (error) => errors.push(error));
    expect(errors[0]?.type).toBe("Transform");
  });

  it("should exclude documents with a transform error", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: z.object({
        title: z.string(),
      }),
      sources: path.join(__dirname, "./__tests__/sources/posts/*.md"),
      transform: (doc) => {
        throw new Error("Something went wrong");
        return doc;
      },
    });

    const [collection] = await collect([posts], () => {});
    expect(collection?.files).toHaveLength(0);
  });
});
