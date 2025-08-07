import camelcase from "camelcase";
import pluralize from "pluralize";
import { CollectionFile } from "./types";
import path from "node:path";

export function generateTypeName(name: string) {
  const singularName = pluralize.singular(name);
  return camelcase(singularName, { pascalCase: true });
}

export function generateArrayConstName(name: string) {
  let suffix = name.charAt(0).toUpperCase() + name.slice(1);
  return "all" + pluralize(suffix);
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

export function orderByPath(a: CollectionFile, b: CollectionFile) {
  return a.path.localeCompare(b.path);
}

export function removeChildPaths(paths: Array<string>) {
  return Array.from(
    new Set(
      paths.filter((path) => {
        return !paths.some((otherPath) => {
          if (path === otherPath) {
            return false;
          }
          return path.startsWith(otherPath);
        });
      }),
    ),
  );
}

export function posixToNativePath(pathName: string) {
  if (path.sep !== path.posix.sep) {
    return pathName.replaceAll(path.posix.sep, path.sep);
  }
  return pathName;
}

export function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}
