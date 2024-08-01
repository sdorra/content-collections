import camelcase from "camelcase";
import pluralize from "pluralize";
import { CollectionFile } from "./types";
import path from "node:path";

export function generateTypeName(name: string) {
  const singularName = pluralize.singular(name);
  return camelcase(singularName, { pascalCase: true });
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

export function orderByPath(a: CollectionFile, b: CollectionFile) {
  return a.path.localeCompare(b.path);
}

export function removeChildPaths(paths: Array<string>) {
  return paths.filter((path) => {
    return !paths.some((otherPath) => {
      if (path === otherPath) {
        return false;
      }
      return path.startsWith(otherPath);
    });
  });
}