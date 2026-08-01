// lib/soul-engine.ts
export const SOUL_GROUPS = [
  '灯の民',
  '星渡りの民',
  '花の民',
  '大樹の民',
  '炎の民',
  '風の民',
  '雫の民',
] as const;

export type SoulGroup = (typeof SOUL_GROUPS)[number];

export const SOUL_AGES = [
  '幼魂', '若魂', '成魂', '熟魂', '古魂',
] as const;

export type SoulAge = (typeof SOUL_AGES)[number];

export const ELEMENTS = ['光', '風', '水', '土', '火'] as const;

export type Element = (typeof ELEMENTS)[number];

export interface Birthday {
  year: number;
  month: number;
  day: number;
}

export interface SoulComposition {
  group: SoulGroup;
  ratio: 70 | 20 | 10;
  role: '主星' | '副星' | '隠れ星';
}

export interface SoulType {
  destinyNumber: number;
  soulAge: SoulAge;
  element: Element;
  mainStar: SoulGroup;
  subStar: SoulGroup;
  hiddenStar: SoulGroup;
  composition: SoulComposition[];
}

function digitalRoot(n: number): number {
  let v = Math.abs(n);
  while (v > 9) {
    v = String(v)
      .split('')
      .reduce((sum, d) => sum + Number(d), 0);
  }
  return v;
}

export function parseBirthday(iso: string): Birthday {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) throw new Error(`Invalid birthday format: ${iso} (expected YYYY-MM-DD)`);
  const [, y, mo, d] = m;
  const birthday = { year: Number(y), month: Number(mo), day: Number(d) };
  validateBirthday(birthday);
  return birthday;
}

function validateBirthday({ year, month, day }: Birthday): void {
  if (month < 1 || month > 12) throw new Error(`Invalid month: ${month}`);
  const daysInMonth = [31, isLeap(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day < 1 || day > daysInMonth[month - 1]) {
    throw new Error(`Invalid day: ${year}-${month}-${day}`);
  }
}

function isLeap(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function getDestinyNumber({ year, month, day }: Birthday): number {
  const digits = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
  const sum = digits.split('').reduce((s, d) => s + Number(d), 0);
  return digitalRoot(sum);
}

export function getSoulAge(birthday: Birthday): SoulAge {
  const yearRoot = digitalRoot(birthday.year);
  const destiny = getDestinyNumber(birthday);
  const index = (yearRoot + destiny) % SOUL_AGES.length;
  return SOUL_AGES[index];
}

export function getElement({ month, day }: Birthday): Element {
  const index = (month + day) % ELEMENTS.length;
  return ELEMENTS[index];
}

export function getMainStar(birthday: Birthday): SoulGroup {
  const destiny = getDestinyNumber(birthday);
  const elementIndex = ELEMENTS.indexOf(getElement(birthday));
  const index = (destiny + elementIndex) % SOUL_GROUPS.length;
  return SOUL_GROUPS[index];
}

export function getSubStar(birthday: Birthday): SoulGroup {
  const mainIndex = SOUL_GROUPS.indexOf(getMainStar(birthday));
  const ageIndex = SOUL_AGES.indexOf(getSoulAge(birthday));
  const offset = (ageIndex % (SOUL_GROUPS.length - 1)) + 1;
  return SOUL_GROUPS[(mainIndex + offset) % SOUL_GROUPS.length];
}

export function getHiddenStar(birthday: Birthday): SoulGroup {
  const mainIndex = SOUL_GROUPS.indexOf(getMainStar(birthday));
  const subIndex = SOUL_GROUPS.indexOf(getSubStar(birthday));
  let index = digitalRoot(birthday.day) % SOUL_GROUPS.length;
  while (index === mainIndex || index === subIndex) {
    index = (index + 1) % SOUL_GROUPS.length;
  }
  return SOUL_GROUPS[index];
}

export function getSoulType(input: string | Birthday): SoulType {
  const birthday = typeof input === 'string' ? parseBirthday(input) : input;
  if (typeof input !== 'string') validateBirthday(birthday);

  const destinyNumber = getDestinyNumber(birthday);
  const soulAge = getSoulAge(birthday);
  const element = getElement(birthday);
  const mainStar = getMainStar(birthday);
  const subStar = getSubStar(birthday);
  const hiddenStar = getHiddenStar(birthday);

  return {
    destinyNumber,
    soulAge,
    element,
    mainStar,
    subStar,
    hiddenStar,
    composition: [
      { group: mainStar, ratio: 70, role: '主星' },
      { group: subStar, ratio: 20, role: '副星' },
      { group: hiddenStar, ratio: 10, role: '隠れ星' },
    ],
  };
}