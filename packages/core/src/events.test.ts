import { describe, expect, it } from "vitest";
import { createEmitter } from "./events";

type Events = {
  test: {
    a: string;
  };
  other: {
    error: Error;
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

  it("should emit extra collection-error on error event", () => {
    const emitter = createEmitter<Events>();

    const events: Array<string> = [];

    emitter.on("other", (event) => {
      events.push("other");
    });
    emitter.on("_error", (event) => {
      events.push("error");
      expect(event._event).toBe("other");
      expect(event.error.message).toBe("test");
    });

    emitter.emit("other", { error: new Error("test") });

    expect(events).toEqual(["other", "error"]);
  });

  it("should emit extra _all event", () => {
    const emitter = createEmitter<Events>();

    const events: Array<string> = [];

    emitter.on("test", (event) => {
      events.push("test");
    });
    emitter.on("_all", (event) => {
      events.push("all");
      expect(event._event).toBe("test");
    });

    emitter.emit("test", { a: "test" });

    expect(events).toEqual(["test", "all"]);
  });
});
