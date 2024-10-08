import { PackageJson } from "src/packageJson.js";
import { detectPackageManager } from "../utils/packageManager.js";
import { Task } from "./index.js";

function alreadyInstalled(packageJson: PackageJson, dependency: string) {
  return (
    (packageJson.dependencies && packageJson.dependencies[dependency]) ||
    (packageJson.devDependencies && packageJson.devDependencies[dependency])
  );
}

function collectDependenciesToAdd(
  packageJson: PackageJson,
  dependencies: Array<string>,
) {
  const dependenciesToAdd = Array<string>();

  for (const dependency of dependencies) {
    if (!alreadyInstalled(packageJson, dependency)) {
      dependenciesToAdd.push(dependency);
    }
  }

  return dependenciesToAdd;
}

type DependenciesTask = Task & {
  dependencies: Array<string>;
  devDependencies: Array<string>;
};

export function addDependencies(
  directory: string,
  packageJson: PackageJson,
  dependencies: Array<string>,
  devDependencies: Array<string>,
): DependenciesTask {
  return {
    name: "Install dependencies",
    dependencies,
    devDependencies,
    run: async () => {
      const dependenciesToAdd = collectDependenciesToAdd(
        packageJson,
        dependencies,
      );
      const devDependenciesToAdd = collectDependenciesToAdd(
        packageJson,
        devDependencies,
      );

      if (dependenciesToAdd.length === 0 && devDependenciesToAdd.length === 0) {
        return {
          status: "skipped",
          message: `dependencies ${[...dependencies, ...devDependencies].join(",")} already installed, skipping`,
        };
      }

      const packageManager = await detectPackageManager(directory);

      if (dependenciesToAdd.length > 0) {
        packageManager.addDependencies(...dependenciesToAdd);
      }

      if (devDependenciesToAdd.length > 0) {
        packageManager.addDevDependencies(...devDependenciesToAdd);
      }

      return {
        status: "changed",
        message: `added dependencies ${[...dependenciesToAdd, ...devDependenciesToAdd].join(",")}`,
      };
    },
  };
}
