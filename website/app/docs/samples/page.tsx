import { allSamples } from "@/.content-collections/generated";
import { DocContainer } from "@/components/DocContainer";
import { TagFilterPanel } from "./_components/TagFilterPanel";

const allTags = allSamples.map((sample) => sample.tags).flat();

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Page({ searchParams }: Props) {
  const tags = Array.isArray(searchParams.tag)
    ? searchParams.tag
    : searchParams.tag
      ? [searchParams.tag]
      : [];

  const filteredSamples = allSamples.filter((sample) =>
    tags.every((tag) => sample.tags.includes(tag))
  );

  await new Promise((resolve) => setTimeout(resolve, 2000));

  return (
    <DocContainer className="group">
      <h1>Samples</h1>
      <p>Filter by tag</p>
      <TagFilterPanel tags={tags} allTags={allTags} />
      <ul className="group-has-[[data-pending]]:animate-pulse">
        {filteredSamples.map((sample) => (
          <li key={sample.name}>
            <a href={`/docs/samples/${sample.name}`}>{sample.title}</a>
          </li>
        ))}
      </ul>
    </DocContainer>
  );
}
