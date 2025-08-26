export default async () => {
  const simple = await import("./simple");
  return simple.default;
};
