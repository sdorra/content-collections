import { component$, useSignal } from "@builder.io/qwik";

export const Counter = component$(() => {
  const count = useSignal(0);

  return (
    <button onClick$={() => count.value++}>{count.value}</button>
  );
});
