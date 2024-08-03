import { test } from "vitest";
import os from "node:os";
import fs from "node:fs/promises";
import path, { resolve } from "node:path";

interface TmpDirFixture {
  tmpdir: string;
};

export const tmpdirTest = test.extend<TmpDirFixture>({
  tmpdir: async ({}, use) => {
    const ostmpdir = os.tmpdir();

    const directory = await fs.mkdtemp(path.join(ostmpdir, "vitest-"));
    // we need to call realpath, because mktemp returns /var/folders/... on macOS
    // but the paths which are returned by the watcher are /private/var/folders/...
    const directoryPath = await fs.realpath(directory);
    await use(directoryPath);

    await fs.rm(directory, { recursive: true });
  },
});
