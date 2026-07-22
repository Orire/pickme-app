import { useEffect } from 'react'
import { useStore } from './store'
import Splash from './components/Splash'
import Deck from './components/Deck'
import Controls from './components/Controls'
import InvestSheet from './components/InvestSheet'
import Summary from './components/Summary'
import Toast from './components/Toast'

export default function App() {
  const { phase, init } = useStore()
  useEffect(() => { init() }, [init])

  return (
    <div className="app">
      <header>
        <div className="brand">🔥 PickMe <span className="tag">Collective Knowledge</span></div>
        <Wallet />
      </header>

      <Deck />
      {phase === 'deck' && <Controls />}
      <div className="hint">Swipe ← pass&nbsp; •&nbsp; → to invest&nbsp; •&nbsp; powered by eToro's collective knowledge</div>

      <Toast />
      <InvestSheet />
      {phase === 'splash' && <Splash />}
      {phase === 'summary' && <Summary />}

      <div className="disc">Mock demo · Crowd Wisdom Score is an aggregated, anonymized signal. Not investment advice. Simulated amounts only — no real orders. Capital at risk in the real product.</div>
    </div>
  )
}

function Wallet() {
  const total = useStore((s) => s.totalInvested)
  return <div className="wallet">💰 ${total.toLocaleString()} invested</div>
}
