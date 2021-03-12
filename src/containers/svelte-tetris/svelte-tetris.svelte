<script lang="ts">
  import Tscreen from "../../components/screen/screen.svelte";
  import Tlogo from "../../components/logo/logo.svelte";
  import Tpoint from "../../components/point/point.svelte";
  import TstartLine from "../../components/start-line/start-line.svelte";
  import Tlevel from "../../components/level/level.svelte";
  import Tnext from "../../components/next/next.svelte";
  import Tsound from "../../components/sound/sound.svelte";
  import Tpause from "../../components/pause/pause.svelte";
  import Tclock from "../../components/clock/clock.svelte";
  import Tkeyboard from "../../components/keyboard/keyboard.svelte";

  import Tmatrix from "../../components/matrix/matrix.svelte";
  import { isShowLogo$ } from "../../state/tetris/tetris.query.svelte";
  import { onMount } from "svelte";

  let filling: number;
  let host: HTMLElement;

  function resize() {
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const ratio = height / width;
    let scale = 1;
    if (ratio < 1.5) {
      scale = height / 960;
    } else {
      scale = width / 640;
      filling = (height - 960 * scale) / scale / 3;
      const paddingTop = Math.floor(filling) + 42;
      const paddingBottom = Math.floor(filling);
      const marginTop = Math.floor(-480 - filling * 1.5);
      setPaddingMargin(paddingTop, paddingBottom, marginTop);
    }

    host.style.transform = `scale(${scale - 0.02})`;
  }

  function setPaddingMargin(
    paddingTop: number,
    paddingBottom: number,
    marginTop: number
  ) {
    host.style.paddingTop = `${paddingTop}px`;
    host.style.paddingBottom = `${paddingBottom}px`;
    host.style.marginTop = `${marginTop}px`;
  }

  onMount(() => {
    resize();
  });
</script>

<div id="host" bind:this={host}>
  <div class="react">
    <Tscreen />
    <div class="screen">
      <div class="panel">
        <Tmatrix />
        {#if isShowLogo$}
          <Tlogo />
        {/if}
        <div class="state">
          <Tpoint />
          <TstartLine />
          <Tlevel />
          <Tnext />
          <div class="last-row">
            <Tsound />
            <Tpause />
            <Tclock />
          </div>
        </div>
      </div>
    </div>
  </div>
  <Tkeyboard />
</div>

<style lang="scss">
  @import "./svelte-tetris.scss";
</style>
