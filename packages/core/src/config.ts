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

type GetSchema<TSource extends AnyContent> =
  TSource extends Collection<any, any, any, infer TSchema, any, any>
    ? Prettify<TSchema>
    : TSource extends Singleton<any, any, any, infer TSchema, any, any>
      ? Prettify<TSchema>
      : never;

export const skippedSymbol = Symbol("skipped");

export type SkippedSignal = {
  [skippedSymbol]: true;
  reason?: string;
};

export type Context<TSchema = unknown> = {
  documents<TSource extends AnyContent>(
    source: TSource,
  ): Array<GetSchema<TSource>>;
  cache: CacheFn;
  skip: (reason?: string) => SkippedSignal;
};

export type CollectionContext<TSchema = unknown> = Context<TSchema> & {
  collection: {
    name: string;
    directory: string;
    documents: () => Promise<Array<TSchema>>;
  };
};

export type SingletonContext<TSchema = unknown> = Context<TSchema> & {
  singleton: {
    name: string;
    filePath: string;
    directory: string;
    document: () => Promise<TSchema | undefined>;
  }
};

export type ContentType = "collection" | "singleton";

export type CollectionRequest<
  TName extends string,
  TShape extends TSchemaProp,
  TParser,
  TSchema,
  TTransformResult,
  TDocument,
> = {
  name: TName;
  parser?: TParser;
  typeName?: string;
  schema: TShape;
  transform?: (data: TSchema, context: CollectionContext<TSchema>) => TTransformResult;
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
  type: "collection";
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

export type SingletonRequest<
  TName extends string,
  TShape extends TSchemaProp,
  TParser,
  TSchema,
  TTransformResult,
  TDocument,
> = {
  name: TName;
  filePath: string;
  parser?: TParser;
  typeName?: string;
  schema: TShape;
  transform?: (data: TSchema, context: SingletonContext<TSchema>) => TTransformResult;
  onSuccess?: (document: TDocument | undefined) => void | Promise<void>;
};

export type Singleton<
  TName extends string,
  TShape extends TSchemaProp,
  TParser extends ConfiguredParser,
  TSchema,
  TTransformResult,
  TDocument,
> = Omit<
  SingletonRequest<
    TName,
    TShape,
    TParser,
    TSchema,
    TTransformResult,
    TDocument
  >,
  "schema"
> & {
  type: "singleton";
  typeName: string;
  schema: StandardSchemaV1;
  parser: TParser;
};

export type AnySingleton = Singleton<
  any,
  TSchemaProp,
  ConfiguredParser,
  any,
  any,
  any
>;

export type AnyContent = AnyCollection | AnySingleton;

export function isSingleton(source: AnyContent): source is AnySingleton {
  return source.type === "singleton";
}

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
      `Parser ${parser} is not a valid parser`,
    );
  }
  let schema: any = collection.schema;
  if (!schema["~standard"]) {
    retired("legacySchema");
  }
  return {
    ...collection,
    type: "collection",
    typeName,
    parser,
    schema,
  } as TResult;
}


export function defineSingleton<
  TName extends string,
  TShape extends TSchemaProp,
  TParser extends ConfiguredParser = "frontmatter",
  TSchema = Schema<TParser, TShape>,
  TTransformResult = never,
  TDocument = [TTransformResult] extends [never]
    ? Schema<TParser, TShape>
    : Exclude<Awaited<TTransformResult>, SkippedSignal>,
  TResult = TDocument extends Serializable
    ? Singleton<
        TName,
        TShape,
        TParser,
        TSchema,
        TTransformResult,
        ResolveImports<TDocument>
      >
    : InvalidReturnType<NotSerializableError, TDocument>,
>(
  singleton: SingletonRequest<
    TName,
    TShape,
    TParser,
    TSchema,
    TTransformResult,
    TDocument
  >,
): TResult {
  let typeName = singleton.typeName;
  if (!typeName) {
    typeName = generateTypeName(singleton.name);
  }

  let parser = singleton.parser;
  if (!parser) {
    parser = "frontmatter" as TParser;
  } else if (!isValidParser(parser)) {
    throw new ConfigurationError(
      "Read",
      `Parser ${parser} is not a valid parser`,
    );
  }

  let schema: any = singleton.schema;
  if (!schema["~standard"]) {
    retired("legacySchema");
  }

  return {
    ...singleton,
    type: "singleton",
    typeName,
    parser,
    schema,
  } as TResult;
}

type Cache = "memory" | "file" | "none";

export type ConfigurationWithContent<TCollections extends Array<AnyContent>> = {
  content: TCollections;
  /**
   * @deprecated Use `content` instead.
   */
  collections?: TCollections;
  cache?: Cache;
};

export type ConfigurationWithCollections<TCollections extends Array<AnyContent>> = {
  /**
   * @deprecated Use `content` instead.
   */
  collections: TCollections;
  content?: TCollections;
  cache?: Cache;
};

export type Configuration<TCollections extends Array<AnyContent>> =
  | ConfigurationWithContent<TCollections>
  | ConfigurationWithCollections<TCollections>;

export type AnyConfiguration = Configuration<Array<AnyContent>>;

export function defineConfig<TCollections extends Array<AnyContent>>(config: {
  content: TCollections;
  cache?: Cache;
}): ConfigurationWithContent<TCollections>;

export function defineConfig<TCollections extends Array<AnyContent>>(config: {
  /**
   * @deprecated Use `content` instead.
   */
  collections: TCollections;
  cache?: Cache;
}): ConfigurationWithCollections<TCollections>;

export function defineConfig<TConfig extends AnyConfiguration>(config: TConfig) {
  return config;
}
