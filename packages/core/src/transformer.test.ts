import { describe, it, expect, beforeEach } from "vitest";
import { z } from "zod";
import {
  TransformError,
  ResolvedCollection,
  createTransformer,
} from "./transformer";
import { CollectionFile } from "./types";
import { Meta, defineCollection } from "./config";
import { Events, createEmitter } from "./events";
import { CacheManager } from "./cache";

const noopCacheManager: CacheManager = {
  cache: () => {
    return {
      cacheFn: async (input, fn) => {
        return fn(input);
      },
      tidyUp: async () => {},
    };
  },
  flush: async () => {},
};

const sampleOne: CollectionFile = {
  data: {
    name: "One",
    content: "# One",
  },
  path: "001.md",
};

const sampleTwo: CollectionFile = {
  data: {
    name: "Two",
    content: "# Two",
  },
  path: "002.md",
};

const sampleThree: CollectionFile = {
  data: {
    name: "Three",
    content: "# Three",
  },
  path: "nested/003.md",
};

const sampleFour: CollectionFile = {
  data: {
    name: "Four",
    content: "# Four",
  },
  path: "nested/index.md",
};

const sampleWithoutContent: CollectionFile = {
  data: {
    name: "Four",
  },
  path: "nested/index.md",
};

const firstPost: CollectionFile = {
  data: {
    title: "First post",
    author: "trillian",
    content: "# First post",
  },
  path: "first.md",
};

const invalidPost: CollectionFile = {
  data: {
    fn: () => {},
  },
  path: "first.md",
};

const authorTrillian: CollectionFile = {
  data: {
    ref: "trillian",
    displayName: "Tricia Marie McMillan",
    content: "# Trillian",
  },
  path: "trillian.md",
};

