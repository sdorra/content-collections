declare module "*.md.txt" {
  const content: string;
  export default content;
}

declare type DemoContent = false | "markdown" | "mdx";
