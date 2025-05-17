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
import { generateTypeName } from "./utils";
import { warnDeprecated } from "./warn";

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
> = GetOutput<TParser, TShape> & {
  _meta: Meta;
};

type GetSchema<TCollection extends AnyCollection> =
  TCollection extends Collection<any, infer TSchema, any, any, any, any>
    ? GetOutputShape<TSchema>
    : never;

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
};

type Z = typeof z;

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

const legacySchemaDeprecatedMessage = `The use of a function as a schema is deprecated.
Please use a StandardSchema compliant library directly.
For more information, see:
https://content-collections.dev/docs/legacy-schema`;


export function defineCollection<
  TName extends string,
  TShape extends TSchemaProp,
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
  let schema: any = collection.schema;
  if (!schema["~standard"]) {
    warnDeprecated(legacySchemaDeprecatedMessage);
    schema = z.object(schema(z));
  }
  return {
    ...collection,
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
