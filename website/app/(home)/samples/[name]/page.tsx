import { allSamples } from "content-collections";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MDXContent } from "@content-collections/mdx/react";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { GitHub, StackBlitz } from "@/components/icons";
import { ReactNode } from "react";
import { createStackBlitzSampleLink } from "@/lib/stackblitz";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

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
      className="inline-flex items-center font-medium gap-2 text-sm border-info-600 border-2 rounded-md px-4 py-2 transition-colors [&_svg]:size-4 dark:text-info-50 hover:text-info-50 hover:bg-info-600"
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
    <main className="px-4 py-8 mx-auto w-full max-w-container">
      <Link
        href="/samples"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-8 hover:text-accent-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to Samples
      </Link>
      <article className="prose">
        <h1>{sample.title}</h1>
        <p>{sample.description}</p>

        <div className="flex flex-row items-center gap-4 not-prose">
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
