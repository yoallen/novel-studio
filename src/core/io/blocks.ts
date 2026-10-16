// One small, lossless-enough text model that every importer reads into and every exporter writes from.
// Paragraphs keep their runs of italic, bold and underline; headings keep their level; scene breaks are their own block.

export interface Run { text: string; i?: boolean; b?: boolean; u?: boolean; s?: boolean }
export type Block =
  | { type: 'p'; runs: Run[]; quote?: boolean; align?: 'center' | 'right' }
  | { type: 'h'; level: number; runs: Run[] }
  | { type: 'break' };

interface PMNode { type?: string; text?: string; content?: PMNode[]; attrs?: Record<string, unknown>; marks?: { type: string }[] }

export const plain = (runs: Run[]) => runs.map((r) => r.text).join('');
export const blockText = (b: Block) => (b.type === 'break' ? '* * *' : plain(b.runs));

/** A scene-break line as writers type it: *, * * *, ***, #, ~~~, a centered ornament. */
export function isBreakLine(t: string) {
  const s = t.trim();
  return s.length > 0 && s.length <= 12 && /^([*#~•·⁂§=_-]\s*){1,5}$/.test(s) && !/^-{1,2}$/.test(s);
}

/** Merge neighbouring runs with the same marks so output stays tidy. */
export function tidy(runs: Run[]): Run[] {
  const out: Run[] = [];
  for (const r of runs) {
    if (!r.text) continue;
    const last = out[out.length - 1];
    if (last && !!last.i === !!r.i && !!last.b === !!r.b && !!last.u === !!r.u && !!last.s === !!r.s) last.text += r.text;
    else out.push({ text: r.text, ...(r.i ? { i: true } : {}), ...(r.b ? { b: true } : {}), ...(r.u ? { u: true } : {}), ...(r.s ? { s: true } : {}) });
  }
  return out;
}

// ---------- the editor's document ----------

export function docToBlocks(doc: PMNode): Block[] {
  const out: Block[] = [];
  const runsOf = (n: PMNode): Run[] => {
    if (n.type === 'text') {
      const m = new Set((n.marks ?? []).map((x) => x.type));
      return [{ text: n.text ?? '', i: m.has('italic') || undefined, b: m.has('bold') || undefined, u: m.has('underline') || undefined, s: m.has('strike') || undefined }];
    }
    if (n.type === 'hardBreak') return [{ text: '\n' }];
    return (n.content ?? []).flatMap(runsOf);
  };
  const walk = (n: PMNode, quote = false) => {
    if (!n) return;
    if (n.type === 'paragraph') {
      const runs = tidy(runsOf(n));
      if (runs.length === 1 && isBreakLine(runs[0]!.text) && !runs[0]!.text.includes('\n')) { out.push({ type: 'break' }); return; }
      const align = n.attrs?.textAlign === 'center' || n.attrs?.textAlign === 'right' ? n.attrs.textAlign as 'center' | 'right' : undefined;
      out.push({ type: 'p', runs, ...(quote ? { quote: true } : {}), ...(align ? { align } : {}) });
      return;
    }
    if (n.type === 'heading') { out.push({ type: 'h', level: Number(n.attrs?.level ?? 2), runs: tidy(runsOf(n)) }); return; }
    if (n.type === 'horizontalRule') { out.push({ type: 'break' }); return; }
    if (n.type === 'blockquote') { (n.content ?? []).forEach((c) => walk(c, true)); return; }
    if (n.type === 'codeBlock') { out.push({ type: 'p', runs: [{ text: runsOf(n).map((r) => r.text).join('') }] }); return; }
    (n.content ?? []).forEach((c) => walk(c, quote));
  };
  walk(doc);
  return out;
}

export function blocksToDoc(blocks: Block[]): PMNode {
  const textNodes = (runs: Run[]): PMNode[] => {
    const nodes: PMNode[] = [];
    for (const r of tidy(runs)) {
      const marks = [r.i && { type: 'italic' }, r.b && { type: 'bold' }, r.u && { type: 'underline' }, r.s && { type: 'strike' }].filter(Boolean) as { type: string }[];
      r.text.split('\n').forEach((part, k) => {
        if (k) nodes.push({ type: 'hardBreak' });
        if (part) nodes.push({ type: 'text', text: part, ...(marks.length ? { marks } : {}) });
      });
    }
    return nodes;
  };
  const content: PMNode[] = [];
  for (const b of blocks) {
    if (b.type === 'break') content.push({ type: 'horizontalRule' });
    else if (b.type === 'h') content.push({ type: 'heading', attrs: { level: Math.min(Math.max(b.level, 1), 6) }, content: textNodes(b.runs) });
    else {
      const p: PMNode = { type: 'paragraph', content: textNodes(b.runs) };
      if (b.quote) content.push({ type: 'blockquote', content: [p] });
      else content.push(p);
    }
  }
  return { type: 'doc', content };
}

// ---------- a forgiving reader for the small HTML subset that Word conversion produces ----------

const ENT: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
export function decodeEntities(s: string) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') { const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(n) ? String.fromCodePoint(n) : m; }
    return ENT[e.toLowerCase()] ?? m;
  });
}

