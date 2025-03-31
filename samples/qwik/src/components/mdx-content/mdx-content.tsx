import { component$ } from "@builder.io/qwik";
import { getMDXComponent, type MDXContentProps } from "mdx-bundler/client";
import * as Qwik from "@builder.io/qwik";

type Props = MDXContentProps & {
  code: string;
};

export function useMDXComponent(code: string): Qwik.Component<Props> {
  const jsxComponentConfig = { 
    Qwik,
    _jsx_runtime: {
      jsx: Qwik.jsx,
      jsxs: Qwik.jsx,
      Fragment: Qwik.Fragment
    }
  }

  return getMDXComponent(code, jsxComponentConfig);
}

export const MDXContent = component$(({ code, ...props }: Props) => {
  const Component = useMDXComponent(code);

  return <Component {...props} />;
})