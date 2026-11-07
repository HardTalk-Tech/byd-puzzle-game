# Rebuild the BYD – puzzle kiosk

Portrait touch-screen kiosk game for the BYD Sri Lanka showroom event: a visitor
registers (name + 10-digit phone, one play per number), rebuilds a random BYD
model as a 4×4 swap puzzle within 120 s, and staff read the moves on screen.
The full specification is in [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md).

## Run it

```bash
npm install
npm run dev            # http://localhost:3000  (kiosk)  ·  /staff (dashboard)
```

Without Firebase env vars the app runs in **local mode**: players are stored in
`localStorage` and `/staff` shows that local data with a banner. Copy
`.env.example` to `.env.local` and fill it in to use Firestore.

Dev-only debug mode: `http://localhost:3000/?debug=1` shows the scramble ID,
**Next best move** and **Auto-solve (perfect)** on the game screen. It never
appears in a production build.

Hidden status panel: tap the BYD logo 5 times within 3 s on the start or
registration screen.

## Scripts

| Script | What it does |
|---|---|
| `npm run lint` / `npm test` / `npm run build` | ESLint, Vitest unit tests, production build |
| `npm run scrambles` | Regenerates `data/scrambles.json` (500 scrambles, optimum exactly 16 swaps) |
| `npm run scrambles:verify` | Re-checks every scramble with an exact solver (~15 s) |
| `npm run images` | Converts `assets-src/cars/*` to `public/cars/{slug}.webp` |
| `npm run icons` | Builds the logo SVG, PWA icons and `app/icon.svg` from `public/brand/byd-logo-white.png` |

### Car images

Put one image per model in `assets-src/cars/`, named `{slug}-puzzle.png`
(e.g. `atto-3-puzzle.png`) or by display name (e.g. `BYD Atto 3.png`), then run
`npm run images`. Missing models show a numbered placeholder.

### Logo and icons

The logo source is `public/brand/byd-logo-white.png` (white on transparent).
`npm run icons` builds `public/brand/byd-logo.svg` (used by the app), the PWA
icons and the browser tab icon from it. Re-run it after replacing the PNG.

## Where things live

- `config/game.ts` – every timing and rule (time limit, idle timeouts, animation times)
- `config/cars.ts` – the 9 models
- `content/messages.ts` – all on-screen text
- `components/kiosk/KioskApp.tsx` – the screen state machine
- `lib/players/` – Firestore and local repositories
- `public/sw.js` – hand-written service worker (offline support, production only)
- `firestore.rules` – security rules to publish in the Firebase console
