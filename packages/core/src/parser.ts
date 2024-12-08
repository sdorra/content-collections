import matter from "gray-matter";
import { parse, stringify } from "yaml";

export type Parsers = typeof parsers;
export type Parser = keyof typeof parsers;

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
} as const;
