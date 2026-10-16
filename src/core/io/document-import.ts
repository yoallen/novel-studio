// Planning documents in (a story bible, character profiles, an archive of decisions): R-B-069, R-B-070, R-B-075.
// - Her labels are read exactly: "Decided." stays decided, "One way I could play it" stays an example, "Over to me" stays hers.
// - Every passage is kept word for word as part of the source, with its place in the document, so "where did this come from" always works.
// - Where a passage belongs (which character, which field) is the program's guess, so it waits in a review list she approves.
// - Importing the same document again adds nothing twice and never promotes anything.

import { Block, blockText, plain, Run } from './blocks.js';
import { ImportLabel } from '../settings.js';
import { createHash } from 'node:crypto';

export type ImportStatus = ImportLabel['status'] | 'unlabeled';

export interface Passage {
  key: string;
  path: string[];            // the headings above it
  position: number;          // paragraph number in the document
  label: string | null;      // her label exactly as written
  status: ImportStatus;
  text: string;              // the passage without its label
  full: string;              // the paragraph exactly as written
  hash: string;
}

const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
export const hashText = (s: string) => createHash('sha256').update(s.replace(/\s+/g, ' ').trim()).digest('hex').slice(0, 32);

/** Find a label at the start of a paragraph: "Decided. …", "Over to me: …", or a bold run that is a known label. */
export function readLabel(runs: Run[], lexicon: ImportLabel[]): { label: string; status: ImportLabel['status']; rest: string } | null {
  const text = plain(runs).replace(/^\s*(?:[•·\-*]|\d{1,3}[.)])\s+/, '').replace(/^\s+/, '');
  const flat = text.replace(/’/g, "'").toLowerCase();
  let boldLead = '';
  for (const r of runs.slice(/^\s*(?:[•·\-*]|\d{1,3}[.)])\s+$/.test(runs[0]?.text ?? '') ? 1 : 0)) { if (!r.b) break; boldLead += r.text; }
  const lead = boldLead.trim().replace(/[.:,\s]+$/, '').replace(/’/g, "'").toLowerCase();
  for (const l of [...lexicon].sort((x, y) => y.label.length - x.label.length)) {
    const n = l.label.replace(/’/g, "'").toLowerCase();
    if (!flat.startsWith(n)) continue;
    const after = text.slice(l.label.length);
    const m = /^\s*(?:[.:|—–]|-(?=\s)|,[^.:\n]{0,60}[.:])\s*/.exec(after);
    if (m) return { label: text.slice(0, l.label.length + m[0].trimEnd().length).trim().replace(/[.:|—–-]$/, '').trim(), status: l.status, rest: after.slice(m[0].length) };
    if (lead === n) return { label: l.label, status: l.status, rest: after.trim() };
  }
  return null;
}

/** Labels inside a passage ("Still open: the wife. Decided: she is an innocent. Open: her name.") split it into parts. */
export function splitInner(text: string, lexicon: ImportLabel[]): { label: string | null; status: ImportLabel['status'] | null; text: string }[] {
  const names = [...lexicon].sort((a, b) => b.label.length - a.label.length).map((l) => l.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "['’]"));
  const re = new RegExp(`(?:^|(?<=[.!?”"]\\s))(${names.join('|')}):\\s`, 'gi');
  const parts: { label: string | null; status: ImportLabel['status'] | null; text: string }[] = [];
  let last = 0, label: string | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const before = text.slice(last, m.index).trim();
    if (before) parts.push({ label, status: label ? statusFor(label, lexicon) : null, text: before });
    label = m[1]!; last = re.lastIndex;
  }
  const tail = text.slice(last).trim();
  if (tail) parts.push({ label, status: label ? statusFor(label, lexicon) : null, text: tail });
  return parts.length ? parts : [{ label: null, status: null, text }];
}

function statusFor(label: string, lexicon: ImportLabel[]) {
  return lexicon.find((l) => norm(l.label) === norm(label))?.status ?? null;
}

