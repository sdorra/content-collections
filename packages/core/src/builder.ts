import path from "node:path";
import { build, BuildEvents, createBuildContext } from "./build";
import {
  Options as ConfigurationOptions,
  createConfigurationReader,
  defaultConfigName,
} from "./configurationReader";
import { type Emitter, createEmitter } from "./events";
import { Modification } from "./types";
import { createWatcher, Watcher } from "./watcher";

// TODO: get rid of namespaces at all
export type BuilderEvents = BuildEvents & {
  "builder:created": {
    createdAt: number;
    configurationPath: string;
    outputDirectory: string;
  };
  // events namespaced with watcher for backward compatibility

  // TODO: rename to document-changed
  "watcher:file-changed": {
    filePath: string;
    modification: Modification;
  };
  "watcher:config-changed": {
    filePath: string;
    modification: Modification;
  };
  "watcher:config-reload-error": {
    error: Error;
    configurationPath: string;
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

export class ConfigurationReloadError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export async function createBuilder(
  configurationPath: string,
  options: Options = {
    configName: defaultConfigName,
  },
  emitter: Emitter = createEmitter(),
) {
  const readConfiguration = createConfigurationReader();
  const baseDirectory = path.dirname(configurationPath);
  const outputDirectory = resolveOutputDir(baseDirectory, options);

  emitter.emit("builder:created", {
    createdAt: Date.now(),
    configurationPath,
    outputDirectory: outputDirectory,
  });

  let configuration = await readConfiguration(configurationPath, options);

  let watcher: Watcher | null = null;
  let context = await createBuildContext({
    emitter,
    baseDirectory,
    outputDirectory,
    configuration,
  });

  async function sync(modification: Modification, filePath: string) {
    if (configuration.inputPaths.includes(filePath)) {
      if (await onConfigurationChange()) {
        emitter.emit("watcher:config-changed", {
          filePath,
          modification,
        });

        await build(context);
        return true;
      }
    } else {
      if (await onFileChange(modification, filePath)) {
        emitter.emit("watcher:file-changed", {
          filePath,
          modification,
        });

        await build(context);
        return true;
      }
    }
    return false;
  }

  async function onConfigurationChange() {
    try {
      configuration = await readConfiguration(configurationPath, options);
    } catch (error) {
      emitter.emit("watcher:config-reload-error", {
        error: new ConfigurationReloadError(
          `Failed to reload configuration: ${error}`,
        ),
        configurationPath,
      });
      return false;
    }

    if (watcher) {
      await watcher.unsubscribe();
    }

    context = await createBuildContext({
      emitter,
      baseDirectory,
      outputDirectory,
      configuration,
    });

    if (watcher) {
      watcher = await createWatcher(
        emitter,
        baseDirectory,
        configuration,
        sync,
      );
    }

    return true;
  }

  async function onFileChange(modification: Modification, filePath: string) {
    const { synchronizer } = context;

    if (modification === "delete") {
      return synchronizer.deleted(filePath);
    } else {
      return synchronizer.changed(filePath);
    }
  }

  async function watch() {
    watcher = await createWatcher(emitter, baseDirectory, configuration, sync);

    return {
      unsubscribe: async () => {
        if (watcher) {
          await watcher.unsubscribe();
        }
      },
    };
  }

  return {
    build: () => build(context),
    sync,
    watch,
    on: emitter.on,
  };
}

export type Builder = Awaited<ReturnType<typeof createBuilder>>;
