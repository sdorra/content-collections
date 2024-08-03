import * as watcher from "@parcel/watcher";
import { Modification } from "./types";
import { Emitter } from "./events";
import { removeChildPaths } from "./utils";
import { dirname, resolve } from "node:path";

export type WatcherEvents = {
  // TODO: rename to document-changed
  "watcher:file-changed": {
    filePath: string;
    modification: Modification;
  };
  "watcher:config-changed": {
    filePath: string;
    modification: Modification;
  };
  "watcher:subscribe-error": {
    paths: Array<string>;
    error: Error;
  };
};

type SyncFn = (modification: Modification, path: string) => Promise<boolean>;
type BuildFn = () => Promise<void>;

export async function createWatcher(
  emitter: Emitter,
  configPaths: Array<string>,
  paths: Array<string>,
  sync: SyncFn,
  build: BuildFn
) {
  const resolvedConfigPaths = configPaths.map((p) => resolve(p));

  const onChange: watcher.SubscribeCallback = async (error, events) => {
    if (error) {
      emitter.emit("watcher:subscribe-error", {
        paths,
        error,
      });
      return;
    }

    let rebuild = false;

    for (const event of events) {
      if (resolvedConfigPaths.includes(event.path)) {
        emitter.emit("watcher:config-changed", {
          filePath: event.path,
          modification: event.type,
        });
        rebuild = true;
      } else if (await sync(event.type, event.path)) {
        emitter.emit("watcher:file-changed", {
          filePath: event.path,
          modification: event.type,
        });
        rebuild = true;
      }
    }

    if (rebuild) {
      await build();
    }
  };

  const subscriptions = await Promise.all(
    removeChildPaths([
      ...paths.map((p) => resolve(p)),
      ...resolvedConfigPaths.map(dirname),
    ]).flatMap((path) => watcher.subscribe(path, onChange))
  );

  return {
    unsubscribe: async () => {
      await Promise.all(
        subscriptions.map((subscription) => subscription.unsubscribe())
      );
      return;
    },
  };
}

export type Watcher = Awaited<ReturnType<typeof createWatcher>>;
