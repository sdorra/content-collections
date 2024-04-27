---
title: React Markdown
description: How to use Content Collections with React Markdown
tags:
- markdown
- react
- vite
---

It is very easy to use Content Collections with React Markdown.
Just pass the `content` from your collected markdown files as `children` to the `ReactMarkdown` component.

```tsx
import { allPosts } from "content-collections";
import Markdown from "react-markdown";

function Posts() {
  return (
    <main>
      <h1>Posts</h1>
      {allPosts.map((post) => (
        <article key={post._meta.path}>
          <h2>{post.title}</h2>
          <Markdown>{post.content}</Markdown>
        </article>
      ))}
    </main>
  );
}
```
