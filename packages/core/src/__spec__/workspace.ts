import fs from "node:fs/promises";
import os from "node:os";
import { dirname, join } from "node:path";
import { test } from "vitest";
import { type Builder, createBuilder, createInternalBuilder } from "../builder";
import type { AnyConfiguration } from "../config";
import { defaultConfigName } from "../configurationReader";
import { createEmitter, type Emitter } from "../events";
import type { GetCollectionNames, GetTypeByName } from "../types";
import { generateArrayConstName, generateSingletonConstName } from "../utils";
import type { Watcher } from "../watcher";

function isTemplateStringArray(input: any): input is TemplateStringsArray {
  // @ts-expect-error not yet typed
  return Array.isArray(input) && input.raw !== undefined;
}

function workspaceBuilder(directory: string, emitter: Emitter) {
  let configurationPath: string;
  let configuration: AnyConfiguration | string;
  const files: Record<string, string> = {};

  function createContent(input: TemplateStringsArray | string) {
    const content = typeof input === "string" ? input : input.join("");
    // remove identation and remove top blank lines
    return content.replace(/^ +/gm, "").trimStart();
  }

  function file(relativePath: string, content: TemplateStringsArray | string) {
    files[relativePath] = createContent(content);
  }

  async function createFile(file: [string, string]) {
    const [relativePath, content] = file;
    const absolutePath = join(directory, relativePath);
    await fs.mkdir(dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, content, { encoding: "utf-8" });
  }

  let counter = -1;

  async function resolveConfiguration(): Promise<AnyConfiguration | null> {
    if (typeof configuration !== "string") {
      return configuration;
    }

    // For string/template configurations, load the compiled config output that the builder produced.
    const compiledConfig = join(directory, ".content-collections/cache", defaultConfigName);
    try {
      const module = await import(`${compiledConfig}?t=${Date.now()}&c=${counter}`);
      return module.default as AnyConfiguration;
    } catch {
      return null;
    }
  }

  async function resolveExportName(collectionName: string): Promise<string> {
    const cfg = await resolveConfiguration();
    const defined = cfg?.collections?.find((c: any) => c?.name === collectionName);
    if (defined?.type === "singleton") {
      return generateSingletonConstName(defined.typeName);
    }
    return generateArrayConstName(collectionName);
  }

  async function readCollectionFromIndex(collection: string) {
    const indexFile = join(
      directory,
      // TODO: hardcoded path, should be a constant
      ".content-collections/generated/index.js",
    );

    const collections = await import(
      `${indexFile}?t=${Date.now()}&c=${counter}`
    );
    const name = await resolveExportName(collection);

    return collections[name];
  }

  async function readCollectionFromDataFile(collection: string) {
    const name = await resolveExportName(collection);
    const dataFile = join(
      directory,
      // TODO: hardcoded path, should be a constant
      `.content-collections/generated/${name}.js`,
    );

    const imported = await import(`${dataFile}?t=${Date.now()}&c=${counter}`);
    return imported.default;
  }

  async function collection(collection: string) {
    counter++;
    // TODO: ugly hack to avoid import caching of index file
    // The cache bust on the index file does not work,
    // because node caches the import of the data file and that url does not change.
    let col;
    if (counter > 0) {
      col = await readCollectionFromDataFile(collection);
    } else {
      col = await readCollectionFromIndex(collection);
    }

    return col;
  }

  function path(relativePath: string) {
    const absolutePath = join(directory, relativePath);

    return {
      write: async (content: TemplateStringsArray | string) => {
        await fs.mkdir(dirname(absolutePath), { recursive: true });
        await fs.writeFile(absolutePath, createContent(content), {
          encoding: "utf-8",
        });
      },
      unlink: () => fs.unlink(absolutePath),
    };
  }

  let builder: Builder;

  function watch() {
    return builder.watch();
  }

  let outputDir: string | undefined = undefined;

  async function build() {
    await Promise.all(Object.entries(files).map(createFile));

    const options = {
      configName: defaultConfigName,
    };

    if (outputDir) {
      // @ts-expect-error not typed yet
      options.outputDir = join(directory, outputDir);
    }

    const cfg = join(directory, configurationPath);
    if (typeof configuration === "string") {
      builder = await createBuilder(cfg, options, emitter);
    } else {
      builder = await createInternalBuilder(
        {
          ...configuration,
          // TODO: do we need a better way here to simulate internal configuration?
          path: cfg,
          inputPaths: [cfg],
          generateTypes: true,
          checksum: "",
        },
        directory,
        options,
        emitter,
      );
    }

    await builder.build();

    return {
      configurationPath: cfg,
      builder,
      collection,
    };
  }

  type Options = {
    configurationPath?: string;
    outputDir?: string;
  };

  function createWorkspace<
    TConfiguration extends AnyConfiguration | TemplateStringsArray | string,
  >(
    inputConfiguration: TConfiguration,
    options: Options = {},
  ): TConfiguration extends AnyConfiguration
    ? Workspace<TConfiguration>
    : Workspace<string> {
    const relativePath = options.configurationPath || "content-collections.ts";
    outputDir = options.outputDir;

    configurationPath = relativePath;

    if (typeof inputConfiguration === "string") {
      configuration = inputConfiguration;
      file(relativePath, inputConfiguration);
    } else if (isTemplateStringArray(inputConfiguration)) {
      configuration = createContent(inputConfiguration);
      file(relativePath, configuration);
    } else {
      configuration = inputConfiguration;
    }

    return {
      file,
      build,
      path,
      watch,
    } satisfies Workspace<string> as any;
  }

  return createWorkspace;
}

