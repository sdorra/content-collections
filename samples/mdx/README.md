---
title: MDX
description: Use MDX files with Content Collections
stackBlitz:
  file: content/001-hello-world.md
---

In order to use [MDX](https://mdxjs.com/) files with Content Collections, we have to transform the collected content.
We have a special package to simplify this process.
Let's see how we can use it.

First we have to install the package `@content-collections/mdx` package.

```sh
pnpm add @content-collections/mdx
```

After installing the package, we can use the `compileMDX` function to compile the content of our document.

```ts
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";

const posts = defineCollection({
  name: "posts",
  directory: "content",
  include: "*.mdx",
  schema: (z) => ({
    title: z.string(),
    date: z.date(),
  }),
  transform: async (document, context) => {
    const body = await compileMDX(context, document);
    return {
      ...document,
      body,
    };
  },
});

export default defineConfig({
  collections: [posts],
});
```

Now we can use the `MDXContent` component to render the compiled MDX.

```tsx
import { allPosts } from "content-collections";
import { MDXContent } from "@content-collections/mdx/react";

export default function App() {
  return (
    <main>
      <h1>Posts</h1>
      <ul>
        {allPosts.map((post) => (
          <li key={post._meta.path}>
            <h2>{post.title}</h2>
            <MDXContent code={post.body} />
          </li>
        ))}
      </ul>
    </main>
  );
}
```

And that's it! Now we can use MDX files with Content Collections.
