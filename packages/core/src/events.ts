import { EventEmitter } from "node:events";
import { AnyCollection } from "./config";
import { CollectionFile, Modification } from "./types";

export type CollectorEvents = {
  "collector:read-error": {
    filePath: string;
    error: CollectError;
  };
  "collector:parse-error": {
    filePath: string;
    error: CollectError;
  };
};

export type CollectorErrorType = "Parse" | "Read";

export class CollectError extends Error {
  type: CollectorErrorType;
  constructor(type: CollectorErrorType, message: string) {
    super(message);
    this.type = type;
  }
}

export type TransformErrorType =
  | "Validation"
  | "Configuration"
  | "Transform"
  | "Result";

export class TransformError extends Error {
  type: TransformErrorType;
  constructor(type: TransformErrorType, message: string) {
    super(message);
    this.type = type;
  }
}

export type BuilderEvents = {
  "builder:start": {
    startedAt: number;
  };
  "builder:end": {
    startedAt: number;
    endedAt: number;
    stats: {
      collections: number;
      documents: number;
    };
  };
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

export type TransformerEvents = {
  "transformer:validation-error": {
    collection: AnyCollection;
    file: CollectionFile;
    error: TransformError;
  };
  "transformer:result-error": {
    collection: AnyCollection;
    document: any;
    error: TransformError;
  };
  "transformer:error": {
    collection: AnyCollection;
    error: TransformError;
  };
};

type EventMap = Record<string, object>;

type EventWithError = {
  error: Error;
};

type SystemEvent = {
  _event: string;
};

type ErrorEvent = EventWithError & SystemEvent;

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

export type Events = BuilderEvents &
  CollectorEvents &
  TransformerEvents &
  WatcherEvents;

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
    listener: Listener<TEvents[TKey]>,
  ): void;

  function on<TKey extends Keys<SystemEvents>>(
    key: TKey,
    listener: Listener<SystemEvents[TKey]>,
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
