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

export type SyncFn<TMeta extends MetaBase> = (
  modification: Modification,
  document: RawDocument<TMeta>,
) => Promise<unknown>;

export type SourceFactory<
  TMeta extends MetaBase,
  TExtendedContext,
  THasContent extends true | false,
> = (context: SourceContext) => Source<TMeta, TExtendedContext, THasContent>;

export type Source<
  TMeta extends MetaBase,
  TExtendedContext,
  THasContent extends true | false,
> = {
  documents: () => Promise<RawDocument<TMeta>[]>;
  documentsHaveContent?: THasContent | (() => Promise<THasContent> | THasContent);
  extendContext?: (document: RawDocument<TMeta>) => TExtendedContext;
  watch?: (sync: SyncFn<TMeta>) => Promise<Watcher>;
};

export function defineSource<
  TMeta extends MetaBase,
  TExtendedContext = {},
  THasContent extends true | false = false,
>(
  source: SourceFactory<TMeta, TExtendedContext, THasContent>,
): SourceFactory<TMeta, TExtendedContext, THasContent> {
  return source;
}
