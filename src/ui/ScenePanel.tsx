import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { RevisionsDialog } from './RevisionsDialog';
import { flushEditor } from './flush';

// The scene's plan beside the page. Readiness is information, never a gate (R-B-014).
// Questions and ideas attached to this scene resurface here and nowhere else (R-B-020).
export function ScenePanel({ ctx, sceneId, onChanged, onReloadPage }: { ctx: Ctx; sceneId: string; onChanged: () => void; onReloadPage: () => void }) {
  const [c, setC] = useState<any>(null);
  const [chars, setChars] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [showRevs, setShowRevs] = useState(false);
  const [notes, setNotes] = useState('');

  const load = useCallback(() => api.get(`/api/scenes/${sceneId}/context`).then((x) => { setC(x); setNotes(x.scene.notes ?? ''); }).catch((e) => setError(e.message)), [sceneId]);
  useEffect(() => { void load(); api.get(`/api/projects/${ctx.projectId}/elements?kind=character`).then(setChars).catch(() => {}); }, [load, ctx.projectId]);
  useEffect(() => { const f = () => void load(); window.addEventListener('ns-captured', f); return () => window.removeEventListener('ns-captured', f); }, [load]);

  async function patchScene(p: Record<string, unknown>) {
    try { await api.patch(`/api/scenes/${sceneId}`, p); await load(); onChanged(); } catch (e) { setError((e as Error).message); }
  }
  async function setField(field: string, value: string, prev: string) {
    if (value.trim() === prev.trim() || !value.trim()) return;
    try { await api.post(`/api/scenes/${sceneId}/plan`, { field, value }); await load(); } catch (e) { setError((e as Error).message); }
  }
  async function setNoteState(id: string, state: string) { await api.patch(`/api/elements/${id}`, { state }).catch((e) => setError(e.message)); await load(); }

  if (!c) return <p className="muted small">{error || 'Loading the scene plan…'}</p>;
  const ladder: any[] = ctx.settings.sceneLadder;
  const markers: string[] = ctx.settings.reservedMarkers;
  const owned = (ctx.settings.ownedLabel as string).replace('{author}', ctx.settings.authorName || '').replace(/^,\s*/, '');

  return (
    <div>
      {error && <div className="notice error" role="alert">{error}</div>}
      <h2 style={{ fontSize: '1.125rem' }}>Scene plan</h2>

      <label className="field"><span>Status</span>
        <select value={c.scene.status} onChange={(e) => void patchScene({ status: e.target.value })}>
          {ladder.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          {!ladder.some((s) => s.key === c.scene.status) && <option value={c.scene.status}>{c.scene.status}</option>}
        </select>
      </label>
      <label className="field"><span>Viewpoint character</span>
        <select value={c.scene.pov_element_id ?? ''} onChange={(e) => void patchScene({ povElementId: e.target.value || null })}>
          <option value="">Not set</option>
          {chars.map((ch) => <option key={ch.id} value={ch.id}>{ch.title}</option>)}
        </select>
        {chars.length === 0 && <span className="faint small">Add characters in the Story Brain.</span>}
      </label>
      <label className="field"><span>Kept for you to write or decide</span>
        <select value={c.scene.reserved ?? ''} onChange={(e) => void patchScene({ reserved: e.target.value || null })}>
          <option value="">Not marked</option>
          {[owned, ...markers].filter((m, i, a) => m && a.indexOf(m) === i).map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </label>
      <label className="check small" style={{ marginBottom: '1rem' }}>
        <input type="checkbox" checked={!!c.scene.confirmed} onChange={(e) => void patchScene({ confirmed: e.target.checked })} />
        <span>Drafted and confirmed: this text outranks the earlier plan</span>
      </label>

      <div className="section">
        <h3>Drafting readiness</h3>
        {c.readiness.ready ? <p className="small">Ready to draft.</p> : <p className="small muted">Open questions: {c.readiness.open.join(', ')}. You can write anyway.</p>}
      </div>

      <div className="section">
        {c.fields.map((f: any) => {
          const cur = f.latest?.value ?? '';
          return (
            <label key={f.field} className="field">
              <span>{f.label}{f.current ? '' : f.latest ? ' (developing)' : ''}</span>
              <textarea rows={2} defaultValue={String(cur)} className={f.latest ? 'st' : ''} data-s={f.current ? 'established' : 'developing'}
                onBlur={(e) => void setField(f.field, e.target.value, String(cur))} />
            </label>
          );
        })}
        <p className="faint small">Each change is kept in history; earlier versions are never erased.</p>
      </div>

      <div className="section">
        <h3>Attached to this scene</h3>
        {c.openNotes.length === 0 ? <p className="muted small">Nothing open. Capture a thought with Ctrl+Shift+N and it will wait here.</p> : (
          <ul className="list">
            {c.openNotes.map((n: any) => (
              <li key={n.id}>
                <div className="st" data-s={n.kind === 'question' ? 'unanswered' : 'developing'}>
                  <span className="small muted">{n.kind === 'question' ? 'Question' : n.kind === 'idea' ? 'Idea' : 'Thought'}{n.attrs?.urgency === 'now' ? ', needed to keep writing' : ''}</span>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{n.body || n.title}</div>
                </div>
                <div className="row" style={{ marginTop: '0.25rem' }}>
                  {n.kind === 'question' && <button className="btn small" onClick={() => void setNoteState(n.id, 'answered')}>Answered</button>}
                  {n.kind === 'question' && <button className="btn small" onClick={() => void setNoteState(n.id, 'not_relevant')}>No longer relevant</button>}
                  {n.kind === 'idea' && <button className="btn small" onClick={() => void setNoteState(n.id, 'adopted')}>Adopt</button>}
                  {n.kind === 'idea' && <button className="btn small" onClick={() => void setNoteState(n.id, 'set_aside')}>Set aside</button>}
                  {n.kind === 'thought' && <button className="btn small" onClick={() => void setNoteState(n.id, 'filed')}>Done</button>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="section">
        <label className="field"><span>Scene notes</span>
          <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => { if (notes !== (c.scene.notes ?? '')) void patchScene({ notes }); }} />
        </label>
        <div className="row">
          <button className="btn small" onClick={() => void flushEditor().then(() => setShowRevs(true))}>Earlier versions</button>
          <button className="btn small danger" onClick={() => { if (window.confirm('Move this scene to Deleted? You can restore it from there.')) void flushEditor().then(() => api.del(`/api/scenes/${sceneId}`)).then(() => { onChanged(); ctx.closeScene(); }); }}>Delete scene</button>
        </div>
      </div>
      {showRevs && <RevisionsDialog sceneId={sceneId} onClose={() => setShowRevs(false)} onRestored={() => { setShowRevs(false); onChanged(); onReloadPage(); }} />}
    </div>
  );
}
