<script lang="ts">
  import Keyboard from "./components/keyboard/keyboard.svelte";
  import Ttile from "./components/tile/tile.svelte";
  import { Tile } from "./interfaces/tile/tile.svelte";
  export let name: string;
  const tilee = new Tile(1);
</script>

<main>
  <h1>Hello {name}!</h1>
  <Keyboard />
  <Ttile tile={tilee}/>
</main>
