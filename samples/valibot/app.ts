import { allCharacters } from "content-collections";

for (const character of allCharacters) {
  console.log("---");
  console.log(character.name);
  console.log(character.status);
  console.log(character.species);
  console.log(character.type);
  console.log(character.gender);
  console.log(character.origin);
  console.log(character.location);
  console.log(character.image);
  console.log(character.episode);
  console.log(character.url);
  console.log(character.created);
  // @ts-expect-error content is not in the schema
  if (character.content) {
    console.log("it has content, but it shouldn't");
  }
}
