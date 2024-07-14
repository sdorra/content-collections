import {
  createConfigurationReader,
  Options as ConfigurationOptions,
  defaultConfigName,
  InternalConfiguration,
} from "./configurationReader";
import { createCollector } from "./collector";
import { Modification } from "./types";
import { createWriter } from "./writer";
import { createTransformer } from "./transformer";
import { isDefined } from "./utils";
import { createSynchronizer } from "./synchronizer";
import path from "node:path";
import { createWatcher, Watcher } from "./watcher";
import { Emitter, Events, createEmitter } from "./events";
import { createCacheManager } from "./cache";

export type BuilderEvents = {
  "builder:start": {
    startedAt: number;
  };
  "builder:end": {
    startedAt: number;
    endedAt: number;
  };
  "builder:config-changed": {};
};

type Options = ConfigurationOptions & {
  outputDir?: string;
};

function resolveOutputDir(baseDirectory: string, options: Options) {
  if (options.outputDir) {
    return options.outputDir;
  }
  return path.join(baseDirectory, ".content-collections", "generated");
}

export async function createBuilder(
  configurationPath: string,
  options: Options = {
    configName: defaultConfigName,
  }
) {
  const emitter = createEmitter<Events>();

  const readConfiguration = createConfigurationReader();
  const baseDirectory = path.dirname(configurationPath);
  const directory = resolveOutputDir(baseDirectory, options);

  let internalBuilder = await createInternalBuilder(
    emitter,
    baseDirectory,
    directory,
    await readConfiguration(configurationPath, options)
  );

  let watcher: Watcher | undefined = undefined;

  emitter.on("builder:config-changed", async () => {

    await watcher?.unsubscribe();

    internalBuilder = await createInternalBuilder(
      emitter,
      baseDirectory,
      directory,
      await readConfiguration(configurationPath, options)
    );

    if (watcher) {
      watcher = await internalBuilder.watch();
    }

    await internalBuilder.build();
  });

  return {
    build: () => internalBuilder.build(),
    sync: (modification: Modification, filePath: string) =>
      internalBuilder.sync(modification, filePath),
    watch: async () => {
      watcher = await internalBuilder.watch();

      return {
        // TODO: find a better way for the test
        get paths() {
          // @ts-ignore - workaround to fix text
          return watcher?.paths;
        },
        unsubscribe: async () => {
          if (watcher) {
            await watcher.unsubscribe();
          }
        },
      };
    },
    on: emitter.on,
  };
}

export async function createInternalBuilder(
  emitter: Emitter,
  baseDirectory: string,
  directory: string,
  configuration: InternalConfiguration
) {
  // TODO: we should not collect files before the user has a chance to register listeners
  const collector = createCollector(emitter, baseDirectory);
  const writer = await createWriter(directory);

  const [resolved] = await Promise.all([
    collector.collect(configuration.collections),
    writer.createJavaScriptFile(configuration),
    writer.createTypeDefinitionFile(configuration),
  ]);

  const synchronizer = createSynchronizer(
    collector.collectFile,
    resolved,
    baseDirectory
  );

  const cacheManager = await createCacheManager(
    baseDirectory,
    configuration.checksum
  );
  const transform = createTransformer(emitter, cacheManager);

  async function sync(modification: Modification, filePath: string) {
    // check if filepath is the configuration file
    if (path.resolve(filePath) === path.resolve(configuration.path)) {
      emitter.emit("builder:config-changed", {});
      return false;
    }

    if (modification === "delete") {
      return synchronizer.deleted(filePath);
    }
    return synchronizer.changed(filePath);
  }

  async function build() {
    const startedAt = Date.now();
    emitter.emit("builder:start", {
      startedAt,
    });

    const collections = await transform(resolved);
    await writer.createDataFiles(collections);

    const pendingOnSuccess = collections
      .filter((collection) => Boolean(collection.onSuccess))
      .map((collection) =>
        collection.onSuccess?.(collection.documents.map((doc) => doc.document))
      );

    await Promise.all(pendingOnSuccess.filter(isDefined));

    emitter.emit("builder:end", {
      startedAt,
      endedAt: Date.now(),
    });
  }

  async function watch() {
    const paths = resolved.map((collection) =>
      path.join(baseDirectory, collection.directory)
    );
    const watcher = await createWatcher(emitter, paths, sync, build);
    return watcher;
  }

  return {
    sync,
    build,
    watch,
  };
}

export type Builder = Awaited<ReturnType<typeof createBuilder>>;
