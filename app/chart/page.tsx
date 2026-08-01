'use client'

import { useState } from 'react'

/* ── 言語データ ── */
const LANG = {
  ja: {
    eyebrow: 'Natal Chart',
    title: '出生図',
    lead: 'あなたが生まれた瞬間の空を読みます。',
    labelDate: '☉ 生年月日',
    labelTime: '☽ 出生時刻',
    labelTimeNote: '（わからない場合は空欄）',
    labelCity: '✦ 出生地',
    labelCityPlaceholder: '都市を選択',
    btnGenerate: '星図を読む',
    btnEdit: '✎ 入力し直す',
    readingTitle: 'あなたの星読み',
    readingEye: 'Your Star Reading',
    sun: '太陽', moon: '月',
    themeEssence: '本質',
    themeLove: '愛と感情',
  },
  en: {
    eyebrow: 'Natal Chart',
    title: 'Birth Chart',
    lead: 'We read the sky at the moment you were born.',
    labelDate: '☉ Date of Birth',
    labelTime: '☽ Time of Birth',
    labelTimeNote: '(leave blank if unknown)',
    labelCity: '✦ Place of Birth',
    labelCityPlaceholder: 'Select a city',
    btnGenerate: 'Read My Chart',
    btnEdit: '✎ Enter Again',
    readingTitle: 'Your Star Reading',
    readingEye: 'Your Star Reading',
    sun: 'Sun', moon: 'Moon',
    themeEssence: 'Essence',
    themeLove: 'Love & Emotion',
  },
}

/* ── 世界都市リスト ── */
const CITIES = [
  { name: '東京 / Tokyo',         lat: 35.6762,  lng: 139.6503,  tz: 9  },
  { name: '大阪 / Osaka',         lat: 34.6937,  lng: 135.5023,  tz: 9  },
  { name: '京都 / Kyoto',         lat: 35.0116,  lng: 135.7681,  tz: 9  },
  { name: '福岡 / Fukuoka',       lat: 33.5904,  lng: 130.4017,  tz: 9  },
  { name: '札幌 / Sapporo',       lat: 43.0618,  lng: 141.3545,  tz: 9  },
  { name: '那覇 / Naha',          lat: 26.2124,  lng: 127.6809,  tz: 9  },
  { name: 'Seoul / ソウル',        lat: 37.5665,  lng: 126.9780,  tz: 9  },
  { name: 'Beijing / 北京',        lat: 39.9042,  lng: 116.4074,  tz: 8  },
  { name: 'Shanghai / 上海',       lat: 31.2304,  lng: 121.4737,  tz: 8  },
  { name: 'Hong Kong / 香港',      lat: 22.3193,  lng: 114.1694,  tz: 8  },
  { name: 'Taipei / 台北',         lat: 25.0330,  lng: 121.5654,  tz: 8  },
  { name: 'Singapore / シンガポール',lat: 1.3521,  lng: 103.8198,  tz: 8  },
  { name: 'Bangkok / バンコク',     lat: 13.7563,  lng: 100.5018,  tz: 7  },
  { name: 'Mumbai / ムンバイ',      lat: 19.0760,  lng: 72.8777,   tz: 5.5},
  { name: 'Dubai / ドバイ',         lat: 25.2048,  lng: 55.2708,   tz: 4  },
  { name: 'Paris / パリ',           lat: 48.8566,  lng: 2.3522,    tz: 1  },
  { name: 'London / ロンドン',      lat: 51.5074,  lng: -0.1278,   tz: 0  },
  { name: 'Berlin / ベルリン',      lat: 52.5200,  lng: 13.4050,   tz: 1  },
  { name: 'Rome / ローマ',          lat: 41.9028,  lng: 12.4964,   tz: 1  },
  { name: 'New York / ニューヨーク', lat: 40.7128,  lng: -74.0060,  tz: -5 },
  { name: 'Los Angeles / LA',      lat: 34.0522,  lng: -118.2437, tz: -8 },
  { name: 'Chicago / シカゴ',       lat: 41.8781,  lng: -87.6298,  tz: -6 },
  { name: 'Toronto / トロント',     lat: 43.6532,  lng: -79.3832,  tz: -5 },
  { name: 'São Paulo / サンパウロ', lat: -23.5505, lng: -46.6333,  tz: -3 },
  { name: 'Sydney / シドニー',      lat: -33.8688, lng: 151.2093,  tz: 10 },
  { name: 'Melbourne / メルボルン', lat: -37.8136, lng: 144.9631,  tz: 10 },
  { name: 'Auckland / オークランド',lat: -36.8509, lng: 174.7645,  tz: 12 },
]

