import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import type { Instrument } from '../types'
import { CONFIG } from '../config'
import { pitch, gradFor } from '../lib/pitch'

export interface CardHandle { fling: (dir: 1 | -1) => void }
interface Props { inst: Instrument; depth: number; isTop: boolean; onDecide: (dir: 1 | -1) => void }

const barColor: Record<string, string> = { consensus: '#7b5cff', momentum: '#ff8a3d', conviction: '#00d38a', activity: '#3b82f6' }

const Card = forwardRef<CardHandle, Props>(({ inst, depth, isTop, onDecide }, ref) => {
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false })
  const [exit, setExit] = useState<0 | 1 | -1>(0)
  const start = useRef<{ x: number; y: number } | null>(null)

  const fling = (dir: 1 | -1) => { setExit(dir); window.setTimeout(() => onDecide(dir), 380) }
  useImperativeHandle(ref, () => ({ fling }), [])

  const onDown = (e: React.PointerEvent) => {
    if (!isTop || exit) return
    start.current = { x: e.clientX, y: e.clientY }
    setDrag({ x: 0, y: 0, active: true })
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    if (!start.current) return
    e.preventDefault()
    setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y, active: true })
  }
  const onUp = () => {
    if (!start.current) return
    const dx = drag.x
    start.current = null
    if (Math.abs(dx) > CONFIG.swipeThreshold) fling(dx > 0 ? 1 : -1)
    else setDrag({ x: 0, y: 0, active: false })
  }

  const g = gradFor(inst.symbol)
  const deg = Math.round(inst.score * 3.6)
  const k = Math.min(Math.abs(drag.x) / 120, 1)

  const style: React.CSSProperties = exit
    ? { transform: `translate(${exit * 600}px,-40px) rotate(${exit * 45}deg)`, opacity: 0, transition: 'transform .4s cubic-bezier(.3,.7,.4,1), opacity .4s', zIndex: 100 - depth }
    : drag.active
      ? { transform: `translate(${drag.x}px,${drag.y * 0.35}px) rotate(${drag.x / 18}deg)`, transition: 'none', zIndex: 100 - depth }
      : { transform: `translateY(${depth * 10}px) scale(${1 - depth * 0.04})`, transition: 'transform .25s ease', filter: depth > 0 ? `brightness(${1 - depth * 0.06})` : 'none', zIndex: 100 - depth }

  const Bar = ({ label, val }: { label: string; val: number }) => (
    <div className="bar">
      <div className="lab">{label}</div>
      <div className="track"><div className="fill" style={{ width: `${val}%`, background: barColor[label.toLowerCase()] }} /></div>
      <div className="pct">{val}</div>
    </div>
  )

  return (
    <div className="card" style={style}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      <div className="stamp like" style={{ opacity: drag.x > 0 ? k : 0 }}>INVEST</div>
      <div className="stamp nope" style={{ opacity: drag.x < 0 ? k : 0 }}>PASS</div>
      <div className="hero" style={{ background: `linear-gradient(145deg,${g[0]},${g[1]})` }}>
        <div className="rings">
          <div className="ring" style={{ width: 120, height: 120, left: -30, top: -30 }} />
          <div className="ring" style={{ width: 200, height: 200, right: -60, bottom: -70 }} />
        </div>
        <div className="tierchip">{inst.tier}</div>
        <div className="crowdBadge">🧠 Collective Knowledge</div>
        <div className="emoji">{inst.emoji}</div>
        <div className="gauge" style={{ background: `conic-gradient(${inst.tierColor} ${deg}deg,#eee ${deg}deg)` }}>
          <div className="inner"><div className="sv">{Math.round(inst.score)}</div><div className="sl">Score</div></div>
        </div>
      </div>
      <div className="body">
        <div className="titleRow"><div className="ticker">{inst.symbol}</div><div className="assetchip">{inst.asset}</div></div>
        <div className="name">{inst.name}</div>
        <div className="pill">💡 <b>{pitch(inst)}</b></div>
        <div className="bars">
          <Bar label="Consensus" val={inst.consensus} />
          <Bar label="Momentum" val={inst.momentum} />
          <Bar label="Conviction" val={inst.conviction} />
          <Bar label="Activity" val={inst.activity} />
        </div>
        <div className="foot">
          <div className="fchip">🧑‍🤝‍🧑 {inst.n_investors} investors in</div>
          <div className="fchip">🔁 {inst.trades} trades</div>
          <div className="fchip">💚 {inst.buy_share}% buys</div>
          <div className="fchip">⏱️ last {inst.days_since < 1 ? '<1' : Math.round(inst.days_since)}d</div>
        </div>
      </div>
    </div>
  )
})
export default Card
