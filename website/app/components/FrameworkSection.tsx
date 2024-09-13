import { getPages } from "@/app/source";
import { BrandIcon } from "@/components/BrandIcon";
import clsx from "clsx";
import Link from "next/link";
import { Content, Section, Title } from "./Section";

export function FrameworkSection() {
  return (
    <Section>
      <Content className="space-y-10">
        <Title center>Support</Title>
        <p className="mx-auto max-w-2xl text-lg md:text-center">
          Content Collection offers a variety of adapters that seamlessly
          integrate with popular web frameworks. This ensures a smooth
          integration process, allowing you to easily incorporate Content
          Collection into your application. If we don&apos;t have an adapter
          available for your specific framework, don&apos;t worry. You can
          utilize our CLI tool to integrate Content Collection into your
          framework of choice.
        </p>
        <ul className="mx-auto grid max-w-60 grid-cols-2 justify-items-center gap-20 pt-10 sm:max-w-xs sm:grid-cols-3 md:max-w-lg">
          {getPages()
            .filter(
              (docs) =>
                docs.slugs[0] === "quickstart" && docs.slugs[1] !== "cli",
            )
            .map((docs) => (
              <li key={docs.url}>
                <Link
                  title={docs.data.title}
                  href={docs.url}
                  className="block rounded-md"
                >
                  <BrandIcon
                    icon={docs.data.icon ?? docs.slugs.at(-1) ?? ""}
                    className={clsx(
                      "size-24 md:size-32",
                      "contrast-50 grayscale",
                      "hover:contrast-100 hover:grayscale-0",
                      "active:contrast-100 active:grayscale-0",
                      "hover:drop-shadow-[0_25px_25px_rgb(255_255_255/0.15)]",
                      "active:drop-shadow-[0_25px_25px_rgb(255_255_255/0.15)]",
                      "transition-all duration-500",
                    )}
                  />
                </Link>
              </li>
            ))}
        </ul>
      </Content>
    </Section>
  );
}
