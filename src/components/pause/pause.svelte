<script lang="ts">
  import { interval, of, Subscription } from "rxjs";
  import { map, switchMap } from "rxjs/operators";
  import { onDestroy, onMount } from "svelte";
  import { GameState } from "../../interfaces/game-state.svelte";
  import * as _tetrisQuery from "../../state/tetris/tetris.query.svelte";

  let paused$: Subscription;
  let paused: boolean;

  onMount(() => {
    paused$ = _tetrisQuery.gameState$
      .pipe(
        switchMap((state) => {
          if (state === GameState.Paused) {
            return interval(250).pipe(map((num) => !!(num % 2)));
          }
          return of(false);
        })
      )
      .subscribe((val) => (paused = val));
  });

  onDestroy(() => paused$.unsubscribe());
</script>

<div class="bg pause" class:filled={paused}></div>

<style lang="scss">
  @import "./pause.scss";
</style>
