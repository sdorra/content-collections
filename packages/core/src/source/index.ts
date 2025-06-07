import { AnyCollection, Collection } from "../config";
import { MetaBase, Source } from "./api";
import {
  ExtendedFileSystemContext,
  FileSystemMeta,
  FileSystemSourceOptions,
} from "./fs";

export * from "./api";
export * from "./fs";

export type SourceOption =
  | Source<any, any>
  | FileSystemSourceOptions
  | undefined;

export type GetMeta<TSource extends SourceOption> =
  TSource extends Source<infer TMeta, any> ? TMeta : FileSystemMeta;

export type GetExtendedContext<TSource extends SourceOption> =
  TSource extends Source<any, infer TExtendedContext>
    ? TExtendedContext
    : ExtendedFileSystemContext;

export type GetMetaFromCollection<TCollection extends AnyCollection> =
  TCollection extends Collection<any, any, any, any, any, any, infer TSource>
    ? GetMeta<TSource>
    : never;
