# PickMe — Product Requirements Document (PRD)

**Version:** 1.0  ·  **Owner:** Ori Reshef (VP Data, eToro)  ·  **Status:** Mock delivered, production spec
**One-liner:** A Tinder-style discovery feed where users swipe through instruments ranked by an anonymized *Crowd Wisdom Score* derived from what eToro's top investors are actually trading — and invest a chosen amount on every right-swipe.

**Philosophy:** PickMe is built on eToro's founding belief that **the collective knowledge of many investors beats any single opinion — together, we know better.** The product's job is to turn that collective knowledge into a signal anyone can act on, without exposing any individual.

---

## 1. Background & vision

eToro's greatest proprietary asset is the aggregate behaviour of its best investors. Today that wisdom is locked inside Popular Investor (PI) profiles that most users never explore. **PickMe turns that collective signal into a fast, playful, mobile-first discovery loop.** Each card is an instrument; the "attractiveness" of the date is how strongly the smartest slice of the eToro crowd is backing it right now.

Critically, **no individual PI is ever exposed.** Users see only an aggregated, anonymized score and a handful of derived signal bars. This sidesteps PI-privacy, ranking-gaming, and "regulated advice from a named person" concerns, while still delivering the "eToro knows better" magic.

### Goals
- Increase instrument discovery and first-trade conversion, especially for newer/low-activity users.
- Surface breadth of conviction (not single-guru tips) to reduce concentration/herding risk on one name.
- Create a low-friction, habit-forming daily loop ("what's the crowd into today?").

### Non-goals (v1)
- Not a copy-trading replacement. It complements copy by seeding a self-directed watchlist/portfolio.
- Not personalized advice. No suitability engine in v1 (see Compliance).
- No social/chat features.

---

## 2. Target users
1. **Curious newcomer** — funded but few positions; wants ideas without reading research.
2. **Active self-director** — trades manually; wants a fast daily idea feed grounded in real crowd behaviour.
3. **Lapsed user** — re-engagement via a fun, notification-friendly daily deck.

---

## 3. The Crowd Wisdom Score (core IP)

The ranking is the product. It must be reproducible, explainable, and tunable.

### 3.1 Inputs
Trade-level data for the top N Popular Investors (v1 mock: top ~800–1000 PIs) over a rolling window (default **30 days**), one row per opened/closed position:
`RealCID, NumOfCopiers, Symbol, InstrumentID, AssetClass, Direction (Buy/Sell), TradeTimestamp, InvestedAmount, NotionalVolume, MirrorID, IsSettled`.

### 3.2 Per-trade signal
```
signal(trade) = direction × pi_size_weight × recency_weight
  direction        = +1 if Buy, −1 if Sell            # net selling lowers a score
  pi_size_weight   = log10(1 + NumOfCopiers)           # bigger crowd counts more, log-damped
  recency_weight   = exp(−ln2 × days_ago / H)          # H = 7-day half-life (recency-forward)
```
Exclude copy-of-another trades (`MirrorID ≠ 0`) so only a PI's own conviction counts.

### 3.3 Instrument raw score (the "sum over the instrument")
```
raw_score(instrument) = Σ signal(trade)   over all qualifying trades on that instrument
```
This single sum simultaneously rewards **frequency** (more trades), **breadth** (more distinct big investors), **recency**, and **direction**.

### 3.4 Display score (0–100)
```
crowd_score = 100 × sqrt( max(raw_score,0) / max_raw_score )
```
Rank-preserving square-root compression, purely for a friendly 0–100 gauge. Ranking always uses `raw_score`.

### 3.5 Feed eligibility
Instrument appears only if `raw_score > 0` **and** traded by **≥ 3 distinct PIs** (a genuine crowd, not one whale).

### 3.6 Signal bars shown on the card (all anonymized, normalized 0–100)
| Bar | Definition |
|---|---|
| **Consensus** | breadth — `log(distinct investors)` normalized |
| **Momentum** | freshness — weighted-average recency of trades |
| **Conviction** | `% of trades that were buys` |
| **Activity** | frequency — `log(total trades)` normalized |

### 3.7 Tiers (by display score)
🔥 Crowd Favorite ≥80 · 📈 Heating Up ≥60 · ✨ Trending ≥45 · 👀 On the Radar ≥30 · 🌱 Emerging >0.

