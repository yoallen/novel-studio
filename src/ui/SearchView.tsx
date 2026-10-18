import { useEffect, useRef, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { statusWord } from './status';
import { RefText } from './RefText';
import { KIND_LABELS } from '../core/templates';

/** The places a result can live, so a long list can be narrowed to one. */
const PLACES: [string, string, string[]][] = [['all', 'Everything', []], ['scene', 'Your pages', ['scene']], ['record', 'Story records', ['element', 'statement']], ['turn', 'Conversations', ['turn']], ['passage', 'Documents', ['passage']]];

// Search everything in this novel, including an exact remembered line (R-B-009).
export function SearchView({ ctx }: { ctx: Ctx }) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [place, setPlace] = useState('all');
  const ref = useRef<HTMLInputElement>(null);
  const timer = useRef<number>();
  useEffect(() => { ref.current?.focus(); }, []);

  useEffect(() => {
    window.clearTimeout(timer.current);
    if (!q.trim()) { setHits(null); return; }
    timer.current = window.setTimeout(() => {
      api.get(`/api/search?project=${encodeURIComponent(ctx.projectId)}&q=${encodeURIComponent(q)}`).then(setHits).catch((e) => setError(e.message));
    }, 200);
  }, [q, ctx.projectId]);

  const snippet = (text: string) => {
    if (!text) return '';
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return text.slice(0, 200);
    const start = Math.max(0, i - 80);
    return (start ? '…' : '') + text.slice(start, i + q.length + 120) + (i + q.length + 120 < text.length ? '…' : '');
  };
  const label: Record<string, string> = { scene: 'Your pages', element: 'Story record', statement: 'Story detail', turn: 'Conversation', passage: 'Document' };
  const kindName = (k: string) => k === 'note' ? 'a planning note, kept with your records' : (KIND_LABELS[k]?.label ?? k.replace(/^x_/, '').replace(/_/g, ' ')).toLowerCase();
  const shown = (hits ?? []).filter((h) => place === 'all' || PLACES.find((p) => p[0] === place)![2].includes(h.hit));
  const remember = (k: string, v: string) => { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } };
  /** Open a result where it lives: the scene, the record, the message in its conversation, or the passage in its document. */
  function openHit(h: any) {
    if (h.hit === 'scene') { ctx.openScene(h.id); return; }
    if (h.hit === 'element' || h.hit === 'statement') { remember('ns-brain-sel', JSON.stringify({ kind: 'element', id: h.hit === 'element' ? h.id : h.element_id })); ctx.go('brain'); return; }
    if (h.hit === 'turn') { remember('ns-conv', h.conversation_id); remember('ns-conv-turn', h.id); ctx.go('conversations'); return; }
    if (h.hit === 'passage') { remember('ns-files-tab', 'documents'); remember('ns-doc-open', h.source_id); remember('ns-doc-passage', h.id); ctx.go('files'); }
  }
  const heading = (h: any) => h.title ?? (h.element_title ? `${h.element_title}, ${String(h.field).replace(/^x_/, '').replace(/_/g, ' ')}` : h.conversation_title ?? h.source_name ?? '');

  return (
    <div className="scroll"><div className="content">
      <h1>Search</h1>
      <input ref={ref} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="A name, a phrase, a line you remember" aria-label="Search this novel" />
      <p className="small faint" style={{ marginTop: '0.4rem' }}>Searches everything inside this novel: your pages, records, the conversations and documents you brought in. Chats that live only in Claude or ChatGPT are not here until you bring them in from Conversations.</p>
      {error && <div className="notice error">{error}</div>}
      {hits && <p className="muted small" style={{ marginTop: '0.75rem' }}>{hits.length === 0 ? 'Nothing matches that yet.' : `${hits.length} found`}</p>}
      {hits && hits.length > 0 && (
        <div className="row search-places" role="tablist" aria-label="Where to look">
          {PLACES.map(([k, l, kinds]) => {
            const n = k === 'all' ? hits.length : hits.filter((h) => kinds.includes(h.hit)).length;
            return <button key={k} role="tab" aria-selected={place === k} className={'btn small' + (place === k ? '' : ' link')} disabled={k !== 'all' && n === 0} onClick={() => setPlace(k)}>{l} ({n})</button>;
          })}
        </div>
      )}
      <ul className="list search-results">
        {shown.map((h, i) => (
          <li key={h.id + i}>
            <div className="small muted">{label[h.hit] ?? h.hit}{h.kind ? `, ${kindName(String(h.kind))}` : ''}{h.status ? `, ${statusWord(ctx.settings, h.status)}` : ''}{h.hit === 'passage' ? `, ${h.locator}` : ''}</div>
            <button className="btn link" style={{ textAlign: 'left', padding: 0 }} onClick={() => openHit(h)}><RefText text={heading(h) || 'Open'} mark={q} inert /></button>
            <div style={{ fontFamily: 'var(--prose)', whiteSpace: 'pre-wrap' }}><RefText text={snippet(h.snippet ?? h.body ?? (typeof h.value === 'string' ? h.value : h.value != null ? JSON.stringify(h.value) : ''))} mark={q} projectId={ctx.projectId} /></div>
          </li>
        ))}
      </ul>
    </div></div>
  );
}
