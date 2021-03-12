<script lang="ts">
  import Keyboard from "./components/keyboard/keyboard.svelte";
  import Matrix from "./components/matrix/matrix.svelte";
  import Ttile from "./components/tile/tile.svelte";
  import { Tile } from "./interfaces/tile/tile.svelte";

  const tilee = new Tile(1);
</script>

<main>
  <Keyboard />
  <Matrix />
  <Ttile tile={tilee} />
</main>
