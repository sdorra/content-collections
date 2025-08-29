import { defineCollection, defineConfig } from "src/config";
import type { Events } from "src/events";
import { describe, expect } from "vitest";
import { z } from "zod";
import { workspaceTest } from "./workspace";

describe("events", () => {
  workspaceTest(
    "should send builder create event",
    async ({ workspaceBuilder, emitter }) => {
      const now = Date.now();

      const animals = defineCollection({
        name: "animals",
        directory: "src/animals",
        include: "*.json",
        parser: "json",
        schema: z.object({
          name: z.string(),
          species: z.string(),
        }),
      });

      const config = defineConfig({
        collections: [animals],
      });

      type Event = Events["builder:created"];

      const events: Array<Event> = [];
      emitter.on("builder:created", (event) => events.push(event));

      const workspace = await workspaceBuilder(config);
      await workspace.build();

      expect(events).toHaveLength(1);
      const event = events[0];
      if (!event) {
        throw new Error("No event");
      }

      expect(event.createdAt).toBeGreaterThan(now);
      expect(event.configurationPath).toBeDefined();
      expect(event.outputDirectory).toBeDefined();
    },
  );

  workspaceTest(
    "should send build start and end events",
    async ({ workspaceBuilder, emitter }) => {
      const now = Date.now();

      const animals = defineCollection({
        name: "animals",
        directory: "src/animals",
        include: "*.json",
        parser: "json",
        schema: z.object({
          name: z.string(),
          species: z.string(),
        }),
      });

      const config = defineConfig({
        collections: [animals],
      });

      const events = {
        start: undefined as Events["builder:start"] | undefined,
        end: undefined as Events["builder:end"] | undefined,
      };

      emitter.on("builder:start", (event) => {
        if (events.start) {
          throw new Error("Start event already received");
        }
        events.start = event;
      });

      let endEvent: Events["builder:end"] | undefined = undefined;
      emitter.on("builder:end", (event) => {
        if (endEvent) {
          throw new Error("End event already received");
        }
        events.end = event;
      });

      const workspace = await workspaceBuilder(config);

      workspace.file(
        "src/animals/1.json",
        JSON.stringify({
          name: "Lion",
          species: "Panthera leo",
        }),
      );

      workspace.file(
        "src/animals/2.json",
        JSON.stringify({
          name: "Tiger",
          species: "Panthera tigris",
        }),
      );

      await workspace.build();

      if (!events.start) {
        throw new Error("No start event");
      }
      expect(events.start.startedAt).toBeGreaterThan(now);

      if (!events.end) {
        throw new Error("No end event");
      }
      expect(events.end.startedAt).toBe(events.start.startedAt);
      expect(events.end.endedAt).toBeGreaterThan(events.end.startedAt);
      expect(events.end.stats).toMatchObject({
        collections: 1,
        documents: 2,
      });
    },
  );
});
