<script lang="ts">
  import { FilledTile } from "../../interfaces/tile/filled-tile.svelte";
  import Ttile from "../tile/tile.svelte";

  const title = "Svelte Tetris";
  const filled = new FilledTile();
</script>

<div class="topBorder">
  <span class="l mr-10 w-40" />
  <span class="l mr-10" />
  <span class="l mr-10" />
  <span class="l mr-10" />
  <span class="l mr-10" />
  <span class="r ml-10 w-40" />
  <span class="r ml-10" />
  <span class="r ml-10" />
  <span class="r ml-10" />
  <span class="r ml-10" />
</div>
<h1>{title}</h1>
<div class="view">
  <Ttile tile={filled} />
  <div class="clear" />
  <Ttile tile={filled} />
  <Ttile tile={filled} />
  <div class="clear" />
  <em />
  <Ttile tile={filled} />
  <p />
  <em />
  <Ttile tile={filled} />
  <div class="clear" />
  <Ttile tile={filled} />
  <Ttile tile={filled} />
  <div class="clear" />
  <em />
  <Ttile tile={filled} />
  <p />
  <Ttile tile={filled} />
  <Ttile tile={filled} />
  <Ttile tile={filled} />
  <Ttile tile={filled} />
  <p />
  <Ttile tile={filled} />
  <div class="clear" />
  <Ttile tile={filled} />
  <Ttile tile={filled} />
  <div class="clear" />
  <Ttile tile={filled} />
  <p />
  <Ttile tile={filled} />
  <Ttile tile={filled} />
  <div class="clear" />
  <Ttile tile={filled} />
  <div class="clear" />
  <Ttile tile={filled} />
  <p />
  <em />
  <Ttile tile={filled} />
  <div class="clear" />
  <em />
  <Ttile tile={filled} />
  <div class="clear" />
  <em />
  <Ttile tile={filled} />
  <div class="clear" />
  <em />
  <Ttile tile={filled} />
</div>
<div class="view l">
  <em />
  <Ttile tile={filled} />
  <div class="clear" />
  <Ttile tile={filled} />
  <Ttile tile={filled} />
  <div class="clear" />
  <Ttile tile={filled} />
  <p />
  <Ttile tile={filled} />
  <div class="clear" />
  <Ttile tile={filled} />
  <Ttile tile={filled} />
  <div class="clear" />
  <Ttile tile={filled} />
  <p />
  <Ttile tile={filled} />
  <Ttile tile={filled} />
  <Ttile tile={filled} />
  <Ttile tile={filled} />
  <p />
  <em />
  <Ttile tile={filled} />
  <div class="clear" />
  <Ttile tile={filled} />
  <Ttile tile={filled} />
  <div class="clear" />
  <em />
  <Ttile tile={filled} />
  <p />
  <Ttile tile={filled} />
  <Ttile tile={filled} />
  <div class="clear" />
  <em />
  <Ttile tile={filled} />
  <div class="clear" />
  <em />
  <Ttile tile={filled} />
  <p />
  <Ttile tile={filled} />
  <div class="clear" />
  <Ttile tile={filled} />
  <div class="clear" />
  <Ttile tile={filled} />
  <div class="clear" />
  <Ttile tile={filled} />
</div>

<style lang="scss">
  @import "./screen.scss";
</style>
