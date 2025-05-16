import { allMovies } from "content-collections";

for (const movie of allMovies) {
  console.log("---");
  console.log(movie.title);
  console.log(movie.description);
  console.log(movie.year);
  console.log(movie.genres);
  // @ts-expect-error content is not in the schema
  if (movie.content) {
    console.log("it has content, but it shouldn't");
  }
}
