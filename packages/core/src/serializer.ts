import serializeJs from "serialize-javascript";
import z from "zod";

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
]);

type Literal = z.infer<typeof literalSchema>;

type SchemaType = Literal | { [key: string]: SchemaType } | SchemaType[];

const schema: z.ZodType<SchemaType> = z.lazy(() =>
  z.union([literalSchema, z.array(schema), z.record(schema)]),
);

export type NotSerializableError =
  `The return type of the transform function must be an object serializable object.
See https://www.content-collections.dev/docs/serialization for more information.

The following type is not valid:`;

export const extension = "js";

export const serializableSchema = z.record(schema);

export type Serializable = z.infer<typeof serializableSchema>;

export function serialize(value: Array<unknown>): string {
  const serializedValue = serializeJs(value, {
    space: 2,
    unsafe: true,
    ignoreFunction: true,
  });
  return `export default ${serializedValue};`;
}
