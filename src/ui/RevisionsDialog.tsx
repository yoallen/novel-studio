import { useEffect, useState } from 'react';
import { api } from './api';
import { diffWords } from './diff';

// Earlier versions of a scene: compare with the current text and restore one. Restoring adds a new
// version; nothing newer is thrown away (R-B-007).
export function RevisionsDialog({ sceneId, onClose, onRestored }: { sceneId: string; onClose: () => void; onRestored: () => void }) {
  const [revs, setRevs] = useState<any[] | null>(null);
  const [current, setCurrent] = useState('');
  const [picked, setPicked] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get(`/api/scenes/${sceneId}/revisions`), api.get(`/api/scenes/${sceneId}`)])
      .then(([r, s]) => { setRevs(r); setCurrent(s.text); }).catch((e) => setError(e.message));
  }, [sceneId]);

  async function pick(id: string) { try { setPicked(await api.get(`/api/revisions/${id}`)); } catch (e) { setError((e as Error).message); } }
  async function restore() {
    if (!picked) return;
    try { await api.post(`/api/scenes/${sceneId}/revisions/${picked.id}/restore`); onRestored(); } catch (e) { setError((e as Error).message); }
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="rev-h" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="dialog" style={{ width: 'min(900px, 94vw)' }}>
        <div className="row"><h2 id="rev-h" className="grow">Earlier versions</h2><button className="btn small" onClick={onClose}>Close</button></div>
        {error && <div className="notice error">{error}</div>}
        {!revs ? <p className="muted">Loading…</p> : revs.length === 0 ? <p className="muted">No earlier versions yet. Each saved stretch of writing becomes one.</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1rem' }}>
            <ul className="list" style={{ maxHeight: '55vh', overflow: 'auto' }}>
              {revs.map((r) => (
                <li key={r.id}><button className="btn link small" aria-current={picked?.id === r.id} onClick={() => void pick(r.id)}>
                  {new Date(r.created_at).toLocaleString()}</button><br /><span className="faint small">{r.word_count.toLocaleString()} words</span></li>
              ))}
            </ul>
            <div>
              {!picked ? <p className="muted">Choose a version to compare it with the current text.</p> : (
                <>
                  <p className="small muted">Compared with the current text: <span className="diff"><span className="removed">struck</span></span> is only in the earlier version, <span className="diff"><span className="added">highlighted</span></span> is only in the current one.</p>
                  <div className="diff" style={{ maxHeight: '45vh', overflow: 'auto', border: '1px solid var(--line)', padding: '0.75rem', borderRadius: 'var(--r-sm)' }}>
                    {diffWords(picked.text, current).map((p, i) => <span key={i} className={p.kind === 'same' ? '' : p.kind}>{p.text}</span>)}
                  </div>
                  <div className="row" style={{ marginTop: '0.75rem' }}><button className="btn write" onClick={() => void restore()}>Restore this version</button><span className="small muted">The current text stays in this list.</span></div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
