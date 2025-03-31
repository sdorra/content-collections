import { component$ } from "@builder.io/qwik";
import { getMDXComponent } from "mdx-bundler/client";
export function useMDXComponent(code: string): any {
  return getMDXComponent(code);
} 

export const MDXContent = component$(() => {
  return <div>MDX Content</div>;
})