<script lang="ts">
  import { beforeUpdate } from "svelte";

  export let num = 0;
  export let length = 6;
  let getNums: string[];

  export function nums(): string[] {
    const str = `${num}`;
    return str.padStart(length, "n").split("");
  }

  beforeUpdate(() => {
    getNums = nums();
  });
</script>

<div class="number">
  {#each getNums as sequence}
    <span class="bg num num-{sequence}" />
  {/each}
</div>

<style lang="scss">
  @import "../../styles/_number.scss";
</style>
