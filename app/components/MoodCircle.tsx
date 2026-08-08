'use client';
import { useState, useRef, useEffect } from 'react';

// 2軸で決まる、心の位置に応じた問い
function getPrompt(x: number, y: number): string {
  const warm = x >= 0;
  const high = y >= 0;
  if (high && warm) return '今日、何があなたの心を高鳴らせましたか？';
  if (high && !warm) return '今日、何が心をざわつかせましたか？';
  if (!high && warm) return '今日、どんな瞬間に、心がやすらぎましたか？';
  return '今日、何があなたを、そっと沈ませましたか？';
}

function getMoodWord(x: number, y: number): string {
  const warm = x >= 0;
  const high = y >= 0;
  if (high && warm) return 'たかぶり、あたたかい';
  if (high && !warm) return 'たかぶり、つめたい';
  if (!high && warm) return 'しずか、あたたかい';
  return 'しずか、つめたい';
}
// 点の位置から、固有の色を計算する
// 角度 = 何色か（上赤→右橙→下青→左緑、なめらかに）
// 中心からの距離 = どれだけ鮮やかか
  function getMoodColor(x: number, y: number): string {
  // 角度を出す（上を0度として時計回り）
  // y は画面座標なので上が負。上向きを正にして扱う
  const angle = Math.atan2(x, y) * (180 / Math.PI); // -180〜180
  const deg = (angle + 360) % 360; // 0〜360

  // 4方向に色相を割り当て、間はなめらかに補間
  // 上(0°)=赤14 / 右(90°)=橙32 / 下(180°)=青210 / 左(270°)=緑130
  const stops = [
    { d: 0,   h: 14  },  // 上・赤
    { d: 90,  h: 32  },  // 右・オレンジ
    { d: 180, h: 210 },  // 下・青
    { d: 270, h: 130 },  // 左・緑
    { d: 360, h: 14  },  // 一周して赤に戻る
  ];
  let hue = 14;
  for (let i = 0; i < stops.length - 1; i++) {
    if (deg >= stops[i].d && deg <= stops[i + 1].d) {
      const t = (deg - stops[i].d) / (stops[i + 1].d - stops[i].d);
      // 色相を最短距離で補間
      let h1 = stops[i].h;
      let h2 = stops[i + 1].h;
      if (Math.abs(h2 - h1) > 180) {
        if (h2 > h1) h1 += 360; else h2 += 360;
      }
      hue = (h1 + (h2 - h1) * t) % 360;
      break;
    }
  }

  // 中心からの距離（0〜1）で、鮮やかさと明るさを決める
  const dist = Math.min(1, Math.sqrt(x * x + y * y));
  const sat = 20 + dist * 45;   // 中心は淡く(20%)、端は鮮やか(65%)
  const light = 72 - dist * 20; // 中心は明るく、端は少し濃く

  return `hsl(${Math.round(hue)}, ${Math.round(sat)}%, ${Math.round(light)}%)`;
}


function todayKey() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

interface Props {
  onSaved?: () => void;
}

