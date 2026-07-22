import { useEffect } from 'react'
import { useStore } from '../store'

export default function Controls() {
  const undo = useStore((s) => s.undo)
  const sheetOpen = useStore((s) => s.sheetOpen)
  const fling = (dir: 1 | -1) => (window as any).__pickmeFling?.(dir)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (sheetOpen) return
      if (e.key === 'ArrowLeft') fling(-1)
      if (e.key === 'ArrowRight') fling(1)
      if (e.key === 'ArrowDown') undo()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sheetOpen, undo])

  return (
    <div className="controls">
      <button className="btn small undo" onClick={undo} title="Undo">↩</button>
      <button className="btn big nope" onClick={() => fling(-1)} title="Pass (←)">✕</button>
      <button className="btn big like" onClick={() => fling(1)} title="Invest (→)">💰</button>
    </div>
  )
}
