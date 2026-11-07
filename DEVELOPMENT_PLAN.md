# BYD "Rebuild the BYD" Puzzle Kiosk – Development Plan

> **For Claude Code.** This file is the complete specification. Read it fully, together with `AGENTS.md`, before writing code. There are no review stages: build the whole app in the **build order** in section 16, run lint, tests and build after each step, and commit after each step. Ask before adding any dependency that is not listed in section 3.

---

## 1. What we are building

A portrait touch-screen kiosk game for a BYD Sri Lanka showroom event.

1. A visitor enters their **name** and **phone number** (exactly 10 digits).
2. Each phone number can play **once**. A repeated number gets a funny message.
3. The game shows a **random BYD car** (1 of 9) as a **4×4 picture puzzle** (16 tiles). There is no empty space: the player **swaps a tile with its neighbour** (up, down, left or right) to rebuild the car.
4. Every game uses a **random scramble** from a pool of 500. Every scramble has a shortest solution of **exactly 16 swaps**, so all players get the same difficulty but never the same layout. People watching earlier players can't copy them.
5. **120-second** time limit. A move counter shows how many swaps the player has made.
6. **Results:**
   - Solved in 16 moves (the best possible): a special **PERFECT** winner popup.
   - Solved in more moves: a **completed** popup with moves and time.
   - Time runs out: a friendly **time's up** popup.
   - Tapping **OK** returns to registration for the next player.
7. **No gift logic in the app.** Staff look at the moves on screen and decide the gift themselves.
8. Every game is saved to **Firebase Firestore**. A **staff dashboard** (login) lists all players and results and exports them to CSV.
9. The game must keep working **offline** if the hall internet drops, and sync when it returns.
10. Audience: kids, young people and adults. All text must be short, fun and easy to understand.

### The 9 car models

Only the model names are used. **Do not mention or hard-code car colours anywhere.** Car images may change.

| slug | Display name |
|---|---|
| `racco` | BYD Racco |
| `atto-1` | BYD Atto 1 |
| `atto-2` | BYD Atto 2 |
| `dolphin` | BYD Dolphin |
| `sealion-5` | BYD Sealion 5 |
| `sealion-6` | BYD Sealion 6 |
| `shark-6` | BYD Shark 6 |
| `sealion-8` | BYD Sealion 8 |
| `atto-3` | BYD Atto 3 |

### Screen

A portrait kiosk display. The exact resolution is **not confirmed yet**, so assume **9:16 (1080×1920, Instagram-story size)**, but the layout must be **fluid** and look right on any portrait screen (see section 7.3).

## 3. Tech stack and dependencies

| Area | Choice |
|---|---|
| Framework | Next.js 16, App Router, TypeScript (strict), Turbopack (default) |
| Styling | Tailwind CSS v4 (tokens in `app/globals.css` with `@theme`) |
| Animation | `motion` (Motion for React, import from `motion/react`) + CSS keyframes |
| Effects | `canvas-confetti` (win celebration) |
| Database / auth | `firebase` (Firestore with offline cache, Anonymous Auth for the kiosk, Email/Password Auth for staff) |
| Fonts | `next/font/google`: **Orbitron** (display, numbers) and **Sora** (body). Self-hosted at build, so they work offline. |
| Images | One square WebP per car in `public/cars/`. Tiles are cut **in CSS**, never pre-sliced. |
| Image conversion | `sharp` (dev dependency) |
| Tests | `vitest` (dev dependency) |
| Offline | Hand-written service worker `public/sw.js` (no `next-pwa` / Serwist: they rely on webpack) |
| Hosting | Vercel |

Install:

```bash
npm install firebase motion canvas-confetti
npm install -D sharp vitest @types/canvas-confetti
```

`package.json` scripts to add:

```json
{
  "scripts": {
    "test": "vitest run",
    "scrambles": "node scripts/generate-scrambles.mjs --count 500 --optimal 16 --min-misplaced 13 --seed 2026 --out data/scrambles.json",
    "scrambles:verify": "node scripts/generate-scrambles.mjs --verify data/scrambles.json",
    "images": "node scripts/convert-car-images.mjs"
  }
}
```

### Next.js 16 notes

- Route `params` / `searchParams` are Promises: `await` them.
- `middleware.ts` is now `proxy.ts` (not needed in this project).
- Cache Components is **off** in this project. Do not enable it.
- Server Components by default; `"use client"` only where needed. The kiosk flow itself is a client component tree.

---

## 4. Folder and file structure

Follow this structure. Small helper files may be added where needed, but keep the same grouping.

