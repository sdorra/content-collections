---
title: Command Line Interface
---

1. Install required packages:

   We have to install the following packages:

   - `@content-collections/core`
   - `@content-collections/cli`
   - `concurrently`

   ```bash
   pnpm add -D @content-collections/core @content-collections/cli concurrently
   ```

1. Adjust your `tsconfig.json`:

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

   We require a path alias for the generated files.
   This is necessary because the CLI will generate the files in the `.content-collections/generated` folder.

1. Add the content-collection cli to your `package.json` scripts:

   ```json
   {
     "scripts": {
       "dev": "concurrently 'content-collections watch' 'build-scripts dev'",
       "build": "content-collections build && build-scripts build"
     }
   }
   ```

   First, we modify the `dev` script to simultaneously execute the `content-collections watch` command along with our regular `dev` command.

   Next, we execute the `content-collections build` command prior to our regular `build` command.

   **Note:** Make sure to replace `build-scripts` with the appropriate command for your framework, such as `next` or `vite`.

