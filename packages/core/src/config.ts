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
  documents<TCollection extends AnyCollection>(
    collection: TCollection
  ): Array<Document<TCollection["schema"]>>;
};

type TransformFn<TSchema extends ZodTypeAny> =
  | ((context: Context, data: Document<TSchema>) => any)
  | undefined;

export type CollectionRequest<
  TSchema extends ZodTypeAny,
  TName extends string,
  TTransform extends TransformFn<TSchema>,
  TDocument
> = {
  name: TName;
  typeName?: string;
  schema: TSchema;
  transform?: TTransform;
  directory: string;
  include: string | string[];
  onSuccess?: (documents: Array<TDocument>) => void | Promise<void>;
};

export type Collection<
  TSchema extends ZodTypeAny,
  TName extends string,
  TTransform extends TransformFn<TSchema>,
  TDocument
> = CollectionRequest<TSchema, TName, TTransform, TDocument> & {
  typeName: string;
};

export type AnyCollection = Collection<ZodTypeAny, any, any, any>;

export function defineCollection<
  TSchema extends ZodTypeAny,
  TName extends string,
  TTransform extends TransformFn<TSchema>,
  TDocument = [TTransform] extends [(...args: any) => any]
    ? Awaited<ReturnType<TTransform>>
    : Document<TSchema>
>(
  collection: CollectionRequest<TSchema, TName, TTransform, TDocument>
): Collection<TSchema, TName, TTransform, TDocument> {
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