/* ── 星座データ ── */
const SIGNS = [
  { name:'牡羊座', nameEn:'Aries',       symbol:'♈', element:'fire',  start:[3,21] },
  { name:'牡牛座', nameEn:'Taurus',      symbol:'♉', element:'earth', start:[4,20] },
  { name:'双子座', nameEn:'Gemini',      symbol:'♊', element:'air',   start:[5,21] },
  { name:'蟹座',   nameEn:'Cancer',      symbol:'♋', element:'water', start:[6,22] },
  { name:'獅子座', nameEn:'Leo',         symbol:'♌', element:'fire',  start:[7,23] },
  { name:'乙女座', nameEn:'Virgo',       symbol:'♍', element:'earth', start:[8,23] },
  { name:'天秤座', nameEn:'Libra',       symbol:'♎', element:'air',   start:[9,23] },
  { name:'蠍座',   nameEn:'Scorpio',     symbol:'♏', element:'water', start:[10,23] },
  { name:'射手座', nameEn:'Sagittarius', symbol:'♐', element:'fire',  start:[11,22] },
  { name:'山羊座', nameEn:'Capricorn',   symbol:'♑', element:'earth', start:[12,22] },
  { name:'水瓶座', nameEn:'Aquarius',    symbol:'♒', element:'air',   start:[1,20]  },
  { name:'魚座',   nameEn:'Pisces',      symbol:'♓', element:'water', start:[2,19]  },
]

const ELEMENT_COLOR: Record<string, string> = {
  fire:'#C87060', earth:'#A89060', air:'#7888C0', water:'#6090A8'
}

