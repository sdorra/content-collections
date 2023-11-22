import { ZodTypeAny } from "zod";

export type Collection<TSchema extends ZodTypeAny> = {
  name: string;
  typeName?: string;
  schema: TSchema;
  sources: string | string[];
};

export function defineCollection<TSchema extends ZodTypeAny>(
  collection: Collection<TSchema>
) {
  return collection;
}

export type Configuration<TCollections extends Array<ZodTypeAny>> = {
  collections: TCollections;
};

export function defineConfig<TConfig extends Configuration<Array<ZodTypeAny>>>(
  config: TConfig
) {
  return config;
}
