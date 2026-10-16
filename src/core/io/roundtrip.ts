// Round trip with an outside editor (R-B-083): export chapters to Word, the editor revises with Track Changes,
// she brings the file back, and decides each change. Nothing is overwritten automatically, and prose changes
// are never confused with structure: chapters and scenes stay as they are.

import { Block, Run, tidy, isBreakLine, decodeEntities, plain } from './blocks.js';

export interface Seg { text: string; kind: 'same' | 'ins' | 'del'; group: string | null; i?: boolean; b?: boolean; u?: boolean; s?: boolean }
export interface Para { style: string | null; align: string | null; segs: Seg[]; marks: string[]; comments: string[] }
export interface ChangeGroup { id: string; kind: 'insert' | 'delete' | 'replace'; author: string; date: string | null; removed: string; added: string; before: string; after: string; decision: 'accept' | 'reject' | null }

const attr = (a: string, name: string) => { const m = new RegExp(`${name}="([^"]*)"`).exec(a); return m ? decodeEntities(m[1]!) : null; };
const on = (a: string) => { const v = attr(a, 'w:val'); return v === null || !['0', 'false', 'none'].includes(v); };

/** Read Word's document.xml, keeping inserted and deleted text apart, with authors, bookmarks and comment anchors. */
export function readTracked(xml: string): { paras: Para[]; changes: Map<string, { author: string; date: string | null }> } {
  const paras: Para[] = [];
  const changes = new Map<string, { author: string; date: string | null }>();
  const re = /<(\/?)([\w:]+)((?:\s[^>]*?)?)(\/?)>|([^<]+)/g;
  let p: Para | null = null;
  const wrap: { kind: 'ins' | 'del'; id: string }[] = [];
  let inRun = false, inRPr = false, inPPr = false, textKind: 't' | 'del' | null = null;
  let fmt: { i?: boolean; b?: boolean; u?: boolean; s?: boolean } = {};
  let skipDepth = 0;
  let m: RegExpExecArray | null;
  const push = (text: string, del = false) => {
    if (!p || !text) return;
    const w = wrap[wrap.length - 1];
    const kind: Seg['kind'] = del || w?.kind === 'del' ? 'del' : w?.kind === 'ins' ? 'ins' : 'same';
    p.segs.push({ text, kind, group: kind === 'same' ? null : w?.id ?? null, ...fmt });
  };
  while ((m = re.exec(xml))) {
    if (m[5] !== undefined) { if (textKind && !skipDepth) push(decodeEntities(m[5]), textKind === 'del'); continue; }
    const close = m[1] === '/', tag = m[2]!, a = m[3] ?? '', self = m[4] === '/';
    if (tag === 'mc:Fallback') { if (close) skipDepth--; else if (!self) skipDepth++; continue; }
    if (skipDepth) continue;
    switch (tag) {
      case 'w:p': if (!close) { p = { style: null, align: null, segs: [], marks: [], comments: [] }; if (self) { paras.push(p); p = null; } } else if (p) { paras.push(p); p = null; } break;
      case 'w:pPr': inPPr = !close && !self; break;
      case 'w:pStyle': if (inPPr && p) p.style = attr(a, 'w:val'); break;
      case 'w:jc': if (inPPr && p) p.align = attr(a, 'w:val'); break;
      case 'w:r': inRun = !close && !self; if (!close) fmt = {}; break;
      case 'w:rPr': inRPr = !close && !self; break;
      case 'w:i': if (inRun && inRPr) fmt.i = on(a); break;
      case 'w:b': if (inRun && inRPr) fmt.b = on(a); break;
      case 'w:u': if (inRun && inRPr) fmt.u = on(a); break;
      case 'w:strike': if (inRun && inRPr) fmt.s = on(a); break;
      case 'w:ins': case 'w:moveTo': case 'w:del': case 'w:moveFrom': {
        if (inRPr || inPPr || self) break;   // paragraph-mark and formatting changes are not text changes
        if (close) { wrap.pop(); break; }
        const id = attr(a, 'w:id') ?? String(changes.size);
        changes.set(id, { author: attr(a, 'w:author') ?? 'Editor', date: attr(a, 'w:date') });
        wrap.push({ kind: tag === 'w:ins' || tag === 'w:moveTo' ? 'ins' : 'del', id });
        break;
      }
      case 'w:t': textKind = close || self ? null : 't'; break;
      case 'w:delText': textKind = close || self ? null : 'del'; break;
      case 'w:tab': if (inRun && !inRPr) push('\t'); break;
      case 'w:br': if (inRun && !inRPr) push('\n'); break;
      case 'w:noBreakHyphen': push('-'); break;
      case 'w:bookmarkStart': { const n = attr(a, 'w:name'); if (p && n) p.marks.push(n); break; }
      case 'w:commentReference': case 'w:commentRangeStart': { const id = attr(a, 'w:id'); if (p && id && !p.comments.includes(id)) p.comments.push(id); break; }
      default: break;
    }
  }
  return { paras, changes };
}

