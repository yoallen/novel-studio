import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from './api';
import type { Ctx } from './App';

// The Writing Trail (R-B-017): where she left, why, whether it was resolved, where she meant to return.
export function TrailView({ ctx }: { ctx: Ctx }) {
  const [trail, setTrail] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(() => api.get(`/api/projects/${ctx.projectId}/trail`).then(setTrail).catch((e) => setError(e.message)), [ctx.projectId]);
  useEffect(() => { void load(); }, [load]);
  async function resolve(t: any, resolved: boolean) {
    const outcome = resolved ? t._outcome ?? t.outcome : t._outcome ?? t.outcome;
    await api.post(`/api/trail/${t.id}/resolve`, { resolved, outcome: outcome ?? '' }).catch((e) => setError(e.message));
    await load();
  }
  return (
    <div className="scroll"><div className="content">
      <h1>Writing Trail</h1>
      <p className="muted">Part of the Writing Room. Every time you step away from the page, the trail remembers where you were and why, so a detour never costs you your place.</p>
      <p className="small muted trail-how">A detour closes when you return to writing. Mark it resolved once what you went to do is done, and jot what came of it if you want to remember: an answer you found, a decision you made.</p>
      {error && <div className="notice error">{error}</div>}
      {trail && trail.length === 0 && <p className="muted">No detours yet.</p>}
      <ul className="list">
        {trail?.map((t) => (
          <li key={t.id}>
            <div className="row">
              <strong className="grow">{t.reason || 'Stepped away'}</strong>
              <span className="faint small">{new Date(t.created_at).toLocaleString()}</span>
            </div>
            <div className="small muted">{t.returned_at ? 'Returned to writing' : 'Not returned yet'}{t.resolved ? ', resolved' : ', not resolved'}</div>
            <div className="row" style={{ marginTop: '0.4rem' }}>
              <input type="text" defaultValue={t.outcome} placeholder="What came of it, if you like: an answer, a decision" onChange={(e) => (t._outcome = e.target.value)} style={{ maxWidth: 420 }} aria-label="What came of it" />
              {t.resolved ? <button className="btn small" onClick={() => void resolve(t, false)}>Mark unresolved</button> : <button className="btn small" onClick={() => void resolve(t, true)}>Mark resolved</button>}
              {t.from?.sceneId && <button className="btn small" onClick={() => ctx.openScene(t.from.sceneId)}>Go back to that scene</button>}
            </div>
          </li>
        ))}
      </ul>
    </div></div>
  );
}

// History: every change, undoable one at a time (R-B-063).
export function HistoryView({ ctx }: { ctx: Ctx }) {
  const [hist, setHist] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState<{ id: string; message: string } | null>(null);
  const load = useCallback(() => api.get(`/api/projects/${ctx.projectId}/history`).then(setHist).catch((e) => setError(e.message)), [ctx.projectId]);
  useEffect(() => { void load(); }, [load]);
  async function undo(id: string, force = false) {
    try { await api.post(`/api/batches/${id}/undo`, { force }); setBlocked(null); await load(); await ctx.refreshProject(); }
    catch (e) { if (e instanceof ApiError && e.status === 409) setBlocked({ id, message: e.message }); else setError((e as Error).message); }
  }
  return (
    <div className="scroll"><div className="content">
      <div className="row"><h1 className="grow">Story Trail</h1><button className="btn link small" onClick={() => ctx.go('trash')}>Deleted things</button></div>
      <p className="muted">How your story evolved: every idea, decision and revision, in order. Undo any one of them without losing what came after.</p>
      {error && <div className="notice error">{error}</div>}
      {blocked && <div className="notice" role="alert">{blocked.message}<div className="row" style={{ marginTop: '0.5rem' }}><button className="btn small" onClick={() => void undo(blocked.id, true)}>Undo anyway</button><button className="btn small" onClick={() => setBlocked(null)}>Leave it</button></div></div>}
      {hist && hist.length === 0 && <p className="empty-note">Nothing has changed yet. From your first change on, every idea, decision and revision appears here in order, and any one of them can be undone.</p>}
      <ul className="list">
        {hist?.map((h) => (
          <li key={h.id} className="row">
            <span className="grow">{h.reason}{h.reverted_by ? <span className="faint small"> (undone)</span> : ''}</span>
            <span className="faint small">{h.actor === 'author' ? '' : `${h.actor}, `}{new Date(h.created_at).toLocaleString()}</span>
            {!h.reverted_by && <button className="btn small" onClick={() => void undo(h.id)}>Undo</button>}
          </li>
        ))}
      </ul>
    </div></div>
  );
}

// Deleted work, always restorable (R-B-063).
export function TrashView({ ctx }: { ctx: Ctx }) {
  const [d, setD] = useState<any>(null);
  const [error, setError] = useState('');
  const load = useCallback(() => api.get(`/api/projects/${ctx.projectId}/deleted`).then(setD).catch((e) => setError(e.message)), [ctx.projectId]);
  useEffect(() => { void load(); }, [load]);
  async function restore(url: string) { await api.post(url).catch((e) => setError(e.message)); await load(); }
  return (
    <div className="scroll"><div className="content">
      <h1>Deleted</h1>
      <p className="muted">Nothing deleted here is gone. Restore anything, any time.</p>
      {error && <div className="notice error">{error}</div>}
      {d && (
        <>
          <h2>Chapters</h2>
          {d.chapters.length === 0 ? <p className="muted small">None.</p> : <ul className="list">{d.chapters.map((c: any) => <li key={c.id} className="row"><span className="grow">{c.title}</span><button className="btn small" onClick={() => void restore(`/api/chapters/${c.id}/restore`)}>Restore with its scenes</button></li>)}</ul>}
          <h2 style={{ marginTop: '1.5rem' }}>Scenes</h2>
          {d.scenes.length === 0 ? <p className="muted small">None.</p> : <ul className="list">{d.scenes.map((s: any) => <li key={s.id} className="row"><span className="grow">{s.title} <span className="faint small">from {s.chapter_title}, {s.word_count.toLocaleString()} words</span></span><button className="btn small" onClick={() => void restore(`/api/scenes/${s.id}/restore`)}>Restore</button></li>)}</ul>}
          <h2 style={{ marginTop: '1.5rem' }}>Story records</h2>
          {d.elements.length === 0 ? <p className="muted small">None.</p> : <ul className="list">{d.elements.map((e: any) => <li key={e.id} className="row"><span className="grow">{e.title} <span className="faint small">{String(e.kind).replace(/_/g, ' ')}</span></span><button className="btn small" onClick={() => void restore(`/api/elements/${e.id}/restore`)}>Restore</button></li>)}</ul>}
        </>
      )}
    </div></div>
  );
}
