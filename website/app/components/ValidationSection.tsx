import { Editor } from "@/components/Editor";
import { ExternalLink } from "@/components/links";
import { CodeMotion } from "./CodeMotion";
import { Content, Section, Title } from "./Section";

const beer = /* ts */ `import { z } from "zod";

const beer = defineCollection({
  name: "beer",
  directory: "src/beer",
  include: "**/*.md",
  schema: z.object({
    name: z.string(),
    volume: z.number().positive(),
    brewery: z.string(),
    ingredients: z.array(z.string()),
    description: z.string().optional(),
  })
});`;

const post = /* ts */ `import * as v from "valibot";

const posts = defineCollection({
  name: "posts",
  directory: "src/posts",
  include: "**/*.md",
  schema: v.object({
    title: v.pipe(v.string(), v.maxLength(160)),
    summary: v.optional(v.string()),
    draft: v.boolean(),
    tags: v.array(v.string()),
    publishedAt: v.date(),
  })
});`;

const author = /* ts */ `import { type } from "arktype";

const authors = defineCollection({
  name: "authors",
  directory: "src/authors",
  include: "**/*.md",
  schema: type({
    id: "number > 0",
    email: "string.email",
    displayName: "10 < string <= 120",
    birthday: /\d{4}-\d{2}-\d{2}/,
  })
});`;

const snippets = [beer, post, author];


export function ValidationSection() {
  return (
    <Section>
      <Content className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
        <Editor className="order-2 h-[25rem] md:order-none">
          <CodeMotion snippets={snippets} />
        </Editor>
        <div className="flex flex-col gap-5">
          <Title>Powerful Validation</Title>
          <p>
            Content Collections takes care of validating your content based on
            your defined schema. Any document that doesn&apos;t match the schema
            will not be added to your collection. The schema is powered by{" "}
            <ExternalLink href="https://standardschema.dev/">
              StandardSchema
            </ExternalLink>
            , which means you can use any StandardSchema{" "}
            <ExternalLink href="https://standardschema.dev/#what-schema-libraries-implement-the-spec">
              compatible library
            </ExternalLink>{" "}
            to ensure the integrity of your content.
          </p>
          <p>
            During development, Content Collections will provide warnings for
            invalid content, allowing you to address them in your development
            environment. However, it won&apos;t fail the build, giving you the
            flexibility to fix the content as you go.
          </p>
          <p>
            When it comes to the build process, Content Collections takes
            stricter measures. It will fail the build if any invalid content is
            present. This guarantees that your production build will be free
            from any invalid content, maintaining the integrity of your
            application.
          </p>
        </div>
      </Content>
    </Section>
  );
}