```
byd-puzzle-kiosk/
├─ app/
│  ├─ layout.tsx                 # fonts, metadata, viewport, ServiceWorkerRegister, KioskGuards
│  ├─ page.tsx                   # renders <KioskApp /> – the whole kiosk flow on one route
│  ├─ globals.css                # Tailwind v4 @theme tokens, base styles, kiosk CSS, keyframes
│  ├─ manifest.ts                # PWA manifest (portrait, fullscreen)
│  ├─ not-found.tsx
│  └─ staff/
│     └─ page.tsx                # staff dashboard (login gate + results + CSV export)
├─ components/
│  ├─ kiosk/
│  │  ├─ KioskApp.tsx            # screen state machine (section 6)
│  │  ├─ KioskShell.tsx          # portrait frame, background effects, hidden status trigger
│  │  ├─ StartScreen.tsx
│  │  ├─ RegisterScreen.tsx
│  │  ├─ RevealScreen.tsx
│  │  └─ GameScreen.tsx
│  ├─ puzzle/
│  │  ├─ PuzzleBoard.tsx         # 4×4 board, positions, swap animation, input handling
│  │  ├─ PuzzleTile.tsx          # one tile (CSS background slice of the car image)
│  │  └─ DemoBoard.tsx           # self-playing board for the start screen
│  ├─ hud/
│  │  ├─ TargetCard.tsx          # model name + completed car image (press & hold to enlarge)
│  │  ├─ TimerBar.tsx
│  │  ├─ MoveCounter.tsx
│  │  └─ HintBar.tsx
│  ├─ keyboard/
│  │  ├─ LetterKeyboard.tsx
│  │  ├─ NumberPad.tsx
│  │  └─ KeyButton.tsx
│  ├─ modals/
│  │  ├─ ModalShell.tsx
│  │  ├─ PerfectModal.tsx
│  │  ├─ CompletedModal.tsx
│  │  ├─ TimeUpModal.tsx
│  │  └─ DuplicateModal.tsx
│  ├─ effects/
│  │  ├─ BackgroundFx.tsx        # hexagon grid + drifting gold particles
│  │  ├─ GoldConfetti.tsx
│  │  └─ LightSweep.tsx
│  ├─ ui/
│  │  ├─ GoldButton.tsx
│  │  ├─ GlassPanel.tsx
│  │  ├─ TextField.tsx           # display-only field driven by the on-screen keyboard
│  │  ├─ StatChip.tsx
│  │  └─ BrandLogo.tsx
│  ├─ staff/
│  │  ├─ StaffLogin.tsx
│  │  ├─ StatsSummary.tsx
│  │  ├─ ResultsTable.tsx
│  │  └─ ExportCsvButton.tsx
│  └─ system/
│     ├─ ServiceWorkerRegister.tsx
│     ├─ KioskGuards.tsx         # wake lock, no context menu / zoom / selection
│     └─ StatusPanel.tsx         # hidden diagnostics panel
├─ config/
│  ├─ game.ts                    # all timings and rules in one place (section 5)
│  └─ cars.ts                    # the 9 models: slug, name, image path
├─ content/
│  └─ messages.ts                # all on-screen text (section 8.7)
├─ data/
│  └─ scrambles.json             # generated pool of 500 scrambles
├─ hooks/
│  ├─ useCountdown.ts
│  ├─ useIdleTimeout.ts
│  ├─ useSwipe.ts
│  ├─ useWakeLock.ts
│  └─ useOnlineStatus.ts
├─ lib/
│  ├─ firebase/
│  │  ├─ config.ts               # reads env vars, exports isFirebaseConfigured
│  │  └─ client.ts               # app, auth, Firestore with persistent offline cache
│  ├─ players/
│  │  ├─ repository.ts           # PlayerRepository interface + factory
│  │  ├─ firestoreRepository.ts
│  │  └─ localRepository.ts      # used when Firebase is not configured
│  ├─ puzzle/
│  │  ├─ board.ts                # pure puzzle logic
│  │  ├─ picker.ts               # car shuffle bag + scramble picker
│  │  └─ tileStyle.ts            # background-position maths
│  ├─ utils/
│  │  ├─ phone.ts
│  │  ├─ csv.ts
│  │  ├─ format.ts               # mm:ss, dates in Asia/Colombo
│  │  ├─ safeStorage.ts          # localStorage wrapped in try/catch
│  │  └─ withTimeout.ts
│  └─ types.ts
├─ public/
│  ├─ cars/                      # {slug}.webp (generated) + placeholder.svg
│  ├─ brand/                     # byd-logo.svg (simple placeholder until supplied)
│  ├─ icons/                     # PWA icons: 192, 512, 512 maskable
│  └─ sw.js                      # service worker (section 12)
├─ scripts/
│  ├─ generate-scrambles.mjs     # Appendix A (tested)
│  └─ convert-car-images.mjs     # PNG/JPG → WebP with sharp
├─ assets-src/
│  └─ cars/                      # original images: {slug}-puzzle.png
├─ tests/
│  ├─ board.test.ts
│  ├─ scrambles.test.ts
│  ├─ phone.test.ts
│  └─ csv.test.ts
├─ firestore.rules               # Appendix B
├─ .env.example
├─ AGENTS.md
└─ DEVELOPMENT_PLAN.md
```

Naming rules: PascalCase for components (one component per file), camelCase for hooks and utilities, hooks start with `use`. No vague names like `utils2`, `temp`, `newComponent`.

---

## 5. Game configuration (`config/game.ts`)

Every tunable value lives here. No magic numbers in components.

| Key | Default | Meaning |
|---|---|---|
| `gameTitle` | `"Rebuild the BYD"` | Main title |
| `gridSize` | `4` | 4×4 board |
| `timeLimitSeconds` | `120` | Time limit |
| `optimalMoves` | read from `data/scrambles.json` (`16`) | Best possible score; equal moves = PERFECT |
| `lowTimeWarningSeconds` | `15` | Timer starts pulsing |
| `revealCountdownSeconds` | `3` | 3-2-1 before play |
| `highlightCorrectTiles` | `true` | Gold edge on tiles already in the right place |
| `registerIdleSeconds` | `60` | No touch on registration: clear form, go to start screen |
| `resultIdleSeconds` | `60` | No touch on a result popup: go to start screen |
| `recentScrambleMemory` | `100` | Don't reuse any of the last 100 scrambles |
| `swipeThresholdRatio` | `0.18` | Swipe distance as a fraction of tile size |
| `swapDurationMs` | `200` | Tile swap animation |
| `nameMaxLength` | `30` | Name length limit |
| `soundEnabled` | `false` | Optional short UI tones (Web Audio, no files) |

`config/cars.ts`:

```ts
export interface Car {
  slug: string;
  name: string;        // e.g. "BYD Atto 3"
  image: string;       // e.g. "/cars/atto-3.webp"
}
export const CARS: Car[] = [/* the 9 models from section 1 */];
```

---

## 6. App flow (state machine in `KioskApp.tsx`)

One route (`/`) runs the whole kiosk flow with a typed state machine (`useReducer`). No page navigations during play.

```
START ──tap──▶ REGISTER ──valid & new number──▶ REVEAL ──3-2-1 + shuffle──▶ PLAYING
  ▲               │  ▲                                                       │
  │               │  └──OK── DUPLICATE popup ◀──number already played        │
  │               │                                                          ├─ solved in 16 moves ─▶ PERFECT popup
  │◀─idle 60 s────┘                                                          ├─ solved in >16 ──────▶ COMPLETED popup
  │                                                                          └─ time up ─▶ tiles auto-solve ─▶ TIME UP popup
  │                                                                                         │
  │◀──────────── result popup idle 60 s ───────────────── OK on any result popup ──▶ REGISTER (empty form)
```

Rules:

- Car and scramble are picked **when the player is registered** (before REVEAL), and saved with the player record.
- The timer starts on "GO!", after the shuffle animation, never during it.
- Input is locked during REVEAL, swap animations, the win/time-up sequences and popups.
- After OK, the form is empty and the next player starts fresh.

---

## 7. Design system

### 7.1 Look and feel

