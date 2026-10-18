import { Fragment, useState } from 'react';
import { api } from './api';

// Her imported facts carry reference numbers from her planning documents: "CK-003", "SB-052", "(SB L60, L78)",
// "(T L16949)". Her words are never changed. The numbers are shown quietly, and a click says what each one points to,
// with the passage itself when it is among the documents brought in.

const CODE = /\b(?:SB|T) L\d+(?:[-–]\d+)?(?:, L\d+(?:[-–]\d+)?)*|\b[A-Z][A-Z0-9]{1,2}-\d{2,4}\b/g;

export const HAS_REF = (text: string) => { CODE.lastIndex = 0; return CODE.test(text); };

/** Split text into plain parts and reference codes. Exported for tests. */
export function splitRefs(text: string): { text: string; code?: boolean }[] {
  const out: { text: string; code?: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(CODE)) {
    if (m.index! > last) out.push({ text: text.slice(last, m.index) });
    out.push({ text: m[0], code: true });
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

/** The plain part, with a search word marked when there is one. */
function Marked({ text, mark }: { text: string; mark?: string }) {
  const q = (mark ?? '').trim();
  if (!q) return <>{text}</>;
  const low = text.toLowerCase(), ql = q.toLowerCase();
  const parts: React.ReactNode[] = [];
  let i = 0, j: number, n = 0;
  while ((j = low.indexOf(ql, i)) >= 0) {
    if (j > i) parts.push(text.slice(i, j));
    parts.push(<mark key={n++} className="search-mark">{text.slice(j, j + q.length)}</mark>);
    i = j + q.length;
  }
  parts.push(text.slice(i));
  return <>{parts}</>;
}

/** inert: inside a button or link, the numbers are only shown quietly, never clickable. */
export function RefText({ text, projectId, mark, inert }: { text: string; projectId?: string; mark?: string; inert?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const [refs, setRefs] = useState<any[] | null>(null);
  const parts = splitRefs(text ?? '');
  if (!parts.some((p) => p.code)) return mark?.trim() ? <span className="reftext"><Marked text={text ?? ''} mark={mark} /></span> : <>{text ?? ''}</>;
  async function show(code: string) {
    if (open === code) { setOpen(null); return; }
    setOpen(code); setRefs(null);
    if (!projectId) { setRefs([]); return; }
    const codes = code.startsWith('SB L') || code.startsWith('T L')
      ? code.slice(code.indexOf(' ') + 1).split(/,\s*/).map((l) => `${code.split(' ')[0]} ${l}`)
      : [code];
    try { setRefs(await api.get(`/api/projects/${projectId}/refs?codes=${encodeURIComponent(codes.join('|'))}`)); } catch { setRefs([]); }
  }
  return (
    <span className="reftext">
      {parts.map((p, i) => p.code && inert
        ? <span key={i} className="ref-code" title="A reference number from your planning documents.">{p.text}</span>
        : p.code
        ? <button key={i} type="button" className="ref-code" aria-expanded={open === p.text} title="A reference number from your planning documents. Click to see what it points to." onClick={(e) => { e.stopPropagation(); void show(p.text); }}>{p.text}</button>
        : <Fragment key={i}><Marked text={p.text} mark={mark} /></Fragment>)}
      {open && (
        <span className="ref-note" role="note">
          <span className="ref-note-head">{open}: a reference from your planning documents. It is kept as you wrote it.</span>
          {refs === null ? <span className="faint"> Looking…</span> : refs.length === 0 ? <span> These numbers point into the documents you planned with.</span> : refs.map((r) => (
            <span key={r.code} className="ref-note-item">
              <span className="ref-note-what">{r.what}.</span>
              {r.text && <span className="ref-note-text">{r.text}</span>}
            </span>
          ))}
          <button type="button" className="btn link small" onClick={(e) => { e.stopPropagation(); setOpen(null); }}>Close</button>
        </span>
      )}
    </span>
  );
}
