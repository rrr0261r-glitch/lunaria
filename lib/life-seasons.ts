export interface LifeSeason {
  id: string;
  name: string;
  description: string; // 結果ページで見せる、この季節の説明
  advice: string;       // AIへの、この季節における具体的な行動指針
}

export const LIFE_SEASONS: Record<string, LifeSeason> = {
  seed: {
    id: 'seed',
    name: '種',
    description: 'まだ何も形になっていないけれど、内側に何かを抱えている時期',
    advice: 'まだ言葉にしなくていい時期。誰かに話す前に、まずノートに書き留めることを勧める。焦って行動に移さず、内側で育てることを肯定する',
  },
  sprout: {
    id: 'sprout',
    name: '発芽',
    description: '小さな一歩を踏み出した、まだ頼りないけれど確かな変化の時期',
    advice: '小さく試してみることを勧める。大きく動く前に、信頼できる誰か一人にだけ話してみる、というくらいの規模感を提案する',
  },
  bud: {
    id: 'bud',
    name: '蕾',
    description: '内側に力を溜めながら、まだ開く前の静かな準備の時期',
    advice: '今は準備を整える時期だと伝える。情報を集める、環境を整える、必要なスキルを身につけるなど、開花の前の地ならしを勧める',
  },
  bloom: {
    id: 'bloom',
    name: '開花',
    description: '今まさに、自分らしさが外に向かって表れている時期',
    advice: '今が動きどきだと伝える。声に出す、発信する、踏み出す、人に会う——内側に留めていたものを外に出すことを後押しする',
  },
  fruit: {
    id: 'fruit',
    name: '実り',
    description: 'これまでの積み重ねが、何かしらの形になりつつある時期',
    advice: '振り返って言語化することを勧める。何を積み重ねてきたかを自分の言葉でまとめ、次の種をまく準備をすることを提案する',
  },
  winter: {
    id: 'winter',
    name: '冬眠',
    description: '外には見えないけれど、内側で大切な何かが育っている休息の時期',
    advice: '何もしない選択をすることを積極的に肯定する。予定を減らす、断る練習をする、休むこと自体が今やるべきことだと伝える',
  },
};

export const LIFE_SEASON_IDS = Object.keys(LIFE_SEASONS);