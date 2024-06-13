import { allDocs } from "content-collections";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MDXContent } from "@content-collections/mdx/react";
import { PackageInstall } from "@/components/PackageInstall";
import { Notification } from "@/components/Notification";
import { DocContainer } from "@/components/DocContainer";
import { Correct, Wrong } from "@/components/RightOrWrong";

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
      <DocContainer>
        <h1>{docPage.title}</h1>
        <MDXContent
          code={docPage.body}
          components={{ PackageInstall, Notification, Correct, Wrong }}
        />
      </DocContainer>
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
