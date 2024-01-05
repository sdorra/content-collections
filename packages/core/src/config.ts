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

type Z = typeof z;

export type CollectionRequest<
  TSchema extends ZodTypeAny,
  TName extends string,
  TTransformResult,
  TDocument
> = {
  name: TName;
  typeName?: string;
  schema: (z: Z) => TSchema;
  transform?: (context: Context, data: Document<TSchema>) => TTransformResult;
  directory: string;
  include: string | string[];
  onSuccess?: (documents: Array<TDocument>) => void | Promise<void>;
};

export type Collection<
  TSchema extends ZodTypeAny,
  TName extends string,
  TTransformResult,
  TDocument
> = Omit<CollectionRequest<TSchema, TName, TTransformResult, TDocument>, "schema"> & {
  typeName: string;
  schema: TSchema;
};

export type AnyCollection = Collection<ZodTypeAny, any, any, any>;

export function defineCollection<
  TSchema extends ZodTypeAny,
  TName extends string,
  TTransformResult = never,
  TDocument = [TTransformResult] extends [never]
    ? Document<TSchema>
    : Awaited<TTransformResult>
>(
  collection: CollectionRequest<TSchema, TName, TTransformResult, TDocument>
): Collection<TSchema, TName, TTransformResult, TDocument> {
  let typeName = collection.typeName;
  if (!typeName) {
    typeName = generateTypeName(collection.name);
  }
  return {
    ...collection,
    typeName,
    schema: collection.schema(z),
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