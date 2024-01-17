import { Fragment, useEffect, useState } from "react";
import * as runtime from "react/jsx-runtime";
import { run } from "@mdx-js/mdx";
import { Callout } from "./Callout";

type Props = {
  code: string;
};

export function MdxContent({ code }: Props) {
  const [mdxModule, setMdxModule] = useState<Awaited<ReturnType<typeof run>>>();
  const Content = mdxModule && mdxModule.default;

  useEffect(
    function () {
      (async function () {
        setMdxModule(
          await run(code, { ...runtime, baseUrl: import.meta.url, Fragment })
        );
      })();
    },
    [code]
  );

  if (!Content) {
    return null;
  }

  return <Content components={{ Callout }} />;
}
