import z from "zod";
import serializeJs from "serialize-javascript";

const literalSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.undefined(),
]);

type Literal = z.infer<typeof literalSchema>;

type Json = Literal | { [key: string]: Json } | Json[];

const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);

export type NotSerializableError =
  "The return type of the transform function must be an valid JSONObject, the following type is not valid:";

export const extension = "js";

export const serializableSchema = z.record(jsonSchema);

export type Serializable = z.infer<typeof serializableSchema>;

export function serialize(value: Array<unknown>): string {
  const serializedValue = serializeJs(value, { space: 2, isJSON: true, unsafe: true });
  return `export default ${serializedValue};`;
}
