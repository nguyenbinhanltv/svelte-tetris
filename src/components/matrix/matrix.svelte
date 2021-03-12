<script lang="ts">
  import type { Tile } from "../../interfaces/tile/tile.svelte";
  import Ttile from "../tile/tile.svelte";
  import * as TetrisQuery from "../../state/tetris/tetris.query.svelte";
  import { combineLatest, Observable, of, timer, Subscription } from "rxjs";
  import { map, switchMap, takeWhile } from "rxjs/operators";
  import { GameState } from "../../interfaces/game-state.svelte";
  import { MatrixUtil } from "../../interfaces/matrix.svelte";
  import { onMount } from "svelte";
  import { onDestroy } from "svelte";

  let matrix$: Subscription;
  let matrixValue: Tile[] = [];

  function getMatrix(): Observable<Tile[]> {
    return combineLatest([TetrisQuery.gameState$, TetrisQuery.matrix$]).pipe(
      switchMap(([gameState, matrix]) => {
        if (gameState !== GameState.Over && gameState !== GameState.Loading) {
          return of(matrix);
        }
        const newMatrix = [...matrix];
        const rowsLength = MatrixUtil.Height * 2;
        const animatedMatrix$: Observable<Tile[]> = timer(0, rowsLength).pipe(
          map((x) => x + 1),
          takeWhile((x) => x <= rowsLength + 1),
          switchMap((idx) => {
            const gridIndex = idx - 1;
            if (gridIndex < MatrixUtil.Height) {
              newMatrix.splice(
                gridIndex * MatrixUtil.Width,
                MatrixUtil.Width,
                ...MatrixUtil.FullRow
              );
            }
            if (gridIndex > MatrixUtil.Height && gridIndex <= rowsLength) {
              const startIdx =
                (MatrixUtil.Height - (gridIndex - MatrixUtil.Height)) *
                MatrixUtil.Width;
              newMatrix.splice(
                startIdx,
                MatrixUtil.Width,
                ...MatrixUtil.EmptyRow
              );
            }

            return of(newMatrix);
          })
        );
        return animatedMatrix$;
      })
    );
  }

  onMount(() => {
    matrix$ = getMatrix().subscribe((tiles) => (matrixValue = tiles));
  });

  onDestroy(() => {
    matrix$.unsubscribe();
  });
</script>

<div class="matrix">
  {#each matrixValue as tile}
    <Ttile {tile} />
  {/each}
</div>

<style lang="scss">
  @import "./matrix.scss";
</style>
