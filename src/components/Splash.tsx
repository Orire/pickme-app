import { useStore } from '../store'
import { getUniverseSize } from '../db'

export default function Splash() {
  const { feed, start } = useStore()
  return (
    <div className="screen">
      <div className="logo">💚🔥</div>
      <h1>PickMe</h1>
      <p><b>The collective knowledge of eToro, in your pocket.</b> Every card is an instrument ranked by our <b>Crowd Wisdom Score</b> — the distilled signal of what eToro's smartest investors are actually trading. No names, just the wisdom of the many.</p>
      <p style={{ opacity: 0.9 }}>Because together, <b>we know better</b>. Swipe right to invest — you set the amount every time (starts at <b>$50</b>). Left to pass. 😏</p>
      <button className="cta" onClick={start}>Start swiping →</button>
      <div className="mini">{feed.length} instruments · powered by the collective knowledge of {getUniverseSize()} top investors</div>
    </div>
  )
}
