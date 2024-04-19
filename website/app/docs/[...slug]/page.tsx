import { allDocs } from "content-collections";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MDXContent } from "@content-collections/mdx/react";
import { PackageInstall } from "@/components/PackageInstall";

type Props = {
  params: {
    slug: Array<string>;
  };
};

export default async function Page({ params: { slug } }: Props) {
  const docPage = allDocs.find((doc) => doc.slug === slug.join("/"));
  if (!docPage) {
    return notFound();
  }

  return (
    <div className="min-w-0">
      <article className="prose prose-base prose-code:text-base hover:prose-a:decoration-primary-600 max-w-3xl prose-invert py-5 px-5 sm:px-10">
        <h1>{docPage.title}</h1>
        <MDXContent code={docPage.body} components={{ PackageInstall }} />
      </article>
    </div>
  );
}

export function generateMetadata({ params: { slug } }: Props): Metadata {
  const docPage = allDocs.find((doc) => doc.slug === slug.join("/"));
  if (!docPage) {
    return notFound();
  }
  return {
    title: docPage.title,
    description: docPage.description,
  };
}

export function generateStaticParams() {
  return allDocs.map((doc) => ({
    slug: doc.slug.split("/"),
  }));
}

export const dynamicParams = false;