**Futuristic luxury: black, dark graphite greys and metallic gold.** It should feel premium (like a BYD dashboard) and playful enough for kids. Strong contrast, big shapes, generous spacing, smooth motion. Gold is used for what matters: titles, the active field, primary buttons, the timer, correct tiles and celebrations.

### 7.2 Tokens (`app/globals.css`)

```css
@import "tailwindcss";

@theme {
  --color-ink: #0A0A0B;          /* page background */
  --color-graphite-900: #111214;
  --color-graphite-800: #16171A; /* panels */
  --color-graphite-700: #1E2024; /* raised panels, keys */
  --color-graphite-600: #24262B; /* tiles backing, inputs */
  --color-graphite-500: #3A3D44; /* borders */
  --color-mist: #A8ABB2;         /* secondary text */
  --color-ivory: #F4F1EA;        /* main text */
  --color-gold-300: #F3DC9A;
  --color-gold-400: #E8C875;
  --color-gold-500: #C9A24A;
  --color-gold-600: #9C7A2E;
  --font-display: var(--font-orbitron);
  --font-body: var(--font-sora);
}
```

- **Gold gradient** (titles, primary buttons, frames): `linear-gradient(135deg, #9C7A2E 0%, #C9A24A 30%, #F3DC9A 50%, #C9A24A 70%, #9C7A2E 100%)`. Gradient text uses `background-clip: text`.
- **Gold glow:** `0 0 24px rgba(232,200,117,.35)`, stronger `0 0 48px rgba(232,200,117,.5)` for celebrations.
- **Glass panel:** `rgba(22,23,26,.72)` background, `backdrop-filter: blur(12px)` (max 16px), 1px border `rgba(232,200,117,.22)`, radius 28px, inner highlight `inset 0 1px 0 rgba(255,255,255,.06)`.
- **No car colours anywhere in the UI.**

### 7.3 Portrait layout (exact screen size unknown)

- Design reference: **1080×1920 (9:16)**. Must also look right at **1080×2340**, **1200×1920** and **768×1366**. Check all four in DevTools.
- The app root is a **portrait column**: `width: min(100vw, 56.25dvh)`, `height: 100dvh`, centred. On a landscape screen (developer laptop) it shows as a centred 9:16 column with black sides.
- Use flex layout with proportional heights, not fixed pixel positions. Size text and controls with `clamp()` based on the column width (e.g. CSS container query units `cqw` on the root column).
- **The puzzle board is always square:** `size = min(92% of column width, 52% of column height)`.
- Minimum touch target **72×72 px** (kids); keyboard keys at least 88 px tall at 1080 width.
- Minimum text size about **28 px** at 1080 width; titles 80–110 px.

### 7.4 Typography

- **Orbitron** (display): titles, model name, timer, move counter, popup headings. Uppercase, letter-spacing 0.04–0.08em.
- **Sora** (body): everything else. Weights 400/600/700 only.
- Numbers (timer, moves) use tabular figures so they don't jump.

### 7.5 Motion and effects

- **Background (`BackgroundFx`):** a faint hexagon grid (a nod to battery cells) in gold at 4–6% opacity, slowly drifting, plus about 40 tiny gold particles floating upward on a canvas at max 30 fps. Pause when the tab is hidden. Lighter during PLAYING (fewer particles).
- **Light sweep (`LightSweep`):** a diagonal shine passing across gold buttons and frames every 4–6 s.
- **Buttons:** pressed state on `pointerdown`: scale 0.96, stronger glow. Primary buttons breathe gently (glow pulse every 2.5 s) on the start screen.
- **Screen transitions:** fade + slight rise (250–350 ms). Nothing bouncy except celebration moments.
- Animate only `transform` and `opacity` (and filter for glows sparingly). Respect `prefers-reduced-motion`.

### 7.6 Reusable components

- `GoldButton`: gold gradient fill, dark text (Orbitron), radius 999px, min height 96 px, light sweep, disabled state in graphite with mist text.
- `GlassPanel`: as in 7.2.
- `TextField`: display-only (no native input, no device keyboard). Large label, value in 44–52 px text, blinking gold caret, active state with gold border and glow, error state with a short shake and message under the field.
- `StatChip`: label (small, mist) + big value (Orbitron, ivory or gold).
- `BrandLogo`: `/brand/byd-logo.svg`. Use a simple text placeholder until the real logo is supplied.

---

## 8. Screens

### 8.1 Start screen (`StartScreen`)

Purpose: attract people walking by.

Layout top to bottom:
1. `BrandLogo` (small, top centre).
2. Title **"REBUILD THE BYD"** in huge gold gradient text with a light sweep; subtitle *"Swap the tiles. Rebuild the car. Beat the clock!"*
3. **`DemoBoard`:** a live 4×4 board showing a random car that scrambles and then rebuilds itself on a loop (tiles flying to their places, then a gold flash on completion). Changes car each loop.
4. **How to play:** three icon steps in a row: ① *Swipe a tile* (hand icon) ② *Rebuild the car* (puzzle icon) ③ *Beat 2 minutes* (stopwatch icon).
5. Big pulsing **"TAP TO PLAY"** button. Tapping anywhere on the screen also starts.

### 8.2 Registration screen (`RegisterScreen`)

Layout:
1. Small logo + heading **"Let's get you on the grid!"**
2. Glass panel with two `TextField`s:
   - **Your name** (letters keyboard)
   - **Phone number** (number pad); show as `071 234 5678` while storing 10 digits.
3. Big **"START GAME"** `GoldButton`, enabled only when both fields are valid.
4. **On-screen keyboard** in the bottom ~40% of the screen. It switches automatically:
   - `LetterKeyboard`: QWERTY rows A–Z, a wide **SPACE**, **⌫**, and **NEXT →** (moves to the phone field).
   - `NumberPad`: 3×4 grid 1–9, **CLEAR**, 0, **⌫**; huge keys.
   - Tapping a field selects it and shows its keyboard. Phone input stops at 10 digits.
   - Each key press: quick gold flash + scale 0.95.

Validation:
- **Name:** required after trimming, max 30 characters. Store with normal capitalisation (e.g. "Kasun Perera").
- **Phone:** exactly 10 digits (`/^\d{10}$/`). No other rules.

On START:
1. Check whether the number has played (section 10). Show a small gold spinner on the button for at most 3 s.
2. If played: `DuplicateModal`.
3. If new: pick car and scramble, register the player, go to REVEAL.

### 8.3 Reveal screen (`RevealScreen`)

