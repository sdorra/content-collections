import { ZodTypeAny, z } from "zod";
import { generateTypeName } from "./utils";

export type Meta = {
  path: string;
};

export type Document<TSchema extends ZodTypeAny> = z.infer<TSchema> & {
  _meta: Meta;
};

export type Context = {
  content(): Promise<string>;
};

type TransformFn<TSchema extends ZodTypeAny> =
  | ((context: Context, data: Document<TSchema>) => any)
  | undefined;

export type CollectionRequest<
  TSchema extends ZodTypeAny,
  TTransform extends TransformFn<TSchema> = undefined
> = {
  name: string;
  typeName?: string;
  schema: TSchema;
  sources: string | string[];
} & (TTransform extends undefined
  ? {
      transform?: never;
    }
  : {
      transform: TTransform;
    });

export type Collection<
  TSchema extends ZodTypeAny,
  TTransform extends TransformFn<TSchema>
> = CollectionRequest<TSchema, TTransform> & {
  typeName: string;
};

export type AnyCollection = Collection<ZodTypeAny, any>;

export function defineCollection<
  TSchema extends ZodTypeAny,
  TTransform extends TransformFn<TSchema>
>(collection: CollectionRequest<TSchema, TTransform>) {
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