const READINGS: Record<string, {
  essence: { title: string; titleEn: string; body: string; bodyEn: string }
  love:    { title: string; titleEn: string; body: string; bodyEn: string }
}> = {
  '牡羊座': {
    essence: {
      title: '衝動は、魂の声かもしれない',
      titleEn: 'Impulse may be the voice of your soul',
      body: `考える前に動いている自分を、責める必要はないかもしれません。\n\n心理学的には、行動優位型の人は感情を体で処理する傾向があります。\n\nやがて、速さの中に\n静けさを見つける時が来るでしょう。`,
      bodyEn: `You don't need to blame yourself for acting before thinking.\n\nPsychologically, action-oriented people tend to process emotions through the body.\n\nSomeday, within your speed,\nyou will find stillness.`,
    },
    love: {
      title: '愛を待つより、愛を選ぶ',
      titleEn: 'Choose love rather than wait for it',
      body: `好きだと感じたら、動かずにいられない。その率直さは、相手への誠実さでもあります。\n\nあなたの愛の速さは、欠点ではないかもしれません。`,
      bodyEn: `When you feel love, you can't stay still. That honesty is also a form of sincerity.\n\nYour speed in love may not be a flaw at all.`,
    },
  },
  '牡牛座': {
    essence: {
      title: '「持つこと」より「感じること」',
      titleEn: 'Feeling over having',
      body: `安心を求める気持ちは、弱さではありません。\n\n豊かさとは持つことではなく、感じることなのかもしれません。\n\nあなたの五感は、その答えをもう知っています。`,
      bodyEn: `Seeking safety is not weakness.\n\nRichness may not be about having, but about feeling.\n\nYour senses already know the answer.`,
    },
    love: {
      title: '愛は、時間をかけて本物になる',
      titleEn: 'Love becomes real with time',
      body: `ゆっくりでいい。確かめながら、少しずつ。\n\n時間をかけて築いた信頼は揺れにくく、長く続くものです。`,
      bodyEn: `Take your time. Slowly, step by step.\n\nTrust built over time is steady and lasting.`,
    },
  },
  '双子座': {
    essence: {
      title: '迷いは、知性が豊かすぎるだけ',
      titleEn: 'Indecision is simply an abundance of intelligence',
      body: `「答えを出すこと」より「問いを深めること」があなたの本質に近いのかもしれません。\n\nいつか、その言葉が誰かの光になる日が来るでしょう。`,
      bodyEn: `Deepening the question may suit you more than finding the answer.\n\nSomeday, your words will become someone's light.`,
    },
    love: {
      title: '心が通じる会話が、愛の始まり',
      titleEn: 'A conversation that connects hearts is where love begins',
      body: `笑い合えること、問いを共有できること。\n\nその感覚を大切にしていい。それがあなたにとっての、愛の言語かもしれません。`,
      bodyEn: `Being able to laugh together, to share questions.\n\nTreasure that feeling. It may be your language of love.`,
    },
  },
  '蟹座': {
    essence: {
      title: '感じすぎることは、才能かもしれない',
      titleEn: 'Feeling too deeply may be your gift',
      body: `傷つく力と、癒す力は同じ根から生まれているのかもしれません。\n\nあなたの感情は、弱さではなく誰かを助ける日のための、準備なのかもしれません。`,
      bodyEn: `The capacity to be hurt and the capacity to heal may share the same root.\n\nYour emotions are not weakness — they may be preparation for the day you help someone.`,
    },
    love: {
      title: '守ることと、守られることの間で',
      titleEn: 'Between protecting and being protected',
      body: `愛することと、愛されることは同じくらい大切かもしれません。\n\nあなたの温かさを、自分自身にも向けてみてください。`,
      bodyEn: `Loving and being loved may be equally important.\n\nTry directing your warmth toward yourself as well.`,
    },
  },
  '獅子座': {
    essence: {
      title: '輝きを「求める」より「許す」',
      titleEn: 'Allow yourself to shine, rather than seek it',
      body: `輝くことを求めるのではなく、輝いていいと自分に許す。\n\nその瞬間から、周りの景色が少し変わるかもしれません。`,
      bodyEn: `Rather than seeking to shine, give yourself permission to shine.\n\nFrom that moment, the world around you may look a little different.`,
    },
    love: {
      title: '愛されたいと、愛したいは、同じ願い',
      titleEn: 'Wanting to be loved and wanting to love are the same wish',
      body: `それは「あなたにとって私は大切ですか」という深い問いかけかもしれません。\n\nそのままのあなたを受け取ってくれる人が、必ずいます。`,
      bodyEn: `It may be a deep question: "Am I important to you?"\n\nThere is someone who will receive you exactly as you are.`,
    },
  },
  '乙女座': {
    essence: {
      title: '完璧を目指す心の、その奥に',
      titleEn: 'Within the heart that seeks perfection',
      body: `完璧を求めることと、自分を許すことは矛盾しないのかもしれません。\n\n丁寧に生きてきたその歩みはちゃんと、あなたの中に積み重なっています。`,
      bodyEn: `Seeking perfection and forgiving yourself may not be contradictions.\n\nThe careful steps you have taken are quietly accumulating within you.`,
    },
    love: {
      title: '言葉より行動で愛す人へ',
      titleEn: 'To those who love through actions more than words',
      body: `「好き」とはっきり言えなくても、相手のために動いてしまう。\n\nそれは確かな愛の形かもしれません。`,
      bodyEn: `Even if you can't say "I love you" clearly, you act for the other person.\n\nThat may be a genuine form of love.`,
    },
  },
  '天秤座': {
    essence: {
      title: '迷うことは、愛しているから',
      titleEn: 'You hesitate because you care',
      body: `選べないのではなく、どちらにも意味があると知っているのかもしれません。\n\nそのやさしい目で見た世界はきっと、誰かの救いになっています。`,
      bodyEn: `You may not be unable to choose — you may simply know that both sides have meaning.\n\nThe world seen through your gentle eyes is surely someone's comfort.`,
    },
    love: {
      title: '対等な愛の、難しさと美しさ',
      titleEn: 'The difficulty and beauty of equal love',
      body: `あなたを大切にしない人を大切にし続ける必要はないかもしれません。\n\n愛は犠牲ではなく、選択かもしれません。`,
      bodyEn: `You may not need to keep cherishing someone who doesn't cherish you.\n\nLove may be a choice, not a sacrifice.`,
    },
  },
  '蠍座': {
    essence: {
      title: '深く傷つく人は、深く愛せる人',
      titleEn: 'Those who are deeply hurt can deeply love',
      body: `傷は弱さの証ではなく、深く関わってきた証かもしれません。\n\n何度でも変容できるのがあなたの、静かな強さです。`,
      bodyEn: `A wound may not be evidence of weakness, but of deep engagement.\n\nThe ability to transform again and again is your quiet strength.`,
    },
    love: {
      title: '全か無かは、本気の証',
      titleEn: 'All or nothing is proof of sincerity',
      body: `中途半端な関係に満足できない。それは深く関わることへの誠実さかもしれません。\n\nあなたの愛の深さは、本物です。`,
      bodyEn: `You can't be satisfied with half-hearted connection. That may be your sincerity toward deep involvement.\n\nThe depth of your love is real.`,
    },
  },
  '射手座': {
    essence: {
      title: '答えより、問いが好きなのかもしれない',
      titleEn: 'You may love questions more than answers',
      body: `「答えを持つ人」より「問いを持ち続ける人」がやがて、道を開くことがあります。`,
      bodyEn: `Those who keep holding questions may eventually open the path, more than those who hold answers.`,
    },
    love: {
      title: '自由と愛は、矛盾しないかもしれない',
      titleEn: 'Freedom and love may not be contradictions',
      body: `束縛ではなく信頼。距離ではなく尊重。\n\nそんな関係は、きっと存在します。`,
      bodyEn: `Not control, but trust. Not distance, but respect.\n\nSuch a relationship surely exists.`,
    },
  },
  '山羊座': {
    essence: {
      title: '山を登る速さより、登り方が問い',
      titleEn: 'How you climb matters more than how fast',
      body: `山の頂上より、どんな気持ちで一歩を踏み出したか。\n\nその積み重ねがやがてあなたの本当の財産になるかもしれません。`,
      bodyEn: `More than the summit, how you felt taking each step matters.\n\nThat accumulation may become your true wealth.`,
    },
    love: {
      title: '愛に、時間がかかってもいい',
      titleEn: "It's okay if love takes time",
      body: `時間をかけて育てた関係は根が深く、簡単には揺らがないでしょう。\n\nあなたのペースで、大丈夫です。`,
      bodyEn: `A relationship nurtured over time has deep roots and won't shake easily.\n\nYour pace is just right.`,
    },
  },
  '水瓶座': {
    essence: {
      title: '孤独は、時代より早く生まれた証',
      titleEn: 'Loneliness is proof you were born ahead of your time',
      body: `孤独は、罰ではなく先を歩く者が払う、静かなコストかもしれません。\n\nいつか、あなたの言葉が誰かの「そうだったのか」になる日が来るでしょう。`,
      bodyEn: `Loneliness may not be punishment, but the quiet cost of walking ahead.\n\nSomeday, your words will become someone's "so that's it."`,
    },
    love: {
      title: '友情が、最も深い愛になることがある',
      titleEn: 'Friendship can sometimes become the deepest love',
      body: `頭で理解し合える人、価値観を共有できる人との縁が\nあなたの愛の土台になるかもしれません。\n\nそこから始まる愛は、静かで、長く続きます。`,
      bodyEn: `A connection with someone who understands your mind and shares your values\nmay become the foundation of your love.\n\nLove that begins there is quiet and long-lasting.`,
    },
  },
  '魚座': {
    essence: {
      title: '境界が溶ける感覚は、共感の深さ',
      titleEn: 'The feeling of dissolving boundaries is the depth of empathy',
      body: `「溶けてしまう」のではなく、「繋がれる」のかもしれません。\n\nその繊細さは、あなたにしか届けられない場所へ、あなたを連れていくでしょう。`,
      bodyEn: `You may not be dissolving — you may be connecting.\n\nYour sensitivity will take you to places only you can reach.`,
    },
    love: {
      title: '愛することは、溶けることではない',
      titleEn: 'Loving is not dissolving',
      body: `あなたを大切にすることが相手への最大の贈り物かもしれません。\n\n溶けるのではなく、触れる。その違いを、ゆっくり感じてみてください。`,
      bodyEn: `Cherishing yourself may be the greatest gift to the other person.\n\nNot dissolving, but touching. Slowly feel the difference.`,
    },
  },
}