1. *"Your car is…"* then the **model name** slides in large with a light sweep (e.g. **BYD ATTO 3**).
2. The **full car image** in a gold frame, big, with a big **3 · 2 · 1** countdown over it.
3. The image splits into 16 tiles (gaps appear), the tiles fly into the scrambled layout (about 1 s), then **"GO!"** flashes and play starts.

### 8.4 Game screen (`GameScreen`)

Layout top to bottom (proportions of the column height, approximately):

| Area | Height | Content |
|---|---|---|
| Header | 6% | Small logo left; *"REBUILD THE BYD"* small, right |
| **Target card** | 18% | Glass panel. Left: label *"YOUR CAR"*, **model name** big in gold gradient (Orbitron), small text *"Match this picture"*. Right: the **completed car image** (square, gold frame). **Press and hold** the image to see it large over the board (released = hidden). |
| Stats | 9% | `StatChip` **TIME** (`1:58`), `StatChip` **MOVES** (big), small chip **BEST: 16** |
| Timer bar | 2% | Full-width gold bar shrinking over 120 s. In the last 15 s it pulses and brightens. |
| **Board** | 55% | The square 4×4 `PuzzleBoard`, centred |
| Hint | 6% | Animated hand icon + *"Swipe a tile to swap it with its neighbour"*; after 10 s it rotates short tips (*"Tip: gold edges mean the tile is in the right place!"*) |

The model name and the completed image stay visible the whole game.

### 8.5 Result popups (`modals/`)

All popups use `ModalShell`: dark blurred backdrop, a centred glass panel at about 86% of the column width, big icon or illustration at the top, title in Orbitron gold gradient, short body text, large stat chips, and one full-width **OK** `GoldButton`. Enter animation: fade + scale 0.94 → 1 (300 ms).

Moves and time must be **very large and readable from 2–3 metres**, since staff read them to decide gifts.

**Win sequence (before the popup):** input locks, tile gaps close and corners square off so the tiles merge into one picture (400 ms), a gold light sweep crosses the image, the frame glows, then the popup appears.

- **`PerfectModal`** (moves === 16): gold confetti bursts from both sides, a trophy icon scales in with a shine, the title **"PERFECT DRIVE!"** in a stamp animation, chips **MOVES 16** and **TIME 1:12**, text *"16 moves – the best score possible! You're a true BYD master!"*. Repeat a smaller confetti burst every few seconds while open.
- **`CompletedModal`**: one confetti burst, title **"YOU DID IT!"**, chips **MOVES** and **TIME**, text *"Car rebuilt! Great driving!"*, plus a small line *"Best possible: 16 moves"*.
- **`TimeUpModal`**: first the tiles slide into the correct places so the player still sees the full car, then the title **"TIME'S UP!"** with a stopwatch icon, text *"So close – the BYD was almost ready! Thanks for playing!"*, and the moves chip.
- **`DuplicateModal`**: playful icon (car with a wink), one of the random duplicate messages (8.7), OK returns to an empty registration form.

### 8.6 Hidden status panel (`StatusPanel`)

Tap the top-left logo **5 times within 3 s** on the start or registration screen. Shows: online/offline, **offline-ready** (all required files cached: yes/no), Firebase configured yes/no, kiosk signed in yes/no, pending (unsynced) writes count, kiosk ID, app version. Buttons: **Close**, **Reload app**. No personal data.

### 8.7 On-screen text (`content/messages.ts`)

All text lives here so it can be edited in one place. Keep it short and friendly. Use designed icons or SVG illustrations rather than emoji, since emoji rendering differs between devices.

```ts
export const messages = {
  start: {
    title: "Rebuild the BYD",
    subtitle: "Swap the tiles. Rebuild the car. Beat the clock!",
    steps: ["Swipe a tile", "Rebuild the car", "Beat 2 minutes"],
    cta: "Tap to play",
  },
  register: {
    heading: "Let's get you on the grid!",
    nameLabel: "Your name",
    phoneLabel: "Phone number",
    start: "Start game",
    errors: {
      nameRequired: "Please type your name to start!",
      phoneLength: "Phone numbers need 10 digits. Please check yours!",
    },
  },
  reveal: { intro: "Your car is…", go: "GO!" },
  game: {
    targetLabel: "Your car",
    targetHint: "Match this picture",
    hint: "Swipe a tile to swap it with its neighbour",
    tips: [
      "Tip: gold edges mean the tile is in the right place!",
      "Tip: hold the small picture to see it bigger.",
      "Tip: start with the corners!",
    ],
  },
  perfect: { title: "Perfect drive!", body: "16 moves – the best score possible! You're a true BYD master!" },
  completed: { title: "You did it!", body: "Car rebuilt! Great driving!", best: "Best possible: 16 moves" },
  timeUp: { title: "Time's up!", body: "So close – the BYD was almost ready! Thanks for playing!" },
  duplicate: [
    { title: "Whoa, slow down, racer!", body: "This number has already taken the wheel. Let someone else drive!" },
    { title: "Battery already used!", body: "This number has had its turn. Thanks for playing!" },
    { title: "Nice try!", body: "This number already played. One drive per number!" },
    { title: "Déjà vu!", body: "We've seen this number before. Give a friend a turn!" },
  ],
  ok: "OK",
};
```

---

## 9. Puzzle engine and interaction

### 9.1 Board model (`lib/puzzle/board.ts`, pure functions, fully unit-tested)

- A board is `number[]` of length 16 where `board[position] = tileId`. Solved when `board[i] === i` for all i.
- Positions: `row = Math.floor(p / 4)`, `col = p % 4`.
- Functions: `neighbours(p)`, `areAdjacent(a, b)`, `swap(board, a, b)` (returns a new array), `isSolved(board)`, `isTileCorrect(board, p)`, `directionToNeighbour(p, dir)` (returns `null` at an edge).

### 9.2 Scramble pool

- `data/scrambles.json` is generated by `scripts/generate-scrambles.mjs` (**Appendix A, tested**): 500 unique scrambles, each with a **shortest solution of exactly 16 swaps**, and at least 13 of 16 tiles out of place.
- Each entry is `{ id, board, solution }`. `solution` is one optimal 16-swap path as `[posA, posB]` pairs. It is used only by tests and the dev-only debug mode (9.7) and never shown to players.
- How it works: each scramble is built backwards from the solved board using only swaps that move both tiles one square further from home. The proven lower bound and the reverse path are then both 16, so the optimum is exactly 16. `--verify` re-checks every scramble with an independent exact solver.
- Run `npm run scrambles` then `npm run scrambles:verify` (takes about 15 s) and commit the JSON.
- Import the JSON into the app bundle (about 90 KB) so it works offline with no fetch.

