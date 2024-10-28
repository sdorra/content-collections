import { loadTsConfig, match, tsconfigPathsToRegExp } from "bundle-require";
import { Plugin, build } from "esbuild";
import { dirname, join } from "node:path";

// the code to handle externals is mostly the one which is used by the awesome tsup project
// https://github.com/egoist/tsup

function tsconfigResolvePaths(configPath: string) {
  let tsconfig = loadTsConfig(dirname(configPath));
  if (!tsconfig) {
    tsconfig = loadTsConfig();
  }
  return tsconfig?.data?.compilerOptions?.paths || {};
}

const NON_NODE_MODULE_RE = /^[A-Z]:[/\\]|^\.{0,2}\/|^\.{1,2}$/

function createExternalsPlugin(configPath: string): Plugin {
  const resolvedPaths = tsconfigResolvePaths(configPath);
  const resolvePatterns = tsconfigPathsToRegExp(resolvedPaths);

  return {
    name: "external-packages",
    setup: (build) => {
      build.onResolve({filter: /.*/ }, ({ path, kind }) => {
        if (match(path, resolvePatterns)) {
          if (kind === "dynamic-import") {
            return { path, external: true };
          }
          return;
        }

        if (!NON_NODE_MODULE_RE.test(path)) {
          return {
            path: path,
            external: true,
          }
        }
      });
    },
  };
}

const importPathPlugin: Plugin = {
  name: "import-path",
  setup(build) {
    build.onResolve({ filter: /^\@content-collections\/core$/ }, () => {
      return { path: join(__dirname, "index.ts"), external: true };
    });
  },
};

export async function compile(configurationPath: string, outfile: string) {
  const plugins: Array<Plugin> = [createExternalsPlugin(configurationPath)];
  if (process.env.NODE_ENV === "test") {
    plugins.push(importPathPlugin);
  }

  const result = await build({
    entryPoints: [configurationPath],
    packages: "external",
    bundle: true,
    platform: "node",
    format: "esm",
    plugins,
    outfile,
    metafile: true,
  });

  return Object.keys(result.metafile.inputs);
}
