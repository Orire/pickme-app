# PickMe 🔥💚

A Tinder-style, mobile-web-first PWA where you swipe through instruments ranked by an
anonymized **Crowd Wisdom Score** — the distilled signal of what eToro's smartest investors
are actually trading. Right-swipe to invest (you set the amount, default **$50**); left to pass.

> **Philosophy:** built on eToro's belief that the *collective knowledge* of many investors beats any single opinion — **together, we know better.** No individual investor is ever exposed; only aggregated, anonymized signals.

## Quick start

```bash
npm install
npm run dev        # local dev server (open the printed URL on your phone via LAN)
npm run build      # production build -> dist/
npm run preview    # serve the production build
npm run typecheck  # optional TS check
```

Deploy `dist/` to any static host (Netlify drag-drop, GitHub Pages, S3, Vercel).

## How it works

- **Local DB:** `src/data/instruments.json` (also mirrored in `public/` for the SW cache) is the
  dataset the mock runs on. `src/db.ts` is the data layer — swap it for a real `GET /feed` API
  without touching the UI.
- **Scoring (computed upstream, documented — the client does not recompute):**
  ```
  signal(trade) = direction(±1) × log10(1 + copiers) × exp(−ln2 · days_ago / 7)   # 7-day half-life
  raw_score(instrument) = Σ signal(trade)                                          # sum over the instrument
  crowd_score = 100 × sqrt(raw_score / max_raw_score)                              # 0–100 display
  ```
  Feed = instruments with `raw_score > 0` traded by ≥ 3 distinct PIs. Inverse/leveraged tickers
  should be excluded from a consumer buy-feed (see PRD §3.9).
- **Invest flow:** every right-swipe opens a bottom sheet pre-filled at `CONFIG.defaultAmount`
  ($50), adjustable via stepper / chips / custom input. Confirm records a **simulated** position
  (`src/services/investService.ts` — stub for the real order API). Portfolio persists to
  `localStorage`.

## Project structure

```
src/
  main.tsx            app entry + service-worker registration
  App.tsx             layout + phase switch (splash / deck / summary)
  store.ts            Zustand store (deck index, portfolio, invest/undo actions)
  config.ts           all product levers (default amount, chips, scoring params)
  db.ts               local DB layer (swap for real API)
  types.ts            Instrument / Position types
  services/investService.ts   mock order + localStorage persistence
  lib/                pitch generator, confetti, formatting
  components/         Card, Deck, Controls, InvestSheet, Splash, Summary, Toast
  data/instruments.json       the ranked dataset (local DB)
public/
  manifest.webmanifest, sw.js, icon-192.png, icon-512.png, instruments.json
PickMe-PRD.md         full product requirements + coding-agent build prompt
```

## Mobile / PWA
Touch-first (`touch-action:none`, no scroll-hijack, safe-area insets, `100svh`), installable
(manifest + service worker, offline app shell). Buttons + arrow keys mirror every gesture.

## Compliance
Mock only — **no real orders**. Persistent "not investment advice · capital at risk" disclaimer.
Before wiring real order routing: MiFID/appropriateness checks, jurisdiction/instrument
availability, per-instrument risk warnings, and min/max order-size + balance validation.

_Not investment advice. Past activity is not indicative of future results._
