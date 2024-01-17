import {  allCharacters } from "content-collections";

export default function Page() {
  return (
    <main>
      <h1>Characters</h1>
      <ul>
        {allCharacters.map((character) => (
          <li key={character.name}>
            <h2>{character.name}</h2>

            <ul>
              <li>Planet of origin: {character.origin}</li>
              <li>Species: {character.species}</li>
            </ul>

            <p>{character.content}</p>

            <a href={character.source}>Source</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
