import { ShikiTransformer } from "shiki";
import { TsPrompt } from "./TsPrompt";

type ValueElement = {
  value: string;
};

function isValueElement(el: any): el is ValueElement {
  return "value" in el;
}

function createTsPrompt(elements: string[]) {
  return <TsPrompt elements={elements} />;
}

function handleComment(comment: string) {
  let c = comment.replace("/*", "");
  c = c.replace("*/", "");
  c = c.trim();
  if (c.startsWith("ts-prompt:")) {
    c = c.substring("ts-prompt:".length);
    return createTsPrompt(c.split("|"));
  } else if (c === "highlight-start") {
    return '<div className="opacity-10">';
  } else if (c === "highlight-end") {
    return "</div>";
  }

  return comment;
}

export const commentTransformer = (className?: string): ShikiTransformer => ({
  pre(node) {
    /*node.properties.className = cn(
      "p-4 rounded-md shadow-md text-sm overflow-x-scroll overflow-y-visible",
      className
    );*/
  },
  span(node) {
    for (const el of node.children) {
      if (isValueElement(el)) {
        const value = el.value;
        if (value.trim().startsWith("/*")) {
          // @ts-ignore do not know how to fix the type for this
          el.value = handleComment(value);
        }
      }
    }
  },
});
