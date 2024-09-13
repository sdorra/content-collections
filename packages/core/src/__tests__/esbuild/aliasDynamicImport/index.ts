export default async () => {
  const simple = await import("@alias");
  return simple.default;
};