### 9.3 Picking car and scramble (`lib/puzzle/picker.ts`)

- **Car:** a shuffle bag. Deal all 9 cars in random order before any repeats, and never the same car twice in a row across bag refills. Persist the bag in `safeStorage`.
- **Scramble:** random, excluding the last `recentScrambleMemory` used IDs (persisted in `safeStorage`).
- If storage is unavailable, fall back to in-memory state.

### 9.4 Rendering tiles (`PuzzleTile`, `lib/puzzle/tileStyle.ts`)

- Each tile is an element with the **whole car image** as its background: `background-size: 400% 400%`, `background-position: (col × 100 / 3)% (row × 100 / 3)%` for the tile's **home** position (its `tileId`).
- **Tiles are positioned absolutely** with `transform: translate(x, y)` from their current position, and React `key = tileId`. A swap just exchanges two positions, and both tiles animate (`swapDurationMs`, ease-out).
- Gap between tiles about 1% of board size; tile radius about 3% of tile size; 1px gold border at low opacity; subtle inner shadow for depth.
- **Correct tile** (`highlightCorrectTiles`): a thin gold inner edge and a tiny corner tick; it fades in when the tile lands in place.
- Preload the car image before REVEAL. If it fails to load, use `public/cars/placeholder.svg`: a dark square with **16 numbered cells** and the model name, which also makes testing easy before the real images exist.

### 9.5 Input (`hooks/useSwipe.ts` + `PuzzleBoard`)

Two ways to move, both supported:

