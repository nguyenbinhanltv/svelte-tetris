<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { of } from "rxjs";
  import * as _query from "../../state/keyboard/keyboard.query.svelte";
  import { ArrowButton } from "../../interfaces/arrow-button.svelte";
  import TButton from "../button/button.svelte";

  const dispatch = createEventDispatcher();

  export let filling = 20;

  function mouseDown(event: CustomEvent<any>): any {
    event.preventDefault();
    dispatch("mousekeydown", {
      key: event.detail.key,
    });
  }

  function mouseUp(event: CustomEvent<any>): any {
    event.preventDefault();
    dispatch("mousekeyup", {
      key: event.detail.key,
    });
  }
</script>

<div class="keyboard" style="margin-top: {filling}px;">
  <TButton
    className="blue btn-md"
    content="Rotation"
    active$={_query.up$}
    arrowButton={ArrowButton.UP}
    top={0}
    left={374}
    isAbsolute={true}
    on:mousekeydown={mouseDown}
    on:mousekeyup={mouseUp}
    key="Up"
  />
  <TButton
    className="blue btn-md"
    content="Down"
    active$={_query.down$}
    arrowButton={ArrowButton.DOWN}
    top={180}
    left={374}
    on:mousekeydown={mouseDown}
    on:mousekeyup={mouseUp}
    key="Down"
  />
  <TButton
    className="blue btn-md"
    content="Left"
    active$={_query.left$}
    arrowButton={ArrowButton.LEFT}
    top={90}
    left={284}
    on:mousekeydown={mouseDown}
    on:mousekeyup={mouseUp}
    key="Left"
  />
  <TButton
    className="blue btn-md"
    content="Right"
    active$={_query.right$}
    arrowButton={ArrowButton.RIGHT}
    top={90}
    left={464}
    on:mousekeydown={mouseDown}
    on:mousekeyup={mouseUp}
    key="Right"
  />
  <TButton
    className="blue btn-lg"
    content="Drop (SPACE)"
    active$={_query.drop$}
    top={100}
    left={52}
    on:mousekeydown={mouseDown}
    on:mousekeyup={mouseUp}
    key="Space"
  />
  <TButton
    className="red btn-sm"
    content="Reset (R)"
    active$={_query.reset$}
    top={0}
    left={196}
    on:mousekeydown={mouseDown}
    on:mousekeyup={mouseUp}
    key="Reset"
  />
  <TButton
    className="green btn-sm"
    content="Sound (S)"
    active$={_query.sound$}
    top={0}
    left={106}
    on:mousekeydown={mouseDown}
    on:mousekeyup={mouseUp}
    key="Sound"
  />
  <TButton
    className="green btn-sm"
    content="Pause (P)"
    active$={_query.pause$}
    top={0}
    left={16}
    on:mousekeydown={mouseDown}
    on:mousekeyup={mouseUp}
    key="Pause"
  />
</div>

<style lang="scss">
  @import "./keyboard.scss";
</style>
