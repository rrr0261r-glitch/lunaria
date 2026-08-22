"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { EmotionCircle2, type EmotionPoint } from "./EmotionCircle2"
import { SceneSelect, type Scene } from "./SceneSelect"

function readEmotion(text: string, index: number): EmotionPoint {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0
  const a = ((h % 997) / 997) * Math.PI * 2
  const r = 0.25 + ((h >> 7) % 1000) / 1000 * 0.6
  const x = Math.cos(a) * r
  const y = Math.sin(a) * r
  const hue = h % 360
  const sat = 20 + ((h >> 3) % 26)
  const light = 48 + ((h >> 5) % 22)
  return {
    id: `${Date.now()}-${index}`,
    x,
    y,
    color: `hsl(${hue} ${sat}% ${light}%)`,
  }
}

const SEED: EmotionPoint[] = [
  { id: "s1", x: -0.34, y: -0.22, color: "hsl(150 26% 60%)" },
  { id: "s2", x: 0.28, y: -0.38, color: "hsl(38 30% 64%)" },
  { id: "s3", x: 0.44, y: 0.2, color: "hsl(196 24% 58%)" },
  { id: "s4", x: -0.12, y: 0.4, color: "hsl(172 22% 55%)" },
]

type Phase = "scene" | "writing" | "placed"

export function LunariaToday() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>("scene")
  const [scene, setScene] = useState<Scene | null>(null)
  const [text, setText] = useState("")
  const [past, setPast] = useState<EmotionPoint[]>(SEED)
  const [latest, setLatest] = useState<EmotionPoint | null>(null)
  const countRef = useRef(0)
  
  useEffect(() => {
    try {
      if (!localStorage.getItem('lunaria_intro_seen')) {
        router.push('/intro')
      }
    } catch {}
  }, [router])

  const hasText = text.trim().length > 0

  const keep = () => {
    if (!hasText) return
    const point = readEmotion(text.trim(), countRef.current++)
    setLatest(point)
    setPhase("placed")
  }

  const returnToWriting = () => {
    if (latest) setPast((p) => [...p, latest])
    setLatest(null)
    setText("")
    setPhase("writing")
  }

  const background = useMemo(() => (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${scene?.src ?? "/morning-light.png"})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'lunaria-drift 40s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          mixBlendMode: 'soft-light',
          background: 'radial-gradient(38% 30% at 32% 24%, rgba(255,248,238,0.9) 0%, transparent 60%), radial-gradient(30% 26% at 72% 40%, rgba(255,250,240,0.7) 0%, transparent 62%), radial-gradient(46% 40% at 54% 78%, rgba(168,191,192,0.5) 0%, transparent 66%)',
          animation: 'lunaria-caustic 26s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(120% 90% at 50% 40%, rgba(238,233,224,0.08) 0%, rgba(238,233,224,0.44) 55%, rgba(224,222,210,0.76) 100%)',
          pointerEvents: 'none',
        }}
      />
    </>
  ), [scene])

  return (
    <main style={{
      position: 'relative',
      display: 'flex',
      minHeight: '100svh',
      flexDirection: 'column',
      overflow: 'hidden',
      background: '#eee9e0',
    }}>
      {background}

      {phase !== "scene" && (
        <header style={{
          position: 'relative',
          zIndex: 20,
          padding: '32px 28px 0',
        }}>
          <h1 style={{
            fontFamily: "'IM Fell English', serif",
            fontStyle: 'italic',
            fontSize: '20px',
            letterSpacing: '0.4em',
            color: phase === "writing"
              ? 'rgba(74,84,76,0.4)'
              : 'rgba(74,84,76,0.2)',
            transition: 'color 1s',
          }}>
            Lunaria
          </h1>
        </header>
      )}

      {phase === "scene" ? (
        <SceneSelect
          onEnter={(s) => {
            setScene(s)
            setPhase("writing")
          }}
        />
      ) : phase === "writing" ? (
        <section style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 32px 96px',
          animation: 'lunaria-fade-in 2s ease-out both',
        }}>
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="今日のことを、そのまま。"
            rows={5}
            style={{
              width: '100%',
              maxWidth: '320px',
              resize: 'none',
              border: 'none',
              background: 'transparent',
              textAlign: 'center',
              fontFamily: "'Shippori Mincho', serif",
              fontSize: '18px',
              fontWeight: 'normal',
              lineHeight: 2,
              letterSpacing: '0.12em',
              color: 'rgba(74,84,76,0.85)',
              outline: 'none',
            }}
          />

          <button
            type="button"
            onClick={keep}
            style={{
              marginTop: '48px',
              fontFamily: "'Shippori Mincho', serif",
              fontSize: '16px',
              letterSpacing: '0.5em',
              color: 'rgba(74,84,76,0.6)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              opacity: hasText ? 1 : 0,
              pointerEvents: hasText ? 'auto' : 'none',
              transition: 'opacity 0.7s, color 0.3s',
            }}
          >
            place
          </button>
        </section>
      ) : (
        <button
          type="button"
          onClick={returnToWriting}
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 32px 96px',
            background: 'transparent',
            border: 'none',
            cursor: 'default',
            outline: 'none',
          }}
        >
          <EmotionCircle2 past={past} latest={latest} />
          <span style={{
            marginTop: '56px',
            fontFamily: "'Shippori Mincho', serif",
            fontSize: '14px',
            letterSpacing: '0.6em',
            color: 'rgba(74,84,76,0.7)',
            animation: 'lunaria-whisper 6s ease-in-out both',
          }}>
            残しました
          </span>
        </button>
      )}
    </main>
  )
}