export function readComments(xml: string | undefined) {
  const out = new Map<string, { author: string; text: string }>();
  if (!xml) return out;
  for (const c of xml.matchAll(/<w:comment\b([^>]*)>([\s\S]*?)<\/w:comment>/g)) {
    const id = attr(c[1]!, 'w:id'); if (!id) continue;
    const text = [...c[2]!.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)].map((x) => decodeEntities(x[1]!)).join('');
    out.set(id, { author: attr(c[1]!, 'w:author') ?? 'Editor', text });
  }
  return out;
}

const textOf = (ps: Para[], keep: (s: Seg) => boolean) => ps.map((p) => p.segs.filter(keep).map((s) => s.text).join('')).join('\n');
export const originalText = (ps: Para[]) => textOf(ps, (s) => s.kind !== 'ins');
export const revisedText = (ps: Para[]) => textOf(ps, (s) => s.kind !== 'del');

/** Adjacent deletions and insertions by the same hand become one decision ("replace X with Y"). */
export function groupChanges(ps: Para[], changes: Map<string, { author: string; date: string | null }>): ChangeGroup[] {
  const groups: ChangeGroup[] = [];
  const flat = ps.flatMap((p, pi) => p.segs.map((s, si) => ({ s, pi, si })));
  const ctx = (from: number, dir: -1 | 1) => {
    let t = '';
    for (let k = from; k >= 0 && k < flat.length && t.length < 60; k += dir) {
      const x = flat[k]!; if (x.s.kind !== 'same') continue;
      t = dir < 0 ? x.s.text + t : t + x.s.text;
    }
    return dir < 0 ? t.slice(-60) : t.slice(0, 60);
  };
  let k = 0;
  while (k < flat.length) {
    const x = flat[k]!;
    if (x.s.kind === 'same') { k++; continue; }
    const start = k;
    const ids: string[] = [];
    let removed = '', added = '';
    const author = changes.get(x.s.group ?? '')?.author ?? 'Editor';
    while (k < flat.length && flat[k]!.s.kind !== 'same' && (changes.get(flat[k]!.s.group ?? '')?.author ?? 'Editor') === author) {
      const y = flat[k]!.s;
      if (y.group && !ids.includes(y.group)) ids.push(y.group);
      if (y.kind === 'del') removed += y.text; else added += y.text;
      k++;
    }
    const gid = ids.join('+');
    for (let q = start; q < k; q++) flat[q]!.s.group = gid;
    groups.push({ id: gid, kind: removed && added ? 'replace' : added ? 'insert' : 'delete', author, date: changes.get(ids[0] ?? '')?.date ?? null, removed, added, before: ctx(start - 1, -1), after: ctx(k, 1), decision: null });
  }
  return groups;
}

/** The scene's paragraphs after her decisions: accepted insertions in, accepted deletions out, undecided left as they were. */
export function decide(ps: Para[], groups: ChangeGroup[], sceneBreak = '* * *'): Block[] {
  const d = new Map(groups.map((g) => [g.id, g.decision]));
  const out: Block[] = [];
  for (const p of ps) {
    const runs: Run[] = tidy(p.segs.filter((s) => s.kind === 'same' || (s.kind === 'ins' ? d.get(s.group ?? '') === 'accept' : d.get(s.group ?? '') !== 'accept'))
      .map((s) => ({ text: s.text, ...(s.i ? { i: true } : {}), ...(s.b ? { b: true } : {}), ...(s.u ? { u: true } : {}), ...(s.s ? { s: true } : {}) })));
    const t = plain(runs);
    if (!t.trim()) continue;
    if (/^Heading[3-6]$/i.test(p.style ?? '')) { out.push({ type: 'h', level: Number(/\d/.exec(p.style!)![0]) - 2, runs }); continue; }
    if (t.trim() === sceneBreak.trim() || (p.align === 'center' && isBreakLine(t))) { out.push({ type: 'break' }); continue; }
    out.push({ type: 'p', runs, ...(p.align === 'center' ? { align: 'center' as const } : p.align === 'right' ? { align: 'right' as const } : {}) });
  }
  return out;
}

/** Paragraphs belonging to each scene, by the bookmarks the export placed at each scene's start and end. */
export function scenesIn(paras: Para[]) {
  const out = new Map<string, Para[]>();
  for (let i = 0; i < paras.length; i++) {
    const start = paras[i]!.marks.find((n) => n.startsWith('sc_'));
    if (!start) continue;
    const id = start.slice(3);
    // The scene runs to its end mark; if the editor's software dropped it, to the next scene or chapter heading.
    let j = i, end = -1;
    for (; j < paras.length; j++) {
      if (paras[j]!.marks.includes(`se_${id}`)) { end = j; break; }
      if (j > i && (paras[j]!.marks.some((n) => n.startsWith('sc_')) || /^(Heading1|Title)$/i.test(paras[j]!.style ?? ''))) { end = j - 1; break; }
    }
    if (end < 0) end = paras.length - 1;
    out.set(id, paras.slice(i, end + 1));
    i = end;
  }
  return out;
}
