import { allSamples } from "content-collections";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MDXContent } from "@content-collections/mdx/react";
import { PackageInstall } from "@/components/PackageInstall";
import { Notification } from "@/components/Notification";
import { GitHub, StackBlitz } from "@/components/icons";
import { ReactNode } from "react";
import { createStackBlitzSampleLink } from "@/lib/stackblitz";

type Props = {
  params: {
    name: string;
  };
};

type TldrLinkProps = {
  href: string;
  children?: ReactNode;
};

function TldrLink({ href, children }: TldrLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 border-info-600 border-2 rounded-md px-4 py-2 hover:bg-info-600 text-info-50"
    >
      {children}
    </a>
  );
}

export default async function Page({ params: { name } }: Props) {
  const sample = allSamples.find((sample) => sample.name === name);
  if (!sample) {
    return notFound();
  }

  return (
    <div className="min-w-0">
      <article className="prose prose-base prose-code:text-base hover:prose-a:decoration-primary-600 max-w-3xl prose-invert py-5 px-5 sm:px-10">
        <h1>{sample.title}</h1>

        <Notification
          type="info"
          title="TL;DR"
          className="mt-5"
          disableLinkStyle
        >
          <div className=" flex items-center justify-center gap-4">
            <TldrLink
              href={`https://github.com/sdorra/content-collections/tree/main/samples/${sample.name}`}
            >
              <GitHub />
              Github
            </TldrLink>
            <TldrLink
              href={createStackBlitzSampleLink(
                sample.name,
                sample.stackBlitz
              )}
            >
              <StackBlitz />
              StackBlitz
            </TldrLink>
          </div>
        </Notification>

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
