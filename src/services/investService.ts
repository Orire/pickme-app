// MOCK order/allocation service. In production this routes to the real
// order-management / allocation API after compliance & suitability checks.
import type { Position } from '../types'

export async function placeOrder(symbol: string, amount: number): Promise<{ ok: true; simulated: true }> {
  // No real order is placed in the mock.
  console.info(`[mock] simulated allocation: ${symbol} $${amount}`)
  return { ok: true, simulated: true }
}

export function loadPortfolio(key: string): { portfolio: Position[]; totalInvested: number } {
  try {
    const d = JSON.parse(localStorage.getItem(key) || 'null')
    if (d) return { portfolio: d.portfolio || [], totalInvested: d.totalInvested || 0 }
  } catch {}
  return { portfolio: [], totalInvested: 0 }
}

export function savePortfolio(key: string, portfolio: Position[], totalInvested: number) {
  try { localStorage.setItem(key, JSON.stringify({ portfolio, totalInvested })) } catch {}
}
