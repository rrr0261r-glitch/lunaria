import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getMoonInfo, getSunSign, isMercuryRetrograde, findConjunctions } from '@/lib/astro';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const HEART_CORE = `
【LUNARIA憲法・絶対遵守】
・断定しない。「〜かもしれません」「〜のような気がします」を基調とする
・未来を予言しない
・恐怖で惹きつけない。不安を煽らない
・必ず希望で終える
・「絶対」「必ず」「危険」「注意」などの強い言葉を使わない
・比喩は自然(月、光、水、草花、季節)から借りる
・特定の占い師や占術ブランドの名前・作風を模倣しない。LUNARIA独自の声で書く
`;

function todayStr() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
}

export async function GET(req: NextRequest) {
  try {
    const today = todayStr();

    // キャッシュ確認（全ユーザー共通・1日1回）
    const { data: cached } = await supabase
      .from('daily_energy')
      .select('content')
      .eq('date', today)
      .maybeSingle();

    if (cached?.content) {
      return NextResponse.json({ ...cached.content, cached: true });
    }

    // 天体計算（コスト0）
    const now = new Date();
    const moon = getMoonInfo(now);
    const sunSign = getSunSign(now);
    const mercuryRetro = isMercuryRetrograde(now);
    const conjunctions = findConjunctions(now);

    const astroText = `
月相: ${moon.phase}（輝面率${Math.round(moon.illumination * 100)}%）
太陽星座: ${sunSign}
水星逆行: ${mercuryRetro ? 'あり' : 'なし'}
惑星の合: ${conjunctions.length > 0 ? conjunctions.map(c => `${c.bodyA}と${c.bodyB}`).join('、') : 'なし'}
`;

    const systemPrompt = `あなたはLUNARIAの「今日の空」を綴るライターです。
今日の月相と星の配置をもとに、今日という一日をやさしく照らす短い言葉を書いてください。
個人ではなく、今日という日そのものに向けた、静かであたたかい天気予報のような言葉です。

${HEART_CORE}`;

    const userPrompt = `
【今日の星空】
${astroText}

【出力形式:JSONのみ、前置き不要】
{
  "word": "今日のことば（40字以内、詩的に）",
  "advice": "今日、意識するといいこと（30字以内、やさしく）"
}
`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    const result = {
      ...parsed,
      moonPhase: moon.phase,
      sunSign,
    };

    // キャッシュ保存
    await supabase.from('daily_energy').upsert({ date: today, content: result });

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'generation failed' }, { status: 500 });
  }
}