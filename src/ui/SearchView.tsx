import { useEffect, useRef, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';

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
  const label: Record<string, string> = { scene: 'Manuscript', element: 'Story record', statement: 'Story detail', turn: 'Conversation' };

  return (
    <div className="scroll"><div className="content">
      <h1>Search</h1>
      <input ref={ref} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="A name, a phrase, a line you remember" aria-label="Search this novel" />
      {error && <div className="notice error">{error}</div>}
      {hits && <p className="muted small" style={{ marginTop: '0.75rem' }}>{hits.length === 0 ? 'Nothing matches that yet.' : `${hits.length} found`}</p>}
      <ul className="list">
        {hits?.map((h, i) => (
          <li key={h.id + i}>
            <div className="small muted">{label[h.hit] ?? h.hit}{h.kind ? `, ${String(h.kind).replace(/_/g, ' ')}` : ''}{h.status ? `, ${h.status}` : ''}</div>
            {h.hit === 'scene'
              ? <button className="btn link" style={{ textAlign: 'left' }} onClick={() => ctx.openScene(h.id)}>{h.title}</button>
              : <strong>{h.title ?? (h.element_title ? `${h.element_title}, ${String(h.field).replace(/_/g, ' ')}` : h.conversation_title ?? '')}</strong>}
            <div style={{ fontFamily: 'var(--prose)', whiteSpace: 'pre-wrap' }}>{snippet(h.snippet ?? h.body ?? (typeof h.value === 'string' ? h.value : h.value != null ? JSON.stringify(h.value) : ''))}</div>
          </li>
        ))}
      </ul>
    </div></div>
  );
}
