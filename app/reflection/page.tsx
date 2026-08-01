'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Backdrop from '../components/Backdrop';
import { relative } from 'path';

interface DiaryEntry {
  date: string;
  kidzuki?: string;
  emotion?: string;
  karada?: string;
  kansha?: string;
  negai?: string;
}

interface ReflectionResult {
  monthSummary: string;
  psychology: string;
  philosophy: string;
  neuroscience: string;
  soul: string;
  closingMessage: string;
}

function getYearMonth(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getYearMonthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  return `${y}年${m}月`;
}

export default function ReflectionPage() {
  const router = useRouter();
  const now = new Date();
  const [yearMonth, setYearMonth] = useState(getYearMonth(now));
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [star, setStar] = useState<string | null>(null);
  const [result, setResult] = useState<ReflectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // その月のlocalStorage日記エントリを集める
  useEffect(() => {
    const collected: DiaryEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('lunaria_note_') && key.includes(yearMonth)) {
        try {
          const date = key.replace('lunaria_note_', '');
          const note = JSON.parse(localStorage.getItem(key) || '{}');
          if (note.kidzuki || note.emotion || note.kansha || note.negai) {
            collected.push({ date, ...note });
          }
        } catch {}
      }
    }
    collected.sort((a, b) => a.date.localeCompare(b.date));
    setEntries(collected);
    setResult(null);
  }, [yearMonth]);

  // ユーザーの主星を取得(プロフィールから)
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from('profiles')
        .select('main_star')
        .eq('id', session.user.id)
        .maybeSingle();
      if (data?.main_star) setStar(data.main_star);
    })();
    setTimeout(() => setVisible(true), 300);
  }, []);

  async function handleAnalyze() {
    if (!star) {
      setError('まず鑑定を受けて、あなたの民を知ってから振り返ってみてください');
      return;
    }
    if (entries.length === 0) {
      setError('この月にはまだ記録がないようです');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ star, yearMonth, entries }),
      });
      const data = await res.json();
      if (data.error) {
        setError('分析に失敗しました。もう一度試してみてください');
      } else {
        setResult(data);
      }
    } catch (e) {
      setError('分析に失敗しました。もう一度試してみてください');
    } finally {
      setLoading(false);
    }
  }

  function goMonth(delta: number) {
    const [y, m] = yearMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setYearMonth(getYearMonth(d));
  }

  const section = (label: string, content: string, accent?: string) => (
    <div style={{
      background: 'rgba(246,241,229,0.94)',
      border: '1px solid #CFC3A9', borderRadius: 3,
      boxShadow: '0 0 0 5px rgba(246,241,229,0.94), 0 0 0 6px #CFC3A9, 0 18px 50px rgba(90,81,66,0.07)',
      padding: '26px 24px', marginBottom: 20,
    }}>
      <div style={{
        fontSize: 10, letterSpacing: '0.4em',
        color: accent ?? '#8C816C', marginBottom: 14,
        textTransform: 'uppercase', fontFamily: "'Cinzel', serif",
      }}>
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
      position: 'relative',
      // background: 'radial-gradient(ellipse 130% 95% at 50% 32%, #F5F0E4 0%, #EEE6D4 100%)',
      fontFamily: "'Shippori Mincho', serif",
      WebkitFontSmoothing: 'antialiased',
      paddingBottom: 90,
    }}>
      <Backdrop />
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: 420, margin: '0 auto',
        padding: '64px 28px 40px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(10px)',
        transition: 'opacity 1.5s ease, transform 1.5s ease',
      }}>

        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 9, letterSpacing: '0.5em',
          color: '#8C816C', textAlign: 'center', marginBottom: 12,
        }}>
          MONTHLY REFLECTION
        </div>
        <h1 style={{
          fontSize: 22, fontWeight: 200,
          letterSpacing: '0.2em', color: '#5A5142',
          textAlign: 'center', marginBottom: 8,
        }}>
          月の振り返り
        </h1>
        <p style={{
          fontSize: 12, color: '#8C816C',
          textAlign: 'center', lineHeight: 1.9, marginBottom: 36,
        }}>
          書きためた言葉を、4つの観点から読み解きます
        </p>

        {/* 月送りナビ */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 24, marginBottom: 28,
        }}>
          <button onClick={() => goMonth(-1)} style={{
            background: 'transparent', border: '1px solid #CBBFA6',
            color: '#8C816C', width: 30, height: 30, cursor: 'pointer', borderRadius: 2,
          }}>‹</button>
          <span style={{ fontSize: 15, color: '#5A5142', letterSpacing: '0.1em' }}>
            {getYearMonthLabel(yearMonth)}
          </span>
          <button onClick={() => goMonth(1)} style={{
            background: 'transparent', border: '1px solid #CBBFA6',
            color: '#8C816C', width: 30, height: 30, cursor: 'pointer', borderRadius: 2,
          }}>›</button>
        </div>

        {/* この月の記録数 */}
        <div style={{
          textAlign: 'center', fontSize: 11, color: '#8C816C',
          marginBottom: 32, letterSpacing: '0.1em',
        }}>
          この月の記録: {entries.length}件
        </div>

        {!result && !loading && (
          <button
            onClick={handleAnalyze}
            disabled={entries.length === 0}
            style={{
              display: 'block', width: '100%',
              background: entries.length === 0 ? '#E8E0D0' : '#5A5142',
              color: entries.length === 0 ? '#B5AA92' : '#F5F0E4',
              border: 'none', borderRadius: 3,
              padding: '16px', fontFamily: "'Cinzel', serif",
              fontSize: 11, letterSpacing: '0.3em',
              cursor: entries.length === 0 ? 'default' : 'pointer',
              marginBottom: 24,
            }}
          >
            この月を振り返る
          </button>
        )}

        {error && (
          <div style={{
            textAlign: 'center', fontSize: 12, color: '#A07A5C',
            marginBottom: 24, lineHeight: 1.8,
          }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{
            textAlign: 'center', color: '#8C816C', fontSize: 12,
            letterSpacing: '0.3em', padding: '40px 0',
          }}>
            あなたの1ヶ月を読み解いています...
          </div>
        )}

        {result && (
          <>
            <div style={{
              textAlign: 'center', marginBottom: 32,
            }}>
              <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#8C816C', marginBottom: 10 }}>
                この月をひと言で
              </div>
              <div style={{ fontSize: 19, fontWeight: 300, color: '#5A5142', letterSpacing: '0.15em' }}>
                {result.monthSummary}
              </div>
            </div>

            <div style={{ width: 1, height: 32, background: '#CBBFA6', margin: '0 auto 32px' }} />

            {section('心理学の観点から', result.psychology)}
            {section('哲学の観点から', result.philosophy)}
            {section('脳科学の観点から', result.neuroscience)}
            {section('魂の観点から', result.soul)}

            <div style={{
              textAlign: 'center', padding: '28px 20px',
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic', fontSize: 14,
              color: '#8C816C', lineHeight: 2, letterSpacing: '0.05em',
            }}>
              {result.closingMessage}
            </div>

            <button
              onClick={() => setResult(null)}
              style={{
                display: 'block', margin: '24px auto 0',
                background: 'transparent', border: 'none',
                borderBottom: '1px solid #CBBFA6',
                padding: '0 6px 6px',
                fontFamily: "'Noto Serif JP', serif",
                fontSize: 11, letterSpacing: '0.3em',
                color: '#8C816C', cursor: 'pointer',
              }}
            >
              閉じる
            </button>
          </>
        )}
      </div>
    </div>
  );
}