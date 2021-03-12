<script lang="ts">
  import { concat, Observable, Subscription, timer } from "rxjs";
  import {
    delay,
    finalize,
    map,
    repeat,
    startWith,
    takeWhile,
    tap,
  } from "rxjs/operators";
  import { onDestroy, onMount } from "svelte";
  import * as _tetrisQuery from "../../state/tetris/tetris.query.svelte";

  let logo$: Subscription;
  let className: string = "";

  function eyes() {
    return timer(0, 500).pipe(
      startWith(0),
      map((x) => x + 1),
      takeWhile((x) => x < 6),
      tap((x) => {
        const state = x % 2 === 0 ? 1 : 2;
        className = `l${state}`;
      })
    );
  }

  function run(): Observable<number> {
    let side = "r";
    return timer(0, 100).pipe(
      startWith(0),
      map((x) => x + 1),
      takeWhile((x) => x <= 40),
      tap((x) => {
        if (x === 10 || x === 20 || x === 30) {
          side = side === "r" ? "l" : "r";
        }
        const state = x % 2 === 0 ? 3 : 4;
        className = `${side}${state}`;
      }),
      finalize(() => {
        className = `${side}1`;
      })
    );
  }

  onMount(() => {
    logo$ = concat(run(), eyes()).pipe(delay(5000), repeat(1000)).subscribe();
  });

  onDestroy(() => logo$.unsubscribe());
</script>

<div class="logo">
  <div class="bg dragon {className}" />
  <p>Press Space to start</p>
</div>

<style lang="scss">
  @import "./logo.scss";
</style>
