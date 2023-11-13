import z from "zod";
import { AnyCollection, AnyConfiguration } from "./config";

type CollectionByName<TConfiguration extends AnyConfiguration> = {
  [TCollection in TConfiguration["collections"][number] as TCollection["name"]]: TCollection;
};

type Document = {
  path: string;
};

export type GetTypeByName<
  TConfiguration extends AnyConfiguration,
  TName extends keyof CollectionByName<TConfiguration>,
  TCollection = CollectionByName<TConfiguration>[TName]
> = TCollection extends AnyCollection
  ? z.infer<TCollection["schema"]> & { _document: Document }
  : never;
