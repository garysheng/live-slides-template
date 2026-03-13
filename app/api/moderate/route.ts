import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_PROMPT = `You are a content moderator for a professional event. Your job is to review audience questions submitted during live presentations.

Reject any question that contains:
- Profanity, slurs, or vulgar language
- Harassment, intimidation, or personal attacks
- Sexist, racist, or discriminatory language
- Sexual content or innuendo
- Threats or incitement of violence
- Trolling or deliberately disruptive content
- Spam or self-promotion
- Sharing of private/confidential information

Approve questions that are:
- Genuine questions about the presentation topic
- Professional and respectful in tone
- Constructive, even if critical

Respond with ONLY a JSON object (no markdown, no code fences):
{"approved": true} or {"approved": false, "reason": "brief reason"}`;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ approved: false, reason: 'Empty question' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ approved: true });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Review this audience question:\n\n"${text}"`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0,
        maxOutputTokens: 256,
      },
    });

    const raw = response.text?.trim() ?? '';
    try {
      const result = JSON.parse(raw);
      return NextResponse.json({
        approved: result.approved === true,
        reason: result.reason ?? undefined,
      });
    } catch {
      if (raw.includes('"approved": false') || raw.includes('"approved":false')) {
        return NextResponse.json({ approved: false, reason: 'Your question was flagged as inappropriate. Please rephrase and try again.' });
      }
      return NextResponse.json({ approved: true });
    }
  } catch (error) {
    console.error('Moderation error:', error);
    return NextResponse.json({ approved: true });
  }
}
