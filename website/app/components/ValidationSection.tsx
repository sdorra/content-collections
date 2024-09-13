import { Editor } from "@/components/Editor";
import { commentComponentTransformer } from "@/components/commentComponentTransformer";
import { ExternalLink } from "@/components/links";
import { codeToJsx } from "@/lib/codeToJsx";
import { CodeMotion } from "./CodeMotion";
import { Content, Section, Title } from "./Section";

const code = `const samples = defineCollection({
  name: "samples",
  directory: "src/samples",
  include: "**/*.md",
  schema: (z) => ({
    /* cmp-line:codemotion */
  }),
});
`;

const simple = `const simple = {
    name: z.string().min(1).max(120),
    description: z.string().optional(),
  }`;

const post = `const post = {
    title: z.string().min(20).max(160),
    summary: z.string().optional(),
    draft: z.boolean(),
    tags: z.array(z.string()),
    publishedAt: z.string().regex(/\\d{4}-\\d{2}-\\d{2}/),
  }`;

const author = `const author = {
    id: z.number().positive(),
    email: z.string().email(),
    displayName: z.string().min(1).max(120),
    birthday: z.string().regex(/\\d{4}-\\d{2}-\\d{2}/),
  }`;

const sampleCode = [simple, post, author];

export async function ValidationSection() {
  const samples = await Promise.all(
    sampleCode.map((sample) =>
      codeToJsx(sample.trim(), {
        lang: "ts",
        type: "inline",
        log: false,
        removeFirstLine: true,
        removeLastLine: true,
      }),
    ),
  );

  const api = await codeToJsx(code, {
    lang: "ts",
    log: false,
    transformers: [
      commentComponentTransformer({
        codemotion: <CodeMotion>{samples}</CodeMotion>,
      }),
    ],
  });

  return (
    <Section>
      <Content className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
        <Editor className="order-2 h-[23rem] md:order-none">{api}</Editor>
        <div className="flex flex-col gap-5">
          <Title>Powerful Validation</Title>
          <p>
            Content Collections takes care of validating your content based on
            your defined schema. Any document that doesn&apos;t match the schema
            will not be added to your collection. The schema is powered by{" "}
            <ExternalLink href="https://zod.dev">Zod</ExternalLink>, which means
            you can leverage all the robust validation features of{" "}
            <ExternalLink href="https://zod.dev">Zod</ExternalLink> to ensure
            the integrity of your content.
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
