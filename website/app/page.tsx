import { Badge } from "@/components/ui/badge";
import { Hero } from "./components/Hero";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Clock8 } from "lucide-react";

type FeatureCardProps = {
  title: string;
  children: string;
  comingSoon?: boolean;
};

function FeatureCard({ title, comingSoon, children }: FeatureCardProps) {
  const Icon = comingSoon ? Clock8 : CheckCircle2;
  return (
    <Card className="bg-slate-800 relative">
      <CardHeader>
        <CardTitle className="flex">
          <Icon className="inline-block mr-2 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-slate-300">
        <p>{children}</p>
      </CardContent>
      {comingSoon ? (
        <CardFooter className="flex justify-end">
          <Badge className="bg-slate-700">Coming soon</Badge>
        </CardFooter>
      ) : null}
    </Card>
  );
}

export default function Home() {
  return (
    <main className="min-h-svh">
      <Hero />
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-10 gap-6">
        <FeatureCard title="Beautiful DX">
          Content Collections is designed to provide a pleasurable user
          experience. It offers a seamless developer experience without the need
          to restart the server or refresh the browser. Content collections are
          automatically updated when you make changes to your content.
        </FeatureCard>
        <FeatureCard title="Type-safe">
          Your content is parsed and validated during the build process,
          guaranteeing accuracy and currency. Content Collections offers a
          type-safe API to access your content.
        </FeatureCard>
        <FeatureCard title="Simple to use">
          No need to manually fetch and parse your content anymore. Just import
          it and start using Content Collections. It provides a simple API,
          allowing you to concentrate on building your app.
        </FeatureCard>
        <FeatureCard title="Tansformation">
          Content Collections allows you to transform your content before it
          enters your app. You can use it to modify your content, join two
          collections or even fetch data from a server.
        </FeatureCard>
        <FeatureCard title="Content types" comingSoon>
          Content Collections supports multiple content types, such as markdown,
          mdx, JSON, and YAML. The API remains consistent across all content
          types.
        </FeatureCard>
        <FeatureCard title="Support" comingSoon>
          Content Collection includes a range of adapters that support popular
          web frameworks. It also provides a CLI tool for use in environments
          without native support.
        </FeatureCard>
      </section>
    </main>
  );
}
