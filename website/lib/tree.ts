import { allDocs } from "content-collections";

type Node<T> = {
  name: string;
  data?: T;
  children: Node<T>[];
};

export function isLeadNode<T>(node: Node<T>) {
  return node.data && node.children.length === 0;
}

type SlugExtractor<T> = (data: T) => string;

function createTree<T>(data: Array<T>, slugExtractor: SlugExtractor<T>) {
  const root: Node<T> = {
    name: "",
    children: [],
  };

  for (const item of data) {
    const slug = slugExtractor(item);
    const parts = slug.split("/");
    let current = root;

    for (let idx = 0; idx < parts.length; idx++) {
      const part = parts[idx];

      let child = current.children.find((node) => node.name === part);
      if (!child) {
        child = {
          name: part,
          children: [],
        };
        current.children.push(child);
      }

      current = child;

      if (idx === parts.length - 1) {
        current.data = item;
      }
    }
  }

  return root;
}

export const docsTree = createTree(allDocs, (doc) => doc.slug);
