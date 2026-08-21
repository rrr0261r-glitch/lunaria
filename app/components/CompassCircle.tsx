'use client';
import { useEffect, useRef, useState } from 'react';

const SIZE = 360;
const C = 180;
const R = 152;

function pad(n: number) { return String(n).padStart(2, '0'); }
function keyFor(d: Date) {
  return `lunaria_note_${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function monthPrefix(d: Date) {
  return `lunaria_note_${d.getFullYear()}-${pad(d.getMonth() + 1)}-`;
}

type Star = { x: number; y: number; day: string; color: string };
type Phase = 'write' | 'analyzing' | 'placed';

export function CompassCircle() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [phase, setPhase] = useState<Phase>('write');
  const [inputText, setInputText] = useState('');
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const [moodColor, setMoodColor] = useState('#C4BFB4');
  const [ripples, setRipples] = useState<{ id: number; r: number; opacity: number }[]>([]);
  const [pastStars, setPastStars] = useState<Star[]>([]);
  const [savedFlash, setSavedFlash] = useState(false);
  const rippleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 今月の過去の点を読み込む
  useEffect(() => {
    try {
      const now = new Date();
      const prefix = monthPrefix(now);
      const todayKey = keyFor(now);
      const stars: Star[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith(prefix)) continue;
        try {
          const obj = JSON.parse(localStorage.getItem(k) || '{}');
          if (typeof obj.moodX !== 'number' || typeof obj.moodY !== 'number') continue;
          const x = C + obj.moodX * R;
          const y = C + obj.moodY * R;
          if (k === todayKey) {
            setPoint({ x, y });
            setMoodColor(obj.moodColor || '#C4BFB4');
            setPhase('placed');
            if (typeof obj.moodText === 'string') setInputText(obj.moodText);
          } else {
            stars.push({ x, y, day: k.slice(prefix.length), color: obj.moodColor || '#C4BFB4' });
          }
        } catch {}
      }
      stars.sort((a, b) => a.day.localeCompare(b.day));
      setPastStars(stars);
    } catch {}
  }, []);

  // 波紋アニメーション
  function startRipple(x: number, y: number) {
    let count = 0;
    const id = Date.now();
    setRipples([{ id, r: 0, opacity: 0.6 }]);

    rippleRef.current = setInterval(() => {
      count++;
      setRipples(prev => prev
        .map(r => ({ ...r, r: r.r + 3, opacity: r.opacity - 0.02 }))
        .filter(r => r.opacity > 0)
      );
      if (count > 30) {
        if (rippleRef.current) clearInterval(rippleRef.current);
        setRipples([]);
      }
    }, 30);
  }

  // Claude APIで感情分析→座標を決める
  async function analyzeAndPlace() {
    if (!inputText.trim()) return;
    setPhase('analyzing');

    try {
      const res = await fetch('/api/analyze-mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();

      // x: -1(つめたい)〜1(あたたかい)
      // y: -1(たかぶり)〜1(しずか)
      const nx = Math.max(-0.95, Math.min(0.95, data.x ?? 0));
      const ny = Math.max(-0.95, Math.min(0.95, data.y ?? 0));
      const color = data.color ?? '#C4BFB4';

      const px = C + nx * R;
      const py = C + ny * R;

      setPoint({ x: px, y: py });
      setMoodColor(color);
      setPhase('placed');
      startRipple(px, py);
      save(nx, ny, color);

    } catch {
      // フォールバック：中心付近にランダム配置
      const nx = (Math.random() - 0.5) * 0.4;
      const ny = (Math.random() - 0.5) * 0.4;
      const color = '#A8BFC0';
      const px = C + nx * R;
      const py = C + ny * R;
      setPoint({ x: px, y: py });
      setMoodColor(color);
      setPhase('placed');
      startRipple(px, py);
      save(nx, ny, color);
    }
  }

  function save(nx: number, ny: number, color: string) {
    try {
      const k = keyFor(new Date());
      let existing: Record<string, unknown> = {};
      try { existing = JSON.parse(localStorage.getItem(k) || '{}'); } catch {}
      localStorage.setItem(k, JSON.stringify({
        ...existing,
        moodX: nx,
        moodY: ny,
        moodColor: color,
        moodText: inputText,
        updatedAt: new Date().toISOString(),
      }));
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2400);
    } catch {}
  }

  // 星座の線
  const chain = [...pastStars.map(s => `${s.x},${s.y}`)];
  if (point) chain.push(`${point.x},${point.y}`);

  return (
    <div className="compass-wrap">

      {/* 書く画面 */}
      {phase === 'write' && (
        <div className="lunaria-write">
          <textarea
            className="lunaria-textarea"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="今日のことを、そのまま。"
            rows={4}
          />
          <button
            className="lunaria-send"
            onClick={analyzeAndPlace}
            disabled={!inputText.trim()}
          >
            残す
          </button>
        </div>
      )}

      {/* 分析中 */}
      {phase === 'analyzing' && (
        <div className="lunaria-analyzing">
          <p>読み取っています</p>
        </div>
      )}

      {/* 羅針盤 */}
      {phase === 'placed' && (
        <>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          >
            {/* ベース円 */}
            <circle cx={C} cy={C} r={R} fill="rgba(200,210,205,0.08)" />
            <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(200,210,205,0.25)" strokeWidth="0.8" />

            {/* 星座の線 */}
            {chain.length >= 2 && (
              <polyline
                points={chain.join(' ')}
                fill="none"
                stroke="rgba(200,210,205,0.3)"
                strokeWidth="0.5"
              />
            )}

            {/* 過去の点 */}
            {pastStars.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r="2.5"
                fill={s.color} opacity="0.4" />
            ))}

            {/* 波紋 */}
            {point && ripples.map(rp => (
              <circle key={rp.id}
                cx={point.x} cy={point.y}
                r={rp.r}
                fill="none"
                stroke={moodColor}
                strokeWidth="0.8"
                opacity={rp.opacity}
              />
            ))}

            {/* 今日の点 */}
            {point && (
              <circle
                cx={point.x} cy={point.y}
                r="5"
                fill={moodColor}
                opacity="0.85"
              />
            )}

            {/* 中心 */}
            <circle cx={C} cy={C} r="1.5" fill="rgba(200,210,205,0.4)" />
          </svg>

          <p className={`compass-saved ${savedFlash ? 'show' : ''}`} style={{ textAlign: 'center', marginTop: '16px' }}>
            残しました
          </p>
        </>
      )}
    </div>
  );
}