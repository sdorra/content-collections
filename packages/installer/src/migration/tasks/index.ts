export type Task = {
  name: string;
  run: () => Promise<boolean>
};
