<script lang="ts">
  import type { Observable, Subscription } from "rxjs";
  import { map } from "rxjs/operators";
  import { onMount } from "svelte";
  import { onDestroy, subscribe } from "svelte/internal";
  import { Tile, TileValue } from "../../interfaces/tile/tile.svelte";
  import * as _tetrisQuery from "../../state/tetris/tetris.query.svelte";

  let next$: Subscription;
  let nexts: Tile[][] = [];

  onMount(() => {
    next$ = _tetrisQuery.next$
      .pipe(
        map((piece) =>
          piece.next.map((row) =>
            row.map((value) => new Tile(value as TileValue))
          )
        )
      )
      .subscribe((value) => (nexts = value));
  });

  onDestroy(() => {
    next$.unsubscribe();
  });
</script>

<p>Next</p>
<div class="next">
  {#each nexts as next}
    <div class="row">
      {#each next as tile}
        <t-tile {tile} />
      {/each}
    </div>
  {/each}
</div>

<style lang="scss">
  @import "./next.scss";
</style>
