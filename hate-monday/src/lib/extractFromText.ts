export interface ExtractedItem {
  title: string;
  date:  string; // YYYY-MM-DD
}

/** 텍스트에서 날짜 + 제목 추출 (순수 정규식) */
export function extractFromText(text: string): ExtractedItem[] {
  const currentYear = new Date().getFullYear();
  const seen        = new Set<string>();
  const results: ExtractedItem[] = [];

  const toDateStr = (y: number, mo: number, d: number): string | null => {
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const getContext = (matchIndex: number, matchText: string): string => {
    const ls   = text.lastIndexOf('\n', matchIndex) + 1;
    const le   = text.indexOf('\n', matchIndex + matchText.length);
    const line = text.slice(ls, le === -1 ? undefined : le).trim();
    return line.replace(matchText, '').replace(/^[\s\-·:•]+|[\s\-·:•]+$/g, '').trim();
  };

  const push = (dateStr: string, title: string) => {
    const key = `${dateStr}::${title}`;
    if (!title || seen.has(key)) return;
    seen.add(key);
    results.push({ date: dateStr, title });
  };

  for (const m of text.matchAll(/(\d{4})-(\d{2})-(\d{2})/g)) {
    const ds = toDateStr(+m[1], +m[2], +m[3]);
    if (ds) push(ds, getContext(m.index!, m[0]));
  }
  for (const m of text.matchAll(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/g)) {
    const ds = toDateStr(+m[1], +m[2], +m[3]);
    if (ds) push(ds, getContext(m.index!, m[0]));
  }
  for (const m of text.matchAll(/(\d{1,2})월\s*(\d{1,2})일/g)) {
    const ds = toDateStr(currentYear, +m[1], +m[2]);
    if (ds) push(ds, getContext(m.index!, m[0]));
  }
  for (const m of text.matchAll(/\b(\d{1,2})\/(\d{1,2})\b/g)) {
    const ds = toDateStr(currentYear, +m[1], +m[2]);
    if (ds) push(ds, getContext(m.index!, m[0]));
  }

  return results.slice(0, 15);
}
