<script lang="ts">
  import type { Subscription } from "rxjs";
  import { onDestroy, onMount } from "svelte";
  import type { Speed } from "../../interfaces/speed.svelte";
  import * as _tetrisQuery from "../../state/tetris/tetris.query.svelte";
  import Tnumber from "../number/number.svelte";

  let speed$: Subscription;
  let initSpeed$: Subscription;
  let hasCurrent$: Subscription;
  let speed: Speed;
  let initSpeed: Speed;
  let hasCurrent: boolean;

  onMount(() => {
    speed$ = _tetrisQuery.speed$.subscribe((s) => (speed = s));
    initSpeed$ = _tetrisQuery.initSpeed$.subscribe((iS) => (initSpeed = iS));
    hasCurrent$ = _tetrisQuery.hasCurrent$.subscribe((hC) => (hasCurrent = hC));
  });

  onDestroy(() => {
    speed$.unsubscribe();
    initSpeed$.unsubscribe();
    hasCurrent$.unsubscribe();
  });
</script>

<p>Level</p>
{#if hasCurrent}
  <Tnumber num={speed} length={1} />
{:else}
  <Tnumber num={initSpeed} length={1} />
{/if}
