import { ZodDefault, ZodEnum, ZodObject, ZodRawShape, ZodTypeAny } from "zod";
import { Migrator } from "./migrator.js";

type BaseOption = {
  name: string;
  description?: string;
  defaultValue?: string;
};

export type InputOption = BaseOption & {
  type: "input";
};

export type ListOption = BaseOption & {
  type: "list";
  choices: string[];
};

export type Option = InputOption | ListOption;

function convertOption(key: string, value: ZodTypeAny): Option {
  let valueType = value;
  let defaultValueResolver = value._def.defaultValue;
  let description = value._def.description;

  if (value instanceof ZodDefault) {
    valueType = value._def.innerType;
    defaultValueResolver = value._def.defaultValue;

    if (!description) {
      description = valueType._def.description;
    }
  }

  const defaultValue = defaultValueResolver
    ? defaultValueResolver()
    : undefined;

  if (valueType instanceof ZodEnum) {
    return {
      type: "list",
      name: key,
      description,
      choices: valueType.options,
      defaultValue,
    }
  }

  return {
    type: "input",
    name: key,
    description,
    defaultValue,
  };
}

export function zodToOptions(schema: ZodObject<ZodRawShape>) {
  const shape = schema._def.shape();
  const options: Array<Option> = [];
  for (const key in shape) {
     const value = shape[key];
     if (!value) {
      throw new Error(`No value for key ${key}`);
     }

     options.push(convertOption(key, value));
  }
  return options;
}

export type Ask = (options: Option) => Promise<string>;

export async function resolveOptions(migrator: Migrator, ask: Ask) {
  const resolvedOptions: any = {};

  const schema = migrator.options;

  const options = zodToOptions(schema);
  for (const option of options) {
    const value = await ask(option);
    resolvedOptions[option.name] = value;
  }

  return schema.parse(resolvedOptions);
}
