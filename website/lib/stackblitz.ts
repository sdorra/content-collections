type StackBlitzOptions = {
  file?: string;
};

type Type = "samples" | "integrations";

export function createStackBlitzLink(
  type: Type,
  name: string,
  options: StackBlitzOptions = {}
) {
  const params = new URLSearchParams(options).toString();
  return `https://stackblitz.com/github/sdorra/content-collections/tree/main/${type}/${name}/?${params}`;
}
