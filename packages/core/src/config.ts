import { ZodTypeAny } from "zod";
import { generateTypeName } from "./utils";

export type CollectionRequest<TSchema extends ZodTypeAny> = {
  name: string;
  typeName?: string;
  schema: TSchema;
  sources: string | string[];
};

export type Collection<TSchema extends ZodTypeAny> =
  CollectionRequest<TSchema> & {
    typeName: string;
  };

export type AnyCollection = Collection<ZodTypeAny>;

export function defineCollection<TSchema extends ZodTypeAny>(
  collection: CollectionRequest<TSchema>
): Collection<TSchema> {
  let typeName = collection.typeName;
  if (!typeName) {
    typeName = generateTypeName(collection.name);
  }
  return {
    ...collection,
    typeName,
  };
}

export type Configuration<TCollections extends Array<AnyCollection>> = {
  collections: TCollections;
};

export type AnyConfiguration = Configuration<Array<AnyCollection>>;

export function defineConfig<TConfig extends AnyConfiguration>(
  config: TConfig
) {
  return config;
}
