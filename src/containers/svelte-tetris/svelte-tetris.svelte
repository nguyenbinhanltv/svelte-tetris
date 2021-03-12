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
</script>

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

<style lang="scss">
  @import "./svelte-tetris.scss";
</style>
