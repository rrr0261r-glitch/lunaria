'use client';

export default function NightBackdrop({ opacity = 1 }: { opacity?: number }) {
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', opacity }}>

      {/* 地の色：深夜の空 */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #080B1A 0%, #0E1428 30%, #151D3A 55%, #1E2545 75%, #252B4A 100%)',
      }} />

      {/* 月の光源：右上にやわらかく */}
      <div style={{
        position: 'absolute',
        top: '6%', right: '15%',
        width: '320px', height: '320px',
        background: 'radial-gradient(circle, rgba(255,252,220,0.09) 0%, rgba(220,215,180,0.05) 45%, transparent 70%)',
        filter: 'blur(48px)',
        borderRadius: '50%',
      }} />

      {/* 下部の月明かり：地平線の光 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
        background: 'linear-gradient(to top, rgba(100,110,180,0.14) 0%, rgba(80,90,160,0.07) 35%, transparent 70%)',
        filter: 'blur(50px)',
      }} />

      {/* 銀河の帯：斜めにごくうっすら */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(125deg, transparent 25%, rgba(160,170,230,0.04) 42%, rgba(180,190,240,0.06) 50%, rgba(160,170,230,0.04) 58%, transparent 75%)',
        filter: 'blur(60px)',
      }} />

      {/* 上部の深み */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
        background: 'linear-gradient(to bottom, rgba(4,5,14,0.55) 0%, transparent 100%)',
      }} />

    </div>
  );
}