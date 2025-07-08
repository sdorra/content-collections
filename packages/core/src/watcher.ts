import chokidar from "chokidar";
import path, { dirname, resolve } from "node:path";
import { Emitter } from "./events";
import { Modification } from "./types";
import { isDefined, removeChildPaths, toError } from "./utils";

export type WatcherEvents = {
  "watcher:subscribe-error": {
    paths: Array<string>;
    error: Error;
  };
  "watcher:subscribed": {
    paths: Array<string>;
  };
  "watcher:unsubscribed": {
    paths: Array<string>;
  };
};

type SyncFn = (modification: Modification, path: string) => Promise<unknown>;

type WatchableCollection = {
  directory: string;
};

type WatcherConfiguration = {
  inputPaths: Array<string>;
  collections: Array<WatchableCollection>;
};

export async function createWatcher(
  emitter: Emitter,
  baseDirectory: string,
  configuration: WatcherConfiguration,
  sync: SyncFn,
) {
  const paths = removeChildPaths([
    ...configuration.collections
      .map((collection) => path.join(baseDirectory, collection.directory))
      .map((p) => resolve(p)),
    ...configuration.inputPaths.map((p) => dirname(p)),
  ]);

  const watcher = chokidar.watch(paths, {
    ignored: [
      /(^|[\/\\])\../, // ignore dotfiles
      /(^|[\/\\])node_modules([\/\\]|$)/, // ignore node_modules
    ],
    persistent: true,
    ignoreInitial: true, // ignore initial add events
  });

  // Convert chokidar events to the expected format
  const handleEvent = async (modification: Modification, filePath: string) => {
    try {
      await sync(modification, filePath);
    } catch (error) {
      emitter.emit("watcher:subscribe-error", {
        paths,
        error: toError(error),
      });
    }
  };

  watcher.on("add", (filePath) => handleEvent("create", filePath));
  watcher.on("change", (filePath) => handleEvent("update", filePath));
  watcher.on("unlink", (filePath) => handleEvent("delete", filePath));

  watcher.on("error", (error) => {
    emitter.emit("watcher:subscribe-error", {
      paths,
      error: toError(error),
    });
  });

  // Wait for watcher to be ready before emitting subscribed event
  await new Promise<void>((resolve, reject) => {
    watcher.on("ready", () => {
      emitter.emit("watcher:subscribed", {
        paths,
      });
      resolve();
    });
    watcher.on("error", reject);
  });

  return {
    unsubscribe: async () => {
      await watcher.close();
      emitter.emit("watcher:unsubscribed", {
        paths,
      });
    },
  };
}

export type Watcher = Awaited<ReturnType<typeof createWatcher>>;