export function MoodCircle({ onSaved }: Props) {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const circleRef = useRef<HTMLDivElement>(null);

  const SIZE = 260;
  const key = `lunaria_note_${todayKey()}`;

  // 既に今日の記録があれば読み込む
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw);
        if (typeof data.moodX === 'number' && typeof data.moodY === 'number') {
          setPoint({ x: data.moodX, y: -data.moodY });
        }
        if (data.kidzuki) setNote(data.kidzuki);
      }
    } catch {}
  }, [key]);

  function handleTap(clientX: number, clientY: number) {
    const el = circleRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let nx = (clientX - cx) / (rect.width / 2);
    let ny = (clientY - cy) / (rect.height / 2);
    const dist = Math.sqrt(nx * nx + ny * ny);
    if (dist > 1) { nx /= dist; ny /= dist; }
    setPoint({ x: nx, y: ny });
    setSaved(false);
  }

  function handleSave() {
    if (!point) return;
    try {
      const raw = localStorage.getItem(key);
      const existing = raw ? JSON.parse(raw) : {};
      const data = {
        ...existing,
        moodX: point.x,
        moodY: -point.y, // 上向きが正
        moodWord: getMoodWord(point.x, -point.y),
        kidzuki: note || existing.kidzuki || '',
      };
      localStorage.setItem(key, JSON.stringify(data));
      setSaved(true);
      onSaved?.();
      setTimeout(() => setSaved(false), 2500);
    } catch {}
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      <div style={{ fontSize: 11, letterSpacing: '0.3em', color: '#8C816C', marginBottom: 10 }}>
        たかぶり
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          fontSize: 11, letterSpacing: '0.2em', color: '#8C816C',
          writingMode: 'vertical-rl' as const,
        }}>
          つめたい
        </div>

        <div
          ref={circleRef}
          onClick={(e) => handleTap(e.clientX, e.clientY)}
          onTouchStart={(e) => {
            const t = e.touches[0];
            handleTap(t.clientX, t.clientY);
          }}
          style={{
            width: SIZE, height: SIZE, borderRadius: '50%',
            border: '1px solid #CBBFA6',
            background: 'radial-gradient(circle at 50% 50%, rgba(246,241,229,0.9) 0%, rgba(238,230,212,0.6) 100%)',
            position: 'relative', cursor: 'pointer',
            boxShadow: 'inset 0 0 40px rgba(203,191,166,0.3)',
          }}
        >
          <div style={{
            position: 'absolute', left: '50%', top: 0, bottom: 0,
            width: 1, background: 'rgba(203,191,166,0.4)', transform: 'translateX(-0.5px)',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: 0, right: 0,
            height: 1, background: 'rgba(203,191,166,0.4)', transform: 'translateY(-0.5px)',
          }} />

          {point && (
            <div style={{
              position: 'absolute',
              left: `calc(50% + ${point.x * (SIZE / 2)}px)`,
              top: `calc(50% + ${point.y * (SIZE / 2)}px)`,
              width: 16, height: 16, borderRadius: '50%',
              background: point ? getMoodColor(point.x, point.y) : '#C9A87C',
              boxShadow: point
                ? `0 0 20px ${getMoodColor(point.x, point.y)}, 0 0 0 6px ${getMoodColor(point.x, point.y)}33`
                : '0 0 16px rgba(201,168,124,0.9)',
              transition: 'left 0.3s ease, top 0.3s ease',
            }} />
          )}
        </div>

        <div style={{
          fontSize: 11, letterSpacing: '0.2em', color: '#8C816C',
          writingMode: 'vertical-rl' as const,
        }}>
          あたたかい
        </div>
      </div>

      <div style={{ fontSize: 11, letterSpacing: '0.3em', color: '#8C816C', marginTop: 10 }}>
        しずか
      </div>

      {point && (
        <div style={{ marginTop: 32, width: '100%', maxWidth: 320 }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic', fontSize: 11,
            color: '#B0A588', letterSpacing: '0.15em',
            textAlign: 'center', marginBottom: 14,
          }}>
            {getMoodWord(point.x, -point.y)}
          </div>
          <div style={{
            fontSize: 14, color: '#5A5142', lineHeight: 2,
            textAlign: 'center', marginBottom: 18, letterSpacing: '0.05em',
          }}>
            {getPrompt(point.x, -point.y)}
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="ひとことでも、書かなくても。"
            rows={2}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.5)',
              border: 'none', borderBottom: '1px solid #CBBFA6',
              padding: '8px 4px', fontFamily: 'inherit',
              fontSize: 14, color: '#5A5142', resize: 'none',
              outline: 'none', textAlign: 'center', marginBottom: 24,
            }}
          />

          <button
            onClick={handleSave}
            style={{
              display: 'block', margin: '0 auto',
              background: saved ? 'rgba(140,129,108,0.15)' : '#5A5142',
              color: saved ? '#5A5142' : '#F5F0E4',
              border: 'none', borderRadius: 2,
              padding: '12px 40px',
              fontFamily: "'Cinzel', serif",
              fontSize: 11, letterSpacing: '0.3em',
              cursor: 'pointer', transition: 'all 0.3s ease',
            }}
          >
            {saved ? '✦ 残しました' : '今日を残す'}
          </button>
        </div>
      )}
    </div>
  );
}
