# Svelte Tetris

A childhood memory Tetris game built with Svelte and Akita.

<details>
  <summary>Table Of Content</summary>
  <p>

- [Angular Tetris](#angular-tetris)
  - [Working Game](#working-game)
  - [Support](#support)
  - [Why?](#why)
  - [Who is this for?](#who-is-this-for)
  - [How to play](#how-to-play)
    - [Before playing](#before-playing)
    - [Playing game](#playing-game)
  - [Techstack](#techstack)
  - [Development Challenge](#development-challenge)
    - [Tetris Core](#tetris-core)
    - [Akita state management + dev tool support](#akita-state-management--dev-tool-support)
    - [Customizing Piece](#customizing-piece)
    - [Animation](#animation)
    - [Web Audio API](#web-audio-api)
    - [Keyboard handling](#keyboard-handling)
  - [Features and Roadmap](#features-and-roadmap)
    - [Phase 1 - Angular Tetris basic functionality](#phase-1---angular-tetris-basic-functionality)
    - [Phase 2 - Firebase high score, service worker, more sounds effect, more animation](#phase-2---firebase-high-score-service-worker-more-sounds-effect-more-animation)
  - [Time spending](#time-spending)
  - [Setting up development environment 🛠](#setting-up-development-environment-)
  - [Author: Trung Vo ✍️](#author-trung-vo-️)
  - [Credits and references](#credits-and-references)
  - [Contributing](#contributing)
  - [License](#license)
  </p>
  </details>

## Working Game

Check out the **working game** -> https://tetris.trungk18.com

The game has sounds, wear your 🎧 or turn on your 🔊 for a better experience.

![A childhood memory Tetris game built with Angular 10 and Akita][demo]

![A childhood memory Tetris game built with Angular 10 and Akita][iphonex]

## Support

If you like my work, feel free to:
- ⭐ this repository. And we will be happy together :)
- <a title="Thanks for your support!" href="https://www.buymeacoffee.com/binhannguyen" target="_blank"><img src="https://res.cloudinary.com/dvujyxh7e/image/upload/c_thumb,w_140,g_face/v1596378474/default-orange_uthxgz.jpg" alt="Buy Me A Coffee"></a>

Thanks for supporting me!

## Why?

Tetris game was the first gaming machine I had as a child, it cost about 1$ at that time.

My Tetris was exactly in the same yellow color and it was so big, running on 2 AA battery. It is how it looks.

![Retro Tetris][tetris]

After i saw the [Tetris game built with Angular][angular] by trungk18, [Tetris game built with Vue][vue] by his wife. I came up with an idea why I didn't build the same <u>Tetris with Svelte</u>? And here you go.
## Who is this for?

I built this game dedicated to:

- For anyone that grew up with Tetris as a part of your memory. It was my childhood memory and I hope you enjoy the game as well.
- For the Svelte developer community, I have never really seen a game that built with Svelte and that's my answer. Using Akita as the underlying state management helps me to see all of the data flow, it is great for debugging. I wanted to see more Svelte game from you guys 💪💪💪

## How to play

### Before playing

- You can use both keyboard and mouse to play. But prefer to use <u>keyboard</u>
- Press arrow left and right to change the speed of the game. The higher the number, the faster the piece will fall
- Press arrow up and down to change how many of lines have been filled before starting the game
- Press `Space` to start the game
- Press `P` for pause/resume game
- Press `R` for resetting the game
- Press `S` for the turn on/off the sounds

### Playing game

- Press `Space` make the piece drop quickly
- Press `Arrow left` and `right` for moving left and right
- Press `Arrow up` to rotate the piece
- Press `Arrow down` to move a piece faster
- When clearing lines, you will receive a point - 100 points for 1 line, 300 points for 2 lines, 700 points for 3 lines, 1500 points for 4 lines
- The drop speed of the pieces increases with the number of rows eliminated (one level up for every 20 lines cleared)

## Techstack

I built it barely with Svelte and Akita, no additional UI framework/library was required.

![Svelte Tetris][techstack]

## Development Challenge

I got the inspiration from the same but different [Tetris game built with Vue][vue]. To not reinvented the wheel, I started to look at Vue code and thought it would be very identical to Angular. But later on, I realized a few catches:

- The Vue source code was written a few years ago with pure JS. I could find several problems that the compiler didn't tell you. Such as giving `parseInt` a number. It is still working though, but I don't like it.
- There was extensive use of `setTimeout` and `setInterval` for making animations. I rewrote all of the animation logic using RxJS. You will see the detail below.
- The brain of the game also used `setTimeout` for the game loop. It was not a problem, but I was having a <u>hard time</u> understanding the code on some essential elements: how to render the piece to the UI, how the calculation makes sense with XY axis. In the end, I changed all of the logic to a proper functional way using TypeScript, based on [@angular-tetris][angular].

### Tetris Core

It is the most important part of the game. As I am following the Vue and Angular source code, It is getting harder to understand what was the developer's intention. The Vue version inspired me but I think I have to write the core Tetris differently.

Take a look at the two blocks of code below which do the same rendering piece on the screen and you will understand what I am talking about. The left side was rewritten with Svelte and TypeScript and the right side was the JS version.

I always think that your code must be written as you talk to people, without explaining a word. Otherwise, when someone comes in and reads your code and maintains it, they will be struggling.

> “ Code is like humor. When you have to explain it, it’s bad.” – Cory House

And let me emphasize it again, I didn't write the brain of the game from scratch. I adapted the well-written source by [@angular-tetris][angular] for Tetris core. I did refactor some parts to support Akita and wrote some new functionality as well.

### Akita state management + dev tool support

Although you don't dispatch any action, Akita will still do it undo the hood as the Update action. And you still can see the data with [Redux DevTools][redux-devtool]. Remember to put that option into your `main.ts`

```ts
import { akitaDevtools, persistState } from '@datorama/akita';
akitaDevtools();
persistState();
```

I turn it on all the time on [tetris.trungk18.com][angular-tetris], you can open the DevTools and start seeing the data flow.

![Angular Tetris][akita-devtool]

> Note: opening the DevTools could reduce the performance of the game significantly. I recommended you turn it off when you want to archive a high score 🤓

### Customizing Piece

I still keep a base [Piece class][piece-class] in [@angular-tetris][angular] for a piece. And for each type of piece, it will extend from the same base class to inherit the same capability

[piece-class]: src/interfaces/piece/piece.svelte

```ts
export class Piece {
  x: number;
  y: number;
  rotation = PieceRotation.Deg0;
  type: PieceTypes;
  shape: Shape;
  next: Shape;

  private _shapes: Shapes;
  private _lastConfig: Partial<Piece>;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  store(): Piece {
    this._lastConfig = {
      x: this.x,
      y: this.y,
      rotation: this.rotation,
      shape: this.shape,
    };
    return this._newPiece();
  }

  //code removed for brevity
}
```

For example, I have a piece L. I create a new class name [PieceL][piecel]. I will contain the shape of L in four different rotation so that I don't have to mess up with the math to do minus plus on the XY axis. And I think defining in that way makes the code self-express better. If you see 1, it means on the matrix it will be filled, 0 mean empty tile.

If my team member needs to maintain the code, I hope he will understand what I was trying to write immediately. Or maybe not 🤣

One import property of the Piece is the `next` property to display the piece shape on the decoration box for the upcoming piece.

[piecel]: src/interfaces/piece/L.svelte

```ts
const ShapesL: Shapes = [];
ShapesL[PieceRotation.Deg0] = [
  [0, 0, 0, 0],
  [1, 0, 0, 0],
  [1, 0, 0, 0],
  [1, 1, 0, 0],
];

ShapesL[PieceRotation.Deg90] = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [1, 1, 1, 0],
  [1, 0, 0, 0],
];
//code removed for brevity

export class PieceL extends Piece {
  constructor(x: number, y: number) {
    super(x, y);
    this.type = PieceTypes.L;
    this.next = [
      [0, 0, 1, 0],
      [1, 1, 1, 0],
    ];
    this.setShapes(ShapesL);
  }
}
```

Now is the interesting part, you create a custom piece by yourself. Simply create a new class that extends from `Piece` with different rotations.

For instance, I will define a new piece call F with class name [`PieceF`]. That is how it should look like.

```ts
const ShapesF: Shapes = [];
ShapesF[PieceRotation.Deg0] = [
  [1, 0, 0, 0],
  [1, 1, 0, 0],
  [1, 0, 0, 0],
  [1, 1, 0, 0],
];

export class PieceF extends Piece {
  constructor(x, y) {
    super(x, y);
    this.type = PieceTypes.F;
    this.next = [
      [1, 0, 1, 0],
      [1, 1, 1, 1],
    ];
    this.setShapes(ShapesF);
  }
}
```

And the last step, go to [PieceFactory][piecefactory] to add the new PieceF into the available pieces.

[piecefactory]: src/factory/piece-factory.svelte

```ts
export class PieceFactory {
  private _available: typeof Piece[] = [];

  constructor() {
    //code removed for brevity
    this._available.push(PieceF);
  }
}
```

And you're all set, this is the result. See how easy it is to understand the code and add a custom piece that you like.

### Animation

I rewrote the animation with RxJS. See the comparison below for the simple dinosaurs running animation at the beginning of the game.

You could do a lot of stuff if you know RxJS well enough :) I think I need to strengthen my RxJS knowledge soon enough as well. Super powerful.

### Web Audio API

There are many sound effects in the game such as when you press space, or left, right. In reality, all of the sounds were a reference to a single file [assets/tetris-sound.mp3][sounds].

I don't have much experience working with audio before but the Web Audio API looks very promising. You could do more with it.

- See the [official documentation][webaudio]
- See how I load the mp3 file and store it in [sound-manager.service.ts][sound-manager]
- [Writing Web Audio API code that works in every browser][web_audio_api_cross_browser]

### Keyboard handling

I decided to use `svelte:window` instead. A simple implementation could look like:

```svelte
    <svelte:window on:keydown={handleKeyboardDown} on:keyup={handleKeyboardUp} />
```

See more at [containers/svelte-tetris/svelte-tetris.svelte][hotkeys-implementation]

## Setting up development environment 🛠

- `git clone https://github.com/nguyenbinhanltv/svelte-tetris.git`
- `cd svelte-tetris`
- `npm i`
- `npm run dev`
- The app should run on `http://localhost:5000/`

## Author: Nguyen Binh An ✍️

- A young and passionate front-end engineer. Working with JavaScript and TypeScript. Like photography, running, cooking, and reading books.

## Credits and references

| Resource                                      | Description                                                                                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [@Binaryify/vue-tetris][vue]                  | Vue Tetris, I reused part of HTML, CSS and static assets from that project                                                        |
| [@chrum/ngx-tetris][ngx-tetris]               | A comprehensive core Tetris written with Angular, I reused part of that for the brain of the game.                                |
| [@trungk18/angular-tetris][angular] | Power of Akita state management with Angular to making crazy tetris game |
| [Super Rotation System][srs]                  | A standard for how the piece behaves. I didn't follow everything but it is good to know as wells                                  |

## Contributing

If you have any ideas, just [open an issue][issues] and tell me what you think.

If you'd like to contribute, please fork the repository and make changes as you'd like. [Pull requests][pull] are warmly welcome.

## License

Feel free to use my code on your project. It would be great if you put a reference to this repository.

[MIT](https://opensource.org/licenses/MIT)

[issues]: https://github.com/nguyenbinhanltv/svelte-tetris/issues/new/choose
[pull]: https://github.com/nguyenbinhanltv/svelte-tetris/pulls
[angular-tetris]: https://tetris.trungk18.com
[srs]: https://tetris.fandom.com/wiki/SRS
[vue]: https://github.com/Binaryify/vue-tetris
[angular]: https://github.com/trungk18/angular-tetris
[tetris]: public/assets/readme/retro-tetris.jpg
[demo]: public/assets/readme/angular-tetris-demo.gif
[iphonex]: public/assets/readme/angular-tetris-iphonex.gif
[ngx-tetris]: https://github.com/chrum/ngx-tetris
[techstack]: public/assets/readme/tech-stack.png
[akita-devtool]: public/assets/readme/akita-devtool.gif
[sounds]: public/assets/tetris-sound.mp3
[sound-manager]: src/services/sound-manager.service.svelte
[webaudio]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
[redux-devtool]: https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en
[web_audio_api_cross_browser]: https://developer.mozilla.org/en-US/docs/Web/Guide/Audio_and_video_delivery/Web_Audio_API_cross_browser