function getSunSign(month: number, day: number) {
  for (let i = 0; i < SIGNS.length; i++) {
    const [sm, sd] = SIGNS[i].start
    const [nm, nd] = SIGNS[(i + 1) % 12].start
    if (sm === month && day >= sd) return SIGNS[i]
    if (nm === month && day < nd)  return SIGNS[i]
  }
  return SIGNS[11]
}

function getMoonSign(year: number, month: number, day: number) {
  const base = new Date(2000, 0, 1)
  const d    = new Date(year, month - 1, day)
  const days = Math.floor((d.getTime() - base.getTime()) / 86400000)
  const idx  = Math.floor(((days % 354) + 354) % 354 / 29.5 * 12) % 12
  return SIGNS[idx]
}

function signIndex(sign: typeof SIGNS[0]) {
  return SIGNS.findIndex(s => s.name === sign.name)
}

function drawWheel(sunIdx: number, moonIdx: number) {
  const cx = 170, cy = 170
  const r1 = 155, r2 = 125, r3 = 95, r4 = 60
  const toRad = (deg: number) => (deg - 90) * Math.PI / 180
  let svg = ''
  svg += `<circle cx="${cx}" cy="${cy}" r="${r1}" fill="#020208"/>`
  for (let i = 0; i < 12; i++) {
    const sign  = SIGNS[i]
    const color = ELEMENT_COLOR[sign.element]
    const start = toRad(i * 30)
    const end   = toRad((i + 1) * 30)
    const x1 = cx + r1 * Math.cos(start), y1 = cy + r1 * Math.sin(start)
    const x2 = cx + r1 * Math.cos(end),   y2 = cy + r1 * Math.sin(end)
    const x3 = cx + r2 * Math.cos(end),   y3 = cy + r2 * Math.sin(end)
    const x4 = cx + r2 * Math.cos(start), y4 = cy + r2 * Math.sin(start)
    const bg = i % 2 === 0 ? 'rgba(255,255,255,.03)' : 'transparent'
    svg += `<path d="M${x1},${y1} A${r1},${r1} 0 0,1 ${x2},${y2} L${x3},${y3} A${r2},${r2} 0 0,0 ${x4},${y4} Z" fill="${bg}" stroke="rgba(212,175,55,.15)" stroke-width=".5"/>`
    const mid  = toRad(i * 30 + 15)
    const symR = (r1 + r2) / 2
    svg += `<text x="${cx + symR * Math.cos(mid)}" y="${cy + symR * Math.sin(mid)}" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="${color}" opacity=".9">${sign.symbol}</text>`
  }
  svg += `<circle cx="${cx}" cy="${cy}" r="${r3}" fill="transparent" stroke="rgba(212,175,55,.1)" stroke-width=".5"/>`
  svg += `<circle cx="${cx}" cy="${cy}" r="${r4}" fill="rgba(6,6,15,.8)" stroke="rgba(212,175,55,.15)" stroke-width=".8"/>`
  for (let i = 0; i < 12; i++) {
    const ang = toRad(i * 30)
    svg += `<line x1="${cx + r2 * Math.cos(ang)}" y1="${cy + r2 * Math.sin(ang)}" x2="${cx + r3 * Math.cos(ang)}" y2="${cy + r3 * Math.sin(ang)}" stroke="rgba(212,175,55,.18)" stroke-width=".5"/>`
  }
  const planets = [
    { idx: sunIdx,  sym: '☉', color: '#D4AF37', r: 78 },
    { idx: moonIdx, sym: '☽', color: '#C4C0B6', r: 110 },
  ]
  planets.forEach(p => {
    const ang = toRad(p.idx * 30 + 15)
    const px  = cx + p.r * Math.cos(ang)
    const py  = cy + p.r * Math.sin(ang)
    svg += `<circle cx="${px}" cy="${py}" r="10" fill="rgba(2,2,8,.85)" stroke="${p.color}" stroke-width="1"/>`
    svg += `<text x="${px}" y="${py}" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="${p.color}">${p.sym}</text>`
  })
  svg += `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-family="Cinzel,serif" font-size="9" fill="rgba(212,175,55,.5)" letter-spacing="2">LUNARIA</text>`
  return svg
}

