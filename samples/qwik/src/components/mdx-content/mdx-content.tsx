import { component$ } from "@qwik.dev/core";
import { getMDXComponent, type MDXContentProps } from "mdx-bundler/client";
import * as Qwik from "@qwik.dev/core";

type Props = MDXContentProps & {
  code: string;
};

export function useMDXComponent(code: string): Qwik.Component<Props> {
  const jsxComponentConfig = { 
    Qwik,
    _jsx_runtime: {
      jsx: Qwik.jsx,
      jsx: Qwik.jsx,
      Fragment: Qwik.Fragment
    }
  }

  const result = getMDXComponent(code, jsxComponentConfig);

  console.log("RESULT", result);

  return result;
}

export const MDXContent = component$(({ code, ...props }: Props) => {
  const Component = useMDXComponent(code);

  return <Component {...props} />;
})