<script lang="ts">
  export let num = 0;
  export let length = 6;

  export function nums(): string[] {
    const str = `${num}`;
    return str.padStart(length, "n").split("");
  }
</script>

<div class="number">
  {#each nums() as sequence}
    <span class="bg num num-{sequence}" />
  {/each}
</div>

<style lang="scss">
  @import "../../styles/_number.scss";
</style>
