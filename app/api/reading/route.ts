import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TYPE_PROMPTS } from '@/lib/type-prompts';
import { MOON_SHADOWS } from '@/lib/moon-shadows';
import { getShadowComposition, type BirthData } from '@/lib/moon-shadow-engine';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const HEART_CORE = `
【LUNARIA憲法・絶対遵守】
・断定しない。「〜かもしれません」「〜のような気がします」を基調とする
・未来を予言しない
・短所を欠点として書かない。必ず「裏返せば才能」として書く
・恐怖で惹きつけない。不安を煽らない
・必ず希望で終える
・「絶対」「必ず」「危険」「注意」などの強い言葉を使わない
・比喩は自然(月、光、水、草花、季節)から借りる
・占術は診断ではなく「人生で繰り返し向き合いやすいテーマを映す鏡」として扱う
・主影/副影/隠影を「あなたは○○です」と単独で断定せず、複数の影が重なり合う物語として描く
`;

function getMonthlyAstro() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const themes: Record<number, string> = {
    1:  '山羊座の季節が終わり、水瓶座へ。新しい視点が開く月。',
    2:  '水瓶座から魚座へ。直感と夢が深まる月。',
    3:  '春分。牡羊座の季節。新しいはじまりのエネルギー。',
    4:  '牡牛座の季節。豊かさと安定を育む月。',
    5:  '双子座の季節。言葉とつながりが活発になる月。',
    6:  '蟹座の季節。感情と家族、ルーツを振り返る月。',
    7:  '獅子座の季節。自己表現と創造のエネルギーが高まる月。',
    8:  '乙女座の季節。整理と浄化、細部への注意が大切な月。',
    9:  '天秤座の季節。バランスと調和、関係性を見直す月。',
    10: '蠍座の季節。深い変容と手放しのエネルギー。',
    11: '射手座の季節。探求と自由、遠くを見る月。',
    12: '山羊座の季節。目標を定め、基盤を固める月。',
  };
  return { year, month, theme: themes[month] || '' };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      star, subStar, hiddenStar, destinyNumber, soulAge, element,
      userId, birthInfo,
    } = body as {
      star: string;
      subStar: string;
      hiddenStar: string;
      destinyNumber: number;
      soulAge: string;
      element: string;
       userId: string | null;
      birthInfo?: BirthData;
    };

    if (!star || !TYPE_PROMPTS[star]) {
      return NextResponse.json({ error: 'invalid star' }, { status: 400 });
    }

    const astro = getMonthlyAstro();
    const yearMonth = `${astro.year}-${String(astro.month).padStart(2, '0')}`;

    // キャッシュキー(月単位)
    if (userId) {
      const { data: cached } = await supabase
        .from('readings')
        .select('content')
        .eq('user_id', userId)
        .eq('year_month', yearMonth)
        .maybeSingle();

      if (cached?.content) {
        return NextResponse.json({ ...cached.content, cached: true });
      }
    }

    // ── 月の影の判定 ──
    let shadowSection = '';
    if (birthInfo) {
      const composition = getShadowComposition(birthInfo);
      const main = MOON_SHADOWS[composition.main];
      const sub = MOON_SHADOWS[composition.sub];
      const hidden = MOON_SHADOWS[composition.hidden];

      shadowSection = `
【月の影(占星術から映し出された、人生で繰り返し向き合いやすいテーマ)】
主影(70%): ${main.name} —「${main.theme}」
  ${main.description}
  才能: ${main.talents.join(' / ')}

副影(20%): ${sub.name} —「${sub.theme}」
  ${sub.description}
  才能: ${sub.talents.join(' / ')}

隠影(10%、成熟すると開花する部分): ${hidden.name} —「${hidden.theme}」
  ${hidden.description}
  才能: ${hidden.talents.join(' / ')}

※ これら3つの影は、単独でこの人を定義するものではない。
  3つが重なり合う、ひとつの物語として描いてください。
`;
    }

    // ── 季節の自動計算 ──
    let seasonSection = '';
    if (birthInfo) {
      const { getSeasonComposition } = await import('@/lib/astro');
      const { LIFE_SEASONS } = await import('@/lib/life-seasons');
      const seasons = getSeasonComposition(birthInfo);
      const lifeSeason = LIFE_SEASONS[seasons.lifeSeason];
      const monthSeason = LIFE_SEASONS[seasons.monthSeason];

      seasonSection = `
【宇宙の法則から導かれた、今のあなたの季節】
人生の季節(7年周期): ${lifeSeason.name} — ${lifeSeason.description}
行動の指針: ${lifeSeason.advice}

今月の季節(月相): ${monthSeason.name} — ${monthSeason.description}
行動の指針: ${monthSeason.advice}

※ homeworkは、上記2つの季節の行動指針を統合した、
  具体的で実践可能な1つのアドバイスとして書くこと。
  詩的な言葉より、「今週、実際にできること」を優先する。
`;
    }

    const systemPrompt = `${TYPE_PROMPTS[star]}

${shadowSection}
${seasonSection}

${HEART_CORE}`;

    const userPrompt = `
以下の情報をもとに、今月の鑑定文を書いてください。

【魂の構成】
主星: ${star}(70%)
副星: ${subStar}(20%)
隠れ星: ${hiddenStar}(10%)
運命数: ${destinyNumber}
魂年齢: ${soulAge}
エレメント: ${element}

【今月の星空】
${astro.year}年${astro.month}月
${astro.theme}

上記の「民」「月の影」「今の季節」のすべてを統合し、
この人だけの物語として、ひとつの詩のように編んでください。
表面的な性格診断ではなく、
「この人が今、何を恐れ、何を求め、何を育てようとしているか」
が伝わる文章にしてください。

【出力形式:JSONのみ、前置き不要】
{
  "monthlyTheme": "今月のテーマ(30字以内)",
  "monthFlow": "今月の流れ(300字程度。前半後半を分けず、ひとつの流れとして)",
  "shadowReading": "月の影を統合した、この人の物語(250字程度。主影・副影・隠影が重なり合う様子を描く)",
  "homework": "今月の宿題(具体的で実践可能な行動を1つ、50字以内)",
  "today": "今日のことば(50字以内)",
  "catchphrase": "この人へのキャッチフレーズ(20字以内)"
}
`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    if (userId) {
      await supabase.from('readings').upsert({
        user_id: userId,
        year_month: yearMonth,
        main_star: star,
        content: parsed,
      });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'generation failed' }, { status: 500 });
  }
}