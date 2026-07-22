export function confetti() {
  const cs = ['#ff5a8a', '#00d38a', '#7b5cff', '#ffd166', '#00d1b2']
  for (let i = 0; i < 26; i++) {
    const c = document.createElement('div')
    c.className = 'confetti'
    c.style.left = 50 + (Math.random() * 40 - 20) + '%'
    c.style.background = cs[i % cs.length]
    document.body.appendChild(c)
    const dx = Math.random() * 300 - 150
    const dy = window.innerHeight * 0.7 + Math.random() * 200
    const rot = Math.random() * 720 - 360
    c.animate(
      [{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${dx}px,${dy}px) rotate(${rot}deg)`, opacity: 0 }],
      { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.2,.6,.4,1)' },
    )
    setTimeout(() => c.remove(), 1500)
  }
}
