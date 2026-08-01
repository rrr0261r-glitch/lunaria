/**
 * LUNARIA「月の影」判定エンジン
 *
 * 天体配置(太陽星座・月星座・アスペクト)から、
 * 16の月の影それぞれにスコアをつけ、
 * 主影(70%)/副影(20%)/隠影(10%)を決定する。
 *
 * 設計方針:
 * - 「あなたは○○の影です」という断定はしない
 * - 占術は人生で繰り返し向き合いやすいテーマを映す鏡として扱う
 * - 出生時刻/出生地が無い場合は、生年月日のみのフォールバック計算を使う
 */

import * as Astronomy from 'astronomy-engine';
import { MOON_SHADOW_IDS, type MoonShadow } from './moon-shadows';

export interface BirthData {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  lat?: number;
  lon?: number;
}

export interface ShadowComposition {
  main: string;   // 主影のid (70%)
  sub: string;    // 副影のid (20%)
  hidden: string; // 隠影のid (10%)
  scores: Record<string, number>; // 全16影のスコア(デバッグ・将来拡張用)
}

const SIGNS = [
  '牡羊座','牡牛座','双子座','蟹座','獅子座','乙女座',
  '天秤座','蠍座','射手座','山羊座','水瓶座','魚座',
] as const;

function eclipticLongitude(body: Astronomy.Body, date: Date): number {
  const eq = Astronomy.Ecliptic(Astronomy.GeoVector(body, date, false));
  return eq.elon;
}

function getSignIndex(lon: number): number {
  return Math.floor(lon / 30);
}

function angleDiff(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * 出生時刻が無い場合、その日の正午(現地時間の概算としてUTC正午)を採用する。
 * 月は1日で約13度動くため、時刻が不明な場合の月星座は誤差を含むが、
 * 太陽星座・主要なテーマ判定への影響は小さい。
 */
function resolveDate(birth: BirthData): Date {
  const hour = birth.hour ?? 12;
  const minute = birth.minute ?? 0;
  return new Date(Date.UTC(birth.year, birth.month - 1, birth.day, hour, minute));
}

interface NatalPoint {
  longitude: number;
  signIndex: number;
}

function calcNatalChart(date: Date): Record<string, NatalPoint> {
  const bodies: Array<keyof typeof Astronomy.Body> = [
    'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
    'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  ] as any;

  const chart: Record<string, NatalPoint> = {};
  for (const b of bodies) {
    const lon = eclipticLongitude((Astronomy.Body as any)[b], date);
    chart[b as string] = { longitude: lon, signIndex: getSignIndex(lon) };
  }
  return chart;
}

interface AspectInfo {
  a: string;
  b: string;
  aspectName: string;
  orb: number;
}

const ASPECT_DEFS = [
  { name: '合', angle: 0 },
  { name: '対立', angle: 180 },
  { name: 'スクエア', angle: 90 },
  { name: 'トライン', angle: 120 },
] as const;

function calcAspects(chart: Record<string, NatalPoint>, orb = 6): AspectInfo[] {
  const bodies = Object.keys(chart);
  const aspects: AspectInfo[] = [];
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const diff = angleDiff(chart[bodies[i]].longitude, chart[bodies[j]].longitude);
      for (const def of ASPECT_DEFS) {
        const delta = Math.abs(diff - def.angle);
        if (delta <= orb) {
          aspects.push({ a: bodies[i], b: bodies[j], aspectName: def.name, orb: delta });
        }
      }
    }
  }
  return aspects;
}

/**
 * 天体配置から、16の月の影それぞれにスコアを加算する。
 * スコアリングの考え方:
 * - 特定の天体同士のアスペクトが、特定の影のテーマと共鳴する
 * - 太陽星座・月星座の特性も加点要素にする
 * - orbが小さい(=正確に重なっている)ほど高得点
 */
