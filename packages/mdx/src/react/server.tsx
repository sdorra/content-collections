import type { MDXContentProps } from "mdx-bundler/client";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _jsx_runtime from "react/jsx-runtime";

export function useMDXComponent(
  code: string,
): React.FunctionComponent<MDXContentProps> {
  // I'm not sure why this works, but usage of getMDXComponent from mdx-bundler/client doesn't work
  const scope = { React, ReactDOM, _jsx_runtime };
  // eslint-disable-next-line
  const fn = new Function(...Object.keys(scope), code);
  return fn(...Object.values(scope)).default;
}

type Props = MDXContentProps & {
  code: string;
};

export function MDXContent({ code, ...props }: Props) {
  const Component = useMDXComponent(code);
  return <Component {...props} />;
}
