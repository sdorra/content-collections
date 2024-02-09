import {
  createConfigurationReader,
  Options as ConfigurationOptions,
  defaultConfigName,
} from "./configurationReader";
import { createCollector } from "./collector";
import { Modification } from "./types";
import { createWriter } from "./writer";
import { createTransformer } from "./transformer";
import { isDefined } from "./utils";
import { createSynchronizer } from "./synchronizer";
import path from "node:path";
import { createWatcher } from "./watcher";
import { Events, createEmitter } from "./events";
import { createCache } from "./cache";

export type BuilderEvents = {
  "builder:start": {
    startedAt: number;
  };
  "builder:end": {
    startedAt: number;
    endedAt: number;
  };
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
  const configuration = await readConfiguration(configurationPath, options);
  const baseDirectory = path.dirname(configurationPath);
  const directory = resolveOutputDir(baseDirectory, options);

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

  const cache = await createCache(configuration.cache, baseDirectory);
  const transform = createTransformer(emitter, cache);

  async function sync(modification: Modification, filePath: string) {
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
    on: emitter.on,
  };
}

export type Builder = Awaited<ReturnType<typeof createBuilder>>;
