<script lang="ts" context="module">
import { createEntityStore } from "@datorama/akita";


  export interface KeyboardState {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    pause: boolean;
    sound: boolean;
    reset: boolean;
    drop: boolean;
  }

  export const createInitialState = (): KeyboardState => ({
    up: false,
    down: false,
    left: false,
    right: false,
    pause: false,
    sound: false,
    reset: false,
    drop: false,
  });

  export const KeyboardStore = createEntityStore(
    createInitialState(),
    {
      name: "SvelteTetrisKeyboard",
    }
  );
</script>
