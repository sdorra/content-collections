<script>
  import { allCharacters } from "content-collections";
</script>

<h1>Characters</h1>

<ul>
  {#each allCharacters as character}
    <li>
      <h2>{character.name}</h2>
      <p>{character.content}</p>
    </li>
  {/each}
</ul>
