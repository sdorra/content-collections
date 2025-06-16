<script>
  let count = 0;
</script>

<div class="squirrel-counter">
  <h3>🐿️ Squirrel Counter</h3>
  <div class="count">{count}</div>
  <div class="buttons">
    <button on:click={() => count++}>+</button>
    <button on:click={() => count--} disabled={count <= 0}>-</button>
    <button on:click={() => count = 0}>Reset</button>
  </div>
</div>

<style>
  .squirrel-counter {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 2rem;
    padding: 1rem;
    border: 2px solid #8B4513;
    border-radius: 0.5rem;
    background-color: #F5E6D3;
  }

  h3 {
    color: #8B4513;
  }

  .count {
    font-size: 2em;
    font-weight: bold;
    color: #8B4513;
    text-align: center;
  }

  .buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  button {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    background-color: #8B4513;
    color: white;
    cursor: pointer;
    font-size: 0.9em;
  }

  button:hover:not(:disabled) {
    background-color: #A0522D;
  }

  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
</style>
