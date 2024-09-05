import Head from "next/head";

type Props = {
  title?: string;
  description?: string;
};

const defaultTitle = "ContentCrafter Inc.";
const titleSuffix = " | " + defaultTitle;

const defaultDescription =
  "From Worldly Wonders to Polished Perfection - Crafting Content That Captivates and Converts";

export default function Metadata({ title, description }: Props) {
  return (
    <Head>
      <title>{title ? title + titleSuffix : defaultTitle}</title>
      <meta
        name="description"
        content={description || defaultDescription}
      ></meta>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
      ></meta>
      <meta name="color-scheme" content="light dark"></meta>
    </Head>
  );
}