export function htmlToBlocks(html: string): Block[] {
  const out: Block[] = [];
  const re = /<(\/?)([a-z0-9]+)([^>]*)>|([^<]+)/gi;
  const marks = { i: 0, b: 0, u: 0, s: 0 };
  let cur: Run[] | null = null, kind: { type: 'p' | 'h'; level: number; quote: boolean; li: string | null } | null = null;
  let quote = 0; const lists: { ordered: boolean; n: number }[] = [];
  const flush = () => {
    if (!cur || !kind) return;
    const runs = tidy(cur);
    const t = plain(runs);
    if (kind.type === 'h') { if (t.trim()) out.push({ type: 'h', level: kind.level, runs }); }
    else if (runs.length === 1 && isBreakLine(t)) out.push({ type: 'break' });
    else if (t.trim()) out.push({ type: 'p', runs: kind.li ? [{ text: kind.li }, ...runs] : runs, ...(kind.quote ? { quote: true } : {}) });
    cur = null; kind = null;
  };
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    if (m[4] !== undefined) {
      const text = decodeEntities(m[4]);
      if (!cur) { if (!text.trim()) continue; cur = []; kind = { type: 'p', level: 0, quote: quote > 0, li: null }; }
      cur.push({ text, i: marks.i > 0 || undefined, b: marks.b > 0 || undefined, u: marks.u > 0 || undefined, s: marks.s > 0 || undefined });
      continue;
    }
    const close = m[1] === '/', tag = m[2]!.toLowerCase();
    if (/^h[1-6]$/.test(tag) || tag === 'p' || tag === 'li') {
      flush();
      if (!close) {
        let li: string | null = null;
        if (tag === 'li') { const l = lists[lists.length - 1]; if (l) { l.n++; li = l.ordered ? `${l.n}. ` : '• '; } }
        cur = []; kind = { type: tag[0] === 'h' ? 'h' : 'p', level: tag[0] === 'h' ? Number(tag[1]) : 0, quote: quote > 0, li };
      }
    } else if (tag === 'em' || tag === 'i') marks.i += close ? -1 : 1;
    else if (tag === 'strong' || tag === 'b') marks.b += close ? -1 : 1;
    else if (tag === 'u') marks.u += close ? -1 : 1;
    else if (tag === 's' || tag === 'del' || tag === 'strike') marks.s += close ? -1 : 1;
    else if (tag === 'br') { if (cur) cur.push({ text: '\n' }); }
    else if (tag === 'hr') { flush(); out.push({ type: 'break' }); }
    else if (tag === 'blockquote') { flush(); quote += close ? -1 : 1; }
    else if (tag === 'ol' || tag === 'ul') { flush(); if (close) lists.pop(); else lists.push({ ordered: tag === 'ol', n: 0 }); }
    else if (tag === 'tr' || tag === 'table') flush();
    else if (tag === 'td' || tag === 'th') { if (close && cur) cur.push({ text: '\t' }); }
    for (const k of Object.keys(marks) as (keyof typeof marks)[]) if (marks[k] < 0) marks[k] = 0;
  }
  flush();
  return out;
}

// ---------- plain text and Markdown ----------

export function textToBlocks(text: string): Block[] {
  const paras = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n').split(/\n\s*\n/);
  const out: Block[] = [];
  for (const p0 of paras) {
    const p = p0.replace(/^\n+|\n+$/g, '');
    if (!p.trim()) continue;
    if (isBreakLine(p)) { out.push({ type: 'break' }); continue; }
    out.push({ type: 'p', runs: [{ text: p.split('\n').map((l) => l.trim()).join('\n') }] });
  }
  return out;
}

