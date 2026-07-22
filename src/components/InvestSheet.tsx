import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { CONFIG } from '../config'
import { confetti } from '../lib/confetti'
import { clampInt } from '../lib/format'

export default function InvestSheet() {
  const { sheetOpen, pendingSymbol, bySymbol, confirmInvest, justWatch } = useStore()
  const [amount, setAmount] = useState(CONFIG.defaultAmount)

  useEffect(() => { if (sheetOpen) setAmount(CONFIG.defaultAmount) }, [sheetOpen, pendingSymbol])

  const inst = pendingSymbol ? bySymbol(pendingSymbol) : undefined

  const confirm = () => { if (amount > 0) confetti(); confirmInvest(amount) }
  const bump = (d: number) => setAmount((a) => clampInt(a + d, CONFIG.minAmount))

  return (
    <div className={'sheetWrap' + (sheetOpen ? ' show' : '')}>
      <div className="backdrop" onClick={justWatch} />
      <div className="sheet">
        <div className="grip" />
        {inst && (
          <>
            <div className="sHead">
              <div className="e">{inst.emoji}</div>
              <div><div className="t">{inst.symbol} · {inst.name}</div><div className="s">{inst.tier} · {inst.asset}</div></div>
              <div className="g"><div className="v">{Math.round(inst.score)}</div><div className="l">Crowd</div></div>
            </div>
            <div className="amtRow">
              <button className="step" onClick={() => bump(-CONFIG.step)}>–</button>
              <div className="amt">
                <span className="cur">$</span>
                <input type="number" inputMode="numeric" value={amount}
                  onChange={(e) => setAmount(clampInt(Number(e.target.value)))} min={CONFIG.minAmount} />
              </div>
              <button className="step" onClick={() => bump(CONFIG.step)}>+</button>
            </div>
            <div className="chips">
              {CONFIG.amountChips.map((v) => (
                <div key={v} className={'chip' + (v === amount ? ' active' : '')} onClick={() => setAmount(v)}>${v}</div>
              ))}
            </div>
            <div className="sBtns">
              <button className="sBtn watch" onClick={justWatch}>👀 Just watch</button>
              <button className="sBtn invest" onClick={confirm}>Invest ${amount || 0}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
