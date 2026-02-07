---
title: Markdown
description: Use Markdown files with Content Collections
tags:
  - markdown
  - react
  - vite
adapter: vite
---

There are many ways to use markdown files with Content Collections.
We can use packages like [react-markdown](https://github.com/remarkjs/react-markdown) to compile the files at runtime.
Or we can use [remark](https://github.com/remarkjs/remark) to compile the files at build time.
The package `@content-collections/markdown` simplifies the usage of remark with Content Collections.
Let's see how we can use it.

First we have to install the package `@content-collections/markdown` package.

```sh
pnpm add @content-collections/markdown
```

After installing the package, we can use the `compileMarkdown` function to compile the content of our document.

```ts
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMarkdown } from "@content-collections/markdown";
import { z } from "zod";

const posts = defineCollection({
  name: "posts",
  directory: "content",
  include: "*.md",
  schema: z.object({
    title: z.string(),
  }),
  transform: async (document, context) => {
    const html = await compileMarkdown(context, document);
    return {
      ...document,
      html,
    };
  },
});

export default defineConfig({
  content: [posts],
});
```

Now we can use the compiled `html` in our project.
The following snippet shows an example with React.

```tsx
import { allPosts } from "content-collections";

export default function App() {
  return (
    <main>
      <h1>Posts</h1>
      <ul>
        {allPosts.map((post) => (
          <li key={post._meta.path}>
            <h2>{post.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: post.html }} />
          </li>
        ))}
      </ul>
    </main>
  );
}
```

And the next snippet shows an example with Svelte.

```svelte
<script>
  import { allPosts } from "content-collections";
</script>

<h1>Posts</h1>

<ul>
  {#each allPosts as post}
    <li>
      <h2>{post.title}</h2>
      <div>{@html post.html}</div>
    </li>
  {/each}
</ul>
```

And the last snippet shows an example with Solid.

```tsx
import { allPosts } from "content-collections";

export default function App() {
  return (
    <main>
      <h1>Posts</h1>
      <ul>
        {allPosts.map((post) => (
          <li>
            <h2>{post.title}</h2>
            <div innerHTML={post.html} />
          </li>
        ))}
      </ul>
    </main>
  );
}
```

And that's it!
