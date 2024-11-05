import clsx from "clsx";
import { allSponsors, Sponsor } from "content-collections";
import Image from "next/image";

const sortedSponsors = allSponsors.toSorted((a, b) => b.order - a.order);

type SponsorListProps = {
  title: string;
  sponsors: Sponsor[];
  size: "small" | "large";
};

function SponsorList({ title, sponsors, size }: SponsorListProps) {
  return (
    <>
      <h2 className="mb-5 mt-10 text-xl font-bold">{title}</h2>
      <div className="flex flex-wrap gap-5">
        {sponsors.map((sponsor) => (
          <a
            key={sponsor.name}
            href={sponsor.url}
            target="_blank"
            className="bg-card hover:bg-accent/80 group relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors"
          >
            <Image
              src={sponsor.avatarUrl}
              alt={sponsor.name}
              width={128}
              height={128}
              className={clsx("rounded-full", {
                "size-20 md:size-32": size === "large",
                "size-12 md:size-20": size === "small",
              })}
            />
            <p
              className={clsx({
                "text-lg": size === "large",
                "text-sm": size === "small",
              })}
            >
              {sponsor.name}
            </p>
          </a>
        ))}
      </div>
    </>
  );
}

export default function SponsorPage() {
  return (
    <main className="container py-12">
      <h1 className="mb-4 text-3xl font-bold">Sponsors</h1>
      <p className="text-muted-foreground mb-4">
        I would like to thank the following sponsors for supporting my work on
        Content Collections.
      </p>
      <SponsorList
        title="Current Sponsors"
        sponsors={sortedSponsors.filter((sponsor) => sponsor.isActive)}
        size="large"
      />
      <SponsorList
        title="Past Sponsors"
        sponsors={sortedSponsors.filter((sponsor) => !sponsor.isActive)}
        size="small"
      />
      <h2 className="mb-2 mt-10 text-xl font-bold">Become a Sponsor</h2>
      <p className="text-muted-foreground mb-4 max-w-2xl">
        If you would like to join the list of nice people and organizations
        supporting me and my work on Content Collections, please consider
        becoming a sponsor on GitHub.
      </p>
      <iframe
        src="https://github.com/sponsors/sdorra/button"
        title="Sponsor sdorra"
        height="32"
        width="114"
        className="rounded-md border-none"
      ></iframe>
    </main>
  );
}
