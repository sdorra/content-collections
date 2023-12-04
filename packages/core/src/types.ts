import { ZodTypeAny } from "zod";
import { AnyCollection, AnyConfiguration, Collection } from "./config";

export type Modification = "added" | "changed" | "removed";

type CollectionByName<TConfiguration extends AnyConfiguration> = {
  [TCollection in TConfiguration["collections"][number] as TCollection["name"]]: TCollection;
};

type GetDocument<TCollection extends AnyCollection> =
  TCollection extends Collection<ZodTypeAny, any, any, infer TDocument>
    ? TDocument
    : never;

export type GetTypeByName<
  TConfiguration extends AnyConfiguration,
  TName extends keyof CollectionByName<TConfiguration>,
  TCollection = CollectionByName<TConfiguration>[TName]
> = TCollection extends AnyCollection ? GetDocument<TCollection> : never;
