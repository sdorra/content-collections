import matter from "gray-matter";
import { parse, stringify } from "yaml";

export type Parsers = typeof parsers;
export type Parser = keyof typeof parsers;

function frontmatterParser(fileContent: string) {
  const { data, content } = matter(fileContent, {
    engines: {
      yaml: {
        parse,
        stringify,
      },
    },
  });

  return {
    ...data,
    content: content.trim(),
  };
}

export const parsers = {
  frontmatter: {
    hasContent: true,
    parse: frontmatterParser,
  },
  json: {
    hasContent: false,
    parse: JSON.parse,
  },
  yaml: {
    hasContent: false,
    parse,
  },
} as const;
