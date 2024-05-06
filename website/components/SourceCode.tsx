import { codeToHast } from "shiki";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { transformerNotationHighlight } from "@shikijs/transformers";
import { commentTransformer } from "./CommentTransformer";
import { cn } from "@/lib/utils";

type Props = {
  lang: string;
  className?: string;
  lineHighlighter?: boolean;
  children: string | string[];
};

export async function SourceCode({
  lang,
  lineHighlighter,
  className,
  children,
}: Props) {
  let code: string = "";
  if (Array.isArray(children)) {
    code = children.join("\n");
  } else {
    code = children;
  }

  code = code.trim();

  const transformers = [
    commentTransformer(
      cn(className, {
        "line-highlighting": lineHighlighter,
      })
    ),
  ];

  if (lineHighlighter) {
    transformers.push(transformerNotationHighlight());
  }

  const tree = await codeToHast(code, {
    lang,
    theme: "github-dark-dimmed",
    transformers,
  });

  // @ts-ignore typings are wrong
  return toJsxRuntime(tree, { Fragment, jsx, jsxs });
}
