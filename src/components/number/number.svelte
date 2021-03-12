<script lang="ts">
  export let num = 0;
  export let length = 6;

  export function nums(): string[] {
    const str = `${num}`;
    return str.padStart(this.length, "n").split("");
  }
</script>

<div class="number">
  {#each nums() as sequence}
    <span class="bg num num-{sequence}" />
  {/each}
</div>
