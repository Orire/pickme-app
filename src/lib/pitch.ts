import type { Instrument } from '../types'

// Auto-generate a one-line, anonymized pitch from the signal values.
export function pitch(c: Instrument): string {
  const parts: string[] = []
  if (c.consensus >= 85) parts.push('wide agreement across the crowd')
  else if (c.consensus >= 65) parts.push('solid crowd backing')
  if (c.momentum >= 45) parts.push('fresh buying right now')
  else if (c.days_since <= 1) parts.push('traded in the last day')
  if (c.conviction >= 98) parts.push('near-unanimous buying')
  else if (c.conviction < 70) parts.push('mixed buy/sell — contrarian')
  if (c.activity >= 85) parts.push('heavy repeat activity')
  const s = parts.slice(0, 2).join(', ') || 'a quiet-but-rising crowd signal'
  const label = c.tier.replace(/^[^ ]+ /, '')
  return `${label} — ${s.charAt(0).toUpperCase()}${s.slice(1)}.`
}

export const heroGrads: [string, string][] = [
  ['#ff5a8a', '#ff8a5c'], ['#7b5cff', '#00d1b2'], ['#f857a6', '#ff5858'],
  ['#43cea2', '#185a9d'], ['#fa709a', '#fee140'], ['#4facfe', '#00f2fe'],
  ['#c471f5', '#fa71cd'], ['#f6d365', '#fda085'], ['#30cfd0', '#330867'],
]
export const gradFor = (sym: string) => heroGrads[(sym.charCodeAt(0) + sym.length) % heroGrads.length]
