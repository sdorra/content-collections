<script>
  import { allCharacters } from "content-collections";
</script>

<h1>Characters</h1>

<ul>
  {#each allCharacters as character}
    <li>
      <h2>{character.name}</h2>
      <div>{@html character.content}</div>
    </li>
  {/each}
</ul>