/** Markdown: headings, emphasis, block quotes and breaks. Anything else is kept as written. */
export function markdownToBlocks(md: string): Block[] {
  const lines = md.replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');
  const out: Block[] = [];
  let para: string[] = [], quote = false;
  const flushPara = () => { if (para.length) out.push({ type: 'p', runs: inlineMd(para.join('\n')), ...(quote ? { quote: true } : {}) }); para = []; quote = false; };
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (!line.trim()) { flushPara(); continue; }
    if (h) { flushPara(); out.push({ type: 'h', level: h[1]!.length, runs: inlineMd(h[2]!.replace(/\s+#+\s*$/, '')) }); continue; }
    if (/^\s*(\*\s*){3,}$|^\s*(-\s*){3,}$|^\s*(_\s*){3,}$/.test(line) || isBreakLine(line)) { flushPara(); out.push({ type: 'break' }); continue; }
    const q = /^>\s?(.*)$/.exec(line);
    if (q) { if (para.length && !quote) flushPara(); quote = true; para.push(q[1]!); continue; }
    if (quote) flushPara();
    para.push(line.replace(/\\$/, ''));
  }
  flushPara();
  return out;
}

export function inlineMd(s: string): Run[] {
  const runs: Run[] = [];
  const re = /(\\[\\`*_{}[\]()#+\-.!>~])|(\*\*\*|___)(.+?)\2|(\*\*|__)(.+?)\4|(\*|_)(?=\S)(.+?)(?<=\S)\6(?![\p{L}\p{N}])|~~(.+?)~~/gsu;
  let last = 0; let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) runs.push({ text: s.slice(last, m.index) });
    if (m[1]) runs.push({ text: m[1].slice(1) });
    else if (m[3] !== undefined) runs.push(...inlineMd(m[3]).map((r) => ({ ...r, i: true, b: true })));
    else if (m[5] !== undefined) runs.push(...inlineMd(m[5]).map((r) => ({ ...r, b: true })));
    else if (m[7] !== undefined) runs.push(...inlineMd(m[7]).map((r) => ({ ...r, i: true })));
    else if (m[8] !== undefined) runs.push(...inlineMd(m[8]).map((r) => ({ ...r, s: true })));
    last = re.lastIndex;
  }
  if (last < s.length) runs.push({ text: s.slice(last) });
  return tidy(runs);
}

// ---------- RTF (the subset word processors write for prose) ----------

export function rtfToBlocks(rtf: string): Block[] {
  const out: Block[] = [];
  let runs: Run[] = [];
  type St = { i: boolean; b: boolean; u: boolean; s: boolean; skip: boolean; uc: number; hl: number };
  let st: St = { i: false, b: false, u: false, s: false, skip: false, uc: 1, hl: 0 };
  const stack: St[] = [];
  let skipChars = 0, i = 0;
  const DEST = new Set(['fonttbl', 'colortbl', 'stylesheet', 'info', 'pict', 'header', 'footer', 'headerl', 'headerr', 'footerl', 'footerr', 'footnote', 'listtable', 'listoverridetable', 'rsidtbl', 'generator', 'xmlnstbl', 'themedata', 'colorschememapping', 'latentstyles', 'datastore', 'object', 'fldinst', 'mmathPr', 'pgdsctbl', 'revtbl']);
  const emit = (t: string) => { if (st.skip) return; if (skipChars > 0) { skipChars--; return; } runs.push({ text: t, i: st.i || undefined, b: st.b || undefined, u: st.u || undefined, s: st.s || undefined }); };
  const endPara = () => {
    const r = tidy(runs); runs = [];
    const t = plain(r);
    if (!t.trim()) return;
    if (st.hl) out.push({ type: 'h', level: st.hl, runs: r });
    else if (isBreakLine(t)) out.push({ type: 'break' });
    else out.push({ type: 'p', runs: r });
  };
  while (i < rtf.length) {
    const c = rtf[i]!;
    if (c === '{') { stack.push({ ...st }); i++; if (rtf.startsWith('\\*', i)) { st.skip = true; } continue; }
    if (c === '}') { st = stack.pop() ?? st; i++; continue; }
    if (c === '\r' || c === '\n') { i++; continue; }
    if (c !== '\\') { emit(c); i++; continue; }
    const nx = rtf[i + 1] ?? '';
    if (nx === '\\' || nx === '{' || nx === '}') { emit(nx); i += 2; continue; }
    if (nx === '\'') { const hex = rtf.substr(i + 2, 2); emit(Buffer.from([parseInt(hex, 16)]).toString('latin1')); i += 4; continue; }
    if (nx === '~') { emit(' '); i += 2; continue; }
    if (nx === '-' || nx === '_') { i += 2; continue; }
    if (nx === '\n' || nx === '\r') { endPara(); i += 2; continue; }
    const w = /^\\([a-z]+)(-?\d+)? ?/i.exec(rtf.slice(i, i + 40));
    if (!w) { i++; continue; }
    i += w[0].length;
    const word = w[1]!, arg = w[2] === undefined ? null : Number(w[2]);
    if (DEST.has(word)) { st.skip = true; continue; }
    switch (word) {
      case 'par': case 'sect': endPara(); break;
      case 'line': emit('\n'); break;
      case 'tab': emit('\t'); break;
      case 'pard': st.hl = 0; break;
      case 'outlinelevel': st.hl = (arg ?? 0) + 1; break;
      case 'i': st.i = arg !== 0; break;
      case 'b': st.b = arg !== 0; break;
      case 'ul': st.u = arg !== 0; break;
      case 'ulnone': st.u = false; break;
      case 'strike': st.s = arg !== 0; break;
      case 'plain': st.i = st.b = st.u = st.s = false; break;
      case 'uc': st.uc = arg ?? 1; break;
      case 'u': { let n = arg ?? 0; if (n < 0) n += 65536; emit(String.fromCharCode(n)); skipChars = st.uc; break; }
      case 'emdash': emit('—'); break;
      case 'endash': emit('–'); break;
      case 'lquote': emit('‘'); break;
      case 'rquote': emit('’'); break;
      case 'ldblquote': emit('“'); break;
      case 'rdblquote': emit('”'); break;
      case 'bullet': emit('•'); break;
      default: break;
    }
  }
  endPara();
  return out;
}
