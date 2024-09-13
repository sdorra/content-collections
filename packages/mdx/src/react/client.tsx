import { MDXContentProps, getMDXComponent } from "mdx-bundler/client/index.js";
import { useMemo } from "react";

export function useMDXComponent(
  code: string,
): React.FunctionComponent<MDXContentProps> {
  return useMemo(() => getMDXComponent(code), [code]);
}

type Props = MDXContentProps & {
  code: string;
};

export function MDXContent({ code, ...props }: Props) {
  const Component = useMDXComponent(code);
  return <Component {...props} />;
}
