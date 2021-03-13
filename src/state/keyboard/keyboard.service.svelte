<script lang="ts" context="module">
  import { KeyboardStore } from "./keyboard.store.svelte";
  import type { KeyboardState } from "./keyboard.store.svelte";

  export function setKeỵ(keyState: Partial<KeyboardState>) {
    KeyboardStore.update(keyState);
  }
</script>
