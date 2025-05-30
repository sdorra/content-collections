import { AnyCollection, AnyConfiguration, Collection, Meta } from "./config";
import { StandardSchemaV1 } from "@standard-schema/spec";

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

export type FileCollection = Pick<
  AnyCollection,
  "directory" | "include" | "exclude" | "parser"
>;

export type ResolvedCollection<T extends FileCollection> = T & {
  files: Array<CollectionFile>;
};

type CollectionByName<TConfiguration extends AnyConfiguration> = {
  [TCollection in TConfiguration["collections"][number] as TCollection["name"]]: TCollection;
};

type GetDocument<TCollection extends AnyCollection> =
  TCollection extends Collection<
    any,
    any,
    any,
    any,
    any,
    infer TDocument
  >
    ? TDocument
    : never;

export type GetTypeByName<
  TConfiguration extends AnyConfiguration,
  TName extends keyof CollectionByName<TConfiguration>,
  TCollection = CollectionByName<TConfiguration>[TName],
> = TCollection extends AnyCollection ? GetDocument<TCollection> : never;
