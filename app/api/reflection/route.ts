import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const HEART_CORE = `
【LUNARIA憲法・絶対遵守】
・断定しない。「〜かもしれません」「〜のような気がします」を基調とする
・未来を予言しない
・短所を欠点として書かない。必ず「裏返せば才能」として書く
・恐怖で惹きつけない。不安を煽らない
・必ず希望で終える
・「絶対」「必ず」「危険」「注意」などの強い言葉を使わない
・比喩は自然(月、光、水、草花、季節)から借りる
・診断や断定はしない。あくまで「観点からの映し出し」として書く
`;

import { TYPE_PROMPTS } from '@/lib/type-prompts';
interface DiaryEntry {
  date: string;
  kidzuki?: string;   // 今日、何があなたを動かしましたか
  emotion?: string;   // 感情チップ
  karada?: string;    // からだの緊張/緩み
  kansha?: string;    // 誰の存在に支えられていたか
  negai?: string;     // 新月の願い/満月の振り返り
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { star, yearMonth, entries } = body as {
      star: string;
      yearMonth: string;
      entries: DiaryEntry[];
    };

    if (!star || !TYPE_PROMPTS[star] || !entries || entries.length === 0) {
      return NextResponse.json({ error: 'invalid input' }, { status: 400 });
    }

    const systemPrompt = `あなたはLUNARIAの「月の振り返り」ライターです。
${TYPE_PROMPTS[star]}

${HEART_CORE}

ユーザーが1ヶ月の間に書きためた日々の記録(気づき・からだの感覚・感謝・願い)を読み、
心理学・哲学・脳科学・魂(スピリチュアル)の4つの異なる観点から、
その人の1ヶ月を映し出す文章を書いてください。

4つの観点はそれぞれ全く異なる語り口にすること:
- 心理: 感情パターン、防衛機制、無意識の動きを、専門用語を避けて優しく解説する語り口
- 哲学: 古今の思想や問いに重ねながら、出来事の意味を俯瞰する語り口
- 脳科学: 神経科学的な視点(ストレス反応、報酬系、習慣化など)を平易に翻訳する語り口
- 魂: LUNARIAらしい詩的・スピリチュアルな言葉で、魂の成長として描く語り口`;

    const entriesText = entries
      .map(e => {
        const parts = [`【${e.date}】`];
        if (e.kidzuki) parts.push(`動かされたこと: ${e.kidzuki}`);
        if (e.emotion) parts.push(`こころ: ${e.emotion}`);
        if (e.karada) parts.push(`からだ: ${e.karada}`);
        if (e.kansha) parts.push(`支えられたこと: ${e.kansha}`);
        if (e.negai) parts.push(`願い・振り返り: ${e.negai}`);
        return parts.join(' / ');
      })
      .join('\n');

    const userPrompt = `
【${yearMonth}の記録】
${entriesText}

【出力形式:JSONのみ、前置き不要】
{
  "monthSummary": "この1ヶ月をひと言で表すと(30字以内)",
  "psychology": "心理学の観点から(200字程度)",
  "philosophy": "哲学の観点から(200字程度)",
  "neuroscience": "脳科学の観点から(200字程度)",
  "soul": "魂の観点から(200字程度)",
  "closingMessage": "全体を受けての、LUNARIAからの結びの言葉(80字以内)"
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

    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'generation failed' }, { status: 500 });
  }
}