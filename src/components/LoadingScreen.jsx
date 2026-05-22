import { useEffect, useState } from 'react'

const R = 34
const CIRC = 2 * Math.PI * R

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let rafId
    let start = null
    const duration = 1600

    const animate = (ts) => {
      if (!start) start = ts
      const pct = Math.min((ts - start) / duration, 1)
      setProgress(pct)
      if (pct < 1) {
        rafId = requestAnimationFrame(animate)
      } else {
        setTimeout(() => {
          start = null
          setProgress(0)
          rafId = requestAnimationFrame(animate)
        }, 200)
      }
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const offset = CIRC * (1 - progress)

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: '#111',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 36, zIndex: 9999,
    }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '0.06em' }}>
        Oh-neuldo
      </div>
      <svg width={84} height={84} viewBox="0 0 84 84">
        <circle cx={42} cy={42} r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={3.5} />
        <circle
          cx={42} cy={42} r={R}
          fill="none"
          stroke="#fff"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          transform="rotate(-90 42 42)"
        />
      </svg>
    </div>
  )
}
