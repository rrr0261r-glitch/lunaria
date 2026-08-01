// LUNARIA オンボーディング:演出タイミングの一括管理
// ここの数値を変えるだけで、全体の「間」を調整できる

export const TIMING = {
  moonlightStart: 2500,
  moonlightDuration: 12000,
  resurfaceStart: 6000,
  resurfaceDuration: 14000,
  titleStart: 20000,
  titleFadeDuration: 6000,
  inkedStart: 27000,
  inkedFadeDuration: 5000,
  pageTurnSealDelay: 1000,
  pageTurnDuration: 2000,
} as const;

export type Phase =
  | 'silent'
  | 'moonlit'
  | 'resurfaced'
  | 'titled'
  | 'inked'
  | 'turning'
  | 'turned';
