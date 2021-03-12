<script lang="ts" context="module">
  import { Tile } from "./tile.svelte";

  export class FilledTile extends Tile {
    constructor(isSolid = false) {
      super(1);
      this.isSolid = isSolid;
    }
  }
</script>
