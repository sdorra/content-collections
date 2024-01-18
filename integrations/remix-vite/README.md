---
title: Remix Vite Integration
description: Content Collections integration for Remix (Vite)
linkText: Remix (Vite)
---

1. Install required packages:

   We have to install the following packages:

   - `@content-collections/core`
   - `@content-collections/vite`

   ```bash
   pnpm add -D @content-collections/core @content-collections/vite
   ```

1. Adjust your `tsconfig.json`:

   ```json
   {
     "compilerOptions": {
       // ...
      "paths": {
        "~/*": ["./app/*"],
        "content-collections": ["./.content-collections/generated"]
      },
     }
   }
   ```

   We require a path alias for the generated files.
   This is necessary because we will generate the files in the `.content-collections/generated` folder.

1. Modify your `vite.config.ts`:

   ```ts
   import { unstable_vitePlugin as remix } from "@remix-run/dev";
   import { defineConfig } from "vite";
   import tsconfigPaths from "vite-tsconfig-paths";
   import contentCollections from "@content-collections/vite";

   export default defineConfig({
     plugins: [remix(), tsconfigPaths(), contentCollections()],
   });
   ```

   Add the Content Collections plugin to your Vite config.
