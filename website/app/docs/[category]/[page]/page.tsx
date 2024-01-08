import { allDocs } from "content-collections";
import { notFound } from "next/navigation";
import { run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { Fragment } from "react";

type Props = {
  params: {
    category: string;
    page: string;
  };
};

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
    <article className="prose">
      <h1>{docPage.title}</h1>
      <Content />
    </article>
  );
}
