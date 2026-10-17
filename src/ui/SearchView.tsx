import { useEffect, useRef, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { statusWord } from './status';

// Search everything in this novel, including an exact remembered line (R-B-009).
export function SearchView({ ctx }: { ctx: Ctx }) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<any[] | null>(null);
  const [error, setError] = useState('');
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
  const label: Record<string, string> = { scene: 'Manuscript', element: 'Story record', statement: 'Story detail', turn: 'Conversation', passage: 'Document' };
  const remember = (k: string, v: string) => { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } };
  /** Open a result where it lives: the scene, the record, the message in its conversation, or the passage in its document. */
  function openHit(h: any) {
    if (h.hit === 'scene') { ctx.openScene(h.id); return; }
    if (h.hit === 'element' || h.hit === 'statement') { remember('ns-brain-sel', JSON.stringify({ kind: 'element', id: h.hit === 'element' ? h.id : h.element_id })); ctx.go('brain'); return; }
    if (h.hit === 'turn') { remember('ns-conv', h.conversation_id); remember('ns-conv-turn', h.id); ctx.go('conversations'); return; }
    if (h.hit === 'passage') { remember('ns-files-tab', 'documents'); remember('ns-doc-open', h.source_id); remember('ns-doc-passage', h.id); ctx.go('files'); }
  }
  const heading = (h: any) => h.title ?? (h.element_title ? `${h.element_title}, ${String(h.field).replace(/_/g, ' ')}` : h.conversation_title ?? h.source_name ?? '');

  return (
    <div className="scroll"><div className="content">
      <h1>Search</h1>
      <input ref={ref} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="A name, a phrase, a line you remember" aria-label="Search this novel" />
      <p className="small faint" style={{ marginTop: '0.4rem' }}>Searches everything inside this novel: your pages, records, the conversations and documents you brought in. Chats that live only in Claude or ChatGPT are not here until you bring them in from Conversations.</p>
      {error && <div className="notice error">{error}</div>}
      {hits && <p className="muted small" style={{ marginTop: '0.75rem' }}>{hits.length === 0 ? 'Nothing matches that yet.' : `${hits.length} found`}</p>}
      <ul className="list">
        {hits?.map((h, i) => (
          <li key={h.id + i}>
            <div className="small muted">{label[h.hit] ?? h.hit}{h.kind ? `, ${String(h.kind).replace(/_/g, ' ')}` : ''}{h.status ? `, ${statusWord(ctx.settings, h.status)}` : ''}{h.hit === 'passage' ? `, ${h.locator}` : ''}</div>
            <button className="btn link" style={{ textAlign: 'left', padding: 0 }} onClick={() => openHit(h)}>{heading(h) || 'Open'}</button>
            <div style={{ fontFamily: 'var(--prose)', whiteSpace: 'pre-wrap' }}>{snippet(h.snippet ?? h.body ?? (typeof h.value === 'string' ? h.value : h.value != null ? JSON.stringify(h.value) : ''))}</div>
          </li>
        ))}
      </ul>
    </div></div>
  );
}
