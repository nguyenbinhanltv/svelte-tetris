<script lang="ts" context="module">
  import { Store, StoreConfig } from "@datorama/akita";
  import type { PieceFactory } from "../../factory/piece-factory.svelte";
  import { GameState } from "../../interfaces/game-state.svelte";
  import type { Piece } from "../../interfaces/piece/piece.svelte";
  import type { Tile } from "../../interfaces/tile/tile.svelte";
  import { MatrixUtil } from "../../interfaces/matrix.svelte";
  import type { Speed } from "../../interfaces/speed.svelte";
  import { LocalStorageService } from "../../services/local-storage.service.svelte";

  export interface TetrisState {
    matrix: Tile[];
    current: Piece;
    next: Piece;
    points: number;
    locked: boolean;
    sound: boolean;
    initSpeed: Speed;
    speed: Speed;
    initLine: number;
    clearedLines: number;
    gameState: GameState;
    saved: TetrisState;
    max: number;
  }

  export const createInitialState = (
    pieceFactory: PieceFactory
  ): TetrisState => ({
    matrix: MatrixUtil.getStartBoard(),
    current: null,
    next: pieceFactory.getRandomPiece(),
    points: 0,
    locked: true,
    sound: true,
    initLine: 0,
    clearedLines: 0,
    initSpeed: 1,
    speed: 1,
    gameState: GameState.Loading,
    saved: null,
    max: LocalStorageService.maxPoint,
  });
</script>
