import camelcase from "camelcase";
import pluralize from "pluralize";
import { CollectionFile } from "./types";

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