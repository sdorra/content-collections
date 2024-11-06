import fs from "node:fs/promises";
import { join } from "node:path";
import { describe, expect } from "vitest";
import { tmpdirTest } from "../../__tests__/tmpdir.js";
import { modifySvelteKitConfig } from "./svelteconfig.js";

describe("svelte config", () => {
  async function prepare(tmpdir: string, name: string) {
    const source = join(__dirname, "__tests__", "svelte-config", name);

    // copy all files from source directory to tmpdir
    const files = await fs.readdir(source);
    for (const file of files) {
      await fs.copyFile(join(source, file), join(tmpdir, file));
    }
  }

  function readSvelteKitConfig(tmpdir: string) {
    const source = join(tmpdir, "svelte.config.js");
    return fs.readFile(source, "utf-8");
  }

  tmpdirTest("should add alias to default svelte kit config", async ({ tmpdir }) => {
    await prepare(tmpdir, "simple");
    const result = await modifySvelteKitConfig(tmpdir).run();

    const content = await readSvelteKitConfig(tmpdir);

    expect(result.status).toBe("changed");
    expect(content).toContain(
      '"content-collections": "./.content-collections/generated"',
    );
  });

  tmpdirTest("should add alias to config with existing alias object", async ({ tmpdir }) => {
    await prepare(tmpdir, "with-alias-object");
    const result = await modifySvelteKitConfig(tmpdir).run();

    const content = await readSvelteKitConfig(tmpdir);

    expect(result.status).toBe("changed");
    expect(content).toContain(
      '"content-collections": "./.content-collections/generated"',
    );
  });

  tmpdirTest("should add alias to an inline config object", async ({ tmpdir }) => {
    await prepare(tmpdir, "inline-object");
    const result = await modifySvelteKitConfig(tmpdir).run();

    const content = await readSvelteKitConfig(tmpdir);

    expect(result.status).toBe("changed");
    expect(content).toContain(
      '"content-collections": "./.content-collections/generated"',
    );
  });

  tmpdirTest("should add alias only to the default export", async ({ tmpdir }) => {
    await prepare(tmpdir, "second-object");
    const result = await modifySvelteKitConfig(tmpdir).run();

    const content = await readSvelteKitConfig(tmpdir);

    expect(result.status).toBe("changed");
    expect(content).toContain(
      '"content-collections": "./.content-collections/generated"',
    );
  });

  tmpdirTest("should add alias to a config without kit object", async ({ tmpdir }) => {
    await prepare(tmpdir, "without-kit-object");
    const result = await modifySvelteKitConfig(tmpdir).run();

    const content = await readSvelteKitConfig(tmpdir);

    expect(result.status).toBe("changed");
    expect(content).toContain(
      '"content-collections": "./.content-collections/generated"',
    );
  });

  tmpdirTest(
    "should error if svelte.config.js file is not found",
    async ({ tmpdir }) => {
      const result = await modifySvelteKitConfig(tmpdir).run();
      expect(result.status).toBe("error");
      expect(result.message).toContain("could not find svelte.config.js");
    },
  );

  tmpdirTest(
    "should skip if content-collections alias already exists",
    async ({ tmpdir }) => {
      await prepare(tmpdir, "already-configured");
      const result = await modifySvelteKitConfig(tmpdir).run();

      expect(result.status).toBe("skipped");
    },
  );

  tmpdirTest(
    "should error if alias if configured with a different value",
    async ({ tmpdir }) => {
      await prepare(tmpdir, "with-different-alias");
      const result = await modifySvelteKitConfig(tmpdir).run();
      expect(result.status).toBe("error");
      expect(result.message).toContain("content-collections alias already exists with different value");
    },
  );

  tmpdirTest(
    "should error if kit property is not a object expression",
    async ({ tmpdir }) => {
      await prepare(tmpdir, "wrong-type-of-kit-property");
      const result = await modifySvelteKitConfig(tmpdir).run();
      expect(result.status).toBe("error");
      expect(result.message).toContain("kit property value is not an ObjectExpression");
    },
  );

  tmpdirTest(
    "should error if kit is not a object expression",
    async ({ tmpdir }) => {
      await prepare(tmpdir, "wrong-type-of-kit");
      const result = await modifySvelteKitConfig(tmpdir).run();

      expect(result.status).toBe("error");
      expect(result.message).toContain("kit property is not an ObjectProperty or Property");
    },
  );

});