export default function ChartPage() {
  const [lang,   setLang]   = useState<'ja'|'en'>('ja')
  const [date,   setDate]   = useState('')
  const [city,   setCity]   = useState('')
  const [result, setResult] = useState<null|{sun:typeof SIGNS[0];moon:typeof SIGNS[0]}>(null)
  const t = LANG[lang]

  const generate = () => {
    if (!date) return
    const [y, m, d] = date.split('-').map(Number)
    setResult({ sun: getSunSign(m, d), moon: getMoonSign(y, m, d) })
  }

  return (
    <main className="main-content">

      {/* 言語切り替え */}
      <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:'1.5rem', gap:'.5rem' }}>
        <button
          onClick={() => setLang('ja')}
          style={{
            fontFamily:'var(--fc)', fontSize:'.42rem', letterSpacing:'.12em',
            padding:'.3rem .8rem',
            background: lang==='ja' ? 'var(--g)' : 'transparent',
            color: lang==='ja' ? 'var(--i0)' : 'var(--t2)',
            border:'1px solid rgba(212,175,55,.3)',
            cursor:'pointer', transition:'all .2s',
          }}
        >日本語</button>
        <button
          onClick={() => setLang('en')}
          style={{
            fontFamily:'var(--fc)', fontSize:'.42rem', letterSpacing:'.12em',
            padding:'.3rem .8rem',
            background: lang==='en' ? 'var(--g)' : 'transparent',
            color: lang==='en' ? 'var(--i0)' : 'var(--t2)',
            border:'1px solid rgba(212,175,55,.3)',
            cursor:'pointer', transition:'all .2s',
          }}
        >English</button>
      </div>

      <p className="s-eye">{t.eyebrow}</p>
      <h1 className="s-head">{t.title}</h1>
      <div className="s-rule" />

      {!result ? (
        <div className="birth-form">
          <p className="form-lead">{t.lead}</p>

          <div className="form-field">
            <label className="form-label">{t.labelDate}</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">
              {t.labelCity}
            </label>
            <select
              className="form-input"
              value={city}
              onChange={e => setCity(e.target.value)}
              style={{ cursor:'pointer' }}
            >
              <option value="">{t.labelCityPlaceholder}</option>
              {CITIES.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <button className="form-submit" onClick={generate}>
            {t.btnGenerate}
          </button>
        </div>
      ) : (
        <div>
          {/* ホイール */}
          <div className="wheel-wrap">
            <svg viewBox="0 0 340 340" xmlns="http://www.w3.org/2000/svg"
              dangerouslySetInnerHTML={{ __html: drawWheel(signIndex(result.sun), signIndex(result.moon)) }}
            />
          </div>

          {/* 天体サマリー */}
          <div className="planet-summary" style={{ marginBottom:'2rem' }}>
            {[
              { sym:'☉', name: t.sun,  sign: result.sun  },
              { sym:'☽', name: t.moon, sign: result.moon },
            ].map(p => (
              <div key={p.name} className="planet-item">
                <span className="planet-symbol">{p.sym}</span>
                <div className="planet-info">
                  <div className="planet-name">{p.name}</div>
                  <div className="planet-sign">
                    {p.sign.symbol} {lang === 'ja' ? p.sign.name : p.sign.nameEn}
                  </div>
                  <div className="planet-degree">{p.sign.nameEn}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 占い文 */}
          <p className="s-eye">{t.readingEye}</p>
          <h2 className="s-head">{t.readingTitle}</h2>
          <div className="s-rule" />

          <div className="reading-cards">
            {READINGS[result.sun.name] && (
              <div className="reading-card">
                <div className="rc-theme">
                  ☉ {lang==='ja' ? result.sun.name : result.sun.nameEn} — {t.themeEssence}
                </div>
                <h4 className="rc-title">
                  {lang==='ja'
                    ? READINGS[result.sun.name].essence.title
                    : READINGS[result.sun.name].essence.titleEn}
                </h4>
                <p className="rc-body" style={{ whiteSpace:'pre-line' }}>
                  {lang==='ja'
                    ? READINGS[result.sun.name].essence.body
                    : READINGS[result.sun.name].essence.bodyEn}
                </p>
              </div>
            )}

            {READINGS[result.moon.name] && (
              <div className="reading-card">
                <div className="rc-theme">
                  ☽ {lang==='ja' ? result.moon.name : result.moon.nameEn} — {t.themeLove}
                </div>
                <h4 className="rc-title">
                  {lang==='ja'
                    ? READINGS[result.moon.name].love.title
                    : READINGS[result.moon.name].love.titleEn}
                </h4>
                <p className="rc-body" style={{ whiteSpace:'pre-line' }}>
                  {lang==='ja'
                    ? READINGS[result.moon.name].love.body
                    : READINGS[result.moon.name].love.bodyEn}
                </p>
              </div>
            )}
          </div>

          <button
            className="form-submit"
            style={{ marginTop:'1.5rem' }}
            onClick={() => setResult(null)}
          >
            {t.btnEdit}
          </button>
        </div>
      )}
    </main>
  )
}