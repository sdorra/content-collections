import Image from "next/image";

const queryOneTimeSponsors = `query sponsors($user: String!) {
  user(login: $user) {
    sponsorsActivities(first: 100, period: ALL) {
      nodes {
        sponsorsTier {
          monthlyPriceInDollars
          isOneTime
        }
        sponsor {
          ... on Organization {
            name
            avatarUrl
            url
          }
          ... on User {
            name
            avatarUrl
            url
          }
        }
      }
    }
  }
}`;

type Sponsor = {
  name: string;
  avatarUrl: string;
  url: string;
  isOneTime: boolean;
};

async function fetchSponsors(): Promise<Sponsor[]> {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SPONSOR_GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: queryOneTimeSponsors,
      variables: {
        user: "sdorra",
      },
    }),
  });

  if (!response.ok || response.status !== 200) {
    throw new Error(`Failed to fetch sponsors: ${response.status}`);
  }

  const { data } = await response.json();

  const sponsors = data.user.sponsorsActivities.nodes;
  sponsors.sort(
    (a: any, b: any) =>
      b.sponsorsTier.monthlyPriceInDollars -
      a.sponsorsTier.monthlyPriceInDollars,
  );

  return sponsors.map((node: any) => ({
    name: node.sponsor.name,
    avatarUrl: node.sponsor.avatarUrl,
    url: node.sponsor.url,
    isOneTime: node.sponsorsTier.isOneTime,
  }));
}

type SponsorListProps = {
  title: string;
  sponsors: Sponsor[];
};

function SponsorList({ title, sponsors }: SponsorListProps) {
  return (
    <>
      <h2 className="mb-5 mt-10 text-xl font-bold">{title}</h2>
      <div className="flex gap-5 flex-wrap">
        {sponsors.map((sponsor) => (
          <a
            key={sponsor.name}
            href={sponsor.url}
            target="_blank"
            className="bg-card hover:bg-accent/80 group relative flex flex-col gap-2 rounded-xl border p-4 transition-colors"
          >
            <Image
              src={sponsor.avatarUrl}
              alt={sponsor.name}
              width={128}
              height={128}
              className="size-20 md:size-32 rounded-full"
            />
            <p className="font-medium">{sponsor.name}</p>
          </a>
        ))}
      </div>
    </>
  );
}

export default async function SponsorPage() {
  const sponsors = await fetchSponsors();
  return (
    <main className="container py-12">
      <h1 className="mb-4 text-3xl font-bold">Sponsors</h1>
      <p className="text-muted-foreground mb-4">
        I would like to thank the following sponsors for supporting my work on
        Content Collections.
      </p>
      <SponsorList
        title="Monthly Sponsors"
        sponsors={sponsors.filter((sponsor) => !sponsor.isOneTime)}
      />
      <SponsorList
        title="One-Time Sponsors"
        sponsors={sponsors.filter((sponsor) => sponsor.isOneTime)}
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
