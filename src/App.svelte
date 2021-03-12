<script lang="ts">
  import Keyboard from "./components/keyboard/keyboard.svelte";
  import TileComponent from "./components/tile/tile.svelte";
  import { Tile } from "./interfaces/tile/tile.svelte";
  export let name: string;
  const tilee = new Tile(2);
</script>

<main>
  <h1>Hello {name}!</h1>
  <Keyboard />
  <TileComponent tile={tilee}/>
</main>
