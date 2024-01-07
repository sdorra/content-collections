import { EventEmitter } from "node:events";
import { CollectError } from "./collector";
import { TransformError } from "./transformer";
import { AnyCollection } from "./config";
import { CollectionFile, Modification } from "./types";

type EventMap = Record<string, object>;

export type Events = {
  "build:start": {
    startedAt: number;
  };
  "build:end": {
    startedAt: number;
    endedAt: number;
  };
  "watch:file-changed": {
    filePath: string;
    modification: Modification;
  };
  "collector:read-error": {
    filePath: string;
    error: CollectError;
  };
  "transformer:validation-error": {
    collection: AnyCollection;
    file: CollectionFile;
    error: TransformError;
  };
  "transformer:error": {
    collection: AnyCollection;
    error: TransformError;
  };
};

type Keys<TEvents extends EventMap> = keyof TEvents & string;
type Listener<TEvent> = (event: TEvent) => void;

export function createEmitter<TEvents extends EventMap>() {
  const emitter = new EventEmitter();
  return {
    on<TKey extends Keys<TEvents>>(
      key: TKey,
      listener: Listener<TEvents[TKey]>
    ) {
      emitter.on(key, listener);
    },
    emit<TKey extends Keys<TEvents>>(key: TKey, event: TEvents[TKey]) {
      emitter.emit(key, event);
    },
  };
}

export type Emitter = ReturnType<typeof createEmitter<Events>>;
