<script lang="ts">
  import type { ArrowButton } from "../../interfaces/arrow-button.svelte";
  import { ArrowButtonTransform } from "../../interfaces/arrow-button.svelte";

  export let className: string = "";
  export let isAbsolute: boolean = false;
  export let top: number;
  export let left: number;

  export let active$: any;
  export let arrowButton: ArrowButton;
  export let content: string;

  function arrowTransforms() {
    return ArrowButtonTransform[arrowButton];
  }
</script>

<div class="button {className}" style="top: {top}px; left: {left}px;">
  <i class:active={active$} />
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
