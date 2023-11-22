import { applyConfig } from "./applyConfig";
import { run } from "./run";

export async function build(config: string) {
  const configuration = await applyConfig(config);
  await run(configuration);
}

export * from "./config";
export type { GetTypeByName } from "./types";
