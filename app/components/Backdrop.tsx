'use client';

// ══════════════════════════════════════════════════════
// LUNARIA 共通背景
//
//   上部 … 暗い・マット・影が流れる・境界がある
//     ↓  なめらかに移行
//   下部 … 明るい・艶・光が満ちる・境界が溶ける
//
// tone を渡すと、その民の色で全体が染まる。
// 質感（マット・光と影）は共通のまま、色相だけ変わる。
// ══════════════════════════════════════════════════════

export interface BackdropTone {
  darkTop: string;    // 上部の地の色（暗い）
  midTone: string;    // 中間
  lightBottom: string; // 下部の地の色（明るい）
  shadow: string;     // 影の色（rgb three values, e.g. "48,40,30"）
  glow: string;       // 光の色（rgb three values, e.g. "255,251,241"）
}

// デフォルト（土・ベージュ）
const DEFAULT_TONE: BackdropTone = {
  darkTop: '#8A7864',
  midTone: '#BEAC92',
  lightBottom: '#F7F0DF',
  shadow: '48,40,30',
  glow: '255,251,241',
};

// 7つの民の色
export const SOUL_TONES: Record<string, BackdropTone> = {
  '灯の民':   { darkTop: '#8A6E4A', midTone: '#C6A268', lightBottom: '#F8EFD8', shadow: '58,42,24', glow: '255,246,224' },
  '星渡りの民': { darkTop: '#4C4A6E', midTone: '#8A86AA', lightBottom: '#E8E4F0', shadow: '38,36,58', glow: '244,242,252' },
  '花の民':   { darkTop: '#9A6668', midTone: '#D2A0A2', lightBottom: '#F8E8E6', shadow: '70,44,46', glow: '255,244,242' },
  '大樹の民': { darkTop: '#4E6B4A', midTone: '#8AA079', lightBottom: '#E6EEDB', shadow: '34,48,32', glow: '246,250,236' },
  '炎の民':   { darkTop: '#9A5A44', midTone: '#D08A6C', lightBottom: '#F8E4D8', shadow: '68,40,28', glow: '255,242,232' },
  '風の民':   { darkTop: '#5A7080', midTone: '#9BB2C0', lightBottom: '#E4EEF2', shadow: '38,52,60', glow: '244,250,252' },
  '雫の民':   { darkTop: '#5A6E80', midTone: '#94AEC0', lightBottom: '#E4EEF4', shadow: '36,50,62', glow: '244,250,254' },
};

export default function Backdrop({
  tone = DEFAULT_TONE,
  opacity = 1,
}: {
  tone?: BackdropTone;
  opacity?: number;
}) {
  const t = tone;
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity }}>

      {/* ───────── 地の色 ───────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(177deg, ${t.darkTop} 0%, ${t.midTone} 40%, ${t.lightBottom} 100%)`,
      }} />

      {/* ───────── 上部の影：帯状に流す ───────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(168deg, rgba(${t.shadow},0.50) 0%, rgba(${t.shadow},0.34) 14%, rgba(${t.shadow},0.16) 28%, transparent 44%)`,
      }} />

      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(152deg, rgba(${t.shadow},0.30) 0%, transparent 22%, rgba(${t.shadow},0.22) 34%, transparent 52%)`,
        filter: 'blur(18px)',
      }} />

      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '58%',
        background: `linear-gradient(96deg, rgba(${t.shadow},0.22) 0%, transparent 30%, transparent 62%, rgba(${t.shadow},0.26) 100%)`,
        filter: 'blur(26px)',
      }} />

      {/* ───────── 下部の光：溶けてひろがる ───────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '62%',
        background: `linear-gradient(to top, rgba(${t.glow},0.92) 0%, rgba(${t.glow},0.66) 22%, rgba(${t.glow},0.32) 44%, transparent 78%)`,
        filter: 'blur(38px)',
      }} />

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '48%',
        background: `linear-gradient(to top, rgba(${t.glow},0.55) 0%, rgba(${t.glow},0.22) 38%, transparent 78%)`,
        filter: 'blur(24px)',
        mixBlendMode: 'screen',
      }} />

      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(165deg, transparent 46%, rgba(${t.glow},0.26) 62%, rgba(${t.glow},0.54) 76%, rgba(${t.glow},0.28) 88%, transparent 97%)`,
        filter: 'blur(36px)',
      }} />

      {/* ───────── 粒子：上から下へ、なめらかに減衰 ───────── */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: 0.15,
        mixBlendMode: 'multiply',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23m)'/%3E%3C/svg%3E")`,
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.94) 16%, rgba(0,0,0,0.76) 32%, rgba(0,0,0,0.48) 48%, rgba(0,0,0,0.22) 62%, rgba(0,0,0,0.06) 76%, transparent 90%)',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.94) 16%, rgba(0,0,0,0.76) 32%, rgba(0,0,0,0.48) 48%, rgba(0,0,0,0.22) 62%, rgba(0,0,0,0.06) 76%, transparent 90%)',
      }} />

      <div style={{
        position: 'absolute', inset: 0,
        opacity: 0.065,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='c'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.3' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23c)'/%3E%3C/svg%3E")`,
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.82) 20%, rgba(0,0,0,0.5) 38%, rgba(0,0,0,0.2) 56%, rgba(0,0,0,0.04) 70%, transparent 84%)',
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.82) 20%, rgba(0,0,0,0.5) 38%, rgba(0,0,0,0.2) 56%, rgba(0,0,0,0.04) 70%, transparent 84%)',
      }} />

    </div>
  );
}
