import { Context, Meta } from "@content-collections/core";
import { existsSync } from "fs";
import fs from "fs/promises";
import { bundleMDX } from "mdx-bundler";
import path from "path";
import { Pluggable, Transformer } from "unified";
import type { Plugin } from "esbuild";

type Document = {
  _meta: Meta;
  content: string;
};

type FileAppender = ReturnType<typeof createFileAppender>;

export type Options = {
  cwd?: string;
  files?: (appender: FileAppender) => void;
  remarkPlugins?: Pluggable[];
  rehypePlugins?: Pluggable[];
  esbuildOptions?: (options: any) => any;
  jsxConfig?: {
    jsxLib: {
      varName: string;
      package: string;
    };
    jsxDom?: {
      varName: string;
      package: string;
    };
    jsxRuntime: {
      varName: string;
      package: string;
    };
  };
};

export type QwikOptions = Options & {
  qwikOptimizer?: any; // Options for @qwik.dev/core/optimizer createOptimizer
};

async function appendFile(
  files: Record<string, string>,
  importPath: string,
  filePath: string,
) {
  files[importPath] = await fs.readFile(filePath, "utf-8");
}

async function appendDirectory(
  files: Record<string, string>,
  importPathPrefix: string,
  directoryPath: string,
) {
  if (!existsSync(directoryPath)) {
    return;
  }
  const fileNames = await fs.readdir(directoryPath);
  for (const fileName of fileNames) {
    const filePath = path.join(directoryPath, fileName);
    const { name } = path.parse(filePath);
    files[`${importPathPrefix}/${name}`] = await fs.readFile(filePath, "utf-8");
  }
}

function createFileAppender(
  tasks: Promise<void>[],
  files: Record<string, string>,
) {
  return {
    content: (importPath: string, content: string) => {
      files[importPath] = content;
    },
    file: (importPath: string, filePath: string) => {
      tasks.push(appendFile(files, importPath, filePath));
    },
    directory: (importPath: string, directoryPath: string) => {
      tasks.push(appendDirectory(files, importPath, directoryPath));
    },
  };
}

async function createFiles(options: Options): Promise<Record<string, string>> {
  const files: Record<string, string> = {};
  if (options.files) {
    const tasks: Promise<void>[] = [];
    const appender = createFileAppender(tasks, files);
    options.files(appender);
    await Promise.all(tasks);
  }
  return files;
}

function addMetaToVFile(_meta: Meta): Pluggable {
  return (): Transformer => (_, vFile) => {
    Object.assign(vFile.data, { _meta });
  };
}

async function compile(document: Document, options: Options = {}) {
  const files = await createFiles(options);

  const { code } = await bundleMDX({
    source: document.content,
    cwd: options.cwd,
    files,
    jsxConfig: options.jsxConfig,
    esbuildOptions(esbuildOptions) {
      if (!esbuildOptions.define) {
        esbuildOptions.define = {};
      }
      const env = process.env.NODE_ENV ?? "production";
      esbuildOptions.define["process.env.NODE_ENV"] = JSON.stringify(env);
      
      // Apply custom esbuild options if provided
      return options.esbuildOptions ? options.esbuildOptions(esbuildOptions) : esbuildOptions;
    },
    mdxOptions(mdxOptions) {
      mdxOptions.rehypePlugins = [...(options.rehypePlugins ?? [])];

      mdxOptions.remarkPlugins = [
        addMetaToVFile(document._meta),
        ...(options.remarkPlugins ?? []),
      ];

      return mdxOptions;
    },
  });
  return code;
}

