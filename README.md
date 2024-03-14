# Content Collections

<a href="https://content-collections.dev">
  <img align="left" width="96" height="96" src="https://github.com/sdorra/content-collections/blob/main/website/assets/logo_96x96.png?raw=true" alt="logo: A staple of books">
</a>

Transform your content into type-safe data collections. Eliminate the need for manual data fetching and parsing. Simply import your content and begin. Built-in validation ensures the accuracy of your data. Preprocess your data before it enters your app.

## Features

- **Beautiful DX**:
  Content Collections is designed to provide a pleasurable user experience. It offers a seamless developer experience without the need to restart the server or refresh the browser. Content collections are automatically updated when you make changes to your content.

- **Type-safe**:
  Your content is parsed and validated during the build process, guaranteeing accuracy and currency. Content Collections offers a type-safe API to access your content.

- **Simple to use**:
  No need to manually fetch and parse your content anymore. Just import it and start using Content Collections. It provides a simple API, allowing you to concentrate on building your app.

- **Tansformation**:
  Content Collections allows you to transform your content before it enters your app. You can use it to modify your content, join two collections or even fetch data from a server.

## Installation

1. Install required packages:

   ```bash
   pnpm add -D @content-collections/core @content-collections/cli concurrently
   ```

1. Add path alias to your `tsconfig.json`:

   ```json
   {
     "compilerOptions": {
       // ...
       "paths": {
         "content-collections": ["./.content-collections/generated"]
       }
     }
   }
   ```

1. Update your scripts in `package.json`:

   ```json
   {
     "scripts": {
       "dev": "concurrently 'content-collections watch' 'build-scripts dev'",
       "build": "content-collections build && build-scripts build"
     }
   }
   ```

## Usage

1. Create a content-collections.ts file at the root of your project:

   ```ts
   import { defineCollection, defineConfig } from "@content-collections/core";

   const posts = defineCollection({
     name: "posts",
     directory: "src/posts",
     include: "**/*.md",
     schema: (z) => ({
       title: z.string(),
       summary: z.string(),
     }),
   });

   export default defineConfig({
     collections: [posts],
   });
   ```

1. Start writing content in `src/posts`:

   ```md
   ---
   title: Hello World
   summary: This is my first post
   ---

   # Hello World

   This is my first post.
   ```

1. Use your content in your app:

   ```tsx
   import { allPosts } from "content-collections";

   export function Posts() {
     return (
       <ul>
         {allPosts.map((post) => (
           <li key={post._meta.path}>
             <a href={`/posts/${post._meta.path}`}>
               <h3>{post.title}</h3>
               <p>{post.summary}</p>
             </a>
           </li>
         ))}
       </ul>
     );
   }
   ```

For a more detailed guide, please refer to the [documentation](https://content-collections.dev/docs/guides/getting-started).

## Sponsors

<a href="https://supastarter.dev">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/sponsors/supastarter/dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="./assets/sponsors/supastarter/light.svg">
    <img alt="supastarter" src="./assets/sponsors/supastarter/light.svg" height="64">
  </picture>
</a>

### [Become a sponsor](https://github.com/sponsors/sdorra)

## License

Content Collections is licensed under the [MIT License](./LICENSE).
