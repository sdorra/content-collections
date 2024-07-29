import { Plugin, build } from "esbuild";
import { match, loadTsConfig, tsconfigPathsToRegExp } from "bundle-require";
import { dirname, join } from "node:path";

// the code to handle tsconfig paths is inspired by the awesome tsup project
// https://github.com/egoist/tsup

function tsconfigResolvePaths(configPath: string) {
  let tsconfig = loadTsConfig(dirname(configPath));
  if (!tsconfig) {
    tsconfig = loadTsConfig();
  }
  return tsconfig?.data?.compilerOptions?.paths || {};
}

function createExternalsPlugin(configPath: string): Plugin {
  const resolvedPaths = tsconfigResolvePaths(configPath);
  const resolvePatterns = tsconfigPathsToRegExp(resolvedPaths);

  return {
    name: "external-packages",
    setup: (build) => {
      const filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/;
      build.onResolve({ filter }, ({ path, kind }) => {
        if (match(path, resolvePatterns)) {
          if (kind === "dynamic-import") {
            return { path, external: true };
          }
          return;
        }
        return { path, external: true };
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

  await build({
    entryPoints: [configurationPath],
    packages: "external",
    bundle: true,
    platform: "node",
    format: "esm",
    plugins,
    outfile,
  });
}
