<script lang="ts">
  import Tbutton from "./components/button/button.svelte";
  import { ArrowButton } from "./interfaces/arrow-button.svelte";
  export let name: string;
</script>

<main>
  <h1>Hello {name}!</h1>
  <Tbutton
    className="green btn-md"
    active$={true}
    arrowButton={ArrowButton.UP}
    top={0}
    left={374}
    isAbsolute={true}
  >
    Rotation
  </Tbutton>
</main>
