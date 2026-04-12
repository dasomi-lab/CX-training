import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractFromText } from '@/lib/extractFromText';

const today = new Date().toISOString().split('T')[0];

const GEMINI_PROMPT = `
이 문서/이미지에서 날짜와 관련된 모든 일정, 할일, 마감일, 회의를 찾아줘.
결과는 반드시 아래 JSON 배열 형식으로만 반환해. 다른 텍스트는 절대 포함하지 마.

[
  { "title": "일정 제목", "date": "YYYY-MM-DD", "type": "deadline" },
  { "title": "회의 제목", "date": "YYYY-MM-DD", "type": "meeting" }
]

type 값: "deadline" | "meeting" | "general" | "task"
날짜가 월/일만 있으면 올해(${new Date().getFullYear()}년) 기준으로 변환해.
오늘 날짜는 ${today}야.
한국어 날짜 표현(예: 4월 15일, 다음 주 수요일)도 모두 파싱해.
일정이 없으면 빈 배열 [] 반환.
`.trim();

interface GeminiItem { title: string; date: string; type: string }

async function extractWithGemini(base64: string, mimeType: string): Promise<GeminiItem[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY가 설정되지 않았습니다');

  const genAI  = new GoogleGenerativeAI(apiKey);
  const model  = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent([
    { inlineData: { data: base64, mimeType } },
    GEMINI_PROMPT,
  ]);

  const text = result.response.text().trim();
  // JSON 배열 추출 (```json ... ``` 마크다운 감싸기 대응)
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  return JSON.parse(match[0]) as GeminiItem[];
}

export async function POST(req: Request) {
  const body = await req.json() as {
    file_id?:  string;
    text?:     string;
    base64?:   string;
    mimeType?: string;
  };

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
  const supaKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const supabase = supaUrl && supaKey ? createClient(supaUrl, supaKey) : null;

  let rawItems: GeminiItem[] = [];

  /* ── Gemini Vision (이미지 / PDF) ── */
  if (body.base64 && body.mimeType) {
    try {
      rawItems = await extractWithGemini(body.base64, body.mimeType);
    } catch (err) {
      console.error('Gemini error:', err);
      return NextResponse.json({ error: String(err) }, { status: 500 });
    }
  }
  /* ── 정규식 (텍스트 파일) ── */
  else if (body.text) {
    const extracted = extractFromText(body.text);
    rawItems = extracted.map((i) => ({ title: i.title, date: i.date, type: 'general' }));
  } else {
    return NextResponse.json({ error: '파일 또는 텍스트가 없습니다' }, { status: 400 });
  }

  if (rawItems.length === 0) return NextResponse.json({ items: [] });

  const memoryItems = rawItems.map((i) => ({
    ...i,
    id:        crypto.randomUUID(),
    file_id:   body.file_id ?? null,
    confirmed: false,
  }));

  /* ── Supabase extracted_items 저장 (실패 시 in-memory로 fallback) ── */
  if (supabase) {
    try {
      const rows = rawItems.map((i) => ({
        file_id:   body.file_id ?? null,
        title:     i.title || '(제목 없음)',
        date:      i.date,
        type:      i.type || 'general',
        confirmed: false,
      }));
      const { data, error } = await supabase.from('extracted_items').insert(rows).select();
      if (!error && data) return NextResponse.json({ items: data });
      console.warn('Supabase insert failed, using in-memory:', error?.message);
    } catch (err) {
      console.warn('Supabase unreachable, using in-memory:', err);
    }
  }

  return NextResponse.json({ items: memoryItems });
}