### 3.8 Tunable parameters (config, not code)
`window_days=30`, `halflife_days=7`, `min_distinct_pis=3`, `pi_universe_size`, direction weights, and an optional volume/portfolio-% term (off in v1). All must be server-config so we can A/B test.

### 3.9 Known caveats
- Inverse/leveraged products (SQQQ, TQQQ, SOXL, UVXY) log as "buys" but express bearish/hedge intent — **exclude or flag** in a consumer buy-feed.
- ~94% of trades are buys, so Conviction skews high; keep it as a tie-breaker, not the headline.
- Sell-heavy names (e.g. index hedges) correctly score negative and are filtered out.

---

## 4. Core features

### 4.1 Swipe deck
- Card stack (top + 2 peek), drag to swipe with rotation and LIKE/PASS stamps.
- Buttons: Pass (✕), Invest (💰), Undo (↩). Keyboard arrows on desktop.
- Touch-first: `touch-action:none`, no scroll hijack, safe-area aware, `svh` units.

### 4.2 Invest-on-right-swipe (NEW — v1 requirement)
- Every right-swipe opens an **invest sheet** pre-filled at **$50** (default, configurable).
- Adjust via −/+ stepper (±$25), quick chips ($25/$50/$100/$250/$500), or type a custom amount.
- **Invest $X** confirms and adds a position; **Just watch** adds with $0 (watchlist only); backdrop tap = just watch.
- Running **wallet total** in the header; confetti + toast on invest.
- Mock places **no real orders**; production routes to the order/allocation service.

### 4.3 Portfolio / summary
- End-of-deck screen: total invested, position count, average crowd score, per-instrument list with amounts, sorted by amount then score.
- Persisted locally (mock: `localStorage`; production: user account).

