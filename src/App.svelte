<script lang="ts">
  import Keyboard from "./components/keyboard/keyboard.svelte";
  export let name: string;
</script>

<main>
  <h1>Hello {name}!</h1>
  <Keyboard></Keyboard>
</main>
