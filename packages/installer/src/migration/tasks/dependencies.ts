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

export function addDependencies(
  directory: string,
  packageJson: PackageJson,
  dependencies: Array<string>,
  devDependencies: Array<string>,
): Task {
  return {
    name: "Install dependencies",
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
        console.log(
          `dependencies ${[...dependencies, ...devDependencies].join(",")} already installed, skipping`,
        );
        return false;
      }

      const packageManager = await detectPackageManager(directory);

      if (dependenciesToAdd.length > 0) {
        packageManager.addDependencies(...dependenciesToAdd);
      }

      if (devDependenciesToAdd.length > 0) {
        packageManager.addDevDependencies(...devDependenciesToAdd);
      }

      return true;
    },
  };
}
