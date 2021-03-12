<script lang="ts" context="module">
  const SVELTE_TETRIS_STORAGE_KEY = "SVELTE_TETRIS";
  export class LocalStorageService {
    constructor() {}

    static setMaxPoint(max: number) {
      localStorage.setItem(SVELTE_TETRIS_STORAGE_KEY, `${max}`);
    }

    static get maxPoint(): number {
      const max = parseInt(localStorage.getItem(SVELTE_TETRIS_STORAGE_KEY));
      return Number.isInteger(max) ? max : 0;
    }
  }
</script>
