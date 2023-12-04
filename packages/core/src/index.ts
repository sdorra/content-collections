import path from "path";
import { applyConfig } from "./applyConfig";
import { createRunner } from "./run";

export async function build(config: string) {
  const configuration = await applyConfig(config);
  const baseDirectory = path.dirname(config);
  const directory = path.join(baseDirectory, ".mdx-collections", "generated");
  const runner = await createRunner(configuration, directory);
  await runner.run();
}

export * from "./config";
export { applyConfig, createRunner };
export type { GetTypeByName, Modification } from "./types";