export type Workspace<TConfig extends AnyConfiguration | string> = {
  file: (relativePath: string, content: string) => void;
  build: () => Promise<Executor<TConfig>>;
  watch: () => Promise<Watcher>;
  path: (relativePath: string) => {
    write: (content: string | TemplateStringsArray) => Promise<void>;
    unlink: () => Promise<void>;
  };
};

type CollectionNameOrString<TConfig extends AnyConfiguration | string> =
  TConfig extends AnyConfiguration ? GetCollectionNames<TConfig> : string;

type UnknownDocument = Record<string, any>;

type GeneratedReturnType<TConfig, TCollection> =
  TConfig extends AnyConfiguration ? GetTypeByName<TConfig, TCollection> : UnknownDocument;

export type Executor<TConfig extends AnyConfiguration | string> = {
  configurationPath: string;
  collection: <TCollection extends CollectionNameOrString<TConfig>>(
    name: TCollection,
  ) => Promise<Array<GeneratedReturnType<TConfig, TCollection>>>;
};

export type WorkspaceBuilder = ReturnType<typeof workspaceBuilder>;

export interface WorkspaceFixture {
  emitter: Emitter;
  workspacePath: string;
  workspaceBuilder: WorkspaceBuilder;
}

async function createWorkspaceDirectory() {
  const tmpdir = os.tmpdir();

  const directory = await fs.mkdtemp(join(tmpdir, "content-collections-"));
  // we need to call realpath, because mktemp returns /var/folders/... on macOS
  // but the paths which are returned by the watcher are /private/var/folders/...
  const directoryPath = await fs.realpath(directory);

  return directoryPath;
}

export const workspaceTest = test.extend<WorkspaceFixture>({
  emitter: async ({}, use) => {
    const emitter = createEmitter();
    await use(emitter);
  },
  workspacePath: async ({}, use) => {
    const workspacePath = await createWorkspaceDirectory();
    await use(workspacePath);
    await fs.rm(workspacePath, { recursive: true });
  },
  workspaceBuilder: async ({ workspacePath, emitter }, use) => {
    await use(workspaceBuilder(workspacePath, emitter));
  },
});
