import { describe, it, expect } from "vitest";
import { createEmitter } from "./events";
import { e } from "vitest/dist/reporters-O4LBziQ_.js";

type Events = {
  test: {
    a: string;
  };
  other: {
    error: Error
  }
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

  it("should emit extra collection-error on error event", () => {
    const emitter = createEmitter<Events>();

    const events: Array<string> = [];

    emitter.on("other", (event) => {
      events.push("other");
    });
    emitter.on("cc-error", (event) => {
      events.push("error");
      expect(event.event).toBe("other");
      expect(event.error.message).toBe("test");
    });

    emitter.emit("other", { error: new Error("test") });

    expect(events).toEqual(["other", "error"]);
  });
});