function scoreShadows(chart: Record<string, NatalPoint>, aspects: AspectInfo[]): Record<string, number> {
  const scores: Record<string, number> = Object.fromEntries(
    MOON_SHADOW_IDS.map(id => [id, 0])
  );

  function addScore(id: string, amount: number) {
    scores[id] = (scores[id] ?? 0) + amount;
  }

  // アスペクトベースのスコアリング
  for (const asp of aspects) {
    const pair = `${asp.a}-${asp.b}`;
    const weight = Math.max(1, 10 - asp.orb); // orbが小さいほど重い

    // 月×土星: 頑張らないと愛されない、という感覚 → 月隠れの影
    if (pair.includes('Moon') && pair.includes('Saturn')) {
      addScore('moonhidden', weight * 1.5);
      addScore('root', weight * 0.8);
    }
    // 月×冥王星: 感情の深さ、執着 → 深海の影
    if (pair.includes('Moon') && pair.includes('Pluto')) {
      addScore('deepsea', weight * 1.5);
      addScore('hollow', weight * 0.6);
    }
    // 太陽×天王星: 自由を求める、縛られたくない → 籠の影
    if (pair.includes('Sun') && pair.includes('Uranus')) {
      addScore('cage', weight * 1.3);
      addScore('wanderer', weight * 1.0);
    }
    // 金星×海王星: 理想と現実の狭間 → 霧の影
    if (pair.includes('Venus') && pair.includes('Neptune')) {
      addScore('veil', weight * 1.4);
      addScore('twilight', weight * 0.7);
    }
    // 水星×天王星 or 水星×海王星: 考えすぎる、理解されない → 星影/深海
    if (pair.includes('Mercury') && (pair.includes('Uranus') || pair.includes('Neptune'))) {
      addScore('starlight', weight * 1.2);
      addScore('deepsea', weight * 0.6);
    }
    // 火星×土星: 抑え込まれた情熱、燃え尽き → 残り火の影
    if (pair.includes('Mars') && pair.includes('Saturn')) {
      addScore('ember', weight * 1.3);
      addScore('permafrost', weight * 0.7);
    }
    // 太陽×冥王星: 存在価値、変容 → 空白の影/渡り鳥
    if (pair.includes('Sun') && pair.includes('Pluto')) {
      addScore('void', weight * 1.2);
      addScore('wanderer', weight * 0.8);
    }
    // 月×海王星: 繊細さ、感情を隠す → 月隠れ/霧
    if (pair.includes('Moon') && pair.includes('Neptune')) {
      addScore('moonhidden', weight * 1.0);
      addScore('veil', weight * 1.0);
    }
    // 金星×土星: 失うことへの恐れ、一途さ → 黄昏の影
    if (pair.includes('Venus') && pair.includes('Saturn')) {
      addScore('twilight', weight * 1.4);
    }
    // 月×天王星: 自由への希求、感情の急変 → 籠/渡り鳥
    if (pair.includes('Moon') && pair.includes('Uranus')) {
      addScore('cage', weight * 1.0);
      addScore('wanderer', weight * 0.9);
    }
    // 太陽×土星: 完璧主義、自己否定 → 根の影
    if (pair.includes('Sun') && pair.includes('Saturn')) {
      addScore('root', weight * 1.3);
      addScore('thorn', weight * 0.6);
    }
    // 水星×冥王星: 過去への執着、深い記憶 → こだまの影
    if (pair.includes('Mercury') && pair.includes('Pluto')) {
      addScore('echo', weight * 1.2);
    }
    // 火星×冥王星: 強い意志の裏の傷つきやすさ → 棘の影
    if (pair.includes('Mars') && pair.includes('Pluto')) {
      addScore('thorn', weight * 1.2);
    }
    // 金星×冥王星: 失う恐れの強い形、執着 → 黄昏/空洞
    if (pair.includes('Venus') && pair.includes('Pluto')) {
      addScore('twilight', weight * 0.8);
      addScore('hollow', weight * 0.8);
    }
    // 木星×海王星: 理想を追い求める、満たされなさ → 空洞の影
    if (pair.includes('Jupiter') && pair.includes('Neptune')) {
      addScore('hollow', weight * 1.0);
    }
    // 月×木星: 比較してしまう、過剰な期待 → 境界の影
    if (pair.includes('Moon') && pair.includes('Jupiter')) {
      addScore('threshold', weight * 1.0);
    }
  }

  // 星座特性ベースの軽い加点(アスペクトが少ない人でもスコア差が出るように)
  const moonSign = chart['Moon']?.signIndex;
  const sunSign = chart['Sun']?.signIndex;

  // 水のサイン(蟹4=index3, 蠍8=index7, 魚12=index11)は感情の深さ系
  const waterSigns = [3, 7, 11];
  if (moonSign !== undefined && waterSigns.includes(moonSign)) {
    addScore('deepsea', 3);
    addScore('moonhidden', 2);
  }
  // 風のサイン(双子=2, 天秤=6, 水瓶=10)は自由・思考系
  const airSigns = [2, 6, 10];
  if (sunSign !== undefined && airSigns.includes(sunSign)) {
    addScore('cage', 2);
    addScore('starlight', 2);
  }
  // 土のサイン(牡牛=1, 乙女=5, 山羊=9)は完璧主義・継続系
  const earthSigns = [1, 5, 9];
  if (sunSign !== undefined && earthSigns.includes(sunSign)) {
    addScore('root', 2);
    addScore('permafrost', 1.5);
  }
  // 火のサイン(牡羊=0, 獅子=4, 射手=8)は情熱・変化系
  const fireSigns = [0, 4, 8];
  if (sunSign !== undefined && fireSigns.includes(sunSign)) {
    addScore('ember', 2);
    addScore('wanderer', 1.5);
  }

  return scores;
}

/**
 * 出生データから「月の影」の構成(主影70%/副影20%/隠影10%)を判定する。
 * 出生時刻・出生地が無くても、生年月日のみでフォールバック計算する
 * (月星座の精度は落ちるが、太陽星座ベースのスコアリングで一定の解像度を保つ)。
 */
export function getShadowComposition(birth: BirthData): ShadowComposition {
  const date = resolveDate(birth);
  const chart = calcNatalChart(date);
  const aspects = calcAspects(chart);
  const scores = scoreShadows(chart, aspects);

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return {
    main: sorted[0]?.[0] ?? MOON_SHADOW_IDS[0],
    sub: sorted[1]?.[0] ?? MOON_SHADOW_IDS[1],
    hidden: sorted[2]?.[0] ?? MOON_SHADOW_IDS[2],
    scores,
  };
}