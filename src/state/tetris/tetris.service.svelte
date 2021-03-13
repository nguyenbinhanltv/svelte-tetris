<script lang="ts" context="module">
  import { PieceFactory } from "../../factory/piece-factory.svelte";
  import type { CallBack } from "../../interfaces/callback.svelte";
  import { GameState } from "../../interfaces/game-state.svelte";
  import type { Piece } from "../../interfaces/piece/piece.svelte";
  import { EmptyTile } from "../../interfaces/tile/empty-tile.svelte";
  import { FilledTile } from "../../interfaces/tile/filled-tile.svelte";
  import type { Tile } from "../../interfaces/tile/tile.svelte";
  import { MatrixUtil } from "../../interfaces/matrix.svelte";
  import { Subscription, timer } from "rxjs";
  import * as _query from "./tetris.query.svelte";
  import * as _store from "./tetris.store.svelte";
  import type { Speed } from "../../interfaces/speed.svelte";
  import * as _soundManager from "../../services/sound-manager.service.svelte";
  import * as LocalStorageService from "../../services/local-storage.service.svelte";
  import { createInitialState } from "./tetris.store.svelte";

  let _gameInterval: Subscription;
  const _pieceFactory = new PieceFactory();

  function _locked() {
    return _query.locked();
  }

  function _current() {
    return _query.current();
  }

  function _next() {
    return _query.next();
  }

  function _matrix() {
    return _query.matrix();
  }

  export function start() {
    if (!_current()) {
      _setCurrentPiece(_next());
      _setNext();
    }
    const { initLine, initSpeed } = _query.raw();
    _store.TetrisStore.update({
      points: 0,
      gameState: GameState.Started,
      matrix: MatrixUtil.getStartBoard(initLine),
      speed: initSpeed,
    });
    _unsubscribe();
    auto(MatrixUtil.getSpeedDelay(initSpeed));
    _setLocked(false);
  }

  export function auto(delay: number) {
    _gameInterval = timer(0, delay).subscribe(() => {
      _update();
    });
  }

  export function resume() {
    if (!_query.isPause()) {
      return;
    }
    const { speed } = _query.raw();
    _store.TetrisStore.update({
      locked: false,
      gameState: GameState.Started,
    });
    auto(MatrixUtil.getSpeedDelay(speed));
  }

  export function pause() {
    if (!_query.isPlaying()) {
      return;
    }
    _store.TetrisStore.update({
      locked: true,
      gameState: GameState.Paused,
    });
    _unsubscribe();
  }

  export function reset() {
    const { sound } = _query.raw();
    _store.TetrisStore.update({
      ...createInitialState(_pieceFactory),
      sound,
    });
  }

  export function moveLeft() {
    if (_locked()) {
      return;
    }
    _clearPiece();
    _setCurrentPiece(_current().store());
    _setCurrentPiece(_current().moveLeft());
    if (_isCollidesLeft()) {
      _setCurrentPiece(_current().revert());
    }
    _drawPiece();
  }

  export function moveRight() {
    if (_locked()) {
      return;
    }
    _clearPiece();
    _setCurrentPiece(_current().store());
    _setCurrentPiece(_current().moveRight());
    if (_isCollidesRight()) {
      _setCurrentPiece(_current().revert());
    }
    _drawPiece();
  }

  export function rotate() {
    if (_locked()) {
      return;
    }

    _clearPiece();
    _setCurrentPiece(_current().store());
    _setCurrentPiece(_current().rotate());
    while (_isCollidesRight()) {
      _setCurrentPiece(_current().moveLeft());
      if (_isCollidesLeft()) {
        _setCurrentPiece(_current().revert());
        break;
      }
    }
    _drawPiece();
  }

  export function moveDown() {
    _update();
  }

  export function drop() {
    if (_locked()) {
      return;
    }
    while (!_isCollidesBottom()) {
      _clearPiece();
      _setCurrentPiece(_current().store());
      _setCurrentPiece(_current().moveDown());
    }
    _setCurrentPiece(_current().revert());
    _drawPiece();
  }

  export function setSound() {
    const sound = _query.raw().sound;
    _store.TetrisStore.update({
      sound: !sound,
    });
  }

  export function decreaseLevel() {
    const { initSpeed } = _query.raw();
    const newSpeed = (initSpeed - 1 < 1 ? 6 : initSpeed - 1) as Speed;
    _store.TetrisStore.update({
      initSpeed: newSpeed,
    });
  }

  export function increaseLevel() {
    const { initSpeed } = _query.raw();
    const newSpeed = (initSpeed + 1 > 6 ? 1 : initSpeed + 1) as Speed;
    _store.TetrisStore.update({
      initSpeed: newSpeed,
    });
  }

  export function increaseStartLine() {
    const { initLine } = _query.raw();
    const startLine = initLine + 1 > 10 ? 1 : initLine + 1;
    _store.TetrisStore.update({
      initLine: startLine,
    });
  }

  export function decreaseStartLine() {
    const { initLine } = _query.raw();
    const startLine = initLine - 1 < 1 ? 10 : initLine - 1;
    _store.TetrisStore.update({
      initLine: startLine,
    });
  }

  function _update() {
    if (_locked()) {
      return;
    }
    _setLocked(true);
    _setCurrentPiece(_current().revert());
    _clearPiece();
    _setCurrentPiece(_current().store());
    _setCurrentPiece(_current().moveDown());

    if (_isCollidesBottom()) {
      _setCurrentPiece(_current().revert());
      _markAsSolid();
      _drawPiece();
      _clearFullLines();
      _setCurrentPiece(_next());
      _setNext();
      if (_isGameOver()) {
        _onGameOver();
        return;
      }
    }

    _drawPiece();
    _setLocked(false);
  }

  function _clearFullLines() {
    let numberOfClearedLines = 0;
    const newMatrix = [..._matrix()];
    for (let row = MatrixUtil.Height - 1; row >= 0; row--) {
      const pos = row * MatrixUtil.Width;
      const fullRowTiles = newMatrix.slice(pos, pos + MatrixUtil.Width);
      const isFullRow = fullRowTiles.every((x) => x.isSolid);
      if (isFullRow) {
        numberOfClearedLines++;
        const topPortion = _matrix().slice(0, row * MatrixUtil.Width);
        newMatrix.splice(
          0,
          ++row * MatrixUtil.Width,
          ...MatrixUtil.EmptyRow.concat(topPortion)
        );
        _setMatrix(newMatrix);
      }
    }
    _setPointsAndSpeed(numberOfClearedLines);
  }

  function _isGameOver() {
    _setCurrentPiece(_current().store());
    _setCurrentPiece(_current().moveDown());
    if (_isCollidesBottom()) {
      return true;
    }
    _setCurrentPiece(_current().revert());
    return false;
  }

  function _onGameOver() {
    pause();
    _soundManager.gameOver();
    const { points, max, sound } = _query.raw();
    const maxPoint = Math.max(points, max);
    LocalStorageService.setMaxPoint(maxPoint);
    _store.TetrisStore.update({
      ...createInitialState(_pieceFactory),
      max: maxPoint,
      gameState: GameState.Over,
      sound,
    });
  }

  function _isCollidesBottom(): boolean {
    if (_current().bottomRow >= MatrixUtil.Height) {
      return true;
    }
    return _collides();
  }

  function _isCollidesLeft(): boolean {
    if (_current().leftCol < 0) {
      return true;
    }
    return _collides();
  }

  function _isCollidesRight(): boolean {
    if (_current().rightCol >= MatrixUtil.Width) {
      return true;
    }
    return _collides();
  }

  function _collides(): boolean {
    return _current().positionOnGrid.some((pos) => {
      if (_matrix()[pos].isSolid) {
        return true;
      }
      return false;
    });
  }

  function _drawPiece() {
    _setCurrentPiece(_current().clearStore());
    _loopThroughPiecePosition((position) => {
      const isSolid = _matrix()[position].isSolid;
      _updateMatrix(position, new FilledTile(isSolid));
    });
  }

  function _markAsSolid() {
    _loopThroughPiecePosition((position) => {
      _updateMatrix(position, new FilledTile(true));
    });
  }

  function _clearPiece() {
    _loopThroughPiecePosition((position) => {
      _updateMatrix(position, new EmptyTile());
    });
  }

  function _loopThroughPiecePosition(callback: CallBack<number>) {
    _current().positionOnGrid.forEach((position) => {
      callback(position);
    });
  }

  function _setPointsAndSpeed(numberOfClearedLines: number) {
    if (!numberOfClearedLines) {
      return;
    }
    _soundManager.clear();
    const { points, clearedLines, speed, initSpeed } = _query.raw();
    const newLines = clearedLines + numberOfClearedLines;
    const newPoints = _getPoints(numberOfClearedLines, points);
    const newSpeed = _getSpeed(newLines, initSpeed);

    _store.TetrisStore.update({
      points: newPoints,
      clearedLines: newLines,
      speed: newSpeed,
    });

    if (newSpeed !== speed) {
      _unsubscribe();
      auto(MatrixUtil.getSpeedDelay(newSpeed));
    }
  }

  function _getSpeed(totalLines: number, initSpeed: number): Speed {
    const addedSpeed = Math.floor(totalLines / MatrixUtil.Height);
    let newSpeed = (initSpeed + addedSpeed) as Speed;
    newSpeed = newSpeed > 6 ? 6 : newSpeed;
    return newSpeed;
  }

  function _getPoints(numberOfClearedLines: number, points: number): number {
    const addedPoints = MatrixUtil.Points[numberOfClearedLines - 1];
    const newPoints = points + addedPoints;
    return newPoints > MatrixUtil.MaxPoint ? MatrixUtil.MaxPoint : newPoints;
  }

  function _updateMatrix(pos: number, tile: Tile) {
    const newMatrix = [..._matrix()];
    newMatrix[pos] = tile;
    _setMatrix(newMatrix);
  }

  function _setNext() {
    _store.TetrisStore.update({
      next: _pieceFactory.getRandomPiece(),
    });
  }

  function _setCurrentPiece(piece: Piece) {
    _store.TetrisStore.update({
      current: piece,
    });
  }

  function _setMatrix(matrix: Tile[]) {
    _store.TetrisStore.update({
      matrix,
    });
  }

  function _setLocked(locked: boolean) {
    _store.TetrisStore.update({
      locked,
    });
  }

  function _unsubscribe() {
    if (_gameInterval) {
      _gameInterval.unsubscribe();
    }
  }
</script>
