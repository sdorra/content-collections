const symbol = Symbol("importOrSplit");

export type ImportOrSplit<T> = {
  [symbol]: true;
};

export type Import<T> = ImportOrSplit<T> & {
  path: string;
  name?: string;
};

export type GetTypeOfImport<T> = T extends Import<infer U> ? U : never;

// T extends ImportOrSplit<infer U> ? U : never;
// does not work, i don't know why.

export type GetTypeOfImportOrSplit<T> =
  T extends Import<infer U> ? U : T extends Split<infer U> ? U : never;

export function isImport(value: any): value is Import<any> {
  return value && value[symbol] && typeof value.path === "string";
}

export function createDefaultImport<T>(path: string): Import<T> {
  return {
    [symbol]: true,
    path,
  };
}

export function createNamedImport<T>(name: string, path: string): Import<T> {
  return {
    [symbol]: true,
    path,
    name,
  };
}

export type Split<T> = ImportOrSplit<T> & {
  part: T;
};

export function split<T>(part: T): Split<T> {
  return {
    [symbol]: true,
    part,
  };
}

export function isSplit(value: any): value is Split<any> {
  return value && value[symbol] && "part" in value;
}
