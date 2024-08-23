import * as watcher from "@parcel/watcher";
import { Modification } from "./types";
import { Emitter } from "./events";
import { isDefined, removeChildPaths } from "./utils";
import path, { dirname, resolve } from "node:path";

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
  sync: SyncFn
) {
  const onChange: watcher.SubscribeCallback = async (error, events) => {
    if (error) {
      emitter.emit("watcher:subscribe-error", {
        paths,
        error,
      });
      return;
    }

    for (const event of events) {
      await sync(event.type, event.path);
    }
  };

  const paths = removeChildPaths([
    ...configuration.collections
      .map((collection) => path.join(baseDirectory, collection.directory))
      .map((p) => resolve(p)),
    ...configuration.inputPaths.map((p) => dirname(p)),
  ]);

  const subscriptions = (
    await Promise.all(paths.map((path) => watcher.subscribe(path, onChange)))
  ).filter(isDefined); // in case of an subscription error, subscribe will return undefined

  emitter.emit("watcher:subscribed", {
    paths,
  });

  return {
    unsubscribe: async () => {
      if (!subscriptions || subscriptions.length === 0) {
        return;
      }

      await Promise.all(
        subscriptions.map((subscription) => subscription.unsubscribe())
      );

      emitter.emit("watcher:unsubscribed", {
        paths,
      });
      return;
    },
  };
}

export type Watcher = Awaited<ReturnType<typeof createWatcher>>;
