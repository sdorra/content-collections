import { ZodObject, ZodRawShape, ZodString, ZodTypeAny, z } from "zod";
import { generateTypeName } from "./utils";
import { Parser, Parsers } from "./parser";

export type Meta = {
  filePath: string;
  fileName: string;
  directory: string;
  path: string;
  extension: string;
};

type WithContent = {
  content: ZodString;
};

type AddContent<TShape extends ZodRawShape> = TShape extends {
  content: ZodTypeAny;
}
  ? TShape
  : TShape & WithContent;

type GetParsedShape<
  TParser extends Parser,
  TShape extends ZodRawShape,
> = Parsers[TParser]["hasContent"] extends true ? AddContent<TShape> : TShape;

type GetShape<
  TParser extends Parser | undefined,
  TShape extends ZodRawShape,
> = TParser extends Parser
  ? GetParsedShape<TParser, TShape>
  : AddContent<TShape>;

export type Schema<
  TParser extends Parser | undefined,
  TShape extends ZodRawShape,
> = z.infer<ZodObject<GetShape<TParser, TShape>>> & {
  _meta: Meta;
};

export type Context = {
  documents<TCollection extends AnyCollection>(
    collection: TCollection
  ): Array<Schema<TCollection["parser"], TCollection["schema"]>>;
};

type Z = typeof z;

export type CollectionRequest<
  TName extends string,
  TShape extends ZodRawShape,
  TParser,
  TSchema,
  TTransformResult,
  TDocument,
> = {
  name: TName;
  parser?: TParser;
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
  TParser extends Parser,
  TSchema,
  TTransformResult,
  TDocument,
> = Omit<
  CollectionRequest<
    TName,
    TShape,
    TParser,
    TSchema,
    TTransformResult,
    TDocument
  >,
  "schema"
> & {
  typeName: string;
  schema: TShape;
  parser: TParser;
};

export type AnyCollection = Collection<any, ZodRawShape, Parser, any, any, any>;

export function defineCollection<
  TName extends string,
  TShape extends ZodRawShape,
  TParser extends Parser = "frontmatter",
  TSchema = Schema<TParser, TShape>,
  TTransformResult = never,
  TDocument = [TTransformResult] extends [never]
    ? Schema<TParser, TShape>
    : Awaited<TTransformResult>,
>(
  collection: CollectionRequest<
    TName,
    TShape,
    TParser,
    TSchema,
    TTransformResult,
    TDocument
  >
): Collection<TName, TShape, TParser, TSchema, TTransformResult, TDocument> {
  let typeName = collection.typeName;
  if (!typeName) {
    typeName = generateTypeName(collection.name);
  }
  let parser = collection.parser;
  if (!parser) {
    parser = "frontmatter" as TParser;
  }
  return {
    ...collection,
    typeName,
    parser,
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
