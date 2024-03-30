// @refresh reload
import { allCharacters } from "content-collections";
import "./app.css";

export default function App() {
  return (
    <main>
      <h1>Characters</h1>
      <ul>
        {allCharacters.map((character) => (
          <li>
            <h2>{character.name}</h2>
            <div innerHTML={character.content} />
          </li>
        ))}
      </ul>
    </main>
  );
}
