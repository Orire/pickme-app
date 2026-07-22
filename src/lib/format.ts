export const usd = (n: number) => '$' + Math.round(n).toLocaleString()
export const clampInt = (n: number, min = 0) => Math.max(min, Math.round(Number.isFinite(n) ? n : 0))
