<script lang="ts">
  import type { Tile } from "../../interfaces/tile/tile.svelte";
  import type { Observable } from "rxjs";
  import Ttile from "../tile/tile.svelte";

  let matrix$: Observable<Tile[]>;
</script>

<div class="matrix">
  <!-- {#each tiles as }
        <Ttile tile={}/>
    {/each} -->
</div>

<style lang="scss">
  @import "./matrix.scss";
</style>
