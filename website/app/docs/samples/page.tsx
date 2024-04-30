import { Sample, allSamples } from "content-collections";
import { DocContainer } from "@/components/DocContainer";
import { TagFilterPanel } from "./_components/TagFilterPanel";
import { ExternalLink, Link } from "@/components/links";
import { Notification } from "@/components/Notification";
import { createStackBlitzLink } from "@/lib/stackblitz";
import { GitHub, StackBlitz } from "@/components/icons";

const allTags = allSamples.map((sample) => sample.tags).flat();

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

type SampleCardProps = {
  sample: Sample;
};

function SampleCard({ sample }: SampleCardProps) {
  return (
    <div className="flex flex-col border-base-400 p-2 rounded-md border-2 bg-base-200 text-base-800 hover:border-primary-400">
      <h2 className="font-semibold text2xl">{sample.title}</h2>
      <p className="flex-grow text-base-700">{sample.description}</p>
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
            href={createStackBlitzLink(
              "samples",
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
          <Notification type="info" className="md:col-span-2">
            No samples found for the selected tag combination.
          </Notification>
        )}
        {filteredSamples.map((sample) => (
          <SampleCard key={sample.name} sample={sample}></SampleCard>
        ))}
      </ul>
    </DocContainer>
  );
}
