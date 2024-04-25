import { allQuickstarts } from "content-collections";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MDXContent } from "@content-collections/mdx/react";
import { PackageInstall } from "@/components/PackageInstall";

type Props = {
  params: {
    name: string;
  };
};

export default async function Page({ params: { name } }: Props) {
  const quickstart = allQuickstarts.find((quickstart) => quickstart.name === name);
  if (!quickstart) {
    return notFound();
  }

  return (
    <div className="min-w-0">
      <article className="prose prose-base prose-code:text-base hover:prose-a:decoration-primary-600 max-w-3xl prose-invert py-5 px-5 sm:px-10">
        <h1>{quickstart.title}</h1>
        <MDXContent code={quickstart.body} components={{ PackageInstall }} />
      </article>
    </div>
  );
}

export function generateMetadata({ params: { name } }: Props): Metadata {
  const quickstart = allQuickstarts.find(
    (quickstart) => quickstart.name === name
  );
  if (!quickstart) {
    return notFound();
  }
  return {
    title: quickstart.title,
    description: quickstart.description,
  };
}

export function generateStaticParams() {
  return allQuickstarts.map((quickstart) => ({
    name: quickstart.name,
  }));
}

export const dynamicParams = false;
