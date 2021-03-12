<script lang="ts" context="module">
  import { Tile } from "./tile.svelte";

  export class EmptyTile extends Tile {
    constructor() {
      super(0);
      this.isSolid = false;
    }
  }
</script>
