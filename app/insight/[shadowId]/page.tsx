'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOON_SHADOWS } from '@/lib/moon-shadows';

interface Props {
  params: Promise<{ shadowId: string }>;
}

export default function InsightPage({ params }: Props) {
  const router = useRouter();
  const [shadow, setShadow] = useState<(typeof MOON_SHADOWS)[string] | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    params.then(p => {
      const id = decodeURIComponent(p.shadowId);
      const data = MOON_SHADOWS[id];
      if (data) {
        setShadow(data);
        setTimeout(() => setVisible(true), 300);
      }
    });
  }, [params]);

  if (!shadow) return null;

  const panel = (label: string, content: string, icon: string) => (
    <div style={{
      background: 'rgba(246,241,229,0.94)',
      border: '1px solid #CFC3A9', borderRadius: 3,
      boxShadow: '0 0 0 5px rgba(246,241,229,0.94), 0 0 0 6px #CFC3A9, 0 18px 50px rgba(90,81,66,0.07)',
      padding: '28px 24px', marginBottom: 20,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 10, letterSpacing: '0.4em',
        color: '#8C816C', marginBottom: 14,
        fontFamily: "'Cinzel', serif",
      }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        {label}
      </div>
      <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 2.3, color: '#5A5142' }}>
        {content}
      </p>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 130% 95% at 50% 32%, #F5F0E4 0%, #EEE6D4 100%)',
      fontFamily: "'Noto Serif JP', serif",
      WebkitFontSmoothing: 'antialiased',
      paddingBottom: 90,
    }}>
      <div style={{
        maxWidth: 420, margin: '0 auto',
        padding: '64px 28px 40px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 2s ease, transform 2s ease',
      }}>

        {/* 戻るボタン */}
        <button
          onClick={() => router.back()}
          style={{
            background: 'transparent', border: 'none',
            color: '#8C816C', fontSize: 11, letterSpacing: '0.3em',
            cursor: 'pointer', marginBottom: 40, padding: 0,
            fontFamily: "'Cinzel', serif",
          }}
        >
          ← 戻る
        </button>

        {/* タイトル */}
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic', fontSize: 12,
          letterSpacing: '0.3em', color: '#8C816C',
          marginBottom: 8, textAlign: 'center',
        }}>
          Moon Shadow
        </div>
        <h1 style={{
          fontSize: 28, fontWeight: 200,
          letterSpacing: '0.3em', color: '#5A5142',
          textAlign: 'center', marginBottom: 8,
        }}>
          {shadow.name}
        </h1>
        <div style={{
          textAlign: 'center', fontSize: 12,
          color: '#8C816C', letterSpacing: '0.2em',
          marginBottom: 8,
        }}>
          {shadow.academicName}
        </div>
        <div style={{
          textAlign: 'center', fontSize: 11,
          color: '#CBBFA6', letterSpacing: '0.2em',
          marginBottom: 32,
        }}>
          才能: {shadow.talents.join(' · ')}
        </div>

        <div style={{ width: 1, height: 32, background: '#CBBFA6', margin: '0 auto 32px' }} />

        {/* 本質の説明 */}
        <p style={{
          fontSize: 14, fontWeight: 300,
          lineHeight: 2.3, color: '#5A5142',
          marginBottom: 32, letterSpacing: '0.04em',
        }}>
          {shadow.description}
        </p>

        {/* 4観点 */}
        {panel('心理学から見ると', shadow.psychology, '◎')}
        {panel('脳科学から見ると', shadow.neuroscience, '◈')}
        {panel('哲学から見ると', shadow.philosophy, '✦')}
        {panel('魂から見ると', shadow.soul, '☽')}

      </div>
    </div>
  );
}
