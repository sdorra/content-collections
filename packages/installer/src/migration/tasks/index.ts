type Result = {
  status: "changed" | "skipped" | "error";
  message: string;
}

export type Task = {
  name: string;
  run: () => Promise<Result>;
};
