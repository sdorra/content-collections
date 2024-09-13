import { ReactElement } from "react";
import { ShikiTransformer } from "shiki";

type Components = Record<string, ReactElement>;

type ValueElement = {
  value: string;
};

function isValueElement(el: any): el is ValueElement {
  return typeof el.value === "string";
}

function componentNameFromComment(
  prefix: "cmp-line" | "cmp-inline",
  comment: string,
) {
  let c = comment.replace("/*", "").replace("*/", "").trim();
  if (c.startsWith(prefix + ":")) {
    return c.replace(prefix + ":", "").trim();
  }
}

function findLineComponent(node: any) {
  for (const el of node.children || []) {
    if (isValueElement(el)) {
      const value = el.value;
      if (value.trim().startsWith("/*")) {
        const cmp = componentNameFromComment("cmp-line", value.trim());
        if (cmp) {
          return cmp;
        }
      }
    }
    return findLineComponent(el);
  }
}

export function commentComponentTransformer(
  components: Components,
): ShikiTransformer {
  return {
    line(node) {
      let cmp = findLineComponent(node);
      if (!cmp) {
        return node;
      }

      return {
        type: "element",
        tagName: "div",
        properties: {
          class: "cmp line",
        },
        children: [
          {
            type: "text",
            value: components[cmp] as any,
          },
        ],
      };
    },

    code(node) {
      // remove next line if the previous line was a div
      for (let i = 0; i < node.children.length; i++) {
        const el = node.children[i];
        if (el.type === "element" && el.tagName === "div") {
          const next = node.children[i + 1];
          if (next && next.type === "text" && next.value === "\n") {
            node.children.splice(i + 1, 1);
          }
        }
      }
    },

    span(node, children) {
      for (const el of node.children) {
        if (isValueElement(el)) {
          const value = el.value;
          if (value.trim().startsWith("/*")) {
            const cmp = componentNameFromComment("cmp-inline", value);
            if (cmp) {
              console.log(JSON.stringify(el, null, 2));
              // @ts-ignore
              el.value = components[cmp];
            }
          }
        }
      }
    },
  };
}
