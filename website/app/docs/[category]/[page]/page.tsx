import { Sample, allIntegrations, allSamples } from "content-collections";
import { notFound } from "next/navigation";
import { run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { Fragment } from "react";
import { Code } from "bright";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { createStackBlitzLink } from "@/lib/stackblitz";

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

function StackBlitzIcon() {
  return (
    <svg
      className="size-5 stroke-white fill-white"
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10.797 14.182H3.635L16.728 0l-3.525 9.818h7.162L7.272 24l3.524-9.818Z" />
    </svg>
  );
}

type StackBlitzProps = {
  sample: Sample;
};

function StackBlitz({ sample }: StackBlitzProps) {
  return (
    <div className="text-center">
      <Button asChild>
        <a
          href={createStackBlitzLink("samples", sample.name, sample.stackBlitz)}
          className="flex items-center justify-center gap-2"
        >
          <StackBlitzIcon />
          Open Sample in StackBlitz
        </a>
      </Button>
    </div>
  );
}

function isSample(category: string, page: object): page is Sample {
  return category === "samples" && "name" in page;
}

export default async function Page({ params: { category, page } }: Props) {
  const docPage = findPage(category, page);
  if (!docPage) {
    return notFound();
  }

  const { default: Content } = await run(docPage.body, {
    ...runtime,
    baseUrl: import.meta.url,
    Fragment,
  });

  return (
    <div className="min-w-0">
      <article className="prose prose-slate hover:prose-a:decoration-primary max-w-3xl prose-invert py-5 px-5 sm:px-10">
        <h1>{docPage.title}</h1>
        <Content components={{ pre: SyntaxHighlighter }} />
      </article>
      {isSample(category, docPage) ? <StackBlitz sample={docPage} /> : null}
    </div>
  );
}

function findPage(category: string, page: string) {
  if (category === "integrations") {
    return allIntegrations.find((doc) => doc.name === page);
  }
  if (category === "samples") {
    return allSamples.find((doc) => doc.name === page);
  }
}

export function generateMetadata({
  params: { category, page },
}: Props): Metadata {
  const docPage = findPage(category, page);
  if (!docPage) {
    return notFound();
  }
  return {
    title: docPage.title,
    description: docPage.description,
  };
}

export function generateStaticParams() {
  const integrations = allIntegrations.map((doc) => ({
    category: "integrations",
    page: doc.name,
  }));

  const samples = allSamples.map((doc) => ({
    category: "samples",
    page: doc.name,
  }));

  return [...samples, ...integrations];
}

export const dynamicParams = false;
