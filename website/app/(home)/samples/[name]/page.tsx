import { GitHub, StackBlitz } from "@/components/icons";
import { createStackBlitzSampleLink } from "@/lib/stackblitz";
import { MDXContent } from "@content-collections/mdx/react";
import { allSamples } from "content-collections";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { ChevronLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode } from "react";

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
      className="border-info-600 dark:text-info-50 hover:text-info-50 hover:bg-info-600 inline-flex items-center gap-2 rounded-md border-2 px-4 py-2 text-sm font-medium transition-colors [&_svg]:size-4"
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
    <main className="max-w-container mx-auto w-full px-4 py-8">
      <Link
        href="/samples"
        className="text-muted-foreground hover:text-accent-foreground mb-8 inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" />
        Back to Samples
      </Link>
      <article className="prose">
        <h1>{sample.title}</h1>
        <p>{sample.description}</p>

        <div className="not-prose flex flex-row items-center gap-4">
          <TldrLink
            href={`https://github.com/sdorra/content-collections/tree/main/samples/${sample.name}`}
          >
            <GitHub />
            Github
          </TldrLink>
          <TldrLink
            href={createStackBlitzSampleLink(sample.name, sample.stackBlitz)}
          >
            <StackBlitz />
            StackBlitz
          </TldrLink>
        </div>

        <MDXContent code={sample.body} components={defaultMdxComponents} />
      </article>
    </main>
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
