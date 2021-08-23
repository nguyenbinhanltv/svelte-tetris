<script lang="ts" context="module">
  import {
    TetrisQuery as _query,
    isEnableSound,
  } from "../state/tetris/tetris.query.svelte";

  const SOUND_FILE_PATH = "/svelte-tetris/assets/tetris-sound.mp3";
  let _context: AudioContext;
  let _buffer: AudioBuffer;

  export function start() {
    _playMusic(0, 3.7202, 3.6224);
  }

  export function clear() {
    _playMusic(0, 0, 0.7675);
  }

  export function fall() {
    _playMusic(0, 1.2558, 0.3546);
  }

  export function gameOver() {
    _playMusic(0, 8.1276, 1.1437);
  }

  export function rotate() {
    _playMusic(0, 2.2471, 0.0807);
  }

  export function move() {
    _playMusic(0, 2.9088, 0.1437);
  }

  export function _playMusic(when: number, offset: number, duration: number) {
    if (!isEnableSound()) {
      return;
    }
    _loadSound().then((source) => {
      if (source) {
        source.start(when, offset, duration);
      }
    });
  }

  export function _loadSound(): Promise<AudioBufferSourceNode> {
    return new Promise((resolve, reject) => {
      if (_context && _buffer) {
        resolve(_getSource(_context, _buffer));
        return;
      }
      const context = new AudioContext();
      const req = new XMLHttpRequest();
      req.open("GET", SOUND_FILE_PATH, true);
      req.responseType = "arraybuffer";

      req.onload = () => {
        context.decodeAudioData(
          req.response,
          (buffer) => {
            _context = context;
            _buffer = buffer;
            resolve(_getSource(context, buffer));
          },
          () => {
            const msg =
              "Sorry, cannot play sound. But I hope you still enjoy Svelte Tetris!!!";
            alert(msg);
            reject(msg);
          }
        );
      };
      req.send();
    });
  }

  export function _getSource(
    context: AudioContext,
    buffer: AudioBuffer
  ): AudioBufferSourceNode {
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    return source;
  }
</script>
