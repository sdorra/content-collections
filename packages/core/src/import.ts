import * as z from "zod/mini";

export const importSchema = z.object({
  __cc_import: z.literal(true),
  path: z.string(),
  name: z.optional(z.string()),
});

export type Import<T> = z.infer<typeof importSchema> & { __type?: T };

export type GetTypeOfImport<T> = T extends Import<infer U> ? U : never;

export function isImport(value: any): value is Import<any> {
  return value && value.__cc_import;
}

export function createDefaultImport<T>(path: string): Import<T> {
  return {
    __cc_import: true,
    path: path.replace(/\\/g, "/"),
  };
}

export function createNamedImport<T>(name: string, path: string): Import<T> {
  return {
    __cc_import: true,
    path: path.replace(/\\/g, "/"),
    name,
  };
}
