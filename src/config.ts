// All product levers live here so they can be A/B tested without touching logic.
export const CONFIG = {
  defaultAmount: 50,
  amountChips: [25, 50, 100, 250, 500],
  step: 25,
  minAmount: 1,
  deckPeek: 3,
  swipeThreshold: 110,
  // Scoring params (computed upstream; documented for reference / future recompute)
  scoring: { window_days: 30, halflife_days: 7, min_distinct_pis: 3 },
  storageKey: 'pickme_portfolio_v1',
}
