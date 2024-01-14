import { allDocs } from "content-collections";
import { notFound } from "next/navigation";
import { run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { Fragment } from "react";
import { Code } from "bright";

type Props = {
  params: {
    category: string;
    page: string;
  };
};

type SyntaxHighlighterProps = {
  lang?: string;
  children?: React.ReactNode;
};

function SyntaxHighlighter({ lang, children }: SyntaxHighlighterProps) {
  return (
    <Code lang={lang} theme="material-palenight">
      {children}
    </Code>
  );
}

export default async function Page({ params: { category, page } }: Props) {
  const docPage = allDocs.find(
    (doc) => doc._meta.path === `${category}/${page}`
  );
  if (!docPage) {
    return notFound();
  }

  const { default: Content } = await run(docPage.body, {
    ...runtime,
    baseUrl: import.meta.url,
    Fragment,
  });

  return (
    <article className="mx-auto prose prose-slate max-w-3xl prose-invert py-5 px-5 sm:px-10">
      <h1>{docPage.title}</h1>
      <Content components={{ pre: SyntaxHighlighter }} />
    </article>
  );
}

export function generateStaticParams() {
  return allDocs.map((doc) => {
    const path = doc._meta.path;
    const [category, page] = path.split("/");
    return {
      category,
      page,
    };
  });
}

export const dynamicParams = false;
