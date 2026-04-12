import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractFromText } from '@/lib/extractFromText';

export async function POST(req: Request) {
  const { file_id, text } = await req.json() as { file_id: string; text: string };

  if (!text) {
    return NextResponse.json({ error: '텍스트가 없습니다' }, { status: 400 });
  }

  const items = extractFromText(text);

  if (items.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  if (!url || !key) {
    // Supabase 미설정 시 추출 결과만 반환 (저장 생략)
    return NextResponse.json({ items: items.map((i) => ({ ...i, id: crypto.randomUUID(), file_id, type: 'general', confirmed: false })) });
  }

  const supabase = createClient(url, key);

  const rows = items.map((i) => ({
    file_id: file_id || null,
    title:   i.title || '(제목 없음)',
    date:    i.date,
    type:    'general',
    confirmed: false,
  }));

  const { data, error } = await supabase
    .from('extracted_items')
    .insert(rows)
    .select();

  if (error) {
    console.error('extracted_items insert error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data });
}
