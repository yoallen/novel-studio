import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { RevisionsDialog } from './RevisionsDialog';
import { flushEditor } from './flush';
import { LaterList } from './LaterList';
import { sceneCircle, CIRCLE_WORDS, RESERVED_HINTS, type SceneCircle } from '../core/labels';
import { valueText } from './status';

// The scene's plan beside the page. Readiness is information, never a gate (R-B-014).
// Questions and ideas attached to this scene resurface here and nowhere else (R-B-020).
export function ScenePanel({ ctx, sceneId, tick, onChanged, onReloadPage }: { ctx: Ctx; sceneId: string; tick?: number; onChanged: () => void; onReloadPage: () => void }) {
  const [c, setC] = useState<any>(null);
  const [chars, setChars] = useState<any[]>([]);
  const [places, setPlaces] = useState<string[]>([]);
  const [myName, setMyName] = useState('');
  const [error, setError] = useState('');
  const [showRevs, setShowRevs] = useState(false);
  const [notes, setNotes] = useState('');
  // Which blank was just saved, so she can see her typing was kept.
  const [savedField, setSavedField] = useState<string | null>(null);
  const savedTimer = useRef<number>();

  const load = useCallback(() => api.get(`/api/scenes/${sceneId}/context`).then((x) => { setC(x); setNotes(x.scene.notes ?? ''); }).catch((e) => setError(e.message)), [sceneId]);
  useEffect(() => {
    void load();
    api.get(`/api/projects/${ctx.projectId}/elements?kind=character`).then(setChars).catch(() => {});
    api.get(`/api/projects/${ctx.projectId}/elements?kind=location`).then((l: any[]) => setPlaces(l.map((x) => x.title))).catch(() => {});
    api.get('/api/author-profile').then((p) => setMyName(String(p.about?.name ?? '').trim())).catch(() => {});
  }, [load, ctx.projectId]);
  // The page can move the scene along (first words start the drafting step): keep the status in step, leave her notes alone.
  useEffect(() => { if (tick) api.get(`/api/scenes/${sceneId}/context`).then((x) => setC((cur: any) => (cur ? { ...x } : cur))).catch(() => {}); }, [tick, sceneId]);
  useEffect(() => { const f = () => void load(); window.addEventListener('ns-captured', f); return () => window.removeEventListener('ns-captured', f); }, [load]);
  useEffect(() => () => window.clearTimeout(savedTimer.current), []);

  function showSaved(field: string) {
    setSavedField(field);
    window.clearTimeout(savedTimer.current);
    savedTimer.current = window.setTimeout(() => setSavedField(null), 2500);
  }
  async function patchScene(p: Record<string, unknown>, field?: string) {
    try { await api.patch(`/api/scenes/${sceneId}`, p); await load(); onChanged(); if (field) showSaved(field); } catch (e) { setError((e as Error).message); }
  }
  async function setField(field: string, value: string, prev: string) {
    if (value.trim() === prev.trim() || !value.trim()) return;
    try { await api.post(`/api/scenes/${sceneId}/plan`, { field, value }); await load(); showSaved(field); } catch (e) { setError((e as Error).message); }
  }
  async function setNoteState(id: string, state: string) { await api.patch(`/api/elements/${id}`, { state }).catch((e) => setError(e.message)); await load(); }
  function openCard() { if (c?.card) void flushEditor().then(() => ctx.showInMap(sceneId)); }

  if (!c) return <p className="muted small">{error || 'Loading the scene plan…'}</p>;
  const ladder: any[] = ctx.settings.sceneLadder;
  const markers: string[] = ctx.settings.reservedMarkers;
  const name = myName || ctx.settings.authorName || '';
  const owned = (ctx.settings.ownedLabel as string).replace('{author}', name).replace(/^,\s*/, '');
  const ownedHint = 'Handed back to you: the collaborator offers nothing more here unless you ask.';
  const hintOf = (m: string) => (m === owned ? ownedHint : RESERVED_HINTS[m] ?? '');
  const options = [owned, ...markers].filter((m, i, a) => m && a.indexOf(m) === i);
  // Old marks keep their words even if the name has changed since.
  if (c.scene.reserved && !options.includes(c.scene.reserved)) options.push(c.scene.reserved);
  const circles: SceneCircle[] = ['empty', 'half', 'full'];
  const byCircle = (k: SceneCircle) => ladder.filter((s) => sceneCircle(ladder, s.key) === k).map((s) => s.label);
  const savedNote = (field: string) => savedField === field ? <span className="saved-note" role="status">Saved</span> : null;
  const core = new Set(['purpose', 'objective', 'conflict', 'outcome', 'reader_response']);
  const fieldBox = (f: any) => {
    const cur = f.latest?.value ?? '';
    return (
      <label key={f.field} className="field">
        <span>{f.label}{f.current ? '' : f.latest ? ' (developing)' : ''}{savedNote(f.field)}</span>
        {f.field === 'location' ? (
          <input type="text" list="scene-places" defaultValue={String(cur)} className={f.latest ? 'st' : ''} data-s={f.current ? 'established' : 'developing'} aria-describedby={`hint-${f.field}`}
            onBlur={(e) => void setField(f.field, e.target.value, String(cur))} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />
        ) : (
          <textarea rows={2} defaultValue={String(cur)} className={f.latest ? 'st' : ''} data-s={f.current ? 'established' : 'developing'} aria-describedby={f.hint ? `hint-${f.field}` : undefined}
            onBlur={(e) => void setField(f.field, e.target.value, String(cur))} />
        )}
        {f.hint && <small id={`hint-${f.field}`} className="field-hint">{f.hint}</small>}
      </label>
    );
  };

  return (
    <div className="scene-plan">
      {error && <div className="notice error" role="alert">{error}</div>}
      <h2 style={{ fontSize: '1.125rem' }}>Scene plan</h2>
      <p className="small muted plan-saving">Everything here saves by itself when you click away. Earlier versions are kept.</p>
      <LaterList ctx={ctx} sceneId={sceneId} />

      {c.card && (c.card.beat || c.card.mightGo.length > 0 || c.card.fields.length > 0) && (
        <section className="section from-card" aria-label="From the card">
          <h3>From the card</h3>
          <dl className="card-plan">
            <div><dt>Beat</dt><dd>{c.card.beat ? c.card.beat.name : c.card.mightGo.length ? `Might go at ${c.card.mightGo.map((b: any) => b.name).join(' or ')}` : 'Not on a beat yet'}</dd></div>
            {c.card.fields.map((f: any) => <div key={f.field}><dt>{f.label}</dt><dd>{valueText(f.value)}</dd></div>)}
          </dl>
          <button className="btn link small" onClick={openCard}>Open the full card</button>
        </section>
      )}

      <label className="field"><span>Status{savedNote('status')}</span>
        <select value={c.scene.status} onChange={(e) => void patchScene({ status: e.target.value }, 'status')}>
          {ladder.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          {!ladder.some((s) => s.key === c.scene.status) && <option value={c.scene.status}>{c.scene.status}</option>}
        </select>
      </label>
      <ul className="circle-key" aria-label="What the circles in the binder mean">
        {circles.map((k) => byCircle(k).length > 0 && (
          <li key={k} data-here={sceneCircle(ladder, c.scene.status) === k || undefined}><span className="mark" data-c={k} aria-hidden="true" /><span><strong>{CIRCLE_WORDS[k]}</strong>: {byCircle(k).join(', ')}</span></li>
        ))}
      </ul>

      <label className="field"><span>Viewpoint character{savedNote('pov')}</span>
        <select value={c.scene.pov_element_id ?? ''} onChange={(e) => void patchScene({ povElementId: e.target.value || null }, 'pov')}>
          <option value="">Not set</option>
          {chars.map((ch) => <option key={ch.id} value={ch.id}>{ch.title}</option>)}
        </select>
        {chars.length === 0 && <span className="faint small">Add characters in the Story Brain.</span>}
      </label>
      <label className="field"><span>Kept for you to write or decide{savedNote('reserved')}</span>
        <select value={c.scene.reserved ?? ''} onChange={(e) => void patchScene({ reserved: e.target.value || null }, 'reserved')} aria-describedby="reserved-hint">
          <option value="">Not marked</option>
          {options.map((m) => <option key={m} value={m} title={hintOf(m) || undefined}>{m}</option>)}
        </select>
        <small id="reserved-hint" className="field-hint">{c.scene.reserved && hintOf(c.scene.reserved) ? hintOf(c.scene.reserved) : 'Mark what is yours alone. The collaborator may talk about it, but never writes or decides it for you.'}</small>
      </label>
      <label className="check small confirm-check">
        <input type="checkbox" checked={!!c.scene.confirmed} onChange={(e) => void patchScene({ confirmed: e.target.checked }, 'confirmed')} aria-describedby="confirm-hint" />
        <span>This draft is settled: the page wins over the plan{savedNote('confirmed')}</span>
      </label>
      <small id="confirm-hint" className="field-hint confirm-hint">Tick it once the scene reads the way you want. Where the page and the plan below disagree, the page is the truth and the plan becomes history.</small>

      <SceneAges sceneId={sceneId} tick={c} />

      <div className="section">
        <h3>Drafting readiness</h3>
        {c.readiness.ready ? <p className="small">Ready to draft.</p> : (
          <>
            <p className="small muted">Still open below. You can write anyway.</p>
            <ul className="readiness small">{c.readiness.items.map((r: any) => <li key={r.item} data-ok={r.ok || undefined}>{r.ok ? 'Done: ' : 'Open: '}{r.item}</li>)}</ul>
          </>
        )}
      </div>

      <div className="section">
        {c.fields.filter((f: any) => core.has(f.field)).map(fieldBox)}
      </div>
      <div className="section">
        <h3>The turn, and around it</h3>
        {c.fields.filter((f: any) => !core.has(f.field)).map(fieldBox)}
        <datalist id="scene-places">{places.map((p) => <option key={p} value={p} />)}</datalist>
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
        <label className="field"><span>Scene notes{savedNote('notes')}</span>
          <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => { if (notes !== (c.scene.notes ?? '')) void patchScene({ notes }, 'notes'); }} />
        </label>
        <div className="row">
          <button className="btn small" onClick={() => void flushEditor().then(() => setShowRevs(true))}>Earlier versions</button>
        </div>
        <p className="faint small">To move or delete this scene, use the links under its name on the left.</p>
      </div>
      {showRevs && <RevisionsDialog sceneId={sceneId} onClose={() => setShowRevs(false)} onRestored={() => { setShowRevs(false); onChanged(); onReloadPage(); }} />}
    </div>
  );
}

/** Who is in this scene and how old, once the scene has a year or the characters have birth years or fixed ages. */
function SceneAges({ sceneId, tick }: { sceneId: string; tick: unknown }) {
  const [d, setD] = useState<any>(null);
  useEffect(() => { api.get(`/api/scenes/${sceneId}/ages`).then(setD).catch(() => setD(null)); }, [sceneId, tick]);
  if (!d || (!d.year && !d.people.some((p: any) => p.age != null))) return null;
  return (
    <section className="section ages" aria-label="Who is here, and how old">
      <h3>Who is here{d.year != null ? `, ${d.year}` : ''}</h3>
      {d.people.length === 0 ? <p className="small muted">Connect characters to this scene (appears in) to see their ages.</p> : (
        <ul className="list small">{d.people.map((p: any) => <li key={p.id}>{p.title}{p.age != null ? `, ${p.age}` : <span className="faint">, age not known yet</span>}</li>)}</ul>
      )}
    </section>
  );
}
