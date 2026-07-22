// Local DB layer. The mock reads the bundled dataset; swap this module for a
// real API client (GET /feed) without touching the UI.
import fallback from './data/instruments.json'
import type { Instrument } from './types'

// Developer-only override: src/data/instruments.local.json holds the real
// dataset and is git-ignored, so it is never committed or published. When it is
// present (local dev/build) the app uses it; on CI / GitHub it is absent, so the
// committed randomized demo data (instruments.json) is served instead.
const overrides = import.meta.glob<{ default: Instrument[] }>('./data/instruments.local.json', { eager: true })
const local = Object.values(overrides)[0]?.default
const DATA = local ?? (fallback as unknown as Instrument[])

export function getInstruments(): Promise<Instrument[]> {
  // Already ranked by Crowd Wisdom Score desc in the dataset.
  return Promise.resolve(DATA)
}

export function getUniverseSize(): number {
  return 569 // distinct instruments in the qualifying crowd (from the source pipeline)
}
