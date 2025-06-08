---
title: Svelte Markdown Example
summary: Markdown with Svelte Components, Remark and Rehype support, simular as MDX, just for Svelte
---

## GFM

### Autolink literals

www.example.com, https://example.com, and contact@example.com.

### Footnote

A note[^1]

Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est

### Strikethrough

~one~ or ~~two~~ tildes.

### Table

| a   | b   |   c |  d  |
| --- | :-- | --: | :-: |
| aaa | bbb | ccc | ddd |

### Tasklist

- [ ] to do
- [x] done

---

## RehypeSlug

### Internal-Links

Go to [Svelte Component](#svelte-component)

---

## Element Design

### Markdown Bold

This is a **markdown** paragraph.

### HTML paragraph with strong

<p>This is an <strong>HTML</strong> paragraph</p>

### HTML DIV with RED style

<div style="background-color: red; color: white;">html div element without tab and with style is parsed</div>

### HTML as Text (by TAB)

    <div>just html TEXT - div element starting with a tab</div>

### Markdown Element added Attribute Pink by rehype-attr

<!--rehype:style=color:pink;-->

### Code support, extendable via Shiki etc.

```typescript
console.log("Hello, world!");
```

---

### Working Svelte Components

Click to count <Counter />

---

## What not works, yet

- Adding Element multiple Attributes/Props

---

[^1]: look into the source at https://github.com/sdorra/content-collections/samples/svelte-kit/posts/md-svelte-support.md
