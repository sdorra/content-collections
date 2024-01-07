import { describe, it, expect } from "vitest";
import { createEmitter } from "./events";

type Events = {
  test: {
    a: string;
  };
};

describe("events", () => {
  it("should emit and listen to events", () => {
    const emitter = createEmitter<Events>();
    emitter.on("test", (event) => {
      expect(event.a).toBe("test");
    });
    emitter.emit("test", { a: "test" });
  });

  it("should only allow keys from the event map", () => {
    const emitter = createEmitter<Events>();
    // @ts-expect-error test 2 does not exist
    emitter.emit("test2", { a: "test" });
  });

  it("should only allow listeners for keys from the event map", () => {
    const emitter = createEmitter<Events>();
    // @ts-expect-error test 2 does not exist
    emitter.on("test2", (event) => {});
  });

  it("should only correct event type on emit", () => {
    const emitter = createEmitter<Events>();
    // @ts-expect-error b does not exist
    emitter.emit("test", { b: "test" });
  });

  it("should only allow listeners with the correct event type", () => {
    const emitter = createEmitter<Events>();
    emitter.on("test", (event) => {
      // @ts-expect-error b does not exist
      expect(event.b).toBeUndefined();
    });
  });
});
