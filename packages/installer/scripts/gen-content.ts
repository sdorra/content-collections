import fs from "fs/promises";
import { join } from "path";

function createObject(filename: string, content: string) {
  return `{
    filename: "${filename}",
    content: ${JSON.stringify(content)},
  },`;
}

async function generate(directory: string, varName: string) {
  const filenames = (await fs.readdir(directory)).filter((filename) =>
    filename.endsWith(".md"),
  );

  let content = `export const ${varName} = [\n`;
  for (const filename of filenames) {
    const filePath = join(directory, filename);
    const fileContent = await fs.readFile(filePath, "utf-8");

    const object = createObject(filename, fileContent);
    content += object;
  }

  content += "];\n";

  const tsFilePath = join(directory, "index.ts");
  await fs.writeFile(tsFilePath, content);
}

generate("src/migration/content/posts", "allPosts");
