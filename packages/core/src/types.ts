import { AnyCollection, AnyConfiguration, Collection, Meta } from "./config";
import { MetaBase, Source } from "./source";

export type Modification = "create" | "update" | "delete";

export type Document = {
  _meta: Meta;
};

export type CollectionFile = {
  data: {
    content?: string;
    [key: string]: unknown;
  };
  path: string;
};

// TODO: we are no longer file based
export type FileCollection = Pick<AnyCollection, "source">;

export type ValidatedDocument = any & {
  _meta: MetaBase;
};

export type ValidatedCollection = AnyCollection & {
  documents: Array<ValidatedDocument>;
};

export type ResolvedCollection<T extends FileCollection> = T & {
  files: Array<CollectionFile>;
};

type CollectionByName<TConfiguration extends AnyConfiguration> = {
  [TCollection in TConfiguration["collections"][number] as TCollection["name"]]: TCollection;
};

type GetDocument<TCollection extends AnyCollection> =
  TCollection extends Collection<any, any, any, any, any, infer TDocument, Source<any, any>>
    ? TDocument
    : never;

export type GetTypeByName<
  TConfiguration extends AnyConfiguration,
  TName extends keyof CollectionByName<TConfiguration>,
  TCollection = CollectionByName<TConfiguration>[TName],
> = TCollection extends AnyCollection ? GetDocument<TCollection> : never;
