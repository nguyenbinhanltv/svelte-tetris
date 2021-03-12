<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { of } from "rxjs";
  import { ArrowButton } from "../../interfaces/arrow-button.svelte";
  import TButton from "../button/button.svelte";

  const dispatch = createEventDispatcher();

  let filling = 20;

  function mouseDown(key: string): any {
    dispatch("mousedown", {
      key: key,
    });
  }

  function mouseUp(key: string): any {
    dispatch("mouseup", {
      key: key,
    });
  }
</script>

<div class="keyboard" style="margin-top: {filling}px;">
  <TButton
    className="blue btn-md"
    content="Rotation"
    active$={of(true)}
    arrowButton={ArrowButton.UP}
    top={0}
    left={374}
    isAbsolute={true}
    on:mousedown={mouseDown("Up")}
    on:mouseup={mouseUp("Up")}
    on:touchstart={mouseDown("Up")}
    on:touchend={mouseUp("Up")}
  />
  <TButton
    className="blue btn-md"
    content="Down"
    active$={of(false)}
    arrowButton={ArrowButton.DOWN}
    top={180}
    left={374}
    on:mousedown={mouseDown("Down")}
    on:mouseup={mouseUp("Down")}
    on:touchstart={mouseDown("Down")}
    on:touchend={mouseUp("Down")}
  />
  <TButton
    className="blue btn-md"
    content="Left"
    active$={of(false)}
    arrowButton={ArrowButton.LEFT}
    top={90}
    left={284}
    on:mousedown={mouseDown("Left")}
    on:mouseup={mouseUp("Left")}
    on:touchstart={mouseDown("Left")}
    on:touchend={mouseUp("Left")}
  />
  <TButton
    className="blue btn-md"
    content="Right"
    active$={of(false)}
    arrowButton={ArrowButton.RIGHT}
    top={90}
    left={464}
    on:mousedown={mouseDown("Right")}
    on:mouseup={mouseUp("Right")}
    on:touchstart={mouseDown("Right")}
    on:touchend={mouseUp("Right")}
  />
  <TButton
    className="blue btn-lg"
    content="Drop (SPACE)"
    active$={of(false)}
    top={100}
    left={52}
    on:mousedown={mouseDown("Space")}
    on:mouseup={mouseUp("Space")}
    on:touchstart={mouseDown("Space")}
    on:touchend={mouseUp("Space")}
  />
  <TButton
    className="red btn-sm"
    content="Reset (R)"
    active$={of(false)}
    top={0}
    left={196}
    on:mousedown={mouseDown("Reset")}
    on:mouseup={mouseUp("Reset")}
    on:touchstart={mouseDown("Reset")}
    on:touchend={mouseUp("Reset")}
  />
  <TButton
    className="green btn-sm"
    content="Sound (S)"
    active$={of(false)}
    top={0}
    left={106}
    on:mousedown={mouseDown("Sound")}
    on:mouseup={mouseUp("Sound")}
    on:touchstart={mouseDown("Sound")}
    on:touchend={mouseUp("Sound")}
  />
  <TButton
    className="green btn-sm"
    content="Pause (P)"
    active$={of(false)}
    top={0}
    left={16}
    on:mousedown={mouseDown("Pause")}
    on:mouseup={mouseUp("Pause")}
    on:touchstart={mouseDown("Pause")}
    on:touchend={mouseUp("Pause")}
  />
</div>

<style lang="scss">
  @import "./keyboard.scss";
</style>
