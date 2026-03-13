import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_PROMPT = `You are an audience poll analyzer for a live event.

You will receive a poll question and a list of free-text audience responses. Your job is to cluster the responses into 3-7 meaningful groups and provide a brief summary.

Rules:
- Create 3-7 clusters that capture the main themes
- Every response must be assigned to exactly one cluster
- Cluster labels should be short (2-5 words) and descriptive
- Order clusters by count (highest first)
- The summary should be 1-2 sentences highlighting the key takeaway
- Respond with ONLY a JSON object (no markdown, no code fences)

Response format:
{
  "clusters": [
    { "label": "Short Label", "count": 5, "responses": ["response1", "response2", ...] }
  ],
  "summary": "Brief summary of what the audience thinks."
}`;

export async function POST(req: NextRequest) {
  try {
    const { question, responses } = await req.json();

    if (!question || !responses || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json({ error: 'Missing question or responses' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    const responseTexts = responses.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n');

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Poll question: "${question}"\n\nAudience responses (${responses.length} total):\n${responseTexts}`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.3,
        maxOutputTokens: 4096,
      },
    });

    const raw = result.text?.trim() ?? '';

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1].trim());
      } else {
        throw new Error('Failed to parse Gemini response as JSON');
      }
    }

    const chartColors = ['#6366F1', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
    const clusters = (parsed.clusters || []).map((c: { label: string; count: number; responses: string[] }, i: number) => ({
      label: c.label,
      count: c.count,
      responses: c.responses,
      color: chartColors[i % chartColors.length],
    }));

    return NextResponse.json({ clusters, summary: parsed.summary || '' });
  } catch (error) {
    console.error('Poll clustering error:', error);
    return NextResponse.json({ error: 'Failed to cluster responses' }, { status: 500 });
  }
}
