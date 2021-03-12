<script lang="ts">
  import type { Tile } from "../../interfaces/tile/tile.svelte";

  export let tile: Tile;

  let tileElementRef;

  function className(tile: Tile) {
    if (!tile) {
      return;
    }

    if (tile.isFilled) {
      return "filled";
    }

    if (tile.isAnimated) {
      return "animated";
    }
  }
</script>

<div bind:this={tileElementRef} class={className(tile)} />

<style lang="scss">
  @import "./tile.scss";
</style>
