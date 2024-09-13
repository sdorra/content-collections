import LogoImage from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { GettingStartedButton } from "./GettingStartedButton";

type LogoProps = {
  className?: string;
};

function Logo({ className }: LogoProps) {
  return (
    <div className={cn("relative", className)}>
      <Image
        src={LogoImage}
        alt=""
        className="absolute -left-8 top-10 size-20 blur-3xl md:size-64"
      />
      <Image
        src={LogoImage}
        alt="The logo of Content-Collection: A stack of books."
        className="relative size-20 md:size-64"
        priority
      />
    </div>
  );
}

export function Hero() {
  return (
    <header className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-10 py-5 sm:grid-cols-[auto,1fr]">
      <Logo className="md:row-span-3" />
      <h1 className="text-foreground self-center text-4xl font-bold">
        Content Collections
      </h1>
      <p className="sm:col-span-2 md:col-span-1">
        Transform your content into type-safe data collections and say goodbye
        to manual data fetching and parsing. Simply import your content and get
        started. With built-in validation, you can ensure the accuracy of your
        data. Plus, you can preprocess your data before it enters your app.
      </p>
      <div className="mt-5 sm:col-span-2 md:col-span-1">
        <GettingStartedButton />
      </div>
    </header>
  );
}
