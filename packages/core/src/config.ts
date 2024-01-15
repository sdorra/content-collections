import { ZodObject, ZodRawShape, z } from "zod";
import { generateTypeName } from "./utils";

export type Meta = {
  filePath: string;
  fileName: string;
  directory: string;
  path: string;
  extension: string;
};

export type Schema<TShape extends ZodRawShape> = z.infer<ZodObject<TShape>> & {
  _meta: Meta;
};

export type Context = {
  content(): Promise<string>;
  documents<TCollection extends AnyCollection>(
    collection: TCollection
  ): Array<Schema<TCollection["schema"]>>;
};

type Z = typeof z;

export type CollectionRequest<
  TName extends string,
  TShape extends ZodRawShape,
  TSchema,
  TTransformResult,
  TDocument
> = {
  name: TName;
  typeName?: string;
  schema: (z: Z) => TShape;
  transform?: (context: Context, data: TSchema) => TTransformResult;
  directory: string;
  include: string | string[];
  onSuccess?: (documents: Array<TDocument>) => void | Promise<void>;
};

export type Collection<
  TName extends string,
  TShape extends ZodRawShape,
  TSchema,
  TTransformResult,
  TDocument
> = Omit<
  CollectionRequest<TName, TShape, TSchema, TTransformResult, TDocument>,
  "schema"
> & {
  typeName: string;
  schema: TShape;
};

export type AnyCollection = Collection<any, ZodRawShape, any, any, any>;

export function defineCollection<
  TName extends string,
  TShape extends ZodRawShape,
  TSchema = Schema<TShape>,
  TTransformResult = never,
  TDocument = [TTransformResult] extends [never]
    ? Schema<TShape>
    : Awaited<TTransformResult>
>(
  collection: CollectionRequest<
    TName,
    TShape,
    TSchema,
    TTransformResult,
    TDocument
  >
): Collection<TName, TShape, TSchema, TTransformResult, TDocument> {
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