1. **Swipe (main):** `pointerdown` on a tile captures the pointer and highlights the tile (lift: scale 1.05, glow) and its valid neighbours (dashed gold outline + a small chevron pointing towards each). When the finger moves more than `swipeThresholdRatio × tileSize` and one axis clearly dominates (ratio ≥ 1.3), swap with the neighbour in that direction **immediately** (don't wait for release). One swap per gesture.
2. **Tap-tap (for small children):** tap a tile to select it (same highlight), then tap a highlighted neighbour to swap. Tapping the same tile deselects; tapping another non-neighbour selects that one instead. Selection clears after 4 s.

- Swiping towards the board edge (no neighbour): a short shake on the tile, no move counted.
- One swap = **one move**. Ignore input while a swap animation runs.
- Use Pointer Events only (works for touch and mouse); `touch-action: none` on the board.

### 9.6 Timer and scoring

- Timer based on `performance.now()` timestamps (not interval counting), so it stays accurate. Display `m:ss`. Stops the instant the board is solved.
- On solve: `moves`, `timeMs`, `perfect = moves === optimalMoves`.
- On time up: lock input, animate tiles to solved positions, then show `TimeUpModal`.

### 9.7 Debug mode (development only)

When `process.env.NODE_ENV !== "production"` and the URL has `?debug=1`, show a small overlay on the game screen with: the scramble ID, a **"Next best move"** button (highlights the next swap from `solution`), and an **"Auto-solve (perfect)"** button that plays the 16 solution swaps one by one through the normal swap logic. This is used to test the PERFECT flow quickly. It must never appear in a production build.

---

## 10. Data layer (Firebase Firestore)

### 10.1 Collections

**`players/{phone}`** (document ID = the 10-digit phone number, which enforces one play per number):

| Field | Type | When |
|---|---|---|
| `name` | string | registration |
| `phone` | string | registration |
| `kioskId` | string | registration |
| `status` | `"playing"` → `"completed"` or `"timeout"` | registration → end |
| `modelSlug`, `modelName` | string | registration |
| `scrambleId` | string | registration |
| `createdAt` | server timestamp | registration |
| `clientCreatedAt` | ISO string (device time) | registration |
| `moves` | int | end |
| `timeMs` | int | end |
| `perfect` | boolean | end |
| `finishedAt` | server timestamp | end |
| `clientFinishedAt` | ISO string | end |

**`staff/{uid}`**: one document per staff account (created by hand in the console). Its existence grants dashboard access.

### 10.2 Repository interface (`lib/players/repository.ts`)

```ts
export interface PlayerRepository {
  hasPlayed(phone: string): Promise<boolean>;
  registerPlayer(input: NewPlayer): void;              // fire-and-forget
  saveResult(phone: string, result: GameResult): void; // fire-and-forget
  pendingWrites(): number;                             // for the status panel
}
```

`createPlayerRepository()` returns the Firestore implementation when Firebase is configured, otherwise the local one (10.6).

### 10.3 Firebase client (`lib/firebase/client.ts`)

- Initialise once (guard against double init in dev).
- Firestore with the persistent offline cache:
  ```ts
  initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentSingleTabManager({}) }),
  });
  ```
- Kiosk: `signInAnonymously` on start if no user is signed in. The session persists, so it works offline after the first online launch.

### 10.4 Offline rules – follow exactly (these prevent freezes)

1. **Never `await` a write before moving on.** Offline, Firestore applies writes to the local cache immediately but only resolves the promise when the server confirms. Call `setDoc` / `updateDoc`, attach `.catch()` for logging, track the pending count, and continue.
2. **`hasPlayed`:**
   ```ts
   try {
     const snap = await withTimeout(getDoc(ref), 3000);
     return snap.exists();
   } catch {
     try { return (await getDocFromCache(ref)).exists(); }
     catch { return false; } // not in the local cache while offline → treat as a new player
   }
   ```
3. **No transactions or batched reads** in the kiosk flow (they need the server).
4. Registration uses `setDoc` (create) with `status: "playing"`; the result uses `updateDoc` with only the end fields. The security rules (Appendix B) allow create once and one update from `playing` to finished, so a number can never be overwritten.
5. Note for the summary: if the app is reloaded in the middle of a game, that number stays registered as `playing` and can't play again. That is acceptable.

### 10.5 Security rules

Use `firestore.rules` from **Appendix B** exactly. Summary: the kiosk (anonymous) can only **get one document by ID**, **create** a new player, and **update it once** with the result. It can never list or download other players. Staff (email/password + `staff/{uid}` document) can read and list everything. Nobody can delete.

### 10.6 Local mode (no Firebase credentials yet)

When the Firebase env vars are missing, `isFirebaseConfigured` is false and the app uses `localRepository`:
- Players and results stored in `localStorage` under one key.
- Same `PlayerRepository` behaviour, including duplicate detection.
- The staff dashboard shows a clear banner *"Firebase is not configured – showing local test data"* and still lists and exports the local data, so everything can be tested before Firebase is set up.

---

## 11. Staff dashboard (`/staff`)

- Not linked from the kiosk. `robots: noindex`. Not cached by the service worker.
- Designed for a laptop or phone, using the same black, grey and gold style (lighter effects, no particles).
- **Login** (`StaffLogin`): email and password (Firebase Auth). After login, check `staff/{uid}` exists; if not, show *"This account is not allowed"* and a sign-out button.
- **Summary cards** (`StatsSummary`): total players, completed, perfect (16 moves), time-ups, average moves (completed only), fastest completion.
- **Results table** (`ResultsTable`): live (`onSnapshot`, ordered by `createdAt` descending). Columns: date and time (Asia/Colombo, from `clientCreatedAt`), name, phone, car model, status, moves, time (`m:ss`), perfect badge. Search by name or phone; filter: all / completed / perfect / time up. Perfect rows get a gold highlight.
- **Export CSV** (`ExportCsvButton`): all rows (not only filtered), file name `byd-puzzle-players-YYYY-MM-DD.csv`, UTF-8 with BOM, columns as the table. **Write phone numbers as `="0712345678"`** so Excel keeps the leading zero. Escape quotes, commas and line breaks properly (`lib/utils/csv.ts`, unit-tested).
- Sign-out button.

---

## 12. Offline support and PWA

### 12.1 Manifest (`app/manifest.ts`)

Name *"Rebuild the BYD"*, short name *"BYD Puzzle"*, `display: "fullscreen"`, `orientation: "portrait"`, `start_url: "/"`, `background_color` and `theme_color` `#0A0A0B`, icons 192, 512 and 512 maskable (gold BYD-style mark on black; simple placeholder until the logo is supplied).

### 12.2 Service worker (`public/sw.js`, hand-written)

- Registered by `ServiceWorkerRegister` **in production only**, as `/sw.js?v=<APP_VERSION>`. `APP_VERSION` comes from `next.config.ts`: `process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev"`, exposed as `NEXT_PUBLIC_APP_VERSION`. The SW reads `v` from its own URL and uses it in its cache name (`byd-puzzle-<v>`). It deletes older caches on `activate`, then `skipWaiting` + `clients.claim`.
- `next.config.ts` headers for `/sw.js`: `Cache-Control: no-cache` and `Service-Worker-Allowed: /`.
- **Install:** precache `/`, `/manifest.webmanifest`, `/cars/placeholder.svg`, the 9 car images, the logo and the icons.
- **Fill the cache with the app's own files:** after the SW controls the page, the page posts a message with the list of same-origin resources it has loaded (`performance.getEntriesByType("resource")`, filtered to `/_next/static/`, fonts and images). The SW caches them. This covers the JS, CSS and fonts that loaded before the SW existed.
- **Fetch strategy (same-origin GET only):**
  - `/_next/static/*`, `/cars/*`, `/brand/*`, `/icons/*`: cache-first.
  - Navigation to `/`: network-first with a 3 s timeout, fallback to the cached `/`.
  - `/staff` and everything else: network only (not cached).
  - Cross-origin requests (Firebase, Google APIs): never intercepted.
- **Offline-ready check:** the page checks with `caches.match` that `/`, all car images and the loaded static files are cached, and shows the result in the status panel.

### 12.3 Persistent storage

Call `navigator.storage.persist()` on start (ignore failures).

---

## 13. Kiosk behaviour (`KioskGuards`, hooks)

- **Screen Wake Lock** (`useWakeLock`): request `screen` lock; re-request on `visibilitychange`.
- **Disable:** context menu, text selection, image dragging, pinch and double-tap zoom, pull-to-refresh and overscroll (`touch-action`, `overscroll-behavior: none`, `user-select: none`, `-webkit-touch-callout: none`, `draggable={false}`).
- **Viewport export** in `app/layout.tsx`: `width: "device-width"`, `initialScale: 1`, `maximumScale: 1`, `userScalable: false`, `themeColor: "#0A0A0B"`.
- **Idle handling** (`useIdleTimeout`): registration screen 60 s → clear and go to START; result popups 60 s → START. No idle reset during PLAYING (the 120 s limit ends the game).
- **Errors:** `app/error.tsx` and `app/global-error.tsx` show a styled *"Restarting…"* screen and reload to `/` after 5 s.
- Only the first image on screen uses `priority` loading; preload the selected car image during registration.

---

## 14. Quality, performance and testing

### 14.1 Automated

- `vitest` unit tests:
  - `board.test.ts`: neighbours, adjacency, swap, solved detection, edge directions.
  - `scrambles.test.ts`: 500 entries, unique, each a permutation of 0–15, ≥13 misplaced, Manhattan sum exactly 32 (lower bound 16), and applying its `solution` (16 adjacent swaps) solves the board.
  - `phone.test.ts`: exactly 10 digits accepted; 9, 11, letters and empty rejected; spaces stripped.
  - `csv.test.ts`: escaping, phone format, BOM.
- `npm run lint`, `npm test`, `npm run build` must all pass with no errors after every step.

### 14.2 Performance targets

- Swaps and transitions at a smooth 60 fps on a modest kiosk PC (check in DevTools Performance with 4× CPU slowdown).
- Background particles max 30 fps, fewer during play; blur only on panels, max 16 px.
- Car images about 300–500 KB each (WebP, 1600×1600).

### 14.3 Manual test checklist

- [ ] Layout correct at 1080×1920, 1080×2340, 1200×1920 and 768×1366 (DevTools, touch emulation)
- [ ] Full flow: start → register → reveal → play → each popup → OK → empty registration
- [ ] Swipe and tap-tap both work; edge swipe shakes; moves count correctly
- [ ] Solving in exactly 16 moves shows PERFECT (test with `?debug=1` → Auto-solve in `npm run dev`); debug overlay never appears in `npm run build && npm start`
- [ ] Time up auto-solves and shows the popup
- [ ] Same number twice shows a random duplicate message
- [ ] Idle timeouts return to the start screen
- [ ] Production build (`npm run build && npm start`): load once online, then DevTools **Offline** → reload, play several games, try a repeated number → go online → data syncs (local mode: data stays in localStorage)
- [ ] Status panel shows correct values
- [ ] Staff dashboard: login, live table, filters, CSV opens correctly in Excel with leading zeros

---

## 15. After development: Firebase, deployment and kiosk setup (done by the developer)

### 15.1 Firebase project

1. Go to the Firebase console and create a project (or use your existing one).
2. **Project settings → Your apps → Add app → Web.** Register it and copy the config values.
3. **Build → Authentication → Get started → Sign-in method:** enable **Anonymous** and **Email/Password**.
4. **Authentication → Users → Add user:** create the staff login (email + password). Copy the user's **UID**.
5. **Build → Firestore Database → Create database:** production mode, location **asia-south1 (Mumbai)** (closest to Sri Lanka).
6. **Firestore → Data → Start collection** `staff` → document ID = the staff UID → field `email` (string). Repeat for each staff member.
7. **Firestore → Rules:** paste the contents of `firestore.rules` → **Publish**.

### 15.2 Environment variables

Create `.env.local` from `.env.example`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_KIOSK_ID=game-kiosk-1
```

Restart `npm run dev`. The status panel should now show *Firebase configured: yes* and *signed in: yes*. Play a test game and check it appears in Firestore and on `/staff`.

### 15.3 Car images

1. Put the 9 PNGs in `assets-src/cars/` as `{slug}-puzzle.png`.
2. Run `npm run images`. This creates `public/cars/{slug}.webp` (centre-cropped to square, 1600×1600, quality about 82) and lists any missing models.
3. Commit the WebP files.

### 15.4 Deploy to Vercel

1. Push the project to GitHub and import it in Vercel.
2. Add the same environment variables in **Vercel → Settings → Environment Variables**.
3. Deploy, then open the site and `/staff` to check.
4. If staff login reports an unauthorised domain, add the Vercel domain under **Firebase → Authentication → Settings → Authorized domains**.

### 15.5 Kiosk setup and event day

1. On the portrait kiosk, open the site in Chrome **with internet**, install it as an app (or run Chrome in kiosk mode), and play one test game.
2. Open the status panel (5 taps on the logo) and check **offline-ready: yes** and **signed in: yes**.
3. Turn Wi-Fi off, play a game, try a repeated number, then turn Wi-Fi on and check the games appear on `/staff`.
4. Disable OS sleep, screen savers, notifications and auto-updates for the event.
5. After the event, export the CSV from `/staff`.

---

## 16. Build order for Claude Code

Commit after each step. Lint, tests and build must pass before committing.

1. Install dependencies, add scripts, create the folder structure, `config/`, `content/messages.ts`, `lib/types.ts`, `.env.example`.
2. Add `scripts/generate-scrambles.mjs` (Appendix A), generate and verify `data/scrambles.json`. Add `scripts/convert-car-images.mjs` and `public/cars/placeholder.svg`.
3. Puzzle logic (`lib/puzzle/*`) with unit tests.
4. Design tokens, fonts, `KioskShell`, `BackgroundFx`, UI components.
5. `PuzzleBoard` + `PuzzleTile` + swipe and tap-tap input; then `GameScreen` with HUD (target card, timer, moves, hint).
6. `StartScreen` with `DemoBoard`, `RegisterScreen` with on-screen keyboards, `RevealScreen`, all modals and the win/time-up sequences, wired together in `KioskApp`.
7. Data layer: repository interface, local repository, Firebase config/client, Firestore repository, `firestore.rules`.
8. Staff dashboard with CSV export.
9. PWA manifest, icons, service worker, status panel, kiosk guards, idle timeouts, error pages.
10. Full manual checklist (14.3) in local mode, performance check, final summary listing values you chose and the developer's remaining steps (section 15).

---

## Appendix A – `scripts/generate-scrambles.mjs` (tested)

Generates 500 scrambles instantly; `--verify` (about 15 s) confirmed all 500 have an exact shortest solution of 16 swaps, 13–16 tiles out of place, and a stored solution that solves the board in exactly 16 swaps.

```js
#!/usr/bin/env node
// Generates a pool of 4x4 swap-puzzle scrambles where every scramble has an
// EXACT shortest solution of OPTIMAL adjacent swaps (up/down/left/right).
//
// Board format: board[position] = tileId. Solved when board[i] === i.
// Each scramble also stores one optimal solution: a list of [posA, posB] swaps
// (used by tests and the dev-only debug mode, never shown to players).
// Generation is instant (see "generate" below). --verify re-checks every
// scramble with an independent exact solver (takes ~15 s for 500).
// Usage:
//   node scripts/generate-scrambles.mjs                 (defaults below)
//   node scripts/generate-scrambles.mjs --count 500 --optimal 16 --min-misplaced 13 --seed 2026 --out data/scrambles.json
//   node scripts/generate-scrambles.mjs --verify data/scrambles.json

import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith("--")) acc.push([a.slice(2), arr[i + 1]?.startsWith("--") || arr[i + 1] === undefined ? "true" : arr[i + 1]]);
    return acc;
  }, [])
);

const N = 4;
const SIZE = N * N;
const COUNT = Number(args.count ?? 500);
const OPTIMAL = Number(args.optimal ?? 16);
const MIN_MISPLACED = Number(args["min-misplaced"] ?? 13);
const SEED = Number(args.seed ?? 2026);
const OUT = args.out ?? "data/scrambles.json";

// ---------- grid helpers ----------
const row = (p) => Math.floor(p / N);
const col = (p) => p % N;
const EDGES = [];
for (let p = 0; p < SIZE; p++) {
  if (col(p) < N - 1) EDGES.push([p, p + 1]);
  if (row(p) < N - 1) EDGES.push([p, p + N]);
}
// Manhattan distance table: DIST[tile][pos]
const DIST = Array.from({ length: SIZE }, (_, t) =>
  Array.from({ length: SIZE }, (_, p) => Math.abs(row(t) - row(p)) + Math.abs(col(t) - col(p)))
);

const manhattanSum = (b) => {
  let s = 0;
  for (let p = 0; p < SIZE; p++) s += DIST[b[p]][p];
  return s;
};
const misplaced = (b) => b.reduce((n, t, p) => n + (t !== p ? 1 : 0), 0);

// ---------- exact solver: IDA* ----------
// Each swap moves two tiles by one square each, so the Manhattan sum drops by
// at most 2 per swap: h = ceil(sum / 2) is an admissible lower bound.
function shortestSolution(start, limit = 40) {
  const b = start.slice();
  let sum = manhattanSum(b);
  let bound = Math.ceil(sum / 2);
  const FOUND = -1;

  function search(g, lastEdge) {
    const f = g + Math.ceil(sum / 2);
    if (f > bound) return f;
    if (sum === 0) return FOUND;
    let min = Infinity;
    for (let e = 0; e < EDGES.length; e++) {
      if (e === lastEdge) continue;
      const [a, c] = EDGES[e];
      const ta = b[a], tc = b[c];
      if (ta === tc) continue;
      const delta = DIST[ta][c] + DIST[tc][a] - DIST[ta][a] - DIST[tc][c];
      b[a] = tc; b[c] = ta; sum += delta;
      const r = search(g + 1, e);
      b[a] = ta; b[c] = tc; sum -= delta;
      if (r === FOUND) return FOUND;
      if (r < min) min = r;
    }
    return min;
  }

  while (bound <= limit) {
    const r = search(0, -1);
    if (r === FOUND) return bound;
    if (r === Infinity) return null;
    bound = r;
  }
  return null;
}

// ---------- seeded RNG (mulberry32) ----------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- verify mode ----------
if (args.verify) {
  const file = JSON.parse(readFileSync(args.verify, "utf8"));
  let ok = 0;
  const seen = new Set();
  const solves = (s) => {
    if (!Array.isArray(s.solution) || s.solution.length !== file.optimalMoves) return false;
    const b = s.board.slice();
    for (const [a, c] of s.solution) {
      if (!EDGES.some(([x, y]) => (x === a && y === c) || (x === c && y === a))) return false;
      [b[a], b[c]] = [b[c], b[a]];
    }
    return b.every((t, p) => t === p);
  };
  for (const s of file.scrambles) {
    const valid =
      solves(s) &&
      s.board.length === SIZE &&
      new Set(s.board).size === SIZE &&
      misplaced(s.board) >= file.minMisplaced &&
      Math.ceil(manhattanSum(s.board) / 2) === file.optimalMoves &&
      shortestSolution(s.board, file.optimalMoves) === file.optimalMoves &&
      !seen.has(s.board.join(","));
    seen.add(s.board.join(","));
    if (valid) ok++;
    else console.error(`Invalid scramble: ${s.id}`);
  }
  console.log(`${ok}/${file.scrambles.length} scrambles valid (optimal ${file.optimalMoves}, min misplaced ${file.minMisplaced}).`);
  process.exit(ok === file.scrambles.length ? 0 : 1);
}

// ---------- generate ----------
// Build each scramble BACKWARDS from the solved board, using only swaps that
// move BOTH tiles one square further from their home (Manhattan sum +2).
// After OPTIMAL such swaps the Manhattan sum is 2*OPTIMAL, so the lower bound
// is exactly OPTIMAL, and reversing the swaps is an OPTIMAL-move solution.
// Therefore the shortest solution is exactly OPTIMAL - no search needed.
const rand = rng(SEED);
const results = [];
const seen = new Set();
let attempts = 0;
const t0 = Date.now();

function buildScramble() {
  const b = Array.from({ length: SIZE }, (_, i) => i);
  const swaps = [];
  for (let step = 0; step < OPTIMAL; step++) {
    const options = [];
    for (let e = 0; e < EDGES.length; e++) {
      const [a, c] = EDGES[e];
      const ta = b[a], tc = b[c];
      if (DIST[ta][c] - DIST[ta][a] === 1 && DIST[tc][a] - DIST[tc][c] === 1) options.push(e);
    }
    if (options.length === 0) return null; // dead end, start again
    const [a, c] = EDGES[options[Math.floor(rand() * options.length)]];
    [b[a], b[c]] = [b[c], b[a]];
    swaps.push([a, c]);
  }
  return { board: b, solution: swaps.reverse() };
}

while (results.length < COUNT) {
  attempts++;
  if (attempts > COUNT * 1000) throw new Error("Could not find enough scrambles - lower --min-misplaced or --count.");
  const built = buildScramble();
  if (!built || misplaced(built.board) < MIN_MISPLACED) continue;
  const key = built.board.join(",");
  if (seen.has(key)) continue;
  seen.add(key);
  results.push({ id: `s${String(results.length + 1).padStart(3, "0")}`, ...built });
}

const out = {
  gridSize: N,
  optimalMoves: OPTIMAL,
  minMisplaced: MIN_MISPLACED,
  seed: SEED,
  generatedAt: new Date().toISOString(),
  scrambles: results,
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out));
console.log(`Wrote ${results.length} scrambles to ${OUT} in ${((Date.now() - t0) / 1000).toFixed(1)} s.`);
```

## Appendix B – `firestore.rules`

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }
    function isKiosk() {
      return signedIn() && request.auth.token.firebase.sign_in_provider == 'anonymous';
    }
    function isStaff() {
      return signedIn()
        && request.auth.token.firebase.sign_in_provider != 'anonymous'
        && exists(/databases/$(database)/documents/staff/$(request.auth.uid));
    }

    match /players/{phone} {
      // Kiosk may check one number by ID; only staff may list.
      allow get: if isKiosk() || isStaff();
      allow list: if isStaff();

      // Registration: create once, starts as "playing".
      allow create: if isKiosk()
        && phone.matches('^[0-9]{10}$')
        && request.resource.data.keys().hasOnly([
             'name', 'phone', 'kioskId', 'status', 'modelSlug', 'modelName',
             'scrambleId', 'createdAt', 'clientCreatedAt'])
        && request.resource.data.phone == phone
        && request.resource.data.status == 'playing'
        && request.resource.data.name is string
        && request.resource.data.name.size() > 0
        && request.resource.data.name.size() <= 30;

      // Result: one update from "playing" to finished, end fields only.
      allow update: if isKiosk()
        && resource.data.status == 'playing'
        && request.resource.data.status in ['completed', 'timeout']
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly([
             'status', 'moves', 'timeMs', 'perfect', 'finishedAt', 'clientFinishedAt'])
        && request.resource.data.moves is int
        && request.resource.data.moves >= 0
        && request.resource.data.timeMs is int
        && request.resource.data.perfect is bool;

      allow delete: if false;
    }

    match /staff/{uid} {
      allow get: if signedIn() && request.auth.uid == uid;
      allow list, write: if false;
    }
  }
}
```