describe("transform", () => {
  let emitter = createEmitter<Events>();

  beforeEach(() => {
    emitter = createEmitter<Events>();
  });

  function createSampleCollection(
    ...files: Array<CollectionFile>
  ): ResolvedCollection {
    return {
      name: "sample",
      typeName: "Sample",
      parser: "frontmatter",
      schema: {
        name: z.string(),
      },
      directory: "tests",
      include: "*.md",
      files,
    };
  }

  function createNestedSampleCollection(
    ...files: Array<CollectionFile>
  ): ResolvedCollection {
    return {
      name: "sample",
      typeName: "Sample",
      parser: "frontmatter",
      schema: {
        name: z.string(),
      },
      directory: "tests",
      include: "**/*.md",
      files,
    };
  }

  it("should create two document", async () => {
    const [collection] = await createTransformer(
      emitter,
      noopCacheManager
    )([createSampleCollection(sampleOne, sampleTwo)]);

    expect(collection?.documents).toHaveLength(2);
  });

  it("should create document with meta", async () => {
    const [collection] = await createTransformer(
      emitter,
      noopCacheManager
    )([createNestedSampleCollection(sampleThree)]);

    const meta: Meta = collection?.documents[0].document._meta;
    if (!meta) {
      throw new Error("No meta");
    }

    expect(meta.filePath).toBe("nested/003.md");
    expect(meta.fileName).toBe("003.md");
    expect(meta.directory).toBe("nested");
    expect(meta.extension).toBe("md");
    expect(meta.path).toBe("nested/003");
  });

  it("should create document with meta for index files", async () => {
    const [collection] = await createTransformer(
      emitter,
      noopCacheManager
    )([createNestedSampleCollection(sampleFour)]);

    const meta: Meta = collection?.documents[0].document._meta;
    if (!meta) {
      throw new Error("No meta");
    }

    expect(meta.filePath).toBe("nested/index.md");
    expect(meta.fileName).toBe("index.md");
    expect(meta.directory).toBe("nested");
    expect(meta.extension).toBe("md");
    expect(meta.path).toBe("nested");
  });

  it("should parse documents data", async () => {
    const [collection] = await createTransformer(
      emitter,
      noopCacheManager
    )([createSampleCollection(sampleOne)]);

    expect(collection?.documents[0].document.name).toBe("One");
  });

  it("should transform document", async () => {
    const sample = defineCollection({
      name: "sample",
      schema: (z) => ({
        name: z.string(),
      }),
      directory: "tests",
      include: "*.md",
      transform: (document) => {
        return {
          ...document,
          test: "test",
          upperName: document.name.toUpperCase(),
        };
      },
    });

    const [collection] = await createTransformer(
      emitter,
      noopCacheManager
    )([
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
      schema: (z) => ({
        name: z.string(),
      }),
      directory: "tests",
      include: "*.md",
    });

    const [collection] = await createTransformer(
      emitter,
      noopCacheManager
    )([
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
      schema: (z) => ({
        title: z.string(),
        author: z.string(),
      }),
      directory: "tests",
      include: "*.md",
    });

    const authors = defineCollection({
      name: "authors",
      schema: (z) => ({
        ref: z.string(),
        displayName: z.string(),
      }),
      directory: "tests",
      include: "*.md",
    });

    const collections = await createTransformer(
      emitter,
      noopCacheManager
    )([
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
      schema: (z) => ({
        ref: z.string(),
        displayName: z.string(),
      }),
      directory: "tests",
      include: "*.md",
    });

    const posts = defineCollection({
      name: "posts",
      schema: (z) => ({
        title: z.string(),
        author: z.string(),
      }),
      directory: "tests",
      include: "*.md",
      transform: async (document, context) => {
        const author = await context
          .documents(authors)
          .find((a) => a.ref === document.author);
        return {
          ...document,
          author: author?.displayName,
        };
      },
    });

    const collections = await createTransformer(
      emitter,
      noopCacheManager
    )([
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
      schema: (z) => ({
        name: z.string(),
      }),
      directory: "tests",
      include: "*.md",
    });

    emitter.on("transformer:validation-error", (event) => {
      throw event.error;
    });

    await expect(
      createTransformer(
        emitter,
        noopCacheManager
      )([
        {
          ...posts,
          files: [firstPost],
        },
      ])
    ).rejects.toThrowError(/invalid_type/);
  });

  it("should throw if frontmatter document has no content", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: (z) => ({
        name: z.string(),
      }),
      directory: "tests",
      include: "*.md",
    });

    emitter.on("transformer:validation-error", (event) => {
      throw event.error;
    });

    await expect(
      createTransformer(
        emitter,
        noopCacheManager
      )([
        {
          ...posts,
          files: [sampleWithoutContent],
        },
      ])
    ).rejects.toThrowError(/invalid_type/);
  });

  it("should not throw if yaml document has no content", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: (z) => ({
        name: z.string(),
      }),
      directory: "tests",
      parser: "yaml",
      include: "*.yml",
    });

    const [collection] = await createTransformer(
      emitter,
      noopCacheManager
    )([
      {
        ...posts,
        files: [sampleWithoutContent],
      },
    ]);

    expect(collection?.documents).toHaveLength(1);
  });

  it("should capture validation error", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: (z) => ({
        name: z.string(),
      }),
      directory: "tests",
      include: "*.md",
    });

    const errors: Array<TransformError> = [];
    emitter.on("transformer:validation-error", (event) =>
      errors.push(event.error)
    );
    await createTransformer(
      emitter,
      noopCacheManager
    )([
      {
        ...posts,
        files: [firstPost],
      },
    ]);
    expect(errors[0]?.type).toBe("Validation");
  });

  it("should not hold invalid documents", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: (z) => ({
        name: z.string(),
      }),
      directory: "tests",
      include: "*.md",
    });

    const [collection] = await createTransformer(
      emitter,
      noopCacheManager
    )([
      {
        ...posts,
        files: [firstPost],
      },
    ]);
    expect(collection?.documents).toHaveLength(0);
  });

  it("should report an error if a collection is not registered", async () => {
    const authors = defineCollection({
      name: "authors",
      schema: (z) => ({
        ref: z.string(),
        displayName: z.string(),
      }),
      directory: "tests",
      include: "*.md",
    });

    const posts = defineCollection({
      name: "posts",
      schema: (z) => ({
        title: z.string(),
      }),
      directory: "tests",
      include: "*.md",
      transform: async (document, context) => {
        const allAuthors = await context.documents(authors);
        return {
          ...document,
          allAuthors,
        };
      },
    });

    const errors: Array<TransformError> = [];
    emitter.on("transformer:error", (event) => errors.push(event.error));
    await createTransformer(
      emitter,
      noopCacheManager
    )([
      {
        ...posts,
        files: [firstPost],
      },
    ]);
    expect(errors[0]?.type).toBe("Configuration");
  });

  it("should report an transform error", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: (z) => ({
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
    emitter.on("transformer:error", (event) => errors.push(event.error));

    await createTransformer(
      emitter,
      noopCacheManager
    )([
      {
        ...posts,
        files: [firstPost],
      },
    ]);
    expect(errors[0]?.type).toBe("Transform");
  });

  it("should exclude documents with a transform error", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: (z) => ({
        title: z.string(),
      }),
      directory: "tests",
      include: "*.md",
      transform: (doc) => {
        throw new Error("Something went wrong");
        return doc;
      },
    });

    const [collection] = await createTransformer(
      emitter,
      noopCacheManager
    )([
      {
        ...posts,
        files: [firstPost],
      },
    ]);
    expect(collection?.documents).toHaveLength(0);
  });

  it("should report an result error, if the transform result is not serializable", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: (z) => ({
        title: z.string(),
      }),
      transform: (doc) => {
        return {
          ...doc,
          fn: () => {},
        };
      },
      directory: "tests",
      include: "*.md",
    });

    const errors: Array<TransformError> = [];
    emitter.on("transformer:result-error", (event) => errors.push(event.error));

    await createTransformer(
      emitter,
      noopCacheManager
    )([
      // @ts-expect-error posts is invalid
      {
        ...posts,
        files: [firstPost],
      },
    ]);
    expect(errors[0]?.type).toBe("Result");
  });

  it("should report an result error, if the schema result is not serializable", async () => {
    const posts = defineCollection({
      name: "posts",
      parser: "json",
      schema: (z) => ({
        fn: z.function(),
      }),
      directory: "tests",
      include: "*.md",
    });

    const errors: Array<TransformError> = [];
    emitter.on("transformer:result-error", (event) => errors.push(event.error));

    await createTransformer(
      emitter,
      noopCacheManager
    )([
      // @ts-expect-error posts is invalid
      {
        ...posts,
        files: [invalidPost],
      },
    ]);
    expect(errors[0]?.type).toBe("Result");
  });

  it("should pass the name of the collection to the context object", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: (z) => ({
        name: z.string(),
      }),
      directory: "tests",
      include: "*.md",
      transform: (doc, context) => {
        return {
          ...doc,
          collectionName: context.collection.name,
        };
      },
    });

    const [collection] = await createTransformer(
      emitter,
      noopCacheManager
    )([
      {
        ...posts,
        files: [sampleOne],
      },
    ]);

    expect(collection?.documents[0].document.collectionName).toBe("posts");
  });

  it("should pass the directory of the collection to the context object", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: (z) => ({
        name: z.string(),
      }),
      directory: "tests",
      include: "*.md",
      transform: (doc, context) => {
        return {
          ...doc,
          collectionDirectory: context.collection.directory,
        };
      },
    });

    const [collection] = await createTransformer(
      emitter,
      noopCacheManager
    )([
      {
        ...posts,
        files: [sampleOne],
      },
    ]);

    expect(collection?.documents[0].document.collectionDirectory).toBe("tests");
  });

  it("should access documents of the same collection", async () => {
    const posts = defineCollection({
      name: "posts",
      schema: (z) => ({
        name: z.string(),
      }),
      directory: "tests",
      include: "*.md",
      transform: async (doc, context) => {
        const docs = await context.collection.documents();
        return {
          ...doc,
          docs
        };
      },
    });

    const [collection] = await createTransformer(
      emitter,
      noopCacheManager
    )([
      {
        ...posts,
        files: [sampleOne, sampleTwo],
      },
    ]);

    expect(collection?.documents[0].document.docs).toHaveLength(2);
    expect(collection?.documents[0].document.docs[0].name).toBe("One");
    expect(collection?.documents[0].document.docs[1].name).toBe("Two");
  });
});
