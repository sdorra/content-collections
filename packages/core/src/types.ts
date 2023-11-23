import { AnyCollection, AnyConfiguration, Document } from "./config";

type CollectionByName<TConfiguration extends AnyConfiguration> = {
  [TCollection in TConfiguration["collections"][number] as TCollection["name"]]: TCollection;
};

export type GetTypeByName<
  TConfiguration extends AnyConfiguration,
  TName extends keyof CollectionByName<TConfiguration>,
  TCollection = CollectionByName<TConfiguration>[TName]
> = TCollection extends AnyCollection
  ? TCollection["transform"] extends (...args: any) => any
    ? ReturnType<TCollection["transform"]>
    : Document<TCollection["schema"]>
  : never;
