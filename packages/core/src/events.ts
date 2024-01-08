import { EventEmitter } from "node:events";
import { CollectError } from "./collector";
import { TransformError } from "./transformer";
import { AnyCollection } from "./config";
import { CollectionFile, Modification } from "./types";

type EventMap = Record<string, object>;

type EventWithError = {
  error: Error;
};

type SystemEvent = {
  _event: string;
};

type ErrorEvent = EventWithError & SystemEvent;

// TODO: colocate types with fired events in the same file

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
  "collector:parse-error": {
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

export type SystemEvents = {
  _error: ErrorEvent;
  _all: SystemEvent;
};

type Keys<TEvents extends EventMap> = keyof TEvents & string;
type Listener<TEvent> = (event: TEvent) => void;

function isEventWithError(event: unknown): event is EventWithError {
  return typeof event === "object" && event !== null && "error" in event;
}

export function createEmitter<TEvents extends EventMap>() {
  const emitter = new EventEmitter();

  function on<TKey extends Keys<TEvents>>(
    key: TKey,
    listener: Listener<TEvents[TKey]>
  ): void;

  function on<TKey extends Keys<SystemEvents>>(
    key: TKey,
    listener: Listener<SystemEvents[TKey]>
  ): void;

  function on(key: string, listener: Listener<any>) {
    emitter.on(key, listener);
  }

  function emit<TKey extends Keys<TEvents>>(key: TKey, event: TEvents[TKey]) {
    emitter.emit(key, event);

    if (isEventWithError(event)) {
      emitter.emit("_error", {
        ...event,
        _event: key,
      });
    }

    emitter.emit("_all", {
      ...event,
      _event: key,
    });
  }

  return {
    on,
    emit,
  };
}

export type Emitter = ReturnType<typeof createEmitter<Events>>;
