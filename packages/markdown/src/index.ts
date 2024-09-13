import { Context, Meta } from "@content-collections/core";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
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

  builder.use(remarkRehype, {
    allowDangerousHtml: options?.allowDangerousHtml,
  });
  if (options?.allowDangerousHtml) {
    builder.use(rehypeRaw);
  }

  if (options?.rehypePlugins) {
    builder.use(options.rehypePlugins);
  }

  const html = await builder.use(rehypeStringify).process(document.content);

  return String(html);
}

// Remove all unnecessary keys from the document
// and return a new object containing only the keys
// that should trigger a regeneration if changed.
function createCacheKey(document: Document): Document {
  const { content, _meta } = document;
  return { content, _meta };
}

export function compileMarkdown(
  { cache }: Pick<Context, "cache">,
  document: Document,
  options?: Options,
) {
  const cacheKey = createCacheKey(document);
  return cache(cacheKey, (doc) => compile(doc, options));
}
