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
  import { onDestroy, onMount } from "svelte";
  import * as _soundService from "../../services/sound-manager.service.svelte";
  import * as _keyboardService from "../../state/keyboard/keyboard.service.svelte";
  import * as _keyboardQuery from "../../state/keyboard/keyboard.query.svelte";
  import * as _tetrisService from "../../state/tetris/tetris.service.svelte";
  import * as _tetrisQuery from "../../state/tetris/tetris.query.svelte";
  import type { Subscription } from "rxjs";
  import { watchResize } from "svelte-watch-resize";

  let filling: number;
  let host: HTMLElement;

  let drop$: Subscription;
  let isShowLogo$: Subscription;
  let drop: boolean;
  let isShowLogo: boolean;

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

  function keyDownLeft() {
    _soundService.move();
    _keyboardService.setKeỵ({
      left: true,
    });
    if (hasCurrent()) {
      _tetrisService.moveLeft();
    } else {
      _tetrisService.decreaseLevel();
    }
  }

  function keyUpLeft() {
    _keyboardService.setKeỵ({
      left: false,
    });
  }

  function keyDownRight() {
    _soundService.move();
    _keyboardService.setKeỵ({
      right: true,
    });
    if (hasCurrent()) {
      _tetrisService.moveRight();
    } else {
      _tetrisService.increaseLevel();
    }
  }

  function keyUpRight() {
    _keyboardService.setKeỵ({
      right: false,
    });
  }

  function keyDownUp() {
    _soundService.rotate();
    _keyboardService.setKeỵ({
      up: true,
    });
    if (hasCurrent()) {
      _tetrisService.rotate();
    } else {
      _tetrisService.increaseStartLine();
    }
  }

  function keyUpUp() {
    _keyboardService.setKeỵ({
      up: false,
    });
  }

  function keyDownDown() {
    _soundService.move();
    _keyboardService.setKeỵ({
      down: true,
    });
    if (hasCurrent()) {
      _tetrisService.moveDown();
    } else {
      _tetrisService.decreaseStartLine();
    }
  }

  function keyUpDown() {
    _keyboardService.setKeỵ({
      down: false,
    });
  }

  function keyDownSpace() {
    _keyboardService.setKeỵ({
      drop: true,
    });
    if (hasCurrent()) {
      _soundService.fall();
      _tetrisService.drop();
      return;
    }
    _soundService.start();
    _tetrisService.start();
  }

  function keyUpSpace() {
    _keyboardService.setKeỵ({
      drop: false,
    });
  }

  function keyDownSound() {
    _soundService.move();
    _tetrisService.setSound();
    _keyboardService.setKeỵ({
      sound: true,
    });
  }

  function keyUpSound() {
    _keyboardService.setKeỵ({
      sound: false,
    });
  }

  function keyDownPause() {
    _soundService.move();
    _keyboardService.setKeỵ({
      pause: true,
    });
    if (_tetrisQuery.canStartGame()) {
      _tetrisService.resume();
    } else {
      _tetrisService.pause();
    }
  }

  function keyUpPause() {
    _keyboardService.setKeỵ({
      pause: false,
    });
  }

  function keyDownReset() {
    _soundService.move();
    _keyboardService.setKeỵ({
      reset: true,
    });
    _tetrisService.pause();
    setTimeout(() => {
      if (confirm("Are you sure you want to reset?")) {
        _tetrisService.reset();
      } else {
        _tetrisService.resume();
      }
      keyUpReset();
    });
  }

  function keyUpReset() {
    _keyboardService.setKeỵ({
      reset: false,
    });
  }

  function hasCurrent() {
    return !!_tetrisQuery.current();
  }

  function keyboardMouseDown(event) {
    switch (`keyDown${event.detail.key}`) {
      case "keyDownUp":
        keyDownUp();
        break;
      case "keyDownDown":
        keyDownDown();
        break;
      case "keyDownLeft":
        keyDownLeft();
        break;
      case "keyDownRight":
        keyDownRight();
        break;
      case "keyDownSound":
        keyDownSound();
        break;
      case "keyDownReset":
        keyDownReset();
        break;
      case "keyDownPause":
        keyDownPause();
        break;
      case "keyDownSpace":
        keyDownSpace();
        break;
    }
  }

  function keyboardMouseUp(event) {
    switch (`keyUp${event.detail.key}`) {
      case "keyUpUp":
        keyUpUp();
        break;
      case "keyUpDown":
        keyUpDown();
        break;
      case "keyUpLeft":
        keyUpLeft();
        break;
      case "keyUpRight":
        keyUpRight();
        break;
      case "keyUpSound":
        keyUpSound();
        break;
      case "keyUpReset":
        keyUpReset();
        break;
      case "keyUpPause":
        keyUpPause();
        break;
      case "keyUpSpace":
        keyUpSpace();
        break;
    }
  }

  function handleKeyboardDown(event) {
    switch (event.keyCode) {
      case 38:
        keyDownUp();
        break;
      case 40:
        keyDownDown();
        break;
      case 37:
        keyDownLeft();
        break;
      case 39:
        keyDownRight();
        break;
      case 83:
        keyDownSound();
        break;
      case 82:
        keyDownReset();
        break;
      case 80:
        keyDownPause();
        break;
      case 32:
        keyDownSpace();
        break;

      default:
        break;
    }
  }

  function handleKeyboardUp(event) {
    switch (event.keyCode) {
      case 38:
        keyUpUp();
        break;
      case 40:
        keyUpDown();
        break;
      case 37:
        keyUpLeft();
        break;
      case 39:
        keyUpRight();
        break;
      case 83:
        keyUpSound();
        break;
      case 82:
        keyUpReset();
        break;
      case 80:
        keyUpPause();
        break;
      case 32:
        keyUpSpace();
        break;
      default:
        break;
    }
  }

  function handlerResize(node) {
    resize();
  }

  function unloadHandler(event: Event) {
    _tetrisService.reset();
  }

  onMount(() => {
    drop$ = _keyboardQuery.drop$.subscribe((val) => (drop = val));
    isShowLogo$ = _tetrisQuery.isShowLogo$.subscribe(
      (val) => (isShowLogo = val)
    );
  });

  onDestroy(() => {
    drop$.unsubscribe();
    isShowLogo$.unsubscribe();
  });
</script>

<svelte:window
  on:keydown={handleKeyboardDown}
  on:keyup={handleKeyboardUp}
  on:resize={handlerResize}
  on:error={unloadHandler}
/>

<div id="host" bind:this={host} use:watchResize={handlerResize}>
  <div class="react" class:drop>
    <Tscreen />
    <div class="screen">
      <div class="panel">
        <Tmatrix />
        {#if isShowLogo}
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
  <Tkeyboard
    on:mousekeydown={keyboardMouseDown}
    on:mousekeyup={keyboardMouseUp}
    {filling}
  />
</div>

<style lang="scss">
  @import "./svelte-tetris.scss";
</style>
