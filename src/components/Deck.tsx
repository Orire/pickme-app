import { useRef } from 'react'
import { useStore } from '../store'
import Card, { CardHandle } from './Card'
import { CONFIG } from '../config'

export default function Deck() {
  const { feed, index, pass, like } = useStore()
  const topRef = useRef<CardHandle>(null)
  const stack = feed.slice(index, index + CONFIG.deckPeek)

  const onDecide = (dir: 1 | -1) => { if (dir > 0) like(); else pass() }

  return (
    <div className="deck" id="deck">
      {stack.map((inst, i) => (
        <Card
          key={inst.symbol + index + i}
          ref={i === 0 ? topRef : null}
          inst={inst}
          depth={i}
          isTop={i === 0}
          onDecide={onDecide}
        />
      ))}
      <TopRefBridge topRef={topRef} />
    </div>
  )
}

// Exposes the current top card's fling() to the Controls via the store-less ref bridge.
function TopRefBridge({ topRef }: { topRef: React.RefObject<CardHandle> }) {
  ;(window as any).__pickmeFling = (dir: 1 | -1) => topRef.current?.fling(dir)
  return null
}
