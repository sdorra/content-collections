import { Context, Meta } from "@content-collections/core";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import { Pluggable, Transformer, unified } from "unified";

type Document = {
  _meta: Meta;
  content: string;
};

type Options = {
  allowDangerousHtml?: boolean;
  remarkPlugins?: Pluggable[];
  rehypePlugins?: Pluggable[];
};

function addMetaToVFile(_meta: Meta) {
  return (): Transformer => (_, vFile) => {
    Object.assign(vFile.data, { _meta });
  };
}

async function compile(document: Document, options?: Options) {
  const builder = unified().use(remarkParse);
  builder.use(addMetaToVFile(document._meta));

  if (options?.remarkPlugins) {
    builder.use(options.remarkPlugins);
  }

  builder.use(remarkRehype, { allowDangerousHtml: options?.allowDangerousHtml });
  if (options?.allowDangerousHtml) {
    builder.use(rehypeRaw);
  }

  if (options?.rehypePlugins) {
    builder.use(options.rehypePlugins);
  }

  const html = await builder.use(rehypeStringify).process(document.content);

  return String(html);
}

export function compileMarkdown(
  { cache }: Pick<Context, "cache">,
  document: Document,
  options?: Options
) {
  return cache(document, (doc) => compile(doc, options));
}
