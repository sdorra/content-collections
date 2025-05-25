import { spawn } from "cross-spawn";
import { detect } from "package-manager-detector/detect";

function createPackageManager(directory: string, name: string) {
  function run(args: Array<string>): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(name, args, {
        cwd: directory,
      });

      child.on("exit", (code: number) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with code ${code}`));
        }
      });
    });
  }

  const add = name === "npm" ? "install" : "add";

  return {
    name,
    addDependencies: async (...dependencies: Array<string>) => {
      await run([add, ...dependencies]);
    },
    addDevDependencies: async (...dependencies: Array<string>) => {
      await run([add, "-D", ...dependencies]);
    },
  };
}

async function getPackageManager(targetDir: string) {
  const result = await detect({ cwd: targetDir });
  if (!result) {
    return "npm";
  }

  return result.name;
}

export async function detectPackageManager(directory: string) {
  const packageManagerName = await getPackageManager(directory);
  return createPackageManager(directory, packageManagerName);
}
