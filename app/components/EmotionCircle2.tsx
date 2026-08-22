"use client"

export type EmotionPoint = {
  id: string
  x: number
  y: number
  color: string
}

export function EmotionCircle2({
  past,
  latest,
}: {
  past: EmotionPoint[]
  latest: EmotionPoint | null
}) {
  const all = latest ? [...past, latest] : past

  const place = (p: EmotionPoint) => ({
    left: `${50 + p.x * 42}%`,
    top: `${50 + p.y * 42}%`,
  })

  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: '1',
        width: 'min(78vw, 20rem)',
        animation: 'lunaria-circle-in 2.6s cubic-bezier(0.22,1,0.36,1) both',
      }}
    >
      {/* 境界の円 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          borderRadius: '50%',
          border: '1px solid rgba(74,84,76,0.15)',
          background: 'radial-gradient(120% 120% at 50% 30%, rgba(255,250,242,0.5) 0%, rgba(181,196,177,0.28) 45%, rgba(168,191,192,0.34) 100%)',
          boxShadow: 'inset 0 0 70px rgba(255,248,238,0.4), inset 0 -14px 40px rgba(122,140,124,0.18), 0 6px 50px rgba(122,140,124,0.12)',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '-25%',
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,250,242,0.45) 60deg, transparent 150deg, rgba(168,191,192,0.35) 250deg, transparent 340deg)',
            animation: 'lunaria-water-sheen 64s linear infinite',
          }}
        />
      </div>

      {/* 星座の線 */}
      <svg
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {all.slice(1).map((p, i) => {
          const prev = all[i]
          return (
            <line
              key={p.id}
              x1={50 + prev.x * 42}
              y1={50 + prev.y * 42}
              x2={50 + p.x * 42}
              y2={50 + p.y * 42}
              stroke="rgba(74,84,76,0.2)"
              strokeWidth={0.25}
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
      </svg>

      {/* 過去の点（星） */}
      {past.map((p, i) => (
        <span
          key={p.id}
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            ...place(p),
            background: p.color,
            boxShadow: `0 0 8px 1px ${p.color}`,
            animation: `lunaria-twinkle ${6 + (i % 4)}s ease-in-out ${i * 0.4}s infinite`,
          }}
        />
      ))}

      {/* 今日の点（波紋つき） */}
      {latest && (
        <>
          {[0.4, 1.3, 2.2].map((delay, i) => (
            <span
              key={`ring-${i}`}
              aria-hidden="true"
              style={{
                position: 'absolute',
                borderRadius: '50%',
                border: '1px solid rgba(74,84,76,0.25)',
                height: '70%',
                width: '70%',
                ...place(latest),
                animation: `lunaria-water-ring 4.6s cubic-bezier(0.22,0.61,0.36,1) ${delay}s both`,
              }}
            />
          ))}
          <span
            style={{
              position: 'absolute',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              ...place(latest),
              background: latest.color,
              boxShadow: `0 0 22px 5px ${latest.color}, 0 0 0 6px rgba(255,255,255,0.14)`,
              animation: 'lunaria-point-in 2.2s cubic-bezier(0.22,1,0.36,1) both',
            }}
          />
        </>
      )}
    </div>
  )
}