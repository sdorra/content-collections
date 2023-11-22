import camelcase from "camelcase";
import pluralize from "pluralize";

export function generateTypeName(name: string) {
  const singularName = pluralize.singular(name);
  return camelcase(singularName, { pascalCase: true });
}
