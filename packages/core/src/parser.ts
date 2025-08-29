import matter from "gray-matter";
import { parse, stringify } from "yaml";

type ParseFn = (
  content: string,
) => Record<string, unknown> | Promise<Record<string, unknown>>;

export type Parser = {
  hasContent: boolean;
  parse: ParseFn;
};

export type PredefinedParsers = typeof parsers;
export type PredefinedParser = keyof typeof parsers;

export type ConfiguredParser = PredefinedParser | Parser;

function parseYaml(content: string) {
  return parse(content.trim());
}

function frontmatter(fileContent: string) {
  return matter(fileContent, {
    engines: {
      yaml: {
        parse: parseYaml,
        stringify,
      },
    },
  });
}

function frontmatterParser(fileContent: string) {
  const { data, content } = frontmatter(fileContent);

  return {
    ...data,
    content: content.trim(),
  };
}

function frontmatterOnlyParser(fileContent: string) {
  const { data } = frontmatter(fileContent);

  return data;
}

export const parsers = {
  frontmatter: {
    hasContent: true,
    parse: frontmatterParser,
  },
  ["frontmatter-only"]: {
    hasContent: false,
    parse: frontmatterOnlyParser,
  },
  json: {
    hasContent: false,
    parse: JSON.parse,
  },
  yaml: {
    hasContent: false,
    parse: parseYaml,
  },
} satisfies Record<string, Parser>;

export function getParser(configuredParser: ConfiguredParser): Parser {
  if (typeof configuredParser === "string") {
    return parsers[configuredParser];
  }
  return configuredParser;
}

type DefineParserResult<TArgument extends Parser | ParseFn> =
  TArgument extends Function
    ? {
        hasContent: false;
        parse: ParseFn;
      }
    : TArgument extends infer Parser
      ? Parser
      : never;

export function defineParser<TArgument extends Parser | ParseFn>(
  parser: TArgument,
): DefineParserResult<TArgument> {
  if (typeof parser === "function") {
    return {
      hasContent: false,
      parse: parser,
    } as DefineParserResult<TArgument>;
  }

  return parser as DefineParserResult<TArgument>;
}

export function isValidParser(parser: ConfiguredParser): parser is Parser {
  if (typeof parser === "string") {
    return parser in parsers;
  }
  return "hasContent" in parser && typeof parser.parse === "function";
}
