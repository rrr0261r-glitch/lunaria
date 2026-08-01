'use client';
// app/components/CompassCircle.tsx
// 心の羅針盤:点を置くと中心から墨の針が引かれ、今月の点が星座として繋がる
// 保存: lunaria_note_YYYY-MM-DD に既存フィールドを保持したままマージ

import { useEffect, useRef, useState } from 'react';

const SIZE = 360;
const C = 180;      // 中心
const R = 152;      // 内リング半径

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

type Star = { x: number; y: number; day: string };

export function CompassCircle() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const [drawn, setDrawn] = useState(false);       // 針の描画トリガ
  const [prompt, setPrompt] = useState('');
  const [text, setText] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const [pastStars, setPastStars] = useState<Star[]>([]);

  // 今月の過去の点と、今日の既存記録を読み込む
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
    if (dx * dx + dy * dy > R * R) return; // 円の外は無視

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
        ...existing,                              // 既存フィールド(暦の記録など)を保持
        moodX: (point.x - C) / R,                 // -1〜1 の正規化座標
        moodY: (point.y - C) / R,
        moodText: text,
        quadrant: promptFor(point.x, point.y),
        updatedAt: new Date().toISOString(),
      }));
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2400);
    } catch (e) { console.error(e); }
  }

  // 目盛(5°刻み、90°ごとに長く)
  const ticks = [];
  for (let i = 0; i < 72; i++) {
    const a = (i * 5) * Math.PI / 180;
    const major = i % 18 === 0, mid = i % 3 === 0;
    const r2 = major ? R - 9 : (mid ? R - 5 : R - 2.5);
    ticks.push(
      <line key={i}
        x1={C + R * Math.cos(a)} y1={C + R * Math.sin(a)}
        x2={C + r2 * Math.cos(a)} y2={C + r2 * Math.sin(a)}
        strokeWidth={major ? 0.9 : 0.5} />
    );
  }

  // 星座:過去の点(時系列)+ 今日の点
  const chain = [...pastStars.map(s => `${s.x},${s.y}`)];
  if (point) chain.push(`${point.x},${point.y}`);
  const needleLen = point ? Math.hypot(point.x - C, point.y - C) : 0;
  const tailLen = point ? Math.min(24, needleLen * 0.3) : 0;

  return (
    <div className="compass-wrap">
      <span className="axis-label ax-top">たかぶり</span>
      <span className="axis-label ax-bottom">しずか</span>
      <span className="axis-label ax-left">つめたい</span>
      <span className="axis-label ax-right">あたたかい</span>

      <svg ref={svgRef} viewBox={`0 0 ${SIZE} ${SIZE}`} onClick={handleClick}
        style={{ width: '100%', height: 'auto', display: 'block', cursor: 'pointer' }}>

        <circle cx={C} cy={C} r={R} fill="#FBF8EF" fillOpacity="0.45" />

        {/* 真鍮の二重リング */}
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

        {/* 軸線:囁く程度 */}
        <line x1={C} y1={C - R + 12} x2={C} y2={C + R - 12} stroke="#4A4A42" strokeWidth="0.5" opacity="0.16" />
        <line x1={C - R + 12} y1={C} x2={C + R - 12} y2={C} stroke="#4A4A42" strokeWidth="0.5" opacity="0.16" />

        {/* 今月の星座 */}
        {chain.length >= 2 && (
          <polyline points={chain.join(' ')} fill="none"
            stroke="#A98F4E" strokeWidth="0.6" opacity="0.4" />
        )}
        {pastStars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r="2.8" fill="#A98F4E" opacity="0.45" />
        ))}

        {/* 針:中心の軸から、今日の心の方角へ */}
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

        {/* 軸受(真鍮の芯) */}
        <circle cx={C} cy={C} r="3.4" fill="none" stroke="#A98F4E" strokeWidth="0.9" />
        <circle cx={C} cy={C} r="1.2" fill="#4A4A42" />

        {/* 今日の点:墨の一滴であり、今夜の星 */}
        {point && (
          <g>
            <circle className="today-halo" cx={point.x} cy={point.y} r="11"
              fill="none" stroke="#A98F4E" strokeWidth="0.7" />
            <circle cx={point.x} cy={point.y} r="4.5" fill="#A98F4E" />
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
    </div>
  );
}
