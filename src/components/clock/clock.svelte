<script lang="ts">
  import { Subscription, timer } from "rxjs";
  import { map } from "rxjs/operators";
  import { onDestroy, onMount } from "svelte";

  const REFRESH_CLOCK_INTERVAL = 1000;
  let clock$: Subscription;
  let clock: string[] = [];

  function renderClock(): string[] {
    const now = new Date();
    const hours = formatTwoDigits(now.getHours());
    const minutes = formatTwoDigits(now.getMinutes());
    const isOddSecond = now.getSeconds() % 2 !== 0;
    const blinking = `colon-${isOddSecond ? "solid" : "faded"}`;
    return [...hours, blinking, ...minutes];
  }

  function formatTwoDigits(num: number): string[] {
    return `${num}`.padStart(2, "0").split("");
  }

  onMount(() => {
    clock$ = timer(0, REFRESH_CLOCK_INTERVAL)
      .pipe(map(() => renderClock()))
      .subscribe((val) => (clock = val));
  });

  onDestroy(() => {
    clock$.unsubscribe();
  });
</script>

<div class="number">
  {#each clock as item}
    <span class="bg num num-{item}" />
  {/each}
</div>
