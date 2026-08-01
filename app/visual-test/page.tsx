'use client';
import { useState, useEffect } from 'react';

// ───────────────────────────────────────────────
// LUNARIA ビジュアル実験ページ
// 「薄明の光 × すりガラス」を CSS だけで再現。
// 写真素材は一切使わないので著作権クリーン。
// /visual-test で確認して、方向性が良ければ本採用する。
// ───────────────────────────────────────────────

export default function VisualTest() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 200); }, []);

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Shippori Mincho', serif",
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* ── 薄明のグラデーション背景（写真の代わり） ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 60% at 50% 15%, rgba(212,201,168,0.35) 0%, transparent 55%),
          radial-gradient(ellipse 90% 70% at 80% 90%, rgba(120,130,140,0.25) 0%, transparent 50%),
          radial-gradient(ellipse 70% 50% at 15% 80%, rgba(150,140,120,0.2) 0%, transparent 50%),
          linear-gradient(170deg, #EDE6D6 0%, #E4DAC6 45%, #D8CFC0 100%)
        `,
      }} />

      {/* ── 霞のようなぼかしレイヤー（奥行き） ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(circle at 70% 35%, rgba(255,252,245,0.5) 0%, transparent 40%)',
        filter: 'blur(40px)',
      }} />

      {/* ── コンテンツ ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 420, margin: '0 auto',
        padding: '64px 24px 48px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(16px)',
        transition: 'opacity 1.8s ease, transform 1.8s ease',
      }}>

        {/* ロゴ */}
        <div style={{
          fontFamily: "'Cinzel', serif", fontSize: 11,
          letterSpacing: '0.6em', color: '#6B6250',
          textAlign: 'center', marginBottom: 6,
        }}>
          LUNARIA
        </div>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic', fontSize: 13,
          letterSpacing: '0.2em', color: '#8C816C',
          textAlign: 'center', marginBottom: 40,
        }}>
          2026年7月6日 · 下弦
        </div>

        {/* ── すりガラスカード①：今日の空 ── */}
        <div style={{
          background: 'rgba(255,252,245,0.45)',
          backdropFilter: 'blur(20px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
          border: '1px solid rgba(255,255,255,0.6)',
          borderRadius: 24,
          padding: '28px 26px',
          marginBottom: 20,
          boxShadow: '0 8px 32px rgba(120,110,90,0.12), inset 0 1px 1px rgba(255,255,255,0.7)',
        }}>
          <div style={{
            fontFamily: "'Cinzel', serif", fontSize: 9,
            letterSpacing: '0.4em', color: '#8C816C', marginBottom: 14,
          }}>
            TODAY'S SKY
          </div>
          <div style={{
            fontSize: 16, color: '#4A4436', lineHeight: 2,
            letterSpacing: '0.05em',
          }}>
            光は半分。だからこそ、<br/>
            影のやわらかさが見える日。
          </div>
        </div>

        {/* ── すりガラスカード②：羅針盤（メイン） ── */}
        <div style={{
          background: 'rgba(255,252,245,0.4)',
          backdropFilter: 'blur(24px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
          border: '1px solid rgba(255,255,255,0.6)',
          borderRadius: 28,
          padding: '36px 26px 40px',
          marginBottom: 20,
          boxShadow: '0 12px 40px rgba(120,110,90,0.14), inset 0 1px 1px rgba(255,255,255,0.7)',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 15, color: '#4A4436',
            letterSpacing: '0.15em', marginBottom: 28,
          }}>
            今日の心は、どのあたり？
          </div>

          {/* 円（月のような発光する円） */}
          <div style={{
            width: 200, height: 200, margin: '0 auto',
            borderRadius: '50%',
            border: '1px solid rgba(203,191,166,0.6)',
            background: 'radial-gradient(circle at 50% 45%, rgba(255,253,247,0.6) 0%, rgba(232,224,206,0.3) 70%, transparent 100%)',
            boxShadow: 'inset 0 0 50px rgba(212,201,168,0.3), 0 0 30px rgba(212,201,168,0.15)',
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* 十字線 */}
            <div style={{ position: 'absolute', left: '50%', top: '14%', bottom: '14%', width: 1, background: 'rgba(203,191,166,0.35)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '14%', right: '14%', height: 1, background: 'rgba(203,191,166,0.35)' }} />
            {/* 中心の光る点 */}
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: '#C9A87C',
              boxShadow: '0 0 16px rgba(201,168,124,0.9), 0 0 0 6px rgba(201,168,124,0.15)',
              animation: 'breathe 3s ease-in-out infinite',
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, padding: '0 20px' }}>
            <span style={{ fontSize: 11, color: '#8C816C', letterSpacing: '0.1em' }}>つめたい</span>
            <span style={{ fontSize: 11, color: '#8C816C', letterSpacing: '0.1em' }}>あたたかい</span>
          </div>
        </div>

        {/* ── すりガラスカード③：小さなリンク3つ ── */}
        <div style={{ display: 'flex', gap: 12 }}>
          {['暦', '星読み', '振り返り'].map(label => (
            <div key={label} style={{
              flex: 1,
              background: 'rgba(255,252,245,0.4)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: 18,
              padding: '18px 8px',
              textAlign: 'center',
              boxShadow: '0 6px 20px rgba(120,110,90,0.1)',
              fontSize: 13, color: '#4A4436', letterSpacing: '0.1em',
            }}>
              {label}
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.6; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