// Create a Qwik esbuild plugin that intercepts and transforms components from disk
function createQwikEsbuildPlugin(qwikOptimizer: any = {}): Plugin {
  return {
    name: 'qwik-optimizer',
    setup(build) {
      console.log('🔧 Qwik esbuild plugin setup called');
      
      // Hook into onLoad BEFORE inMemoryPlugin to intercept disk reads
      build.onLoad({ filter: /\.(tsx?|jsx?)$/ }, async (args) => {
        console.log('🔍 Qwik plugin checking file:', args.path);
        
        try {
          // Only handle files that exist on disk (not in-memory from files object)
          if (!existsSync(args.path)) {
            console.log('❌ File does not exist on disk, skipping:', args.path);
            return null;
          }

          const content = await fs.readFile(args.path, 'utf-8');
          
          // Quick check if this is likely a Qwik component
          if (!content.includes('component$')) {
            console.log('❌ Not a Qwik component (no component$):', args.path);
            return null; // Not a Qwik component, let other plugins handle
          }

          console.log('🎯 Transforming Qwik component:', args.path);

          // We need to use dynamic import here to avoid bundling issues
          // But we'll handle the error gracefully
          const { createOptimizer } = await import('@qwik.dev/core/optimizer');
          const optimizer = await createOptimizer(qwikOptimizer);

          // Transform with Qwik optimizer - configure to inline everything (no separate chunks)
          const transformResult = await optimizer.transformModules({
            srcDir: path.resolve(process.cwd(), 'src'),
            input: [{
              path: path.relative(path.resolve(process.cwd(), 'src'), args.path),
              code: content
            }],
            entryStrategy: { type: 'inline' }, // Use inline strategy to avoid separate chunks
            minify: 'none',
            sourceMaps: false,
            transpileTs: true,
            transpileJsx: true,
            explicitExtensions: false, // Don't add explicit extensions
            preserveFilenames: false, // Don't preserve filenames to avoid conflicts
            mode: 'dev'
          });
          
          if (transformResult.modules && transformResult.modules.length > 0) {
            const relativePath = path.relative(path.resolve(process.cwd(), 'src'), args.path);
            // Qwik optimizer changes .tsx to .js, so try both
            const relativePathWithJs = relativePath.replace(/\.tsx?$/, '.js');
            
            console.log('🔍 Looking for module:', relativePath, 'or', relativePathWithJs);
            
            const mainModule = transformResult.modules.find((m: any) => 
              m.path === relativePath || m.path === relativePathWithJs
            );
            
            if (mainModule) {
              console.log('✅ Qwik component transformed successfully');
              console.log(`Generated ${transformResult.modules.length} module(s)`);
              
              return {
                contents: mainModule.code,
                loader: 'tsx' as const // Keep original loader type
              };
            } else {
              console.log('❌ Main module not found');
              console.log('Available modules:');
              transformResult.modules.forEach((m: any, i: number) => {
                console.log(`  ${i}: ${m.path}`);
              });
            }
          }

          console.log('❌ No main module found, falling back to original');
          return null;

        } catch (error) {
          console.error('Failed to transform Qwik component:', error);
          return null; // Let other plugins handle
        }
      });
    }
  };
}

// Remove all unnecessary keys from the document
// and return a new object containing only the keys
// that should trigger a regeneration if changed.
function createCacheKey(document: Document): Document {
  const { content, _meta } = document;
  return { content, _meta };
}

export function compileMDX(
  { cache }: Pick<Context, "cache">,
  document: Document,
  options?: Options,
) {
  const cacheKey = createCacheKey(document);
  return cache(cacheKey, (doc) => compile(doc, options), {
    key: "__mdx",
  });
}

/**
 * Qwik-specific MDX compilation with automatic Qwik transformation
 * @param context - Content collections context  
 * @param document - Document to compile
 * @param options - Compilation options
 * @returns Compiled MDX code
 */
export async function compileMDXWithQwik(
  context: Pick<Context, "cache">,
  document: Document,
  options: QwikOptions = {},
) {
  const { qwikOptimizer, ...mdxOptions } = options;
  
  console.log('🚀 Starting Qwik MDX compilation for:', document._meta.filePath);
  
  // Create the Qwik esbuild plugin
  const qwikPlugin = createQwikEsbuildPlugin(qwikOptimizer);
  
        // Enhanced options that include the Qwik plugin in esbuild
      const enhancedOptions: Options = {
        ...mdxOptions,
        esbuildOptions: (esbuildOptions) => {
          // Apply any existing esbuild options first
          const baseOptions = mdxOptions.esbuildOptions ? mdxOptions.esbuildOptions(esbuildOptions) : esbuildOptions;

          // Add our Qwik plugin to the FRONT of the plugins array so it runs before mdx-bundler's inMemoryPlugin
          if (!baseOptions.plugins) {
            baseOptions.plugins = [];
          }
          baseOptions.plugins.unshift(qwikPlugin); // unshift instead of push to add to front

          console.log('Adding Qwik optimizer plugin to esbuild (at front of plugins array)');

          return baseOptions;
        },
        jsxConfig: {
          jsxLib: { package: "@qwik.dev/core", varName: "Qwik" },
          jsxRuntime: { package: "@qwik.dev/core/jsx-runtime", varName: "_jsx_runtime" },
        },
      };

  const result = await compileMDX(context, document, enhancedOptions);
  
  console.log('✅ Qwik MDX compilation complete');
  console.log('Result contains componentQrl:', result.includes('componentQrl'));
  console.log('Result contains inlinedQrl:', result.includes('inlinedQrl'));
  
  return result;
}
