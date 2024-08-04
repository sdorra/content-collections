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
import { type Emitter, createEmitter } from "./events";
import { createCacheManager } from "./cache";

export type BuilderEvents = {
  "builder:created": {
    createdAt: number;
    configurationPath: string;
    outputDirectory: string;
  };
  "builder:start": {
    startedAt: number;
  };
  "builder:end": {
    startedAt: number;
    endedAt: number;
    stats: {
      collections: number;
      documents: number;
    },
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

type InternalBuilder = Awaited<ReturnType<typeof createInternalBuilder>>;

export async function createBuilder(
  configurationPath: string,
  options: Options = {
    configName: defaultConfigName,
  },
  emitter: Emitter = createEmitter()
) {
  const readConfiguration = createConfigurationReader();
  const baseDirectory = path.dirname(configurationPath);
  const directory = resolveOutputDir(baseDirectory, options);

  emitter.emit("builder:created", {
    createdAt: Date.now(),
    configurationPath,
    outputDirectory: directory,
  });

  let internalBuilder: InternalBuilder | null = null;
  let watcher: Watcher | null = null;

  const build = async () => {
    const builder = await useBuilder();
    return builder.build();
  };

  const useBuilder = async () => {
    if (internalBuilder === null) {
      internalBuilder = await createInternalBuilder(
        emitter,
        baseDirectory,
        directory,
        await readConfiguration(configurationPath, options),
        build
      );

      if (watcher) {
        watcher = await internalBuilder.watch();
      }
    }
    return internalBuilder;
  };

  emitter.on("watcher:config-changed", () => {
    watcher?.unsubscribe();
    internalBuilder = null;
  });

  return {
    build,
    sync: async (modification: Modification, filePath: string) => {
      if (!internalBuilder) {
        return false;
      }
      const builder = await useBuilder();
      return builder.sync(modification, filePath);
    },

    watch: async () => {
      const builder = await useBuilder();
      watcher = await builder.watch();

      return {
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

async function createInternalBuilder(
  emitter: Emitter,
  baseDirectory: string,
  directory: string,
  configuration: InternalConfiguration,
  buildFn: () => Promise<void>
) {
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

    const stats = collections.reduce((acc, collection) => {
      acc.collections++;
      acc.documents += collection.documents.length;
      return acc;
    }, {
      collections: 0,
      documents: 0
    });

    emitter.emit("builder:end", {
      startedAt,
      endedAt: Date.now(),
      stats
    });
  }

  async function watch() {
    const paths = resolved.map((collection) =>
      path.join(baseDirectory, collection.directory)
    );
    return await createWatcher(
      emitter,
      configuration.inputPaths,
      paths,
      sync,
      buildFn
    );
  }

  return {
    sync,
    build,
    watch,
  };
}

export type Builder = Awaited<ReturnType<typeof createBuilder>>;
