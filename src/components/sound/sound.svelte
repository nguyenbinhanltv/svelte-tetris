<script lang="ts">
  import type { Subscription } from "rxjs";
  import { map } from "rxjs/operators";
  import { onDestroy, onMount } from "svelte";
  import * as _tetrisQuery from "../../state/tetris/tetris.query.svelte";

  let muted$: Subscription;
  let muted: boolean;

  onMount(() => {
    muted$ = _tetrisQuery.sound$
      .pipe(map((sound) => !sound))
      .subscribe((val) => (muted = val));
  });

  onDestroy(() => muted$.unsubscribe());
</script>

<div class="bg music" class:filled={muted} />

<style lang="scss">
  @import "./sound.scss";
</style>
