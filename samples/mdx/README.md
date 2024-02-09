---
title: MDX
description: Use MDX files with Content Collections
stackBlitz:
  file: content/001-hello-world.md
---

In order to use [MDX](https://mdxjs.com/) files with Content Collections, we have to transform the collected content.

```ts
import { defineCollection, defineConfig } from "@content-collections/core";
import { compile } from "@mdx-js/mdx";

const posts = defineCollection({
  name: "posts",
  directory: "content",
  include: "*.md",
  schema: (z) => ({
    title: z.string(),
    date: z.date(),
  }),
  transform: async ({ content, ...data }) => {
    const body = String(
      await compile(content, {
        outputFormat: "function-body",
      })
    );
    return {
      ...data,
      body,
    };
  },
});

export default defineConfig({
  collections: [posts],
});
```

In the example above, we use the `transform` function to compile the collected content with `@mdx-js/mdx` and add the compiled body to the collected data.

Now we need a component to render the compiled MDX:

```tsx
import { Fragment, useEffect, useState } from "react";
import * as runtime from "react/jsx-runtime";
import { run } from "@mdx-js/mdx";

type Props = {
  code: string;
};

type MdxModule = Awaited<ReturnType<typeof run>>;

export function MdxContent({ code }: Props) {
  const [mdxModule, setMdxModule] = useState<MdxModule>();
  const Content = mdxModule && mdxModule.default;

  useEffect(
    function () {
      (async function () {
        setMdxModule(
          await run(code, { ...runtime, baseUrl: import.meta.url, Fragment })
        );
      })();
    },
    [code]
  );

  if (!Content) {
    return null;
  }

  return <Content />;
}
```

Now we can use the `MdxContent` component to render the compiled MDX:

```tsx
import { allPosts } from "content-collections";
import { MdxContent } from "./MdxContent";

export default function App() {
  return (
    <main>
      <h1>Posts</h1>
      <ul>
        {allPosts.map((post) => (
          <li key={post._meta.path}>
            <h2>{post.title}</h2>
            <MdxContent code={post.body} />
          </li>
        ))}
      </ul>
    </main>
  );
}
```
