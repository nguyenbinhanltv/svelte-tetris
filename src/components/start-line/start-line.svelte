<script lang="ts">
  import type { Subscription } from "rxjs";
  import { onMount } from "svelte";
  import * as _tetrisQuery from "../../state/tetris/tetris.query.svelte";
  import Tnumber from "../number/number.svelte";

  let hasCurrent$: Subscription;
  let clearedLines$: Subscription;
  let initLine$: Subscription;
  let hasCurrent: boolean;
  let clearedLines: number;
  let initLine: number;

  onMount(() => {
    hasCurrent$ = _tetrisQuery.hasCurrent$.subscribe((hC) => (hasCurrent = hC));
    clearedLines$ = _tetrisQuery.clearedLines$.subscribe(
      (cL) => (clearedLines = cL)
    );
    initLine$ = _tetrisQuery.initLine$.subscribe((iL) => (initLine = iL));
  });
</script>

<p>
  {#if hasCurrent}
    <span>Lines</span>
  {:else}
    Start Line
  {/if}
</p>
{#if hasCurrent}
  <Tnumber num={clearedLines} />
{:else}
  <Tnumber num={initLine} />
{/if}
