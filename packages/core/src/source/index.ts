import { AnyCollection, Collection } from "../config";
import { MetaBase, Source, SourceFactory } from "./api";
import {
  ExtendedFileSystemContext,
  FileSystemMeta,
  FileSystemSourceOptions,
} from "./fs";

export * from "./api";
export * from "./fs";

export type SourceOption =
  | SourceFactory<any, any>
  | FileSystemSourceOptions
  | undefined;

export type GetMeta<TSource extends SourceOption> =
  TSource extends SourceFactory<infer TMeta, any> ? TMeta : FileSystemMeta;

export type GetExtendedContext<TSource extends SourceOption> =
  TSource extends SourceFactory<any, infer TExtendedContext>
    ? TExtendedContext
    : ExtendedFileSystemContext;

export type GetMetaFromCollection<TCollection extends AnyCollection> =
  TCollection extends Collection<any, any, any, any, any, any, infer TSource>
    ? GetMeta<TSource>
    : never;
