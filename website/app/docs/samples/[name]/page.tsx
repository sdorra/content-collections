import { allSamples } from "content-collections";
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
  const sample = allSamples.find((sample) => sample.name === name);
  if (!sample) {
    return notFound();
  }

  return (
    <div className="min-w-0">
      <article className="prose prose-base prose-code:text-base hover:prose-a:decoration-primary-600 max-w-3xl prose-invert py-5 px-5 sm:px-10">
        <h1>{sample.title}</h1>
        <MDXContent code={sample.body} components={{ PackageInstall }} />
      </article>
    </div>
  );
}

export function generateMetadata({ params: { name } }: Props): Metadata {
  const sample = allSamples.find((sample) => sample.name === name);
  if (!sample) {
    return notFound();
  }
  return {
    title: sample.title,
    description: sample.description,
  };
}

export function generateStaticParams() {
  return allSamples.map((sample) => ({
    name: sample.name,
  }));
}

export const dynamicParams = false;
