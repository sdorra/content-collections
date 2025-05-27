import { AsyncLocalStorage } from "node:async_hooks";
import { Emitter } from "src/events";
import { Modification } from "src/types";

export type MetaBase = {
  id: string;
};

export type RawDocument<TMeta extends MetaBase> = {
  _meta: TMeta;
  data: Record<string, unknown>;
};

export type Watcher = {
  unsubscribe: () => Promise<void>;
};

export type SourceContext = {
  baseDirectory: string;
  emitter: Emitter;
};

export type SyncFn = (modification: Modification, path: string) => Promise<unknown>;

export type Source<TMeta extends MetaBase> = {
  documents: () => Promise<RawDocument<TMeta>[]>;
  watch: (sync: SyncFn) => Promise<Watcher | null>;
};

const sourceContextStorage = new AsyncLocalStorage<SourceContext>();

export function withSourceContext<T>(
  context: SourceContext,
  callback: () => T,
): T {
  return sourceContextStorage.run(context, callback);
}

export function sourceContext(): SourceContext {
  const ctx = sourceContextStorage.getStore();
  if (!ctx) {
    throw new Error("Source context is not available. Ensure you are using withSourceContext.");
  }
  return ctx;
}