### 4.4 Card content (anonymized)
Emoji, ticker, name, asset chip, crowd-score gauge + tier, 4 signal bars, one-line auto-generated pitch, and aggregate footnotes (# investors in, # trades, % buys, last activity). **No PI names, copiers, or AUC.**

---

## 5. Data & architecture

### 5.1 Local DB schema (mock + client cache) — `instruments`
| field | type | notes |
|---|---|---|
| symbol | string | display ticker |
| name | string | friendly name |
| asset | string | Stocks / ETF / Crypto / Forex / Indices / Commodities |
| emoji | string | card art |
| score | number | crowd_score 0–100 |
| tier / tierColor | string | derived |
| consensus, momentum, conviction, activity | number | signal bars 0–100 |
| n_investors, trades, buy_share, days_since | number | anonymized aggregates |

### 5.2 Production pipeline
1. **Source (Databricks / eToro DWH):** trade-level facts (`fact_customeraction_w_metrics` / `Dim_Position`), PI identity & copiers (`Dim_Customer.GuruStatusID`, `NumOfCopiers`), instrument enrichment (`v_dim_instrument_enriched`).
2. **Scoring job:** scheduled (hourly/daily) Spark/SQL job computes `raw_score` and signal bars per instrument for the rolling window; writes an anonymized `instrument_crowd_score` table (no PI keys downstream).
3. **Serving API:** `GET /feed?limit=` returns ranked, anonymized cards; `POST /invest {symbol, amount}` records intent / routes to allocation; `GET /portfolio`.
4. **Client:** mobile web PWA reads `/feed`, caches to local DB for offline/instant load, syncs portfolio to account.

### 5.3 Privacy boundary
The anonymization happens in the scoring job: **PI CIDs, names, copiers, and AUC never cross into the serving layer or client.** Only aggregate counts and normalized signals are published.

---

## 6. Non-functional requirements
- **Mobile web first** (PWA, installable, offline deck). Sub-1s first card. 60fps swipe.
- **Accessibility:** buttons as fallback for every gesture; keyboard support; color-contrast on tiers.
- **Analytics events:** `card_view, swipe_left, swipe_right, invest_confirm{amount}, just_watch, undo, deck_complete, portfolio_view`.
- **Config-driven scoring** for A/B tests.

---

## 7. Compliance & risk (must-haves)
- Persistent "**not investment advice / capital at risk**" disclaimer; mock adds "simulated, no real orders."
- Before any **real** order path: MiFID/appropriateness checks, jurisdiction/instrument availability, and per-instrument risk warnings (esp. crypto & leveraged).
- **Exclude inverse/leveraged** products from the default buy-feed, or gate behind an explicit "advanced" toggle with warnings.
- No named-person endorsement — anonymized aggregate only.
- Investment amounts must respect min/max order sizes and available balance.

---

## 8. Milestones
1. **M0 — Mock (done):** single-file HTML, local DB, swipe + invest sheet, shareable.
2. **M1 — Scoring service:** productionized Databricks job + anonymized score table + config.
3. **M2 — API + PWA:** `/feed`, `/invest`, `/portfolio`; installable mobile web app.
4. **M3 — Real order routing + compliance gates.**
5. **M4 — Personalization & A/B on scoring params; notifications for daily deck.**

---

## 9. Open questions
- Invest amount: cash vs. % of balance? Recurring/DCA option?
- Should "just watch" feed a real eToro watchlist?
- Include a copy-trading CTA when many PIs back one name?
- Feed personalization (asset-class preference) — post-v1?

---

# Appendix A — Coding-Agent Build Prompt (paste into Claude Code / your agent)

> **Role:** You are a senior front-end engineer. Build the **PickMe** mobile-web app described below. Work in a fresh repo. Produce runnable code, commit in logical steps, and write a short README.
>
> **What to build:** A Tinder-style, mobile-web-first PWA where users swipe instrument cards ranked by an anonymized "Crowd Wisdom Score." Right-swipe opens an invest sheet (default **$50**, adjustable via stepper/chips/custom); confirming records a simulated position and updates a running total. Left-swipe passes. Undo supported. End-of-deck shows a portfolio summary. **Never display any individual investor's name, copier count, or AUC — only aggregated, anonymized signals.**
>
> **Stack:** React + TypeScript + Vite, PWA (installable, offline), Framer Motion for swipe/gestures, Zustand for state, Tailwind for styling. No backend required for the mock — read the dataset from a **local DB layer**: bundle `instruments.json` and access it through a `db.ts` module (swap for a real API later). Persist the portfolio to `localStorage`. Keep it a single deployable static site.
>
> **Data:** Use the provided `instruments.json` (fields: `symbol, name, asset, emoji, score, tier, tierColor, consensus, momentum, conviction, activity, n_investors, trades, buy_share, days_since`). Sort the feed by `score` desc. Do not invent PI-identifying fields.
>
> **Scoring (already computed upstream — do not recompute in the client; document it):**
> `signal = direction(±1) × log10(1+copiers) × exp(−ln2·days_ago/7)`; instrument `raw_score = Σ signal`; `crowd_score = 100·sqrt(raw/max_raw)`; feed requires `raw_score>0` and `≥3 distinct PIs`. Exclude inverse/leveraged tickers from the default feed.
>
> **Screens/flows:** (1) Splash → (2) Swipe deck (card stack of 3, drag + rotation + LIKE/PASS stamps, buttons for pass/invest/undo, keyboard arrows) → (3) Invest bottom sheet (emoji, symbol, name, crowd score, amount input defaulting to $50, −/+ ±$25, chips $25/$50/$100/$250/$500, "Invest $X" + "Just watch", backdrop-dismiss = just watch) → (4) Portfolio summary (total invested, positions, avg score, sorted list).
>
> **Card UI:** gradient hero with emoji, tier chip, "🧠 Crowd Wisdom" badge, circular score gauge (conic-gradient), then ticker + asset chip + name, an auto-generated one-line pitch from the signal values, four labelled signal bars (Consensus/Momentum/Conviction/Activity), and aggregate footnote chips (# investors, # trades, % buys, last activity).
>
> **Mobile hardening (required):** `touch-action:none` on cards, `overscroll-behavior:none`, safe-area insets, `100svh`, no scroll hijack, 60fps. Buttons must fully replicate gestures. Add a web app manifest + service worker for installability/offline.
>
> **Compliance:** persistent "not investment advice · simulated · capital at risk" disclaimer. No real orders in the mock; stub an `investService.placeOrder()` for later wiring. Respect a config object for `defaultAmount`, `amountChips`, `window_days`, `halflife`, `minDistinctPis`.
>
> **Deliverables:** repo with `src/` (components, `store`, `db.ts`, `config.ts`), `public/instruments.json`, manifest + SW, README with run/deploy steps, and clean commit history. Reference `PickMe-PRD.md` for full detail. Match the look-and-feel of the delivered `PickMe-CrowdWisdom.html` mock.
