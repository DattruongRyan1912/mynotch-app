# Writing a scene

Each chapter of the MyNotch tour is one file in `src/scenes/`. It also renders as a short clip of its own (`Clip-<id>`). `src/scenes/Timer.tsx` is the reference: copy its shape.

## Hard rules

- **Everything is a pure function of `useCurrentFrame()`.** This covers positions, text, counters, progress bars, typed text, level bars and karaoke.
  - Not allowed: `setTimeout`, `setInterval`, `requestAnimationFrame`, `Math.random()`, CSS `transition` or `animation`, `@keyframes`, `Date.now()`.
  - For noise use `Math.sin(frame * k)` or `random(seed)` from `remotion`.
- **A scene starts from its own initial state at frame 0.** It must look right alone and inside the tour.
- **Keep the export name, `id`, `label` and `dur` of your stub file.** The scene must end by frame `dur`.
- **Edit only your own scene file(s).** Do not touch `src/lib/`, `src/ui/`, `src/scenes/index.ts`, `Root.tsx` or `package.json`.
  - Need a small component or an icon that `Icon` does not have? Define it in your scene file (inline SVG).
  - Do not install packages.
- **Copy UI strings exactly from the app,** including Vietnamese marks and case. Your brief lists them. Don't invent labels.
  - Menu-bar labels that are English in the app stay English.
- **No real brand art.** No Apple logo, no real app icons, no emoji.
  - For another app, draw a generic rounded square in a flat colour, optionally with one letter.
  - No neon or rainbow gradients, no glow.
  - UI pieces use 4–8 pt corner radii. The notch shape and round bubbles are exempt.
- **Leave out these features:** Cloud Sync to Android, Chia cửa sổ (window layout), Màn hình khoá (lock screen), and replacing the macOS volume/brightness HUD.

## Coordinates

- Inside `<Desktop>` everything is in **points** of a 14-inch MacBook Pro screen: `SCREEN` is 1512 × 850.5. The menu bar is 37 tall.
- The hardware notch is 188 × 34, centred on x = 756.
- The collapsed notch with a live activity is 188 + 128 wide. There are 58-pt slots left and right of the camera (`leading`, `trailing`).
- The open notch is 600 wide by default (x 456 … 1056).
  - Its content box starts at y = 28.
  - `<TabBar>` takes the first 34 pt.
  - `<Page>` is inset 20 left and right and starts 40 down, so **page (0, 0) is screen (476, 68)**. With the default `contentH` of 190 the page is 136 tall. `contentH` may range from 120 to 240.
- Lay out page content with absolute positions. Then cursor targets can be computed as `PX + x, PY + y` (see `at()` in Timer.tsx).
- Camera:
  - `ON_NOTCH` (zoom 1.75, focus on the notch) is the default for notch scenes. `WIDE` shows the whole screen.
  - For a custom one, pass `{ zoom, fx, fy }`.
  - To move it, use `cameraAt(frame, [[f, CameraState], …], kf)`.
- Video pixels are 1.27 × points × zoom. The caption box covers roughly the bottom-left 1000 × 170 px of the video. Keep important things out of it.

## Toolkit

| From | What |
|---|---|
| `lib/theme` | `C` colours (`text`, `text2`, `text3`, `fill(a)`, `accent`, `green`, `mint`, `cyan`, `blue`, `orange`, `yellow`, `red`, `pink`), `FONT.ui` / `display` / `mono`, `SCREEN`, `NOTCH`, `MENU_H`, `OPEN_W` |
| `lib/time` | `kf(f, [[frame, value]…])` eased keyframes; `springSteps(f, [[frame, target]…])` notch-style spring between targets; `pop(f, start)` 0→1 spring; `step(f, [[frame, state]…])` discrete state; `prog`, `fade`, `typed(f, start, text, cps)`, `sec(s)`, `mmss(s)` |
| `ui/Desktop` | `<Desktop camera menu>` (wallpaper + menu bar + children); `<MenuBar app black extra>`; `ON_NOTCH`, `WIDE`, `cameraAt` |
| `ui/Notch` | `<Notch open live strip contentH openW glass leading trailing stripContent cx>`, open content as children; `<TabBar active badge tabs>`; `<Page>`; `<Bubble index show notchW>`; `MAIN_TABS` = clipboard, music, translate, terminal (AI), calendar, checklist (Việc cần làm), grid (Khác); `hexA(hex, a)` |
| `ui/Cursor` | `<Cursor frame moves clicks hidden>`; `Move = { f, x, y, d? }` (arrive at f after travelling d frames) |
| `ui/Kit` | `<Btn active pressed tone icon>`, `<Kbd>`, `<Window x y w h title show chrome>`, `<Captions frame label lines tag>`, `<ChapterTitle frame title sub>`, `<Bars frame color h level seed>` |
| `ui/Icons` | `<Icon name size color stroke>`; names are in `Icons.tsx` |

### Notch state

Drive `open` and `live` with `springSteps`, for example `[[0, 0], [52, 1], [160, 0]]`.

- `strip` is a height in points; spring it too.
- Pages under "Khác" use `<TabBar active={6} badge="<icon>">`.
- A toast is just the notch opening (`open` → 1) with the toast content, then closing.

## Scene structure

1. **`T` constants** for each beat's frame. The first action comes after the chapter title, at about frame 40.
2. **Layout constants and cursor targets.**
3. **State as functions of `f`.**
4. **JSX in this order:** `<Desktop>` (notch, windows and cursor as children), then `<Captions>`, then `{title && <ChapterTitle …/>}`.

### Captions

- 2–5 lines, each on screen for at least 60 frames. Leave a gap of a few frames between lines.
- Each line is under about 55 characters, in plain Vietnamese, saying what is happening. Put shortcuts in `keys`.

## Checking your scene

Typecheck from `video/`:

```bash
./node_modules/.bin/tsc --noEmit
```

Render a few stills and look at them:

```bash
./node_modules/.bin/remotion still src/index.ts Clip-ID out/stills/ID-120.jpg --frame=120 --scale=0.5
```

- When several people or agents work on one machine, render one at a time behind a lock, so only one headless Chrome runs: `lockf -k out/.render.lock <command>` on macOS, `flock out/.render.lock <command>` on Linux.
- Leave full renders to the **Video** workflow on GitHub Actions.
- `out/` is ignored by git; clear your stills when you are done.
