import { allIntegrations } from "content-collections";
import { BrandIcon } from "@/components/BrandIcon";
import { createStackBlitzLink } from "@/lib/stackblitz";

export function SeeItInActionSection() {
  return (
    <section className="p-10 flex flex-col items-center max-w-2xl text-center mx-auto">
      <h2 className="text-4xl font-bold mb-4" id="see-it-in-action">
        See it in action
      </h2>
      <p className="my-2">
        You want to see Content Collections in action with your favorite web
        framework? We&apos;ve got you covered. Click one of the logos below and
        see the magic happen. Make sure you edit some markdown files to witness
        the beauty of HMR (Hot Module Replacement) for content.
      </p>
      <ul className="grid grid-cols-3 gap-8 my-10">
        {allIntegrations.map((integration) => (
          <li key={integration.href}>
            <a
              href={createStackBlitzLink("integrations", integration.name)}
              target="_blank"
              className="hover:text-primary-600"
              title={integration.title}
            >
              <BrandIcon
                icon={integration.icon || integration.name}
                className="w-24 h-20"
              />
            </a>
          </li>
        ))}
      </ul>

      <p>
        We use{" "}
        <a
          href="https://stackblitz.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:decoration-primary-600"
        >
          StackBlitz
        </a>{" "}
        to execute the integration examples directly in your browser. But if you
        prefer to run the examples locally, you can clone the{" "}
        <a
          href="https://github.com/sdorra/content-collections/tree/main/integrations"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:decoration-primary-600"
        >
          GitHub repository
        </a>{" "}
        and run the examples yourself.
      </p>
    </section>
  );
}