/** Break a document into passages under their headings, reading her labels. */
export function readPassages(blocks: Block[], lexicon: ImportLabel[]): Passage[] {
  const out: Passage[] = [];
  const path: { level: number; text: string }[] = [];
  let pos = 0;
  for (const b of blocks) {
    pos++;
    if (b.type === 'break') continue;
    if (b.type === 'h') {
      while (path.length && path[path.length - 1]!.level >= b.level) path.pop();
      path.push({ level: b.level, text: plain(b.runs).trim() });
      continue;
    }
    const full = blockText(b).trim();
    if (!full) continue;
    const lab = readLabel(b.runs, lexicon);
    const base = { path: path.map((p) => p.text), position: pos, full };
    if (!lab) { out.push({ key: `p${pos}`, ...base, label: null, status: 'unlabeled', text: full, hash: hashText(`${base.path.join(' > ')}|${full}`) }); continue; }
    const parts = splitInner(lab.rest, lexicon);
    parts.forEach((part, i) => {
      const label = i === 0 && !part.label ? lab.label : part.label ?? lab.label;
      const status = (i === 0 && !part.label ? lab.status : part.status ?? lab.status) as ImportStatus;
      out.push({ key: parts.length > 1 ? `p${pos}.${i + 1}` : `p${pos}`, ...base, label, status, text: part.text, hash: hashText(`${base.path.join(' > ')}|${label}|${part.text}`) });
    });
  }
  // Identical passages in the same section stay separate (the second is "the same words again", not a duplicate import).
  const seen = new Map<string, number>();
  for (const p of out) { const n = (seen.get(p.hash) ?? 0) + 1; seen.set(p.hash, n); if (n > 1) p.hash = hashText(`${p.hash}#${n}`); }
  return out;
}

/** "Role: co-lead. Goal (concrete): win the war." becomes field-by-field pieces when the labels match the element's fields.
 *  A status word in front of a field ("PROPOSED LIE:", "POSSIBLE GHOST:") is kept as that piece's status. */
export function splitByFields(text: string, fields: { field: string; label: string }[]): { field: string; text: string; status: ImportStatus | null }[] {
  const alias = new Map<string, string>();
  for (const f of fields) {
    alias.set(norm(f.label), f.field);
    alias.set(norm(f.field.replace(/_/g, ' ')), f.field);
  }
  const names = [...alias.keys()].filter((n) => n.length >= 3).sort((a, b) => b.length - a.length).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!names.length) return [];
  const re = new RegExp(`(?:^|(?<=[.!?”"]\\s))(?:(?:the|his|her|their|[\\p{L}]+['’]s)\\s+)?(?:(proposed|possible|working|candidate|decided|developing)\\s+)?(${names.join('|')})(?:\\s*\\([^)]{1,40}\\))?:\\s`, 'giu');
  const hits: { field: string; at: number; start: number; q: string | null }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) hits.push({ field: alias.get(norm(m[2]!))!, at: m.index, start: re.lastIndex, q: m[1] ? m[1].toLowerCase() : null });
  if (!hits.length) return [];
  const Q: Record<string, ImportStatus> = { proposed: 'proposed', candidate: 'proposed', possible: 'developing', working: 'developing', developing: 'developing', decided: 'established' };
  return hits.map((h, i) => {
    const t = text.slice(h.start, hits[i + 1]?.at ?? text.length).trim();
    const open = /^(undecided|still open|open|tbd|unknown)\b[.:]?\s*/i.exec(t);
    return { field: h.field, text: open ? t.slice(open[0].length) || t : t, status: open ? 'unanswered' : h.q ? Q[h.q]! : null };
  }).filter((x) => x.text);
}

/** A date written in a file name (10-13-26, 2026-10-13), as the document's own date. */
export function dateFromName(name: string): string | null {
  let m = /(20\d\d)([-_.])(\d{1,2})\2(\d{1,2})(?!\d)/.exec(name);
  if (m) return iso(+m[1]!, +m[3]!, +m[4]!);
  // Month-day-year with one separator used throughout (10-13-26), the last such date in the name.
  const all = [...name.matchAll(/(?<!\d)(\d{1,2})([-_.])(\d{1,2})\2(\d{2}|\d{4})(?!\d)/g)];
  m = all[all.length - 1] ?? null;
  if (m) { const y = +m[4]!; return iso(y < 100 ? 2000 + y : y, +m[1]!, +m[3]!); }
  return null;
}
function iso(y: number, mo: number, d: number) {
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}T12:00:00.000Z`;
}
