import { Plugin } from "esbuild";
import { match, loadTsConfig, tsconfigPathsToRegExp } from "bundle-require";
import { dirname } from "node:path";

// Must not start with "/" or "./" or "../" or "C:\" or be the exact strings ".." or "."


function tsconfigResolvePaths(configPath: string) {
  let tsconfig = loadTsConfig(process.cwd(), "tsconfig.json");
  if (!tsconfig) {
    tsconfig = loadTsConfig(dirname(configPath), "tsconfig.json");
  }
  return tsconfig?.data?.compilerOptions?.paths || {};
}

export function createExternalsPlugin(configPath: string): Plugin {
  const resolvedPaths = tsconfigResolvePaths(configPath);
  const resolvePatterns = tsconfigPathsToRegExp(resolvedPaths);

  return {
    name: "external-packages",
    setup: (build) => {
      const filter = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/;
      build.onResolve({ filter }, ({ path, kind, ...props }) => {
        if (match(path, resolvePatterns)) {
          if (kind === "dynamic-import") {
            // we treat dynamic imports as external
            console.log("Dynamic import", path, props);
            return { path, external: true };
          }
          return;
        }
        if (path.includes(configPath)) {
          return;
        }
        return { path, external: true };
      });
    },
  };
}
