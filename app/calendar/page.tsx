'use client'

import { useState, useEffect, useMemo } from 'react'
import { getMonthEvents, isFullMoonDay, isNewMoonDay, findPrecedingNewMoon, type MonthEvent } from '@/lib/astro'
import Backdrop from '../components/LunariaBackdrop';

const MONTHS_JP = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS_JP   = ['日','月','火','水','木','金','土']

const EMOTIONS = ['高揚', 'ときめき', '穏やか', '感謝', '安心', '揺らぎ', '不安', '悲しい']

function pad2(n: number) { return String(n).padStart(2, '0') }
function toDS(y: number, m: number, d: number) { return `${y}-${pad2(m + 1)}-${pad2(d)}` }

interface Note {
  kidzuki: string
  emotion: string
  karada:  string
  kansha:  string
  negai:   string
}

export default function CalendarPage() {
  const now = new Date()
  const [year,    setYear]    = useState(now.getFullYear())
  const [month,   setMonth]   = useState(now.getMonth())
  const [sel,     setSel]     = useState<string | null>(null)
  const [notes,   setNotes]   = useState<Record<string, Note>>({})
  const [kidzuki, setKidzuki] = useState('')
  const [emotion, setEmotion] = useState('')
  const [kansha,  setKansha]  = useState('')
  const [negai,   setNegai]   = useState('')
  const [saved,   setSaved]   = useState(false)
  const [karada, setKarada] = useState('');
  const [expanded, setExpanded] = useState(false);

  const todayDS = toDS(now.getFullYear(), now.getMonth(), now.getDate())

  // 天体イベントを自動計算(月が変わるたびに再計算)
  const monthEvents: MonthEvent[] = useMemo(
    () => getMonthEvents(year, month + 1),
    [year, month]
  )
  // day番号 -> イベント のマップに変換(同日複数イベントもサポート)
  const eventsByDay = useMemo(() => {
    const map: Record<number, MonthEvent[]> = {}
    for (const ev of monthEvents) {
      if (!map[ev.day]) map[ev.day] = []
      map[ev.day].push(ev)
    }
    return map
  }, [monthEvents])

  // localStorage から読み込み
  useEffect(() => {
    const all: Record<string, Note> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('lunaria_note_')) {
        try {
          const ds = key.replace('lunaria_note_', '')
          all[ds] = JSON.parse(localStorage.getItem(key) || '{}')
        } catch {}
      }
    }
    setNotes(all)
  }, [])

  const openNote = (ds: string) => {
    if (sel === ds) { setSel(null); return }
    setSel(ds)
    const note = notes[ds]
    setKidzuki(note?.kidzuki || '')
    setEmotion(note?.emotion || '')
    setKarada(note?.karada || '');
    setKansha(note?.kansha  || '')
    setNegai(note?.negai   || '')
    setSaved(false)
  }

  const saveNote = () => {
    if (!sel) return
    const note: Note = { kidzuki, emotion, karada, kansha, negai }
    localStorage.setItem(`lunaria_note_${sel}`, JSON.stringify(note))
    setNotes(prev => ({ ...prev, [sel]: note }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const goP = () => { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1); setSel(null) }
  const goN = () => { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1); setSel(null) }

  const dim   = new Date(year, month + 1, 0).getDate()
  const first = new Date(year, month, 1).getDay()
  const prev  = new Date(year, month, 0).getDate()

  const cells = []
  for (let i = first - 1; i >= 0; i--) cells.push({ d: prev - i, cur: false })
  for (let d = 1; d <= dim; d++)        cells.push({ d, cur: true })
  while (cells.length % 7 !== 0)        cells.push({ d: cells.length - dim - first + 1, cur: false })

  const selDay   = sel ? Number(sel.split('-')[2]) : null
  const selEvents = selDay ? (eventsByDay[selDay] ?? []) : [];
  const isFullMoon = sel ? isFullMoonDay(year, month + 1, Number(sel.split('-')[2])) : false
  const isNewMoon = sel ? isNewMoonDay(year, month + 1, Number(sel.split('-')[2])) : false

  //満月の日なら、直近の新月に書いた願いを
  const precedingNewMoonNote = useMemo(() => {
  if (!isFullMoon || !sel) return null
  const [y, m, d] = sel.split('-').map(Number)
  const newMoonDate = findPrecedingNewMoon(y, m, d)
  if (!newMoonDate) return null
  return notes[newMoonDate]?.negai || null
}, [isFullMoon, sel, notes])

  return (
    <main className="main-content" style={{
     minHeight: '100vh',
     position: 'relative',
    //  background: 'radial-gradient(ellipse 130% 95% at 50% 32%, #F5F0E4 0%, #EEE6D4 100%)',
     paddingBottom: 90,
     }}>
      <Backdrop />
      <div style={{ position: 'relative', zIndex:1 }}>
      <p className="s-eye">Celestial Calendar</p>
      <h1 className="s-head">{year}年 {MONTHS_JP[month]}</h1>
      <div className="s-rule" />

      {/* ナビ */}
      <div className="cal-nav">
        <button className="cal-btn" onClick={goP}>‹</button>
        <span className="cal-myr">
          {year}年{MONTHS_JP[month]}
          <span className="cal-myr-en">{MONTHS_EN[month]} {year}</span>
        </span>
        <button className="cal-btn" onClick={goN}>›</button>
      </div>

      {/* グリッド */}
      <div className="cal-grid">
        {DAYS_JP.map(l => <div key={l} className="cal-dh">{l}</div>)}
        {cells.map((c, i) => {
          if (!c.cur) return <div key={i} className="cal-cell dim"><span className="cal-dn">{c.d}</span></div>
          const ds  = toDS(year, month, c.d)
          const evs = eventsByDay[c.d]
          const nt  = notes[ds]
          let cls = 'cal-cell'
          if (ds === todayDS) cls += ' is-today'
          if (ds === sel)     cls += ' is-selected'
          return (
            <div key={i} className={cls} onClick={() => openNote(ds)}>
              <span className="cal-dn">{c.d}</span>
              <div style={{ display:'flex', gap:2 }}>
                {evs && evs.length > 0 && <span className="cal-dot" />}
                {nt && <span className="cal-dot" style={{ background:'#6A9E7A' }} />}
              </div>
            </div>
          )
        })}
      </div>

      {/* 凡例 */}
      <div className="cal-legend">
        <span className="leg"><span className="leg-dot" />星事</span>
        <span className="leg"><span className="leg-dot" style={{ background:'#6A9E7A' }} />メモあり</span>
      </div>

      {/* パネル */}
      {sel && (
        <div className="note-panel open">
          <div className="note-panel-inner">

            <div className="note-panel-head">
              <div>
                <span className="note-panel-date">
                  {(() => { const [y,m,d] = sel.split('-').map(Number); return `${y}年${m}月${d}日（${DAYS_JP[new Date(y,m-1,d).getDay()]}）` })()}
                </span>
                {selEvents.map(ev => (
                  <span key={ev.title} className="note-panel-event">{ev.title}</span>
                ))}
              </div>
              <button
                onClick={() => setSel(null)}
                style={{ background:'transparent', border:'1px solid #CBBFA6', color:'#8C816C', width:28, height:28, cursor:'pointer', fontSize:'.65rem', borderRadius: 1 }}
              >✕</button>
            </div>

            {/* 星事(複数イベント対応) */}
            {selEvents.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.2rem' }}>
                {selEvents.map(ev => (
                  <div key={ev.title} className="hoshi-card">
                    <div className="hoshi-tags">
                      {ev.tags.map(t => <span key={t} className="hoshi-tag">{t}</span>)}
                    </div>
                    <p className="hoshi-message">{ev.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* メモフィールド */}
<div className="note-fields">

  {/* 必須:今日をひとこと */}
  <div className="note-field">
    <label className="note-label">✦ 今日をひとことで</label>
    <textarea
      className="note-textarea"
      placeholder="どんな一日でしたか。ひとことでいい..."
      rows={2}
      value={kidzuki}
      onChange={e => setKidzuki(e.target.value)}
    />
  </div>

  {/* 気分チップ（タップだけ、軽い） */}
  <div className="note-field">
    <div className="emotion-chips">
      {EMOTIONS.map(em => (
        <button
          key={em}
          className={`chip${emotion === em ? ' active' : ''}`}
          onClick={() => setEmotion(emotion === em ? '' : em)}
        >{em}</button>
      ))}
    </div>
  </div>

  {/* もっと書く（任意・展開式） */}
  {!expanded && (
    <button
      onClick={() => setExpanded(true)}
      style={{
        background: 'transparent', border: 'none',
        color: '#8C816C', fontSize: '.72rem',
        letterSpacing: '.15em', cursor: 'pointer',
        padding: '6px 0', textDecoration: 'underline',
        textUnderlineOffset: 4, alignSelf: 'flex-start',
      }}
    >
      もう少し、深く書く +
    </button>
  )}

  {expanded && (
    <>
      <div className="note-field">
        <label className="note-label">○ 今、からだのどこが緊張し、どこが緩んでいますか</label>
        <textarea
          className="note-textarea"
          placeholder="感覚から。言葉にならない方が正直なことも..."
          rows={2}
          value={karada}
          onChange={e => setKarada(e.target.value)}
        />
      </div>

      <div className="note-field">
        <label className="note-label">◈ 今日、誰の／何の存在に支えられていましたか</label>
        <textarea
          className="note-textarea"
          placeholder="気づかなかった支えほど、大きいのかもしれません..."
          rows={2}
          value={kansha}
          onChange={e => setKansha(e.target.value)}
        />
      </div>
    </>
  )}

          
              
              {/* 新月:願いを書く */}
{isNewMoon && (
  <div className="note-field">
    <label className="note-label">☽ 新月の願い</label>
    <textarea
      className="note-textarea"
      placeholder="この満ちていく月に、何を願いますか…"
      rows={2}
      value={negai}
      onChange={e => setNegai(e.target.value)}
    />
  </div>
)}

{/* 満月:新月の願いを振り返る */}
{isFullMoon && (
  <div className="note-field">
    <label className="note-label">☽ 満月に振り返る</label>
    <p style={{
      fontSize: '.78rem',
      color: '#8C816C',
      lineHeight: 1.9,
      marginBottom: 10,
      fontStyle: 'italic',
    }}>
      月が満ちるまでの間、願いごとはどのように育ちましたか。
      叶ったこと、形を変えたこと、まだ途中にあること——
      どれも、悪いことではありません。
    </p>
    {precedingNewMoonNote ? (
      <>
        <div style={{
          fontSize: '.66rem',
          letterSpacing: '.16em',
          color: '#8C816C',
          marginBottom: 6,
        }}>
          あの新月に、あなたが願ったこと
        </div>
        <div style={{
          padding: '14px 16px',
          background: 'rgba(245,240,228,0.6)',
          borderLeft: '2px solid #CBBFA6',
          fontSize: '.85rem',
          color: '#5A5142',
          lineHeight: 1.9,
          fontStyle: 'italic',
          marginBottom: 14,
        }}>
          {precedingNewMoonNote}
        </div>
        <div style={{
          fontSize: '.66rem',
          letterSpacing: '.16em',
          color: '#8C816C',
          marginBottom: 6,
        }}>
          今、振り返って思うこと
        </div>
        <textarea
          className="note-textarea"
          placeholder="あの願いは、今どんな形になっていますか…"
          rows={2}
          value={negai}
          onChange={e => setNegai(e.target.value)}
        />
      </>
    ) : (
      <div style={{
        padding: '14px 16px',
        fontSize: '.78rem',
        color: '#CBBFA6',
        fontStyle: 'italic',
      }}>
        この満月の前の新月には、まだ何も書かれていなかったようです。
        次の新月から、はじめてみませんか。
      </div>
    )}
  </div>
)}

</div>
            <div className="note-footer">
              <span className={`note-saved${saved ? ' show' : ''}`}>✦ 保存しました</span>
              <button className="note-save-btn" onClick={saveNote}>保存する</button>
            </div>

          </div>
        </div>
      )}
    <p style={{
  textAlign: 'center',
  fontSize: 11,
  color: '#B0A588',
  letterSpacing: '0.1em',
  lineHeight: 2,
  marginTop: 40,
  fontFamily: "'Shippori Mincho', serif",
}}>
  今日置いた小さな点は、<br/>
  いつか、あなただけの星座になります。
</p>
</div>
    </main>
  )
}
