"use client"

import { useRef, useState } from "react"

export type Scene = {
  id: string
  src: string
  label: string
}

export const SCENES: Scene[] = [
  { id: "dawn", src: "/scene-dawn.png", label: "早朝" },
  { id: "midday", src: "/scene-midday.png", label: "昼" },
  { id: "golden", src: "/scene-golden.png", label: "夕暮れ" },
  { id: "night", src: "/scene-night.png", label: "夜" },
]

const EXPAND_MS = 1300

type Rect = { top: number; left: number; width: number; height: number }

export function SceneSelect({ onEnter }: { onEnter: (scene: Scene) => void }) {
  const [chosen, setChosen] = useState<Scene | null>(null)
  const [from, setFrom] = useState<Rect | null>(null)
  const [grown, setGrown] = useState(false)
  const busy = useRef(false)

  const pick = (scene: Scene, el: HTMLElement) => {
    if (busy.current) return
    busy.current = true
    const r = el.getBoundingClientRect()
    setFrom({ top: r.top, left: r.left, width: r.width, height: r.height })
    setChosen(scene)
    requestAnimationFrame(() => requestAnimationFrame(() => setGrown(true)))
    window.setTimeout(() => onEnter(scene), EXPAND_MS)
  }

  return (
    <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
      <div
        style={{
          display: 'grid',
          height: '100%',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '20px',
          opacity: chosen ? 0 : 1,
          transition: 'opacity 0.7s',
          animation: chosen ? undefined : 'lunaria-fade-in 2.4s ease-out both',
        }}
      >
        {SCENES.map((scene, i) => (
          <button
            key={scene.id}
            type="button"
            aria-label={scene.label}
            onClick={(e) => pick(scene, e.currentTarget)}
            style={{
              position: 'relative',
              overflow: 'hidden',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              animation: `lunaria-fade-in 1.8s ease-out ${i * 260}ms both`,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${scene.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'transform 1.4s ease-out',
              }}
            />
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                boxShadow: 'inset 0 0 44px 14px rgba(72,74,68,0.22)',
                background: 'radial-gradient(120% 100% at 50% 50%, transparent 42%, rgba(72,74,68,0.14) 100%)',
              }}
            />
          </button>
        ))}
      </div>

      {chosen && from && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            zIndex: 30,
            backgroundImage: `url(${chosen.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            top: grown ? 0 : from.top,
            left: grown ? 0 : from.left,
            width: grown ? '100vw' : from.width,
            height: grown ? '100svh' : from.height,
            transition: `top ${EXPAND_MS}ms cubic-bezier(0.22,0.61,0.24,1), left ${EXPAND_MS}ms cubic-bezier(0.22,0.61,0.24,1), width ${EXPAND_MS}ms cubic-bezier(0.22,0.61,0.24,1), height ${EXPAND_MS}ms cubic-bezier(0.22,0.61,0.24,1)`,
          }}
        />
      )}
    </div>
  )
}