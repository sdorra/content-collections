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
    <div className="absolute top-0 bottom-0 flex items-start md:items-center right-0">
      <div className="text-foreground bg-background/60 backdrop-blur-lg font-sans border border-base-400/50 rounded-md shadow-md p-5 w-72 md:w-96 flex flex-col">
        <header className="font-bold text-2xl">Beautiful DX</header>
        <div className="flex-grow my-5 flex gap-1.5">
          <span>HMR for content is</span>
          <span id="hmr-target"></span>
        </div>
        <footer className="self-end text-sm text-base-500 dark:text-base-400">
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
        <p className="text-lg max-w-2xl md:text-center mx-auto">
          Content Collections is all about delivering a delightful developer
          experience. It offers a smooth developer journey, eliminating the
          hassle of server restarts or browser refreshes. Any changes you make
          to your content are automatically reflected in the collections,
          keeping everything up to date effortlessly.
        </p>
        <div className="relative pt-24 pr-8 md:pt-0 lg:pr-0 my-10">
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
