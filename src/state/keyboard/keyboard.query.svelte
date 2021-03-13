<script lang="ts" context="module">
  import { createEntityQuery, QueryEntity } from "@datorama/akita";
  import { KeyboardStore } from "./keyboard.store.svelte";
  import type { KeyboardState } from "./keyboard.store.svelte";

  export const KeyboardQuery: QueryEntity<KeyboardState> = createEntityQuery(
    KeyboardStore
  );
  export const up$ = KeyboardQuery.select("up");
  export const down$ = KeyboardQuery.select("down");
  export const left$ = KeyboardQuery.select("left");
  export const right$ = KeyboardQuery.select("right");
  export const drop$ = KeyboardQuery.select("drop");
  export const pause$ = KeyboardQuery.select("pause");
  export const sound$ = KeyboardQuery.select("sound");
  export const reset$ = KeyboardQuery.select("reset");
</script>
