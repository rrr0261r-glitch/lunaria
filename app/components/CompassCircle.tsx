'use client';
import { useEffect, useRef, useState } from 'react';

const SIZE = 360;
const C = 180;
const R = 152;

const PROMPTS: Record<string, string> = {
  warmHigh: 'その高鳴りは、どこから来たのでしょう',
  coldHigh: 'ざわめきの奥に、何がありそうですか',
  warmCalm: 'その穏やかさを、ひとことで残すなら',
  coldCalm: '冷えた静けさにも、名前をつけてあげるなら',
};

function pad(n: number) { return String(n).padStart(2, '0'); }
function keyFor(d: Date) {
  return `lunaria_note_${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function monthPrefix(d: Date) {
  return `lunaria_note_${d.getFullYear()}-${pad(d.getMonth() + 1)}-`;
}

// 位置 → 色(HSL)
function getMoodColor(x: number, y: number): string {
  const nx = (x - C) / R; // -1〜1 右が+
  const ny = (y - C) / R; // -1〜1 下が+
  // 角度: 右=0°, 上=90°, 左=180°, 下=270°
  const angle = Math.atan2(-ny, nx) * (180 / Math.PI);
  const hue = ((angle % 360) + 360) % 360;
  const dist = Math.min(Math.sqrt(nx * nx + ny * ny), 1);
  const sat = 30 + dist * 45;   // 中心:30% 端:75%
  const lig = 58 - dist * 18;   // 中心:淡 端:鮮やか
  return `hsl(${hue.toFixed(1)}, ${sat.toFixed(1)}%, ${lig.toFixed(1)}%)`;
}

type Star = { x: number; y: number; day: string };

export function CompassCircle() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const [drawn, setDrawn] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [text, setText] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const [pastStars, setPastStars] = useState<Star[]>([]);

  // 初回ガイド
const [showGuide, setShowGuide] = useState(false);

useEffect(() => {
  try {
    if (!localStorage.getItem('lunaria_compass_guided')) {
      setShowGuide(true);
    }
  } catch {}
}, []);

function dismissGuide() {
  try { localStorage.setItem('lunaria_compass_guided', '1'); } catch {}
  setShowGuide(false);
}

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
            setPrompt(promptFor(x, y));
            if (typeof obj.moodText === 'string') setText(obj.moodText);
            requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
          } else {
            stars.push({ x, y, day: k.slice(prefix.length) });
          }
        } catch {}
      }
      stars.sort((a, b) => a.day.localeCompare(b.day));
      setPastStars(stars);
    } catch {}
  }, []);

  function promptFor(x: number, y: number) {
    const warm = x >= C, high = y < C;
    return PROMPTS[(warm ? 'warm' : 'cold') + (high ? 'High' : 'Calm')];
  }

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * SIZE;
    const y = ((e.clientY - rect.top) / rect.height) * SIZE;
    const dx = x - C, dy = y - C;
    if (dx * dx + dy * dy > R * R) return;
    setDrawn(false);
    setPoint({ x, y });
    setPrompt(promptFor(x, y));
    requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
  }

  function handleSave() {
    if (!point) return;
    try {
      const k = keyFor(new Date());
      let existing: Record<string, unknown> = {};
      try { existing = JSON.parse(localStorage.getItem(k) || '{}'); } catch {}
      localStorage.setItem(k, JSON.stringify({
        ...existing,
        moodX: (point.x - C) / R,
        moodY: (point.y - C) / R,
        moodText: text,
        quadrant: promptFor(point.x, point.y),
        updatedAt: new Date().toISOString(),
      }));
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2400);
    } catch (e) { console.error(e); }
  }

  const ticks = [];
  for (let i = 0; i < 72; i++) {
    const a = (i * 5) * Math.PI / 180;
    const major = i % 18 === 0, mid = i % 3 === 0;
    const r2 = major ? R - 9 : (mid ? R - 5 : R - 2.5);
    ticks.push(
      <line key={i}
        x1={parseFloat((C + R * Math.cos(a)).toFixed(4))}
        y1={parseFloat((C + R * Math.sin(a)).toFixed(4))}
        x2={parseFloat((C + r2 * Math.cos(a)).toFixed(4))}
        y2={parseFloat((C + r2 * Math.sin(a)).toFixed(4))}
        strokeWidth={major ? 0.9 : 0.5} />
    );
  }

  // 色相環: 360分割のくさび形
  const huePetals = [];
  const steps = 120;
  for (let i = 0; i < steps; i++) {
    const a1 = (i / steps) * Math.PI * 2;
    const a2 = ((i + 1) / steps) * Math.PI * 2;
    const hue = (i / steps) * 360;
    const x1 = parseFloat((C + R * Math.cos(a1)).toFixed(4));
    const y1 = parseFloat((C + R * Math.sin(a1)).toFixed(4));
    const x2 = parseFloat((C + R * Math.cos(a2)).toFixed(4));
    const y2 = parseFloat((C + R * Math.sin(a2)).toFixed(4));
    huePetals.push(
      <path key={i}
        d={`M${C},${C} L${x1},${y1} A${R},${R} 0 0,1 ${x2},${y2} Z`}
        fill={`hsl(${hue.toFixed(1)},60%,65%)`}
        opacity="0.22"
      />
    );
  }

  const chain = [...pastStars.map(s => `${s.x},${s.y}`)];
  if (point) chain.push(`${point.x},${point.y}`);
  const needleLen = point ? Math.hypot(point.x - C, point.y - C) : 0;
  const tailLen = point ? Math.min(24, needleLen * 0.3) : 0;
  const moodColor = point ? getMoodColor(point.x, point.y) : '#A98F4E';

  return (
    <div className="compass-wrap">
      {/* 初回ガイド */}
{showGuide && (
  <div style={{
    position: 'absolute', inset: 0, zIndex: 10,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'rgba(251,248,239,0.92)',
    borderRadius: '50%',
    padding: '32px 24px',
    textAlign: 'center',
    cursor: 'pointer',
  }} onClick={dismissGuide}>
    <p style={{
      fontFamily: "'Shippori Mincho', serif",
      fontSize: '13px',
      lineHeight: 2.2,
      letterSpacing: '0.12em',
      color: '#2D4A3E',
      marginBottom: '20px',
    }}>
      円の中をタップして<br />
      今日の心を置いてみてください<br />
      <br />
      上 → たかぶり・高揚<br />
      下 → しずか・落ち着き<br />
      右 → あたたかい・つながり<br />
      左 → つめたい・孤独・集中
    </p>
    <span style={{
      fontSize: '11px',
      letterSpacing: '0.2em',
      color: '#8A7358',
    }}>タップして始める</span>
  </div>
)}
      <span className="axis-label ax-top">たかぶり</span>
      <span className="axis-label ax-left">つめたい</span>
      <span className="axis-label ax-right">あたたかい</span>

      <svg ref={svgRef} viewBox={`0 0 ${SIZE} ${SIZE}`} onClick={handleClick}
        style={{ width: '100%', height: 'auto', display: 'block', cursor: 'pointer' }}>
        {/* ベース */}
        <circle cx={C} cy={C} r={R} fill="#FBF8EF" fillOpacity="0.45" />

        {/* 淡い色相環 */}
        <g>{huePetals}</g>

        {/* 中心を白くぼかしてなじませる */}
        <radialGradient id="centerFade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FBF8EF" stopOpacity="0.92" />
          <stop offset="55%" stopColor="#FBF8EF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FBF8EF" stopOpacity="0" />
        </radialGradient>
        <circle cx={C} cy={C} r={R} fill="url(#centerFade)" />

        {/* 真鍮リング */}
        <circle cx={C} cy={C} r={R + 8} fill="none" stroke="#A98F4E" strokeWidth="0.7" opacity="0.75" />
        <circle cx={C} cy={C} r={R} fill="none" stroke="#A98F4E" strokeWidth="1.2" />

        <g stroke="#8A7358" opacity="0.5">{ticks}</g>

        {/* 四方の方位印 */}
        <g fill="none" stroke="#A98F4E" strokeWidth="0.8" opacity="0.8">
          <path d={`M${C} 22 L${C + 4} 34 L${C} 30 L${C - 4} 34 Z`} fill="#A98F4E" />
          <path d={`M${C} ${SIZE - 22} L${C + 4} ${SIZE - 34} L${C} ${SIZE - 30} L${C - 4} ${SIZE - 34} Z`} />
          <path d={`M22 ${C} L34 ${C - 4} L30 ${C} L34 ${C + 4} Z`} />
          <path d={`M${SIZE - 22} ${C} L${SIZE - 34} ${C - 4} L${SIZE - 30} ${C} L${SIZE - 34} ${C + 4} Z`} />
        </g>

        {/* 軸線 */}
        <line x1={C} y1={C - R + 12} x2={C} y2={C + R - 12} stroke="#4A4A42" strokeWidth="0.5" opacity="0.16" />
        <line x1={C - R + 12} y1={C} x2={C + R - 12} y2={C} stroke="#4A4A42" strokeWidth="0.5" opacity="0.16" />

        {/* 今月の星座 */}
        {chain.length >= 2 && (
          <polyline points={chain.join(' ')} fill="none"
            stroke="#A98F4E" strokeWidth="0.6" opacity="0.4" />
        )}
        {pastStars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r="2.8"
            fill={getMoodColor(s.x, s.y)} opacity="0.55" />
        ))}

        {/* 針 */}
        {point && (
          <>
            <line x1={C} y1={C}
              x2={C - (point.x - C) / needleLen * tailLen}
              y2={C - (point.y - C) / needleLen * tailLen}
              stroke="#4A4A42" strokeWidth="0.5" opacity="0.35" />
            <line x1={C} y1={C} x2={point.x} y2={point.y}
              stroke="#4A4A42" strokeWidth="0.9" opacity="0.75"
              strokeDasharray={needleLen}
              strokeDashoffset={drawn ? 0 : needleLen}
              style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.3,.7,.3,1)' }} />
          </>
        )}

        {/* 軸受 */}
        <circle cx={C} cy={C} r="3.4" fill="none" stroke="#A98F4E" strokeWidth="0.9" />
        <circle cx={C} cy={C} r="1.2" fill="#4A4A42" />

        {/* 今日の点:位置連動の色 */}
        {point && (
          <g>
            <circle cx={point.x} cy={point.y} r="11"
              fill="none" stroke={moodColor} strokeWidth="0.8" opacity="0.5" />
            <circle cx={point.x} cy={point.y} r="4.5" fill={moodColor} />
          </g>
        )}

      </svg>

      <p className={`needle-word ${point ? 'show' : ''}`}>
        今日、心はこちらを指しました
      </p>

      <div className={`compass-prompt ${point ? 'open' : ''}`}>
        <p className="compass-q">{prompt}</p>
        <textarea rows={2} value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="ひとことでも、じゅうぶん" />
        <div className="compass-actions">
          <span className={`compass-saved ${savedFlash ? 'show' : ''}`}>残しました</span>
          <button className="compass-save" onClick={handleSave}>残 す</button>
        </div>
      </div>

     {/* しずかラベル：タップ前のみ表示 */}
{!point && (
  <p style={{
    textAlign: 'center',
    fontSize: '11px',
    letterSpacing: '0.3em',
    color: '#C9959A',
    fontFamily: "'Shippori Mincho', serif",
    fontWeight: 600,
    margin: '10px 0 0',
  }}>しずか</p>
)}
    </div>
  );    
  }