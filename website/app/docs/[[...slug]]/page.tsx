import { getPage, getPages } from "@/app/source";
import type { Metadata } from "next";
import { DocsPage, DocsBody } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { MDXContent } from "@content-collections/mdx/react";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Notification } from "@/components/Notification";
import { Correct, Wrong } from "@/components/RightOrWrong";
import { Card, Cards } from "fumadocs-ui/components/card";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { Callout } from "fumadocs-ui/components/callout";

export default async function Page({
  params,
}: {
  params: { slug?: string[] };
}) {
  const page = getPage(params.slug);

  if (!page) notFound();

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsBody>
        <h1>{page.data.linkText ?? page.data.title}</h1>
        {page.data.description ? (
          <p className="text-muted-foreground text-sm pb-8 border-b">
            {page.data.description}
          </p>
        ) : null}
        <MDXContent
          code={page.data.body}
          components={{
            ...defaultMdxComponents,
            Notification,
            Tab,
            Callout,
            Tabs,
            QuickStartList,
            InstallTabs: (props) => (
              <Tabs id="package_install" persist {...props} />
            ),
            Correct,
            Wrong,
          }}
        />
      </DocsBody>
    </DocsPage>
  );
}

function QuickStartList() {
  return (
    <Cards>
      {getPages()
        .filter((page) => page.slugs[0] === "quickstart")
        .map((page) => (
          <Card
            key={page.url}
            title={page.data.title}
            href={page.url}
            description={page.data.description ?? ""}
          />
        ))}
    </Cards>
  );
}

export async function generateStaticParams() {
  return getPages().map((page) => ({
    slug: page.slugs,
  }));
}

export function generateMetadata({ params }: { params: { slug?: string[] } }) {
  const page = getPage(params.slug);

  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  } satisfies Metadata;
}
