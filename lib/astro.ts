import * as Astronomy from 'astronomy-engine';
import { LIFE_SEASON_IDS } from './life-seasons';

export const SIGNS = [
  '牡羊座','牡牛座','双子座','蟹座','獅子座','乙女座',
  '天秤座','蠍座','射手座','山羊座','水瓶座','魚座',
] as const;

export type Sign = (typeof SIGNS)[number];

export type MoonPhaseName = '新月' | '上弦' | '満月' | '下弦';

export interface MoonInfo {
  angle: number;       // 0-360。0=新月 90=上弦 180=満月 270=下弦
  phase: MoonPhaseName;
  illumination: number; // 0-1。輝面率
}

export interface ConjunctionInfo {
  bodyA: string;
  bodyB: string;
  orb: number; // 角度差(小さいほど正確に重なっている)
}

const BODY_JP: Record<string, string> = {
  Sun: '太陽', Moon: '月', Mercury: '水星', Venus: '金星',
  Mars: '火星', Jupiter: '木星', Saturn: '土星',
};

function eclipticLongitude(body: Astronomy.Body, date: Date): number {
  const eq = Astronomy.Ecliptic(Astronomy.GeoVector(body, date, false));
  return eq.elon;
}

function angleDiff(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/** 指定日の月相を返す */
export function getMoonInfo(date: Date): MoonInfo {
  const angle = Astronomy.MoonPhase(date);
  let phase: MoonPhaseName;
  if (angle < 45 || angle >= 315) phase = '新月';
  else if (angle < 135) phase = '上弦';
  else if (angle < 225) phase = '満月';
  else phase = '下弦';

  const illumination = (1 - Math.cos((angle * Math.PI) / 180)) / 2;

  return { angle, phase, illumination };
}

/** 指定日が満月までの日数(負の場合は満月を過ぎている) */
export function daysToFullMoon(date: Date): number {
  const angle = Astronomy.MoonPhase(date);
  const remaining = 180 - angle;
  // 月の公転速度はおよそ 13.2°/日
  return Math.round((remaining < 0 ? remaining + 360 : remaining) / 13.2);
}

/** 指定日が新月から数えて前半(満月まで)か後半(満月後)かを返す */
export function getMonthHalf(date: Date): '前半' | '後半' {
  const angle = Astronomy.MoonPhase(date);
  return angle < 180 ? '前半' : '後半';
}

/** 太陽星座(トロピカル方式) */
export function getSunSign(date: Date): Sign {
  const lon = eclipticLongitude(Astronomy.Body.Sun, date);
  return SIGNS[Math.floor(lon / 30)];
}

/** 水星逆行中かどうか */
export function isMercuryRetrograde(date: Date): boolean {
  const oneDayMs = 86400000;
  const lon1 = eclipticLongitude(Astronomy.Body.Mercury, new Date(date.getTime() - oneDayMs));
  const lon2 = eclipticLongitude(Astronomy.Body.Mercury, new Date(date.getTime() + oneDayMs));
  let diff = lon2 - lon1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

/** 金星逆行中かどうか */
export function isVenusRetrograde(date: Date): boolean {
  const oneDayMs = 86400000;
  const lon1 = eclipticLongitude(Astronomy.Body.Venus, new Date(date.getTime() - oneDayMs));
  const lon2 = eclipticLongitude(Astronomy.Body.Venus, new Date(date.getTime() + oneDayMs));
  let diff = lon2 - lon1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

const CONJUNCTION_BODIES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'] as const;

/**
 * 指定日のコンジャンクション(惑星の合)を検出する。
 * orb(許容誤差角度)以内に黄経が重なっている惑星ペアを返す。
 * デフォルトのorb=8は実用上ちょうどいい精度(占星術の標準的な値)。
 */
export function findConjunctions(date: Date, orb = 8): ConjunctionInfo[] {
  const longitudes: Record<string, number> = {};
  for (const b of CONJUNCTION_BODIES) {
    longitudes[b] = eclipticLongitude(Astronomy.Body[b], date);
  }

  const result: ConjunctionInfo[] = [];
  for (let i = 0; i < CONJUNCTION_BODIES.length; i++) {
    for (let j = i + 1; j < CONJUNCTION_BODIES.length; j++) {
      const a = CONJUNCTION_BODIES[i];
      const b = CONJUNCTION_BODIES[j];
      const diff = angleDiff(longitudes[a], longitudes[b]);
      if (diff <= orb) {
        result.push({ bodyA: BODY_JP[a], bodyB: BODY_JP[b], orb: Math.round(diff * 10) / 10 });
      }
    }
  }
  return result;
}

/** 指定日の星空サマリー(LUNARIAの鑑定文生成・カレンダー表示で使う統合情報) */
export interface DailyAstro {
  date: string;
  moon: MoonInfo;
  monthHalf: '前半' | '後半';
  sunSign: Sign;
  mercuryRetrograde: boolean;
  venusRetrograde: boolean;
  conjunctions: ConjunctionInfo[];
}

export function getDailyAstro(date: Date): DailyAstro {
  return {
    date: date.toISOString().slice(0, 10),
    moon: getMoonInfo(date),
    monthHalf: getMonthHalf(date),
    sunSign: getSunSign(date),
    mercuryRetrograde: isMercuryRetrograde(date),
    venusRetrograde: isVenusRetrograde(date),
    conjunctions: findConjunctions(date),
  };
}

// ════════════════════════════════════════════
// カレンダー用:月内の天体イベントを自動検出する
// ════════════════════════════════════════════

export interface MonthEvent {
  day: number;
  title: string;
  tags: string[];
  message: string;
}

const MOON_EVENT_MESSAGE: Record<string, string> = {
  '新月': '新しい種をまく夜。願いごとを静かに思い描いてみてください。',
  '満月': '満ちて、手放す夜。ここまでの自分に、感謝を送ってみてください。',
};

/**
 * 指定の年月における新月・満月・水星逆行の開始終了を自動検出し、
 * カレンダー表示用のイベント配列にして返す。
 * 既存の HOSHI_EVENTS(手動データ)はこの関数の戻り値に置き換える。
 */
export function getMonthEvents(year: number, month: number): MonthEvent[] {
  const events: MonthEvent[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  let prevMoonAngle: number | null = null;
  let prevMercuryRetro: boolean | null = null;
  let prevVenusRetro: boolean | null = null;

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(Date.UTC(year, month - 1, d));
    const moonAngle = Astronomy.MoonPhase(date);
    const mercuryRetro = isMercuryRetrograde(date);
    const venusRetro = isVenusRetrograde(date);
    const sign = getSunSign(date);

    if (prevMoonAngle !== null) {
      // 新月通過
      if (prevMoonAngle > 300 && moonAngle < 60) {
        events.push({
          day: d,
          title: `${sign} 新月`,
          tags: ['新月', sign],
          message: MOON_EVENT_MESSAGE['新月'],
        });
      }
      // 満月通過
      if (prevMoonAngle < 180 && moonAngle >= 180) {
        events.push({
          day: d,
          title: `${sign} 満月`,
          tags: ['満月', sign],
          message: MOON_EVENT_MESSAGE['満月'],
        });
      }
    }

    if (prevMercuryRetro !== null && mercuryRetro !== prevMercuryRetro) {
      events.push({
        day: d,
        title: mercuryRetro ? '水星逆行 はじまる' : '水星逆行 おわる',
        tags: ['水星逆行'],
        message: mercuryRetro
          ? '見直しと振り返りの時期。急いでいたことを、一度置いてみてください。'
          : '滞っていたことが、再び動きはじめる頃。',
      });
    }

    if (prevVenusRetro !== null && venusRetro !== prevVenusRetro) {
      events.push({
        day: d,
        title: venusRetro ? '金星逆行 はじまる' : '金星逆行 おわる',
        tags: ['金星逆行'],
        message: venusRetro
          ? '愛や価値観を、もう一度見つめ直す時期かもしれません。'
          : '心が望むものが、輪郭を持ちはじめる頃。',
      });
    }

    prevMoonAngle = moonAngle;
    prevMercuryRetro = mercuryRetro;
    prevVenusRetro = venusRetro;
  }

  return events;

}

/** 指定の年月日が「満月の日」かどうかを判定する(getMonthEventsと同じロジック) */
  export function isFullMoonDay(year: number, month: number, day: number): boolean {
  const events = getMonthEvents(year, month);
  return events.some(ev => ev.day === day && ev.tags.includes('満月'));
}

/** 指定の年月日が「新月の日」かどうかを判定する */
export function isNewMoonDay(year: number, month: number, day: number): boolean {
  const events = getMonthEvents(year, month);
  return events.some(ev => ev.day === day && ev.tags.includes('新月'));
}

/**
 * 指定の満月の日から見て、直近(過去)の新月の日付を YYYY-MM-DD 形式で返す。
 * 月をまたぐ場合にも対応するため、最大2ヶ月分さかのぼって探す。
 */
export function findPrecedingNewMoon(year: number, month: number, day: number): string | null {
  const target = new Date(Date.UTC(year, month - 1, day));

  for (let back = 0; back <= 2; back++) {
    const d = new Date(target);
    d.setUTCMonth(d.getUTCMonth() - back);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;

    const events = getMonthEvents(y, m);
    const newMoons = events
      .filter(ev => ev.tags.includes('新月'))
      .map(ev => new Date(Date.UTC(y, m - 1, ev.day)))
      .filter(nm => nm.getTime() <= target.getTime())
      .sort((a, b) => b.getTime() - a.getTime());

    if (newMoons.length > 0) {
      const nm = newMoons[0];
      return `${nm.getUTCFullYear()}-${String(nm.getUTCMonth() + 1).padStart(2, '0')}-${String(nm.getUTCDate()).padStart(2, '0')}`;
    }
  }
  return null;
}

// ════════════════════════════════════════════
// 今の季節(人生の季節 × 今月の季節)— 宇宙の法則ベース
// ════════════════════════════════════════════



export interface SeasonComposition {
  lifeSeason: string;   // 人生の大きな季節(7年周期)
  monthSeason: string;  // 今月の小さな季節(月相6分割)
  lifeAgeYears: number; // 参考値:現在の年齢
}

/**
 * 人生の季節:誕生日からの経過年数を7年周期で6分割する。
 * 7年周期は人生の節目の感覚的な単位として採用。
 * 同じ民・同じ月の影でも、人生のフェーズによって
 * 鑑定文のアドバイスの重みづけが変わる。
 */
export function getLifeSeason(birth: { year: number; month: number; day: number }, today = new Date()): string {
  const birthDate = new Date(Date.UTC(birth.year, birth.month - 1, birth.day));
  const t = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const ageDays = (t.getTime() - birthDate.getTime()) / 86400000;
  const ageYears = ageDays / 365.25;

  const cycleYears = 7;
  const cyclePosition = ((ageYears % cycleYears) + cycleYears) % cycleYears; // 負値ガード
  const index = Math.min(5, Math.floor((cyclePosition / cycleYears) * 6));
  return LIFE_SEASON_IDS[index];
}

/**
 * 今月の季節:新月から満月、満月から新月までの月相サイクルを6分割する。
 * 全ユーザー共通(誕生日に依存しない、今日という日に紐づく)。
 */
export function getMonthSeason(today = new Date()): string {
  const angle = Astronomy.MoonPhase(today); // 0-360, 0=新月 180=満月
  const index = Math.min(5, Math.floor(angle / 60));
  return LIFE_SEASON_IDS[index];
}

/** 人生の季節と今月の季節を、両方まとめて返す */
export function getSeasonComposition(
  birth: { year: number; month: number; day: number },
  today = new Date()
): SeasonComposition {
  const birthDate = new Date(Date.UTC(birth.year, birth.month - 1, birth.day));
  const t = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const ageYears = (t.getTime() - birthDate.getTime()) / 86400000 / 365.25;

  return {
    lifeSeason: getLifeSeason(birth, today),
    monthSeason: getMonthSeason(today),
    lifeAgeYears: Math.floor(ageYears),
  };
}