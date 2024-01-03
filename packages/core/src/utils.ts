import camelcase from "camelcase";
import pluralize from "pluralize";

export function generateTypeName(name: string) {
  const singularName = pluralize.singular(name);
  return camelcase(singularName, { pascalCase: true });
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

type ContentCollectionsError = Error & {
  // TODO: we should use a discriminated union here
  type: string;
};

export type ErrorHandler = (error: ContentCollectionsError) => void;

export const throwingErrorHandler: ErrorHandler = (error) => {
  throw error;
};

