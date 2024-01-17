---
title: Next.js Integration
---

1. Install required packages:

   We have to install the following packages:

   - `@content-collections/core`
   - `@content-collections/next`

   ```bash
   pnpm add -D @content-collections/core @content-collections/next
   ```

1. Adjust your `tsconfig.json`:

   ```json
   {
     "compilerOptions": {
       // ...
       "paths": {
         "@/*": ["./*"],
         "content-collections": ["./.content-collections/generated"]
       }
     }
   }
   ```

   We require a path alias for the generated files.
   This is necessary because we will generate the files in the `.content-collections/generated` folder.

1. Modify your `next.config.js`:

   ```js
   const { withcontentCollections } = require("@content-collections/next");

   /** @type {import('next').NextConfig} */
   const nextConfig = {
      // your next.js config
   };

   module.exports = withcontentCollections(nextConfig);
   ```

   This will add content collections to the build of your next.js app.
