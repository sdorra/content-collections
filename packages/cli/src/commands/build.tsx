import z from "zod";
import { Text } from "ink";
import Spinner from "ink-spinner";
import { useEffect, useState } from "react";
import { build } from "@mdx-collections/core";

export const options = z.object({
  config: z.string().default("mdxcol.config.ts").describe("Path to config file"),
});

type Props = {
  options: z.infer<typeof options>;
};

export default function Build({ options }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    build(options.config)
      .then(() => setIsSuccess(true))
      .finally(() => setIsLoading(false));
  }, [options.config]);

  if (isLoading) {
    return (
      <Text>
        <Spinner /> Building...
      </Text>
    );
  }

  return (
    <Text>
      {isSuccess ? (
        <Text color="green">Build successful!</Text>
      ) : (
        <Text color="red">Build failed!</Text>
      )}
    </Text>
  );
}
