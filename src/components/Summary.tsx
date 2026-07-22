import { useStore } from '../store'

export default function Summary() {
  const { portfolio, totalInvested, bySymbol, restart } = useStore()
  const invested = portfolio.filter((p) => p.amount > 0)
  const avg = portfolio.length ? Math.round(portfolio.reduce((a, p) => a + (bySymbol(p.symbol)?.score || 0), 0) / portfolio.length) : 0
  const sorted = [...portfolio].sort((a, b) => b.amount - a.amount || (bySymbol(b.symbol)?.score || 0) - (bySymbol(a.symbol)?.score || 0))

  return (
    <div className="screen">
      <div className="logo">🎉</div>
      {portfolio.length === 0 ? (
        <>
          <h1>Playing hard to get? 🙈</h1>
          <p>You passed on the whole crowd. Give it another spin?</p>
        </>
      ) : (
        <>
          <h1>💼 ${totalInvested.toLocaleString()} across {invested.length} position{invested.length !== 1 ? 's' : ''}</h1>
          <p>{portfolio.length} picks · avg Crowd Score <b>{avg}/100</b>. {avg >= 55 ? 'Bold, high-conviction taste.' : 'Nicely balanced.'}</p>
          <div className="wl">
            {sorted.map((p) => {
              const c = bySymbol(p.symbol)!
              return (
                <div className="wlItem" key={p.symbol}>
                  <div className="e">{c.emoji}</div>
                  <div><div className="t">{c.symbol} · {c.name}</div><div className="s">{c.tier} · Crowd {Math.round(c.score)}</div></div>
                  <div className="r">{p.amount > 0 ? '$' + p.amount.toLocaleString() : '👀 watch'}</div>
                </div>
              )
            })}
          </div>
        </>
      )}
      <button className="cta" onClick={restart}>Swipe again ↻</button>
      <div className="mini">Simulated allocation — this is a mock, no real orders placed.</div>
    </div>
  )
}
