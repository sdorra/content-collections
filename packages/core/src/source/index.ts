import { AnyCollection, Collection } from "../config";
import { MetaBase, Source } from "./api";
import { FileSystemMeta, FileSystemSourceOptions } from "./fs";

export * from "./api";
export * from "./fs";

export type SourceOption<TMeta extends MetaBase = MetaBase> =
  | Source<TMeta>
  | FileSystemSourceOptions
  | undefined;

export type GetMeta<TSource extends SourceOption> =
  TSource extends Source<infer TMeta> ? TMeta : FileSystemMeta;

export type GetMetaFromCollection<TCollection extends AnyCollection> =
  TCollection extends Collection<any, any, any, any, any, any, infer TSource>
    ? GetMeta<TSource>
    : never;
