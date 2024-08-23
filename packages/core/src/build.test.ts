import { describe, it, expect, beforeEach } from "vitest";
import { createEmitter, Emitter, Events } from "./events";
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { InternalConfiguration } from "./configurationReader";
import { build, createBuildContext } from "./build";
import { tmpdirTest } from "./__tests__/tmpdir";
import z from "zod";
import { AnyCollection } from "./config";

describe("createBuildContext", () => {
  it("should create a build context", async () => {
    const configuration: InternalConfiguration = {
      checksum: "checksum",
      collections: [
        {
          name: "posts",
          typeName: "Post",
          directory: "posts",
          include: ["*.md"],
          parser: "frontmatter",
          schema: {
            title: z.string(),
          },
        },
      ],
      path: path.join(__dirname, "__tests__", "content-collection-config.mjs"),
      inputPaths: [path.join(__dirname, "__tests__", "content")],
    };

    const emitter = createEmitter();
    const outputDirectory = "output";
    const baseDirectory = path.join(__dirname, "__tests__");

    const context = await createBuildContext({
      emitter,
      configuration,
      baseDirectory,
      outputDirectory,
    });

    expect(context).toBeDefined();
    expect(context.configuration).toBe(configuration);
    expect(context.emitter).toBe(emitter);

    expect(context.writer).toBeDefined();
    expect(context.resolved).toBeDefined();
    expect(context.cacheManager).toBeDefined();
    expect(context.transform).toBeDefined();
    expect(context.synchronizer).toBeDefined();
  });
});

describe("build", () => {
  const baseDirectory = path.join(__dirname, "__tests__");

  const posts: AnyCollection = {
    name: "posts",
    typeName: "Post",
    directory: "sources/posts",
    include: "**/*.md(x)?",
    parser: "frontmatter",
    schema: {
      title: z.string(),
    },
  };

  const authors: AnyCollection = {
    name: "authors",
    typeName: "Author",
    directory: "sources/authors",
    include: "**/*.md(x)?",
    parser: "frontmatter",
    schema: {
      displayName: z.string(),
    },
  };

  function createConfiguration(
    outputDir: string,
    ...collections: Array<AnyCollection>
  ): InternalConfiguration {
    return {
      checksum: "checksum",
      collections,
      path: path.join(outputDir, "content-collection-config.mjs"),
      inputPaths: [path.join(baseDirectory, "content-collections.ts")],
      generateTypes: true,
    };
  }

  let emitter: Emitter = createEmitter();

  beforeEach(() => {
    emitter = createEmitter();
  });

  async function doBuild(tmpdir: string, ...collection: Array<AnyCollection>) {
    const configuration = createConfiguration(tmpdir, ...collection);
    const context = await createBuildContext({
      emitter,
      configuration,
      baseDirectory,
      outputDirectory: tmpdir,
    });

    await build(context);
  }

  function writeLengthOnSuccess(tmpdir: string, filename: string) {
    return async (documents: Array<unknown>) => {
      await fs.writeFile(
        path.join(tmpdir, filename),
        JSON.stringify(documents.length),
        "utf-8"
      );
    };
  }

  tmpdirTest("should build", async ({ tmpdir }) => {
    await doBuild(tmpdir, posts);

    const { allPosts } = await import(path.resolve(tmpdir, "index.js"));
    expect(allPosts.length).toBe(1);
  });

  tmpdirTest("should call onSuccess", async ({ tmpdir }) => {
    const postsWithOnSuccess: AnyCollection = {
      ...posts,
      onSuccess: writeLengthOnSuccess(tmpdir, "posts.length"),
    };

    const authorsWithOnSuccess: AnyCollection = {
      ...authors,
      onSuccess: writeLengthOnSuccess(tmpdir, "authors.length"),
    };

    await doBuild(tmpdir, postsWithOnSuccess, authorsWithOnSuccess);

    const { allPosts, allAuthors } = await import(
      path.resolve(tmpdir, "index.js")
    );

    expect(allPosts.length).toBe(1);
    const postsLength = await fs.readFile(
      path.join(tmpdir, "posts.length"),
      "utf-8"
    );
    expect(postsLength).toBe("1");

    expect(allAuthors.length).toBe(1);
    const authorsLength = await fs.readFile(
      path.join(tmpdir, "authors.length"),
      "utf-8"
    );
    expect(authorsLength).toBe("1");
  });

  tmpdirTest("should emit build:start and build:end", async ({ tmpdir }) => {
    const events: Array<string> = [];

    emitter.on("builder:start", (event) => {
      events.push("builder:start");
      expect(event.startedAt).toBeDefined();
    });
    emitter.on("builder:end", (event) => {
      events.push("builder:end");
      expect(event.startedAt).toBeDefined();
      expect(event.endedAt).toBeDefined();
    });

    await doBuild(tmpdir, posts);

    expect(events).toEqual(["builder:start", "builder:end"]);
  });

  tmpdirTest(
    "should report some statistics on build:end",
    async ({ tmpdir }) => {
      const events: Array<Events["builder:end"]> = [];

      emitter.on("builder:end", (event) => {
        events.push(event);
      });

      await doBuild(tmpdir, posts, authors);

      const event = events[0];
      if (!event) {
        throw new Error("Event is undefined");
      }

      expect(event.stats).toBeDefined();
      expect(event.stats.collections).toBe(2);
      expect(event.stats.documents).toBe(2);
    }
  );

  tmpdirTest("should create type definition file", async ({ tmpdir }) => {
    await doBuild(tmpdir, posts);

    const typeDefinition = await fs.readFile(
      path.join(tmpdir, "index.d.ts"),
      "utf-8"
    );

    expect(typeDefinition).toContain("export type Post ");
  });

  tmpdirTest("should not create type definition file", async ({ tmpdir }) => {
    const configuration = createConfiguration(tmpdir, posts);
    configuration.generateTypes = false;


    const context = await createBuildContext({
      emitter,
      configuration,
      baseDirectory,
      outputDirectory: tmpdir,
    });

    await build(context);

    const typeDefinition = existsSync(path.join(tmpdir, "index.d.ts"));
    expect(typeDefinition).toBe(false);
  });

  tmpdirTest("should create barrel file", async ({ tmpdir }) => {
    await doBuild(tmpdir, posts);

    const js = await fs.readFile(path.join(tmpdir, "index.js"), "utf-8");

    expect(js).toContain("allPosts");
  });

  tmpdirTest("should create data files", async ({ tmpdir }) => {
    await doBuild(tmpdir, posts, authors);


    const allPosts = existsSync(path.join(tmpdir, "allPosts.js"));
    expect(allPosts).toBe(true);

    const allAuthors = existsSync(path.join(tmpdir, "allAuthors.js"));
    expect(allAuthors).toBe(true);
  });

  tmpdirTest("should create ouput directory", async ({ tmpdir }) => {
    const output = path.join(tmpdir, "output");
    await doBuild(output, posts);

    const exists = existsSync(path.join(output, "index.js"));
    expect(exists).toBe(true);
  });

});
