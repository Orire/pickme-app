import { useEffect, useState } from 'react'
import { useStore } from '../store'

export default function Toast() {
  const toast = useStore((s) => s.toast)
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!toast) return
    setShow(true)
    const t = setTimeout(() => setShow(false), 1400)
    return () => clearTimeout(t)
  }, [toast])
  return <div className={'toast' + (show ? ' show' : '')}>{toast}</div>
}
