import { StandardSchemaV1 } from "@standard-schema/spec";
import { CacheFn } from "./cache";
import { ConfigurationError } from "./configurationReader";
import { retired } from "./features";
import { GetTypeOfImport, Import } from "./import";
import {
  ConfiguredParser,
  isValidParser,
  PredefinedParser,
  PredefinedParsers,
} from "./parser";
import { NotSerializableError, Serializable } from "./serializer";
import { generateTypeName } from "./utils";

export type Meta = {
  filePath: string;
  fileName: string;
  directory: string;
  path: string;
  extension: string;
};

type WithContent = {
  content: string;
};

type AddContent<TOutput> = TOutput extends {
  content: any;
}
  ? TOutput
  : TOutput & WithContent;

type GetParser<TParser extends ConfiguredParser> =
  TParser extends PredefinedParser ? PredefinedParsers[TParser] : TParser;

type HasContent<TParser extends ConfiguredParser> =
  GetParser<TParser>["hasContent"];

type TSchemaProp = StandardSchemaV1;

type GetOutputShape<TShape extends TSchemaProp> =
  TShape extends StandardSchemaV1
    ? StandardSchemaV1.InferOutput<TShape>
    : never;

type GetOutput<
  TParser extends ConfiguredParser,
  TShape extends TSchemaProp,
  TOutput = GetOutputShape<TShape>,
> = HasContent<TParser> extends true ? AddContent<TOutput> : TOutput;

export type Schema<
  TParser extends ConfiguredParser,
  TShape extends TSchemaProp,
> = GetOutput<TParser, TShape> & {
  _meta: Meta;
};

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type GetSchema<TCollection extends AnyCollection> =
  TCollection extends Collection<any, any, any, infer TSchema, any, any>
    ? Prettify<TSchema>
    : never;

export const skippedSymbol = Symbol("skipped");

export type SkippedSignal = {
  [skippedSymbol]: true;
  reason?: string;
};

export type Context<TSchema = unknown> = {
  documents<TCollection extends AnyCollection>(
    collection: TCollection,
  ): Array<GetSchema<TCollection>>;
  cache: CacheFn;
  collection: {
    name: string;
    directory: string;
    documents: () => Promise<Array<TSchema>>;
  };
  skip: (reason?: string) => SkippedSignal;
};

export type CollectionRequest<
  TName extends string,
  TShape extends TSchemaProp,
  TParser,
  TSchema,
  TTransformResult,
  TDocument,
> = {
  name: TName;
  type?: "collection" | "singleton";
  parser?: TParser;
  typeName?: string;
  schema: TShape;
  transform?: (data: TSchema, context: Context<TSchema>) => TTransformResult;
  directory: string;
  include: string | string[];
  exclude?: string | string[];
  onSuccess?: (documents: Array<TDocument>) => void | Promise<void>;
};

export type Collection<
  TName extends string,
  TShape extends TSchemaProp,
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
  type: "collection" | "singleton";
  typeName: string;
  schema: StandardSchemaV1;
  parser: TParser;
};

export type AnyCollection = Collection<
  any,
  TSchemaProp,
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
  TShape extends TSchemaProp,
  TParser extends ConfiguredParser = "frontmatter",
  TSchema = Schema<TParser, TShape>,
  TTransformResult = never,
  TDocument = [TTransformResult] extends [never]
    ? Schema<TParser, TShape>
    : Exclude<Awaited<TTransformResult>, SkippedSignal>,
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
  const type = collection.type ?? "collection";
  let typeName = collection.typeName;
  if (!typeName) {
    typeName = generateTypeName(collection.name);
  }
  let parser = collection.parser;
  if (!parser) {
    parser = "frontmatter" as TParser;
  } else if (!isValidParser(parser)) {
    throw new ConfigurationError(
      "Read",
      `Parser ${parser} is not valid a parser`,
    );
  }
  let schema: any = collection.schema;
  if (!schema["~standard"]) {
    retired("legacySchema");
  }
  return {
    ...collection,
    type,
    typeName,
    parser,
    schema,
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
