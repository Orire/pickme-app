export interface Instrument {
  symbol: string
  name: string
  asset: string
  emoji: string
  score: number          // Crowd Wisdom Score, 0-100 (display)
  tier: string
  tierColor: string
  consensus: number      // signal bars, 0-100
  momentum: number
  conviction: number
  activity: number
  n_investors: number    // anonymized aggregates
  trades: number
  buy_share: number
  days_since: number
}

export interface Position {
  symbol: string
  amount: number         // 0 == watch-only
}
