<script lang="ts" context="module">
  import { Tile } from "./tile.svelte";

  export class AnimatedTile extends Tile {
    constructor(isSolid = false) {
      super(2);
      this.isSolid = isSolid;
    }
  }
</script>
