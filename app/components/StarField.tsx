'use client'

import { useEffect, useRef } from 'react'

export default function StarField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cvs = ref.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')!
    let raf: number

    const stars: {x:number,y:number,r:number,a:number,da:number,gold:boolean}[] = []

    const resize = () => {
      cvs.width  = window.innerWidth
      cvs.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 180; i++) {
      stars.push({
        x:    Math.random(),
        y:    Math.random(),
        r:    Math.random() * 0.85 + 0.12,
        a:    Math.random(),
        da:   (Math.random() * 0.0015 + 0.0003) * (Math.random() < 0.5 ? 1 : -1),
        gold: Math.random() < 0.07,
      })
    }

    const tick = () => {
      ctx.clearRect(0, 0, cvs.width, cvs.height)
      for (const s of stars) {
        s.a += s.da
        if (s.a <= 0.03 || s.a >= 0.92) s.da *= -1
        ctx.beginPath()
        ctx.arc(s.x * cvs.width, s.y * cvs.height, s.r, 0, Math.PI * 2)
        ctx.fillStyle = s.gold
          ? `rgba(212,175,55,${(s.a * 0.8).toFixed(2)})`
          : `rgba(240,237,230,${(s.a * 0.58).toFixed(2)})`
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
      aria-hidden="true"
    />
  )
}