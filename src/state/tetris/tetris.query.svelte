<script lang="ts" context="module">
  import { createEntityQuery, QueryEntity } from "@datorama/akita";
  import { TetrisStore } from "./tetris.store.svelte";
  import type { TetrisState } from "./tetris.store.svelte";
  import { GameState } from "../../interfaces/game-state.svelte";
  import { map, delay, switchMap } from "rxjs/operators";
  import { combineLatest, of } from "rxjs";

  export const TetrisQuery: QueryEntity<TetrisState> = createEntityQuery(
    TetrisStore
  );

  export const next$ = TetrisQuery.select("next");
  export const matrix$ = TetrisQuery.select("matrix");
  export const sound$ = TetrisQuery.select("sound");
  export const gameState$ = TetrisQuery.select("gameState");
  export const hasCurrent$ = TetrisQuery.select("current").pipe(
    map((x) => !!x)
  );
  export const points$ = TetrisQuery.select("points");
  export const clearedLines$ = TetrisQuery.select("clearedLines");
  export const initLine$ = TetrisQuery.select("initLine");
  export const speed$ = TetrisQuery.select("speed");
  export const initSpeed$ = TetrisQuery.select("initSpeed");
  export const max$ = TetrisQuery.select("max");

  export const isShowLogo$ = combineLatest([
    gameState$,
    TetrisQuery.select("current"),
  ]).pipe(
    switchMap(([state, current]) => {
      const isLoadingOrOver =
        state === GameState.Loading || state === GameState.Over;
      const isRenderingLogo$ = of(isLoadingOrOver && !current);
      return isLoadingOrOver
        ? isRenderingLogo$.pipe(delay(1800))
        : isRenderingLogo$;
    })
  );

  export function raw(): TetrisState {
    return TetrisQuery.getValue();
  }

  export function locked(): boolean {
    return raw().locked;
  }

  export function current() {
    return raw().current;
  }

  export function next() {
    return raw().next;
  }

  export function matrix() {
    return raw().matrix;
  }

  export function canStartGame() {
    return raw().gameState !== GameState.Started;
  }

  export function isPlaying() {
    return raw().gameState === GameState.Started;
  }

  export function isPause() {
    return raw().gameState === GameState.Paused;
  }

  export function isEnableSound(): boolean {
    return !!raw().sound;
  }
</script>
