const importSymbol = Symbol("import");

export type Import<T> = {
  [importSymbol]: true;
  path: string;
  name?: string;
};

export type GetTypeOfImport<T> = T extends Import<infer U> ? U : never;

export function isImport(value: any): value is Import<any> {
  return value && value[importSymbol];
}

export function createDefaultImport<T>(path: string): Import<T> {
  return {
    [importSymbol]: true,
    path,
  };
}

export function createNamedImport<T>(name: string, path: string): Import<T> {
  return {
    [importSymbol]: true,
    path,
    name,
  };
}
