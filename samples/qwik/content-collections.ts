import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";

const qwikBundlerConfig = {
  jsxLib: {
    varName: 'Qwik',
    package: '@qwik.dev/core',
  },
  jsxRuntime: {
    varName: '_jsx_runtime',
    package: '@qwik.dev/core/jsx-runtime',
  },
}

const characters = defineCollection({
  name: "characters",
  directory: "characters",
  include: "*.mdx",
  schema: (z) => ({
    name: z.string().min(1),
    origin: z.string().min(1),
    species: z.string().min(1),
    source: z.string().min(1).url(),
  }),
  transform: async (document, context) => {
    console.log("DOCUMENT", document);
    console.log("CONTEXT", context);
    const mdx = await compileMDX(context, document, {
      jsxConfig: qwikBundlerConfig,
    });
    return {
      ...document,
      mdx,
    };
  },
});

export default defineConfig({
  collections: [characters],
});
