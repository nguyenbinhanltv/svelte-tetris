<script lang="ts">
  class LabelAndNumber {
    constructor(public label: string, public points: number) {}
  }
  import { of, Subscription, timer } from "rxjs";
  import { map, switchMap } from "rxjs/operators";
  import { onMount } from "svelte";
  import * as _tetrisQuery from "../../state/tetris/tetris.query.svelte";
  import Tnumber from "../number/number.svelte";

  let labelAndPoints$: Subscription;
  let labelAndPoints: LabelAndNumber;
  const REFRESH_LABEL_INTERVAL = 3000;

  function renderLabelAndPoints() {
    labelAndPoints$ = _tetrisQuery.hasCurrent$
      .pipe(
        switchMap((hasCurrent) => {
          if (hasCurrent) {
            return of(new LabelAndNumber("Score", _tetrisQuery.raw().points));
          }
          return timer(0, REFRESH_LABEL_INTERVAL).pipe(
            map((val) => {
              const isOdd = val % 2 === 0;
              const { points, max } = _tetrisQuery.raw();
              return isOdd
                ? new LabelAndNumber("Score", points)
                : new LabelAndNumber("Max ", max);
            })
          );
        })
      )
      .subscribe((val) => {
        labelAndPoints = val;
      });
  }

  onMount(() => {
    renderLabelAndPoints();
  });
</script>

{#if labelAndPoints}
  <div>
    <p>{labelAndPoints.label}</p>
    <Tnumber num={labelAndPoints.points} />
  </div>
{/if}
