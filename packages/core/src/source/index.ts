import {
  ConfiguredParser,
  PredefinedParser,
  PredefinedParsers,
} from "src/parser";
import { AnyCollection, Collection } from "../config";
import { SourceFactory } from "./api";
import {
  ExtendedFileSystemContext,
  FileSystemMeta,
  FileSystemSourceOptions,
} from "./fs";

export * from "./api";
export * from "./fs";

type GetParser<TParser extends ConfiguredParser> =
  TParser extends PredefinedParser ? PredefinedParsers[TParser] : TParser;

type HasContent<TParser extends ConfiguredParser> =
  GetParser<TParser>["hasContent"] extends true ? true : false;

export type GetHasContentFromParserOption<TParser extends ConfiguredParser | undefined> =
  [TParser] extends [ConfiguredParser] ? HasContent<TParser> : true;

export type GetHasContentFromSourceOption<TSourceOption> =
  TSourceOption extends SourceFactory<any, any, infer THasContent>
    ? THasContent
    : TSourceOption extends FileSystemSourceOptions<infer TParser>
      ? GetHasContentFromParserOption<TParser>
      : true;

export type SourceOption<
  TParser extends ConfiguredParser | undefined,
  THasContent extends true | false,
> =
  | SourceFactory<any, any, THasContent>
  | FileSystemSourceOptions<TParser>
  | undefined;

export type GetMeta<TSource extends SourceOption<any, any>> =
  [TSource] extends [SourceFactory<infer TMeta, any, any>] ? TMeta : FileSystemMeta;

export type GetExtendedContext<TSource extends SourceOption<any, any>> =
  [TSource] extends [SourceFactory<any, infer TExtendedContext, any>]
    ? TExtendedContext
    : ExtendedFileSystemContext;

export type GetMetaFromCollection<TCollection extends AnyCollection> =
  TCollection extends Collection<any, any, any, any, any, any, infer TSource>
    ? GetMeta<TSource>
    : never;
