import Image from "next/image";
import LogoImage from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

type LogoProps = {
  className?: string;
};

function Logo({ className }: LogoProps) {
  return (
    <div className={cn("relative", className)}>
      <Image
        src={LogoImage}
        alt=""
        className="absolute top-10 -left-8 size-20 md:size-64 blur-3xl"
      />
      <Image
        src={LogoImage}
        alt="The logo of Content-Collection: A stack of books."
        className="size-20 md:size-64 relative"
      />
    </div>
  );
}

export function Hero() {
  return (
    <header className="grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-4 py-5 px-10">
      <Logo className="md:row-span-3" />
      <h1 className="text-4xl font-bold text-slate-50 self-center">
        Content Collections
      </h1>
      <p className="sm:col-span-2 md:col-span-1 text-slate-300">
        Transform your content into type-safe data collections. Eliminate the
        need for manual data fetching and parsing. Simply import your content
        and begin. Built-in validation ensures the accuracy of your data.
        Preprocess your data before it enters your app.
      </p>
      <div className="gap-4 sm:flex-row flex-col flex sm:col-span-2 md:col-span-1">
        <Button size="lg" className="sm:w-fit" asChild>
          <Link href="/docs">Getting started</Link>
        </Button>
        <Button
          size="lg"
          className="sm:w-fit outline outline-2 hover:bg-slate-800"
          variant="ghost"
          asChild
        >
          <a href="#see-it-in-action">See it in action</a>
        </Button>
      </div>
    </header>
  );
}
