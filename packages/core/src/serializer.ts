import serializeJs from "serialize-javascript";
import * as z from "zod/mini";
import { importSchema, isImport, type Import } from "./import";

const literalSchema = z.union([
  // json
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  // serializable-javascript
  z.undefined(),
  z.date(),
  z.map(z.unknown(), z.unknown()),
  z.set(z.unknown()),
  z.bigint(),

  // imports
  importSchema,
]);

type Literal = z.infer<typeof literalSchema>;

type SchemaType =
  | Literal
  | { [key: string]: SchemaType }
  | ReadonlyArray<SchemaType>;

const schema: z.ZodMiniType<SchemaType> = z.lazy(() =>
  z.union([literalSchema, z.array(schema), z.record(z.string(), schema)]),
);

export type NotSerializableError =
  `The return type of the transform function must be an object serializable object.
See https://www.content-collections.dev/docs/serialization for more information.

The following type is not valid:`;

export const extension = "js";

export const serializableSchema = z.record(z.string(), schema);

export type Serializable = z.infer<typeof serializableSchema>;

function createImport(imp: Import<unknown>, variableName: string): string {
  const variableDeclaration = imp.name
    ? `{ ${imp.name} as ${variableName} }`
    : variableName;

  return `import ${variableDeclaration} from "${imp.path}";\n`;
}

export function serialize(value: Array<unknown>): string {
  let serializedValue = "";
  let counter = 0;

  function handleImports(item: any) {
    if (item instanceof Object) {
      Object.entries(item).forEach(([key, value]) => {
        if (isImport(value)) {
          counter++;
          const variableName = `__v_${counter}`;
          serializedValue += createImport(value, variableName);
          item[key] = variableName;
        } else if (value instanceof Object) {
          handleImports(value);
        }
      });
    }
  }

  value.forEach(handleImports);

  serializedValue += "\n";

  const js = serializeJs(value, {
    space: 2,
    unsafe: true,
    ignoreFunction: true,
  }).replace(/"__v_(\d+)"/g, (_, index) => {
    return `__v_${index}`;
  });

  serializedValue += "export default " + js;

  return serializedValue;
}
