import { Editor } from "@/components/Editor";
import { codeToJsx } from "@/lib/codeToJsx";
import { HmrInAction } from "./HmrInAction";
import { Content, Section, Title } from "./Section";

const frontmatterSource = `---
title: "Beautiful DX"
description: "A beautiful developer experience"
author: "Sebastian Sdorra"
published: true
---
`;

function Preview() {
  return (
    <div className="absolute bottom-0 right-0 top-0 flex items-start md:items-center">
      <div className="text-foreground bg-background/60 border-base-400/50 flex w-72 flex-col rounded-md border p-5 font-sans shadow-md backdrop-blur-lg md:w-96">
        <header className="text-2xl font-bold">Beautiful DX</header>
        <div className="my-5 flex flex-grow gap-1.5">
          <span>HMR for content is</span>
          <span id="hmr-target"></span>
        </div>
        <footer className="text-base-500 dark:text-base-400 self-end text-sm">
          Sebastian Sdorra
        </footer>
      </div>
    </div>
  );
}

export async function HmrSection() {
  const frontmatter = await codeToJsx(frontmatterSource, {
    lang: "yaml",
  });
  return (
    <Section className="mt-10" backgroundGrid>
      <Content>
        <Title center>Beautiful DX</Title>
        <p className="mx-auto max-w-2xl text-lg md:text-center">
          Content Collections is all about delivering a delightful developer
          experience. It offers a smooth developer journey, eliminating the
          hassle of server restarts or browser refreshes. Any changes you make
          to your content are automatically reflected in the collections,
          keeping everything up to date effortlessly.
        </p>
        <div className="relative my-10 pr-8 pt-24 md:pt-0 lg:pr-0">
          <Editor className="max-w-3xl">
            {frontmatter}
            <div className="mt-5 flex gap-1.5 font-mono">
              <span>HMR for content is</span>
              <span id="hmr-source"></span>
            </div>
            <Preview />
          </Editor>
        </div>
        <HmrInAction />
      </Content>
    </Section>
  );
}
