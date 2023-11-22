import { defineConfig, defineCollection, applyConfig } from "./config";
import { run } from "./run";

export async function build(config: string) {
  const configuration = await applyConfig(config);
  await run(configuration);
}

export { defineConfig, defineCollection };
export type { GetTypeByName } from "./types";
