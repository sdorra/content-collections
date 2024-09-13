import { Context, Meta } from "@content-collections/core";
import { cleanup, render, renderHook, screen } from "@testing-library/react";
import { Node, Parent } from "mdast";
import { Pluggable, Transformer } from "unified";
import { beforeEach, describe, expect, it, vitest } from "vitest";
import { Options, compileMDX } from ".";
import {
  MDXContent as MDXClientContent,
  useMDXComponent as useClientMDXComponent,
} from "./react/client";
import { MDXContent, useMDXComponent } from "./react/server";

type Cache = Context["cache"];

const cache: Cache = (input, fn) => {
  return fn(input) as any;
};

const sampleMeta: Meta = {
  directory: "post",
  extension: ".mdx",
  filePath: "post/index.mdx",
  fileName: "index",
  path: "/post",
};

beforeEach(cleanup);

describe("MDX tests", () => {
  async function mdx(content: string, options?: Options) {
    const mdx = await compileMDX(
      { cache },
      {
        content,
        _meta: sampleMeta,
      },
      options,
    );

    return <MDXContent code={mdx} />;
  }

  it("should render simple MDX", async () => {
    render(await mdx("# Hello World!"));

    expect(screen.getByRole("heading")).toHaveTextContent("Hello World!");
  });

  it("should render MDX with content", async () => {
    const content = await mdx(
      `import HelloWorld from "./HelloWorld";

       <HelloWorld />
    `,
      {
        files: (appender) => {
          appender.content(
            "./HelloWorld",
            "export default function HelloWorld() { return <h1>Hello World!</h1> }",
          );
        },
      },
    );

    render(content);

    expect(screen.getByRole("heading")).toHaveTextContent("Hello World!");
  });

  it("should render MDX with content from file", async () => {
    const content = await mdx(
      `import HelloWorld from "./HelloWorld";

       <HelloWorld />
    `,
      {
        files: (appender) => {
          appender.file("./HelloWorld", "./src/__tests__/HelloWorld.tsx");
        },
      },
    );

    render(content);

    expect(screen.getByRole("heading")).toHaveTextContent("Hello World!");
  });

  it("should render MDX with content from directory", async () => {
    const content = await mdx(
      `import Hello from "./Hello";
       import World from "./World";

       <Hello />
       <World />
    `,
      {
        files: (appender) => {
          appender.directory("./", "./src/__tests__");
        },
      },
    );

    render(content);

    expect(screen.getByRole("heading", { name: "Hello" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "World" })).toBeInTheDocument();
  });

  it("should not fail if directory does not exist", async () => {
    const content = await mdx("# Hello World", {
      files: (appender) => {
        appender.directory("./", "./src/non-existing");
      },
    });

    render(content);

    expect(screen.getByRole("heading")).toHaveTextContent("Hello World");
  });

  function isParentNode(tree: Node): tree is Parent {
    return "children" in tree;
  }

  function isMeta(object: any): object is Meta {
    return "path" in object;
  }

  function createAppenderPlugin(): Pluggable {
    return (): Transformer => (tree, vFile) => {
      let path = "unknown";
      if (isMeta(vFile.data._meta)) {
        path = vFile.data._meta.path;
      }

      if (isParentNode(tree)) {
        tree.children.push({
          type: "heading",
          depth: 2,
          children: [{ type: "text", value: `hello from ${path}` }],
        });
      }
    };
  }

  it("should add _meta to the virtual file system", async () => {
    const content = await mdx("", {
      remarkPlugins: [createAppenderPlugin()],
    });

    render(content);

    expect(screen.getByRole("heading")).toHaveTextContent("hello from /post");
  });

  it("should use passed components", async () => {
    const mdx = await compileMDX(
      { cache },
      {
        content: "<HelloWorld />",
        _meta: sampleMeta,
      },
    );

    function HelloWorld() {
      return <h1>Hello World!</h1>;
    }

    function Content() {
      const Component = useMDXComponent(mdx);
      return <Component components={{ HelloWorld }} />;
    }

    render(<Content />);

    expect(screen.getByRole("heading")).toHaveTextContent("Hello World!");
  });
});

describe("/react (client)", () => {
  async function mdx(content: string, options?: Options) {
    return await compileMDX(
      { cache },
      {
        content,
        _meta: {
          directory: "post",
          extension: ".mdx",
          filePath: "post/index.mdx",
          fileName: "index",
          path: "/post",
        },
      },
      options,
    );
  }

  it("should memoize the component", async () => {
    const content = await mdx("# Memoize");

    const { result, rerender } = renderHook(() =>
      useClientMDXComponent(content),
    );

    const first = result.current;
    rerender();
    const second = result.current;

    expect(first).toBe(second);
  });

  it("should render simple MDX", async () => {
    const code = await mdx("# Hello World!");

    render(<MDXClientContent code={code} />);

    expect(screen.getByRole("heading")).toHaveTextContent("Hello World!");
  });

  it("should only use required props for caching", async () => {
    const cacheFn = vitest.fn();

    const doc = {
      title: "Hello World",
      content: "# hello world",
      _meta: sampleMeta,
    };

    await compileMDX({ cache: cacheFn }, doc);

    const call = cacheFn.mock.calls[0];
    if (!call) {
      throw new Error("cache function was not called");
    }

    const [input] = call;

    expect(Object.keys(input)).toEqual(["content", "_meta"]);
  });
});
