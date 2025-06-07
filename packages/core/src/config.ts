import { StandardSchemaV1 } from "@standard-schema/spec";
import { z, ZodObject, ZodRawShape } from "zod";
import { CacheFn } from "./cache";
import { GetTypeOfImport, Import } from "./import";
import {
  ConfiguredParser,
  PredefinedParser,
  PredefinedParsers,
} from "./parser";
import { NotSerializableError, Serializable } from "./serializer";
import {
  defineFileSystemSource,
  FileSystemSourceOptions,
  GetExtendedContext,
  GetMeta,
  Source,
  SourceOption,
} from "./source";
import { generateTypeName } from "./utils";
import { warnDeprecated } from "./warn";

// Export all zod types to fix type errors,
// if declaration is set to true in tsconfig.json.
// @see https://github.com/microsoft/TypeScript/issues/42873
export type * from "zod";

/**
 * @deprecated Use `FileSystemMeta` instead.
 */
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

type LegacySchema<TResult extends ZodRawShape = ZodRawShape> = (
  z: Z,
) => TResult;

type TSchemaProp = StandardSchemaV1 | LegacySchema;

type GetLegacySchemaShape<LegacySchema> = LegacySchema extends (
  z: Z,
) => infer TObjectShape
  ? TObjectShape
  : never;

type GetOutputShape<TShape extends TSchemaProp> =
  TShape extends StandardSchemaV1
    ? StandardSchemaV1.InferOutput<TShape>
    : TShape extends ZodObject<any>
      ? z.infer<TShape>
      : TShape extends LegacySchema
        ? z.infer<ZodObject<GetLegacySchemaShape<TShape>>>
        : never;

type GetOutput<
  TParser extends ConfiguredParser,
  TShape extends TSchemaProp,
  TOutput = GetOutputShape<TShape>,
> = HasContent<TParser> extends true ? AddContent<TOutput> : TOutput;

export type Schema<
  TParser extends ConfiguredParser,
  TShape extends TSchemaProp,
  TSource extends SourceOption,
> = GetOutput<TParser, TShape> & {
  _meta: GetMeta<TSource>;
};

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type GetSchema<TCollection extends AnyCollection> =
  TCollection extends Collection<any, infer TSchema, any, any, any, any, Source<any, any>>
    ? Prettify<GetOutputShape<TSchema>>
    : never;

export type Context<TSchema = unknown> = {
  documents<TCollection extends AnyCollection>(
    collection: TCollection,
  ): Array<GetSchema<TCollection>>;
  cache: CacheFn;
  collection: {
    name: string;
    /**
     * TODO: how to handle this?
     * @deprecated
     */
    directory: string;
    documents: () => Promise<Array<TSchema>>;
  };
};

type GetContext<TSource extends SourceOption, TSchema> = Context<TSchema> & GetExtendedContext<TSource>;

type Z = typeof z;

export type CollectionRequest<
  TName extends string,
  TShape extends TSchemaProp,
  TParser,
  TSchema,
  TTransformResult,
  TDocument,
  TSource extends SourceOption,
> = {
  name: TName;
  typeName?: string;
  source?: TSource;
  schema: TShape;
  transform?: (data: TSchema, context: GetContext<TSource, TSchema>) => TTransformResult;
  onSuccess?: (documents: Array<TDocument>) => void | Promise<void>;

  /**
   * @deprecated use `source` instead
   */
  directory?: string;
  /**
   * @deprecated use `source` instead
   */
  include?: string | string[];
  /**
   * @deprecated use `source` instead
   */
  exclude?: string | string[];
  /**
   * @deprecated use `source` instead
   */
  parser?: TParser;
};

export type Collection<
  TName extends string,
  TShape extends TSchemaProp,
  TParser extends ConfiguredParser,
  TSchema,
  TTransformResult,
  TDocument,
  TSource extends Source<any, any>,
> = Omit<
  CollectionRequest<
    TName,
    TShape,
    TParser,
    TSchema,
    TTransformResult,
    TDocument,
    TSource
  >,
  "schema" | "source" | "parser" | "directory" | "include" | "exclude"
> & {
  typeName: string;
  schema: StandardSchemaV1;
  parser: TParser;
  source: TSource;
};

export type AnyCollection = Collection<
  any,
  TSchemaProp,
  ConfiguredParser,
  any,
  any,
  any,
  Source<any, any>
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
  TSource extends SourceOption = FileSystemSourceOptions,
  TSchema = Schema<TParser, TShape, TSource>,
  TTransformResult = never,
  TDocument = [TTransformResult] extends [never]
    ? Schema<TParser, TShape, TSource>
    : Awaited<TTransformResult>,
  TResult = TDocument extends Serializable
    ? Collection<
        TName,
        TShape,
        TParser,
        TSchema,
        TTransformResult,
        ResolveImports<TDocument>,
        Source<GetMeta<TSource>, GetExtendedContext<TSource>>
      >
    : InvalidReturnType<NotSerializableError, TDocument>,
>(
  collection: CollectionRequest<
    TName,
    TShape,
    TParser,
    TSchema,
    TTransformResult,
    TDocument,
    TSource
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
  let schema: any = collection.schema;
  if (!schema["~standard"]) {
    warnDeprecated("legacySchema");
    schema = z.object(schema(z));
  }

  let source: any = collection.source;
  // TODO: convert source and log deprecation warning
  if (collection.directory && collection.include) {
    warnDeprecated("topLevelFsSource");

    if (source) {
      throw new Error(
        `Collection "${collection.name}" has both "source" and top-level "directory" and "include" options defined. Please use only "source".`,
      );
    }

    source = defineFileSystemSource({
      directory: collection.directory,
      include: collection.include,
      exclude: collection.exclude,
      parser: collection.parser || "frontmatter",
    });

  } else if (source && source.directory && source.include) {
    source = defineFileSystemSource({
      directory: source.directory,
      include: source.include,
      exclude: source.exclude,
      parser: source.parser || "frontmatter",
    });
  }

  return {
    ...collection,
    typeName,
    parser,
    schema,
    source,
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
