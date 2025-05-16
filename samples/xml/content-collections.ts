import {
  defineCollection,
  defineConfig,
  defineParser,
} from "@content-collections/core";
import xml2js from "xml2js";

const xmlParser = new xml2js.Parser({
  explicitRoot: false,
  explicitArray: false,
});

const parser = defineParser(xmlParser.parseStringPromise);

const movies = defineCollection({
  name: "movies",
  directory: "movies",
  include: "*.xml",
  parser,
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    // xml2js returns a string instead of a number
    year: z.coerce.number().min(1888).max(new Date().getFullYear()),
    // genres is a wrapper around the genre elements
    genres: z
      .object({
        // xml2js returns a string if only one genre is present
        genre: z.union([z.string(), z.array(z.string())]),
      })
      // remove the wrapper and always return an array
      .transform((val) => {
        if (Array.isArray(val.genre)) {
          return val.genre;
        }
        return [val.genre];
      }),
  }),
});

export default defineConfig({
  collections: [movies],
});
