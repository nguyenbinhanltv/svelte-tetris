<script lang="ts" context="module">
  import { KeyboardStore, KeyboardState } from "./keyboard.store.svelte";

  export function setKeỵ(keyState: Partial<KeyboardState>) {
    KeyboardStore.update(keyState);
  }
</script>
