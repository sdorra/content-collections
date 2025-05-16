import { ZodObject, ZodRawShape, ZodString, ZodTypeAny, z } from "zod";
import { CacheFn } from "./cache";
import { GetTypeOfImport, Import } from "./import";
import {
  ConfiguredParser,
  PredefinedParser,
  PredefinedParsers,
} from "./parser";
import { NotSerializableError, Serializable } from "./serializer";
import { generateTypeName } from "./utils";

// Export all zod types to fix type errors,
// if declaration is set to true in tsconfig.json.
// @see https://github.com/microsoft/TypeScript/issues/42873
export type * from "zod";

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

type GetParser<TParser extends ConfiguredParser> =
  TParser extends PredefinedParser ? PredefinedParsers[TParser] : TParser;

type HasContent<TParser extends ConfiguredParser> =
  GetParser<TParser>["hasContent"];

type GetShape<
  TParser extends ConfiguredParser,
  TShape extends ZodRawShape,
> = HasContent<TParser> extends true ? AddContent<TShape> : TShape;

export type Schema<
  TParser extends ConfiguredParser,
  TShape extends ZodRawShape,
> = z.infer<ZodObject<GetShape<TParser, TShape>>> & {
  _meta: Meta;
};

export type Context<TSchema = unknown> = {
  documents<TCollection extends AnyCollection>(
    collection: TCollection,
  ): Array<Schema<TCollection["parser"], TCollection["schema"]>>;
  cache: CacheFn;
  collection: {
    name: string;
    directory: string;
    documents: () => Promise<Array<TSchema>>;
  };
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
  transform?: (data: TSchema, context: Context<TSchema>) => TTransformResult;
  directory: string;
  include: string | string[];
  exclude?: string | string[];
  onSuccess?: (documents: Array<TDocument>) => void | Promise<void>;
};

export type Collection<
  TName extends string,
  TShape extends ZodRawShape,
  TParser extends ConfiguredParser,
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

export type AnyCollection = Collection<
  any,
  ZodRawShape,
  ConfiguredParser,
  any,
  any,
  any
>;

const InvalidReturnTypeSymbol = Symbol(`InvalidReturnType`);

type InvalidReturnType<TMessage extends string, TObject> = {
  [InvalidReturnTypeSymbol]: TMessage;
  object: TObject;
};

type ResolveImports<TTransformResult> =
  TTransformResult extends Import<any>
    ? GetTypeOfImport<TTransformResult>
    : TTransformResult extends Array<infer U>
      ? Array<ResolveImports<U>>
      : TTransformResult extends (...args: any[]) => any
        ? TTransformResult
        : TTransformResult extends object
          ? {
              [K in keyof TTransformResult]: ResolveImports<
                TTransformResult[K]
              >;
            }
          : TTransformResult;

export function defineCollection<
  TName extends string,
  TShape extends ZodRawShape,
  TParser extends ConfiguredParser = "frontmatter",
  TSchema = Schema<TParser, TShape>,
  TTransformResult = never,
  TDocument = [TTransformResult] extends [never]
    ? Schema<TParser, TShape>
    : Awaited<TTransformResult>,
  TResult = TDocument extends Serializable
    ? Collection<
        TName,
        TShape,
        TParser,
        TSchema,
        TTransformResult,
        ResolveImports<TDocument>
      >
    : InvalidReturnType<NotSerializableError, TDocument>,
>(
  collection: CollectionRequest<
    TName,
    TShape,
    TParser,
    TSchema,
    TTransformResult,
    TDocument
  >,
): TResult {
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
  } as TResult;
}

type Cache = "memory" | "file" | "none";

export type Configuration<TCollections extends Array<AnyCollection>> = {
  collections: TCollections;
  cache?: Cache;
};

export type AnyConfiguration = Configuration<Array<AnyCollection>>;

export function defineConfig<TConfig extends AnyConfiguration>(
  config: TConfig,
) {
  return config;
}
