import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: `以下のテキストから感情の座標を読み取ってください。

テキスト：「${text}」

以下のJSON形式のみで返してください。他の文字は一切含めないこと。

{
  "x": -0.3,
  "y": 0.5,
  "color": "hsl(200, 25%, 60%)"
}

xは感情の温度：-1(つめたい・孤独・内向き) 〜 1(あたたかい・つながり・外向き)
yは感情の高さ：-1(たかぶり・興奮・緊張) 〜 1(しずか・落ち着き・疲労)
colorはその感情に合うくすんだ自然な色(HSL形式)
彩度は20〜45%、明度は45〜70%の範囲で、派手にしないこと`
    }],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '{}';

  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    const data = JSON.parse(clean);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ x: 0, y: 0, color: 'hsl(200, 25%, 58%)' });
  }
}