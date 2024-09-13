import { Link } from "@/components/links";
import { codeToJsx } from "@/lib/codeToJsx";
import { Content, Section, Title } from "./Section";
import { TransformationPreviewer } from "./TransformationPreviewer";
import { Sample, sampleSources } from "./TransformationSamples";

async function mapSample(sample: Sample) {
  return {
    ...sample,
    code: await codeToJsx(sample.code.trim(), {
      lang: "ts",
    }),
  };
}

export async function TransformationSection() {
  const samples = await Promise.all(sampleSources.map(mapSample));
  return (
    <Section backgroundGrid>
      <Content>
        <Title center>Transformation</Title>
        <p className="mx-auto max-w-2xl text-lg md:text-center">
          Content Collection does not handle the transformation or compilation
          of content for you. We understand that there are numerous options and
          use cases, so we leave that flexibility in your hands. However, we
          offer a robust transformation API that empowers you to customize and
          shape your content according to your specific requirements. With this
          powerful API, you have the freedom to transform your content in any
          way you desire.
        </p>
        <TransformationPreviewer samples={samples} />
        <p className="mx-auto mt-5 max-w-xl text-center">
          These are just a few examples of what is possible with the transform
          function. For more examples, take a look at our{" "}
          <Link href="/docs">documentation</Link>.
        </p>
      </Content>
    </Section>
  );
}
