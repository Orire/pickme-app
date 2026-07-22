import { create } from 'zustand'
import type { Instrument, Position } from './types'
import { CONFIG } from './config'
import { getInstruments } from './db'
import { placeOrder, loadPortfolio, savePortfolio } from './services/investService'

type Phase = 'splash' | 'deck' | 'summary'

interface HistoryEntry { symbol: string; dir: 1 | -1 }

interface State {
  phase: Phase
  feed: Instrument[]
  index: number
  history: HistoryEntry[]
  portfolio: Position[]
  totalInvested: number
  sheetOpen: boolean
  pendingSymbol: string | null
  toast: string
  init: () => Promise<void>
  start: () => void
  restart: () => void
  pass: () => void
  like: () => void            // opens invest sheet for current top card
  confirmInvest: (amount: number) => void
  justWatch: () => void
  undo: () => void
  bySymbol: (s: string) => Instrument | undefined
  _persist: () => void
  _advanceIfDone: () => void
}

export const useStore = create<State>((set, get) => ({
  phase: 'splash',
  feed: [],
  index: 0,
  history: [],
  portfolio: [],
  totalInvested: 0,
  sheetOpen: false,
  pendingSymbol: null,
  toast: '',

  init: async () => {
    const feed = await getInstruments()
    const { portfolio, totalInvested } = loadPortfolio(CONFIG.storageKey)
    set({ feed, portfolio, totalInvested })
  },

  start: () => set({ phase: 'deck', index: 0, history: [], portfolio: [], totalInvested: 0, sheetOpen: false, pendingSymbol: null }),
  restart: () => { savePortfolio(CONFIG.storageKey, [], 0); get().start() },

  bySymbol: (s) => get().feed.find((f) => f.symbol === s),

  _persist: () => savePortfolio(CONFIG.storageKey, get().portfolio, get().totalInvested),
  _advanceIfDone: () => { if (get().index >= get().feed.length) set({ phase: 'summary' }) },

  pass: () => {
    const { feed, index } = get()
    if (index >= feed.length) return
    set({ history: [...get().history, { symbol: feed[index].symbol, dir: -1 }], index: index + 1 })
    get()._advanceIfDone()
  },

  like: () => {
    const { feed, index } = get()
    if (index >= feed.length) return
    const symbol = feed[index].symbol
    set({
      history: [...get().history, { symbol, dir: 1 }],
      index: index + 1,
      pendingSymbol: symbol,
      sheetOpen: true,
    })
  },

  confirmInvest: (amount) => {
    const sym = get().pendingSymbol
    if (!sym) return
    const amt = Math.max(0, Math.round(amount) || 0)
    placeOrder(sym, amt)
    const portfolio = [...get().portfolio, { symbol: sym, amount: amt }]
    const totalInvested = get().totalInvested + amt
    set({ portfolio, totalInvested, sheetOpen: false, pendingSymbol: null, toast: amt > 0 ? `Added ${sym} · $${amt}` : `${sym} added to watchlist` })
    get()._persist(); get()._advanceIfDone()
  },

  justWatch: () => {
    const sym = get().pendingSymbol
    if (!sym) return
    const portfolio = [...get().portfolio, { symbol: sym, amount: 0 }]
    set({ portfolio, sheetOpen: false, pendingSymbol: null, toast: `${sym} added to watchlist` })
    get()._persist(); get()._advanceIfDone()
  },

  undo: () => {
    const { history } = get()
    if (get().sheetOpen) { set({ sheetOpen: false, pendingSymbol: null }) }
    if (!history.length) return
    const last = history[history.length - 1]
    // remove the most recent position for that symbol, if any
    let portfolio = [...get().portfolio]
    let totalInvested = get().totalInvested
    for (let i = portfolio.length - 1; i >= 0; i--) {
      if (portfolio[i].symbol === last.symbol) { totalInvested -= portfolio[i].amount; portfolio.splice(i, 1); break }
    }
    set({
      history: history.slice(0, -1),
      index: Math.max(0, get().index - 1),
      portfolio, totalInvested,
      phase: 'deck',
    })
    get()._persist()
  },
}))
