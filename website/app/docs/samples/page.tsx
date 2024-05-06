import { Sample, allSamples } from "content-collections";
import { DocContainer } from "@/components/DocContainer";
import { TagFilterPanel } from "./_components/TagFilterPanel";
import { ExternalLink, Link } from "@/components/links";
import { Notification } from "@/components/Notification";
import { createStackBlitzSampleLink } from "@/lib/stackblitz";
import { GitHub, StackBlitz } from "@/components/icons";
import UnstyledLink from "next/link";
import { BrandIcon } from "@/components/BrandIcon";

const allTags = allSamples.map((sample) => sample.tags).flat();

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

type SampleCardProps = {
  sample: Sample;
};

function SampleCard({ sample }: SampleCardProps) {
  return (
    <div className="flex flex-col p-2 bg-base-800 rounded-md border-2 border-base-600 hover:border-primary-400 relative">
      <BrandIcon
        icon={sample.adapter}
        className="absolute size-6 top-2 right-2"
      />
      <UnstyledLink href={sample.href} className="flex-grow flex flex-col">
        <h2 className="font-semibold text-xl text-base-100">{sample.title}</h2>
        <p className="flex-grow text-sm">{sample.description}</p>
        <ul className="flex gap-2 my-2">
          {sample.tags.map((tag) => (
            <li
              key={tag}
              className="border border-base-500 rounded-lg px-1 text-xs"
            >
              {tag}
            </li>
          ))}
        </ul>
      </UnstyledLink>
      <div className="flex justify-between">
        <Link href={sample.href}>Read more</Link>
        <div className="flex gap-2">
          <ExternalLink
            href={`https://github.com/sdorra/content-collections/tree/main/samples/${sample.name}/`}
            className="hover:text-primary-600"
          >
            <GitHub />
          </ExternalLink>
          <ExternalLink
            href={createStackBlitzSampleLink(
              sample.name,
              sample.stackBlitz
            )}
            className="hover:text-primary-600"
          >
            <StackBlitz />
          </ExternalLink>
        </div>
      </div>
    </div>
  );
}

export default async function Page({ searchParams }: Props) {
  const tags = Array.isArray(searchParams.tag)
    ? searchParams.tag
    : searchParams.tag
      ? [searchParams.tag]
      : [];

  const filteredSamples = allSamples.filter((sample) =>
    tags.every((tag) => sample.tags.includes(tag))
  );

  return (
    <DocContainer className="group">
      <h1>Samples</h1>
      <TagFilterPanel tags={tags} allTags={allTags} />
      <ul className="not-prose group-has-[[data-pending]]:animate-pulse grid grid-cols-1 md:grid-cols-2 gap-2 mt-5">
        {filteredSamples.length === 0 && (
          <Notification type="warning" className="md:col-span-2">
            <p>No samples found for the selected tag combination.</p>
            <Link href="/docs/samples" className="mt-2">
              Clear filters
            </Link>
          </Notification>
        )}
        {filteredSamples.map((sample) => (
          <SampleCard key={sample.name} sample={sample}></SampleCard>
        ))}
      </ul>
    </DocContainer>
  );
}
