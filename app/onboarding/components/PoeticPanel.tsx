'use client';
import { useMemo, useState, useEffect, useRef } from 'react';
import styles from '../onboarding.module.css';
import { SpecimenPanel } from './SpecimenPanel';
import { getSoulType } from '@/lib/soul-engine';
import { searchPlace, type GeocodingResult } from '@/lib/geocoding';
import type { Phase } from '@/lib/onboarding-timing';
import type { SoulGroup } from '@/lib/soul-engine';

interface BirthInfo {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  place?: {
    displayName: string;
    lat: number;
    lon: number;
  };
}

interface PoeticPanelProps {
  phase: Phase;
  onSubmit: (mainStar: string, birthInfo: BirthInfo) => void;
}

const YEARS = Array.from({ length: 2020 - 1935 + 1 }, (_, i) => 2020 - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

/** Layer 4: 詩(英語の囁き+日本語)と、生年月日/時刻/出生地の手稿入力 */
export function PoeticPanel({ phase, onSubmit }: PoeticPanelProps) {
  const [year, setYear] = useState(1995);
  const [month, setMonth] = useState(7);
  const [day, setDay] = useState(23);
  const [sealed, setSealed] = useState(false);

  // 任意項目:出生時刻
  const [showDetail, setShowDetail] = useState(false);
  const [hour, setHour] = useState<number | null>(null);
  const [minute, setMinute] = useState<number | null>(null);

  // 任意項目:出生地
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState<GeocodingResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<GeocodingResult | null>(null);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const days = useMemo(
    () => Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1),
    [year, month]
  );

  const panelVisible = phase === 'titled' || phase === 'inked' || phase === 'turning';

  // 出生地の入力に応じて候補をリアルタイム検索(デバウンス付き)
  useEffect(() => {
    if (selectedPlace && placeQuery === selectedPlace.displayName) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (placeQuery.trim().length < 2) {
      setPlaceResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchPlace(placeQuery);
        setPlaceResults(results);
      } catch (e) {
        console.error('geocoding error', e);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [placeQuery, selectedPlace]);

  function handlePlaceSelect(result: GeocodingResult) {
    setSelectedPlace(result);
    setPlaceQuery(result.displayName);
    setPlaceResults([]);
  }

  function handleSubmit() {
    setSealed(true);
    const bd = { year, month, day: Math.min(day, days.length) };

    const birthInfo: BirthInfo = {
      ...bd,
      ...(hour !== null && minute !== null ? { hour, minute } : {}),
      ...(selectedPlace
        ? {
            place: {
              displayName: selectedPlace.displayName,
              lat: selectedPlace.lat,
              lon: selectedPlace.lon,
            },
          }
        : {}),
    };

    // 鑑定ページで使うために保存
    sessionStorage.setItem('lunaria_birthday', JSON.stringify(birthInfo));

    const soul = getSoulType(bd);
    setTimeout(() => onSubmit(soul.mainStar, birthInfo), 1000);
  }

  return (
    <SpecimenPanel visible={panelVisible}>
      <div className={styles.titles}>
        <div className={styles.enLine}>The stars whisper today</div>
        <div className={styles.jpLine}>今日、星が語ること</div>
      </div>

      <div className={styles.manuscript}>
        <label htmlFor="y">生年月日を入力してください</label>
        <div className={styles.selects}>
          <select id="y" aria-label="年" value={year} onChange={e => setYear(+e.target.value)}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select aria-label="月" value={month} onChange={e => setMonth(+e.target.value)}>
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select aria-label="日" value={day} onChange={e => setDay(+e.target.value)}>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* 詳細(任意)の開閉トグル */}
        <button
          type="button"
          onClick={() => setShowDetail(v => !v)}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 10, letterSpacing: '.2em',
            color: '#8C816C', marginTop: 22, padding: '4px 0',
            textDecoration: 'underline', textUnderlineOffset: 4,
          }}
        >
          {showDetail ? '閉じる' : '出生時刻・出生地を加える（任意）'}
        </button>

        {showDetail && (
          <div style={{ marginTop: 20, width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* 出生時刻 */}
            <div>
              <label style={{ fontSize: 10, letterSpacing: '.3em', color: '#8C816C', display: 'block', marginBottom: 10 }}>
                生まれた時刻（わかれば）
              </label>
              <div className={styles.selects}>
                <select
                  aria-label="時"
                  value={hour ?? ''}
                  onChange={e => setHour(e.target.value === '' ? null : +e.target.value)}
                >
                  <option value="">--</option>
                  {HOURS.map(h => <option key={h} value={h}>{h}時</option>)}
                </select>
                <select
                  aria-label="分"
                  value={minute ?? ''}
                  onChange={e => setMinute(e.target.value === '' ? null : +e.target.value)}
                >
                  <option value="">--</option>
                  {MINUTES.map(m => <option key={m} value={m}>{m}分</option>)}
                </select>
              </div>
            </div>

            {/* 出生地 */}
            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: 10, letterSpacing: '.3em', color: '#8C816C', display: 'block', marginBottom: 10 }}>
                生まれた場所（わかれば）
              </label>
              <input
                type="text"
                value={placeQuery}
                onChange={e => {
                  setPlaceQuery(e.target.value);
                  if (selectedPlace) setSelectedPlace(null);
                }}
                placeholder="例: Tokyo, Osaka, New York..."
                style={{
                  width: '100%', fontFamily: 'inherit', fontSize: 14,
                  color: '#5A5142', background: 'transparent',
                  border: 'none', borderBottom: '1px solid #CBBFA6',
                  padding: '6px 2px', outline: 'none', textAlign: 'center',
                }}
              />
              {searching && (
                <div style={{ fontSize: 10, color: '#CBBFA6', marginTop: 6, textAlign: 'center' }}>
                  探しています...
                </div>
              )}
              {placeResults.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                  background: 'rgba(246,241,229,0.98)', border: '1px solid #CFC3A9',
                  borderRadius: 2, marginTop: 4, maxHeight: 160, overflowY: 'auto',
                  boxShadow: '0 8px 24px rgba(90,81,66,0.12)',
                }}>
                  {placeResults.map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handlePlaceSelect(r)}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '10px 14px', background: 'transparent', border: 'none',
                        borderBottom: i < placeResults.length - 1 ? '1px solid #E8E0D0' : 'none',
                        fontSize: 12, color: '#5A5142', cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      {r.displayName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          className={`${styles.go} ${sealed ? styles.sealed : ''}`}
          onClick={handleSubmit}
          style={{ marginTop: showDetail ? 30 : 38 }}
        >
          星に尋ねる
        </button>
      </div>
    </SpecimenPanel>
  );
}
