<script lang="ts" context="module">
  import { Piece } from "./piece.svelte";
  import { PieceRotation, PieceTypes } from "./piece-enum.svelte";
  import type { Shapes } from "./shape.svelte";

  const SHAPES_O: Shapes = [];
  SHAPES_O[PieceRotation.Deg0] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [1, 1, 0, 0],
    [1, 1, 0, 0],
  ];

  export class PieceO extends Piece {
    constructor(x: number, y: number) {
      super(x, y);
      this.type = PieceTypes.O;
      this.next = [
        [0, 1, 1, 0],
        [0, 1, 1, 0],
      ];
      this.setShapes(SHAPES_O);
    }
  }
</script>
