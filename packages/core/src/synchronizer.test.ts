import { describe, it, expect } from "vitest";
import { createSynchronizer } from "./synchronizer";
import { CollectionFile } from "./types";

describe("synchronizer", () => {
  async function noopCollectionFileReader(): Promise<CollectionFile | null> {
    return null;
  }

  function createCollectionFileReader(collectionFile: CollectionFile) {
    return async (_: string, filePath: string) => {
      if (filePath !== collectionFile.path) {
        return null;
      }

      return collectionFile;
    };
  }

  it("should add new file", async () => {
    const collection = {
      directory: "content",
      include: "**/*.md",
      files: [],
    };

    const synchronizer = createSynchronizer(
      createCollectionFileReader({
        data: {},
        body: "changed",
        path: "new.md",
      }),
      [collection]
    );
    expect(await synchronizer.changed("content/new.md")).toBe(true);

    expect(collection.files.length).toBe(1);
  });

  it("should delete file", () => {
    const collection = {
      directory: "content",
      include: "**/*.md",
      files: [
        {
          data: {},
          body: "",
          path: "new.md",
        },
      ],
    };

    const synchronizer = createSynchronizer(noopCollectionFileReader, [
      collection,
    ]);
    synchronizer.deleted("content/new.md");

    expect(collection.files.length).toBe(0);
  });

  it("should change file", async () => {
    const collection = {
      directory: "content",
      include: "**/*.md",
      files: [
        {
          data: {},
          body: "",
          path: "new.md",
        },
      ],
    };

    const synchronizer = createSynchronizer(
      createCollectionFileReader({
        data: {},
        body: "changed",
        path: "new.md",
      }),
      [collection]
    );

    expect(await synchronizer.changed("content/new.md")).toBe(true);
    expect(collection.files[0]?.body).toBe("changed");
  });

  it("should not add file, if path is not in collection directory", async () => {
    const collection = {
      directory: "content",
      include: "**/*.md",
      files: [],
    };

    const synchronizer = createSynchronizer(
      createCollectionFileReader({
        data: {},
        body: "changed",
        path: "other/new.md",
      }),
      [collection]
    );
    expect(await synchronizer.changed("other/new.md")).toBe(false);

    expect(collection.files.length).toBe(0);
  });

  it("should not add file, if path is not included", async () => {
    const collection = {
      directory: "content",
      include: "**/*.md",
      files: [],
    };

    const synchronizer = createSynchronizer(
      createCollectionFileReader({
        data: {},
        body: "changed",
        path: "content/new.html",
      }),
      [collection]
    );
    expect(await synchronizer.changed("content/new.html")).toBe(false);

    expect(collection.files.length).toBe(0);
  });

  it("should not delete file, if path is not in collection directory", () => {
    const collection = {
      directory: "content",
      include: "**/*.md",
      files: [
        {
          data: {},
          body: "",
          path: "new.md",
        },
      ],
    };

    const synchronizer = createSynchronizer(noopCollectionFileReader, [
      collection,
    ]);
    synchronizer.deleted("other/new.md");

    expect(collection.files.length).toBe(1);
  });

  it("should not delete file, if path is not included", () => {
    const collection = {
      directory: "content",
      include: "**/*.md",
      files: [
        {
          data: {},
          body: "",
          path: "new.md",
        },
      ],
    };

    const synchronizer = createSynchronizer(noopCollectionFileReader, [
      collection,
    ]);
    synchronizer.deleted("content/new.html");

    expect(collection.files.length).toBe(1);
  });

  it("should not sync file, if file could not be read", async () => {
    const collection = {
      directory: "content",
      include: "**/*.md",
      files: [],
    };

    const synchronizer = createSynchronizer(
      noopCollectionFileReader,
      [collection]
    );

    expect(await synchronizer.changed("content/new.md")).toBe(false);
    expect(collection.files.length).toBe(0);
  });
});
