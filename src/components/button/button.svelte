<script lang="ts">
  import type { ArrowButton } from "../../interfaces/arrow-button.svelte";
  import { ArrowButtonTransform } from "../../interfaces/arrow-button.svelte";
  import type { Observable } from "rxjs";
  import { beforeUpdate, createEventDispatcher, onMount } from "svelte";

  export let className: string = "";
  export let isAbsolute: boolean = false;
  export let top: number;
  export let left: number;

  export let active$: Observable<boolean>;
  let active: boolean;
  export let arrowButton: ArrowButton;
  export let content: string;
  export let key: string;

  onMount(() => {});
  active$.subscribe((val) => {
    active = val;
  });

  beforeUpdate(() => {
    active$.subscribe((val) => {
      active = val;
    });
  });

  function arrowTransforms() {
    return ArrowButtonTransform[arrowButton];
  }

  const dispatch = createEventDispatcher();

  function mouseDown(): any {
    dispatch("mousekeydown", {
      key: key,
    });
  }

  function mouseUp(): any {
    dispatch("mousekeyup", {
      key: key,
    });
  }
</script>

<div
  class="button {className}"
  style="top: {top}px; left: {left}px;"
  on:mousedown={mouseDown}
  on:mouseup={mouseUp}
  on:touchstart={mouseDown}
  on:touchend={mouseUp}
>
  <i class:active />
  {#if arrowButton}
    <em style="transform: {arrowTransforms()};" />
  {/if}

  <span class:absolute={isAbsolute}>
    {content}
  </span>
</div>

<style lang="scss">
  @import "./button.scss";
</style>
