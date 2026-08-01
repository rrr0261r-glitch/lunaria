'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Slide {
  lines: string[];
  source?: string;
}

const SLIDES: Slide[] = [
  {
    lines: [
      'うれしかった日、悲しかった日。',
      '時間がたつと、その日の温度は',
      '少しずつ薄れていきます。',
    ],
  },
  {
    lines: [
      '日記は、出来事を残すための',
      'ものではありません。',
    ],
  },
  {
    lines: [
      'あの日、どんな気持ちで',
      '世界を見ていたのか。',
    ],
  },
  {
    lines: [
      'その感覚を、',
      '未来のあなたへ届ける',
      '小さな手紙です。',
    ],
  },
];

const STORAGE_KEY = 'lunaria_intro_seen';

export default function IntroPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const isLast = index === SLIDES.length - 1;

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [index]);

  function next() {
    if (isLast) {
      finish();
    } else {
      setIndex(i => i + 1);
    }
  }

  function finish() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
    router.push('/');
  }

  const slide = SLIDES[index];

  return (
    <div
      onClick={next}
      style={{
        position: 'fixed', inset: 0,
        background: 'radial-gradient(ellipse 130% 95% at 50% 32%, #F5F0E4 0%, #EEE6D4 100%)',
        fontFamily: "'Shippori Mincho', serif",
        WebkitFontSmoothing: 'antialiased',
        cursor: 'pointer',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* 進捗バー */}
      <div style={{
        position: 'absolute', top: 20, left: 20, right: 20,
        display: 'flex', gap: 6, zIndex: 10,
      }}>
        {SLIDES.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 2, borderRadius: 2,
            background: i <= index ? '#8C816C' : 'rgba(140,129,108,0.25)',
            transition: 'background 0.4s ease',
          }} />
        ))}
      </div>

      {/* スキップ */}
      <button
        onClick={(e) => { e.stopPropagation(); finish(); }}
        style={{
          position: 'absolute', top: 34, right: 20, zIndex: 10,
          background: 'transparent', border: 'none',
          color: '#8C816C', fontSize: 11, letterSpacing: '0.2em',
          cursor: 'pointer', fontFamily: "'Cinzel', serif",
        }}
      >
        SKIP
      </button>

      {/* 本文 */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 40px',
      }}>
        <div style={{
          maxWidth: 340, textAlign: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(12px)',
          transition: 'opacity 1.2s ease, transform 1.2s ease',
        }}>
          {slide.lines.map((line, i) => (
            <div key={i} style={{
              fontSize: 15, lineHeight: 2.4,
              color: '#5A5142', letterSpacing: '0.08em',
              minHeight: line === '' ? '1.2em' : undefined,
            }}>
              {line}
            </div>
          ))}

          {slide.source && (
            <div style={{
              marginTop: 28,
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic', fontSize: 11,
              color: '#B0A588', letterSpacing: '0.1em',
            }}>
              {slide.source}
            </div>
          )}
        </div>
      </div>

      {/* 下部の誘導 */}
      <div style={{
        position: 'absolute', bottom: 40, left: 0, right: 0,
        textAlign: 'center', zIndex: 10,
      }}>
        {isLast ? (
          <button
            onClick={(e) => { e.stopPropagation(); finish(); }}
            style={{
              background: 'transparent',
              border: '1px solid #CBBFA6',
              borderRadius: 2,
              padding: '12px 40px',
              fontFamily: "'Cinzel', serif",
              fontSize: 12, letterSpacing: '0.3em',
              color: '#5A5142', cursor: 'pointer',
            }}
          >
            はじめる
          </button>
        ) : (
          <div style={{
            fontSize: 10, color: '#B0A588',
            letterSpacing: '0.3em',
            animation: 'introFade 2.5s ease-in-out infinite',
          }}>
            タップで次へ
          </div>
        )}
      </div>

      <style>{`
        @keyframes introFade {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
