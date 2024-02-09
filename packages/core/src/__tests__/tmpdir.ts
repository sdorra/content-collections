import { test } from "vitest";
import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";

interface TmpDirFixture {
  tmpdir: string;
};

export const tmpdirTest = test.extend<TmpDirFixture>({
  tmpdir: async ({}, use) => {
    const ostmpdir = os.tmpdir();

    const directory = await fs.mkdtemp(path.join(ostmpdir, "vitest-"));

    await use(directory);

    await fs.rm(directory, { recursive: true });
  },
});
