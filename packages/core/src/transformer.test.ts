import { describe, it, expect } from "vitest";
import { z } from "zod";
import { TransformError, ResolvedCollection, transform } from "./transformer";
import { CollectionFile } from "./collect";
import { defineCollection } from ".";

const sampleOne: CollectionFile = {
  data: {
    name: "One",
  },
  body: "# One",
  path: "001.md",
};

const sampleTwo: CollectionFile = {
  data: {
    name: "Two",
  },
  body: "# Two",
  path: "002.md",
};

const firstPost: CollectionFile = {
  data: {
    title: "First post",
    author: "trillian",
  },
  body: "# First post",
  path: "first.md",
};

const authorTrillian: CollectionFile = {
  data: {
    ref: "trillian",
    displayName: "Tricia Marie McMillan",
  },
  body: "# Trillian",
  path: "trillian.md",
};

describe("transform", () => {
  function createSampleCollection(
    ...files: Array<CollectionFile>
  ): ResolvedCollection {
    return {
      name: "sample",
      typeName: "Sample",
      schema: z.object({
        name: z.string(),
      }),
      directory: "tests",
      include: "*.md",
      files,
    };
  }

  it("should create two document", async () => {
    const [collection] = await transform([
      createSampleCollection(sampleOne, sampleTwo),
    ]);

    expect(collection?.documents).toHaveLength(2);
  });

  it("should create document with meta", async () => {
    const [collection] = await transform([createSampleCollection(sampleOne)]);

    expect(collection?.documents[0].document._meta.path).toBe("001.md");
  });

  it("should parse documents data", async () => {
    const [collection] = await transform([createSampleCollection(sampleOne)]);

    expect(collection?.documents[0].document.name).toBe("One");
  });

  it("should transform document", async () => {
    const sample = defineCollection({
      name: "sample",
      schema: z.object({
        name: z.string(),
      }),
      directory: "tests",
      include: "*.md",
      transform: (_, document) => {
        return {
          ...document,
          test: "test",
          upperName: document.name.toUpperCase(),
        };
      },
    });

    const [collection] = await transform([
      {
        ...sample,
        files: [sampleOne],
      },
    ]);

    expect(collection?.documents[0].document.test).toBe("test");
    expect(collection?.documents[0].document.upperName).toBe("ONE");
  });

  it("should add the content to the document", async () => {
    const sample = defineCollection({
      name: "sample",
      schema: z.object({
        name: z.string(),
      }),
      directory: "tests",
      include: "*.md",
      transform: async (context, document) => {
        return {
          ...document,
          content: await context.content(),
        };
      },
    });

    const [collection] = await transform([
      {
        ...sample,
        files: [sampleOne],
      },
    ]);

    expect(collection?.documents[0]?.document.content.trim()).toBe("# One");
  });

  it("should collect with multiple collections", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: z.object({
        title: z.string(),
        author: z.string(),
      }),
      directory: "tests",
      include: "*.md",
    });

    const authors = defineCollection({
      name: "authors",
      schema: z.object({
        ref: z.string(),
        displayName: z.string(),
      }),
      directory: "tests",
      include: "*.md",
    });

    const collections = await transform([
      {
        ...posts,
        files: [firstPost],
      },
      {
        ...authors,
        files: [authorTrillian],
      },
    ]);
    expect(collections).toHaveLength(2);

    expect(collections[0]?.documents).toHaveLength(1);
    expect(collections[1]?.documents).toHaveLength(1);
  });

  it("should transform with collection references", async () => {
    const authors = defineCollection({
      name: "authors",
      schema: z.object({
        ref: z.string(),
        displayName: z.string(),
      }),
      directory: "tests",
      include: "*.md",
    });

    const posts = defineCollection({
      name: "posts",
      schema: z.object({
        title: z.string(),
        author: z.string(),
      }),
      directory: "tests",
      include: "*.md",
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

    const collections = await transform([
      {
        ...authors,
        files: [authorTrillian],
      },
      {
        ...posts,
        files: [firstPost],
      },
    ]);
    expect(collections[1]?.documents[0]?.document.author).toBe(
      "Tricia Marie McMillan"
    );
  });

  it("should throw if document validation fails", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: z.object({
        name: z.string(),
      }),
      directory: "tests",
      include: "*.md",
    });

    await expect(
      transform([
        {
          ...posts,
          files: [firstPost],
        },
      ])
    ).rejects.toThrowError(/invalid_type/);
  });

  it("should capture validation error", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: z.object({
        name: z.string(),
      }),
      directory: "tests",
      include: "*.md",
    });

    const errors: Array<TransformError> = [];
    await transform(
      [
        {
          ...posts,
          files: [firstPost],
        },
      ],
      (error) => errors.push(error)
    );
    expect(errors[0]?.type).toBe("Validation");
  });

  it("should not hold invalid documents", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: z.object({
        name: z.string(),
      }),
      directory: "tests",
      include: "*.md",
    });

    const [collection] = await transform(
      [
        {
          ...posts,
          files: [firstPost],
        },
      ],
      () => {}
    );
    expect(collection?.documents).toHaveLength(0);
  });

  it("should report an error if a collection is not registered", async () => {
    const authors = defineCollection({
      name: "authors",
      schema: z.object({
        ref: z.string(),
        displayName: z.string(),
      }),
      directory: "tests",
      include: "*.md",
    });

    const posts = defineCollection({
      name: "posts",
      schema: z.object({
        title: z.string(),
      }),
      directory: "tests",
      include: "*.md",
      transform: async (context, document) => {
        const allAuthors = await context.documents(authors);
        return {
          ...document,
          allAuthors,
        };
      },
    });

    const errors: Array<TransformError> = [];
    await transform(
      [
        {
          ...posts,
          files: [firstPost],
        },
      ],
      (error) => errors.push(error)
    );
    expect(errors[0]?.type).toBe("Configuration");
  });

  it("should report an transform error", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: z.object({
        title: z.string(),
      }),
      directory: "tests",
      include: "*.md",
      transform: (doc) => {
        throw new Error("Something went wrong");
        return doc;
      },
    });

    const errors: Array<TransformError> = [];
    await transform(
      [
        {
          ...posts,
          files: [firstPost],
        },
      ],
      (error) => errors.push(error)
    );
    expect(errors[0]?.type).toBe("Transform");
  });

  it("should exclude documents with a transform error", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: z.object({
        title: z.string(),
      }),
      directory: "tests",
      include: "*.md",
      transform: (doc) => {
        throw new Error("Something went wrong");
        return doc;
      },
    });

    const [collection] = await transform(
      [
        {
          ...posts,
          files: [firstPost],
        },
      ],
      () => {}
    );
    expect(collection?.documents).toHaveLength(0);
  });
});
