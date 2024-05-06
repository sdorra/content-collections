type StackBlitzOptions = {
  file?: string;
};


export function createStackBlitzSampleLink(
  name: string,
  options: StackBlitzOptions = {}
) {
  const params = new URLSearchParams(options).toString();
  return `https://stackblitz.com/github/sdorra/content-collections/tree/main/samples/${name}/?${params}`;
}
