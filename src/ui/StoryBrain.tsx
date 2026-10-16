import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { ElementPage, Suggestions } from './ElementPage';
import { NotesView } from './NotesView';
import { statusWord, valueText } from './status';

// The Story Brain: one trusted place where the story lives (R-A-043). Kinds on the left, the chosen
// record in the middle. Questions and ideas keep their own spaces (R-A-047 to R-A-050).
const MAIN = ['character', 'relationship', 'location', 'event', 'clue', 'object', 'storyline', 'theme', 'motif', 'line'];
type Sel = { kind: 'kind'; key: string } | { kind: 'element'; id: string } | { kind: 'map' } | { kind: 'suggestions' } | { kind: 'notes' };

export function StoryBrain({ ctx }: { ctx: Ctx }) {
  const [kinds, setKinds] = useState<any[]>([]);
  const [els, setEls] = useState<any[]>([]);
  const [sel, setSel] = useState<Sel>(() => { try { const s = sessionStorage.getItem('ns-brain-sel'); return s ? JSON.parse(s) : { kind: 'kind', key: 'character' }; } catch { return { kind: 'kind', key: 'character' }; } });
  const [pending, setPending] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [newKind, setNewKind] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [k, e, p] = await Promise.all([api.get(`/api/projects/${ctx.projectId}/kinds`), api.get(`/api/projects/${ctx.projectId}/elements`), api.get(`/api/projects/${ctx.projectId}/proposals`)]);
      setKinds(k); setEls(e); setPending(p.filter((x: any) => x.status === 'pending' || x.status === 'deferred'));
    } catch (er) { setError((er as Error).message); }
  }, [ctx.projectId]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { try { sessionStorage.setItem('ns-brain-sel', JSON.stringify(sel)); } catch { /* ignore */ } }, [sel]);

  const count = (k: string) => els.filter((e) => e.kind === k).length;
  const hidden = new Set(['scene_plan', 'arc', 'guardrail', 'question', 'idea', 'thought', 'note']);
  const visibleKinds = kinds.filter((k) => !hidden.has(k.key) && (showAll || MAIN.includes(k.key) || k.custom || count(k.key) > 0));
  const kindLabel = (key: string) => kinds.find((k) => k.key === key);

  async function addElement(e: React.FormEvent) {
    e.preventDefault();
    if (sel.kind !== 'kind' || !newTitle.trim()) return;
    try { const el = await api.post(`/api/projects/${ctx.projectId}/elements`, { kind: sel.key, title: newTitle }); setNewTitle(''); await load(); setSel({ kind: 'element', id: el.id }); }
    catch (er) { setError((er as Error).message); }
  }
  async function addKind(e: React.FormEvent) {
    e.preventDefault();
    if (!newKind.trim()) return;
    try { const k = await api.post(`/api/projects/${ctx.projectId}/kinds`, { label: newKind }); setNewKind(''); await load(); setSel({ kind: 'kind', key: k.key }); }
    catch (er) { setError((er as Error).message); }
  }

  return (
    <div className="desk no-panel" style={{ gridTemplateColumns: '260px minmax(0, 1fr)' }}>
      <aside className="binder" aria-label="Story Brain sections">
        <button className="scene-row" aria-current={sel.kind === 'notes' ? 'true' : undefined} onClick={() => setSel({ kind: 'notes' })}>Questions and ideas<span className="wc">{count('question') + count('idea') + count('thought')}</span></button>
        <button className="scene-row" aria-current={sel.kind === 'map' ? 'true' : undefined} onClick={() => setSel({ kind: 'map' })}>Choices ahead</button>
        <button className="scene-row" aria-current={sel.kind === 'suggestions' ? 'true' : undefined} onClick={() => setSel({ kind: 'suggestions' })}>Suggestions waiting<span className="wc">{pending.length}</span></button>
        <div className="section" />
        {visibleKinds.map((k) => (
          <button key={k.key} className="scene-row" aria-current={sel.kind === 'kind' && sel.key === k.key ? 'true' : undefined} onClick={() => setSel({ kind: 'kind', key: k.key })}>{k.plural}<span className="wc">{count(k.key)}</span></button>
        ))}
        <button className="btn link small" onClick={() => setShowAll((s) => !s)}>{showAll ? 'Show fewer kinds' : 'Show every kind'}</button>
        <form onSubmit={addKind} className="section">
          <label className="field"><span>Add your own kind</span><input type="text" value={newKind} onChange={(e) => setNewKind(e.target.value)} placeholder="For example: Running gag" /></label>
          <button className="btn small" type="submit">Add kind</button>
        </form>
      </aside>
      <div className="pagewrap"><div className="content" style={{ maxWidth: 920 }}>
        {error && <div className="notice error" role="alert">{error}</div>}
        {sel.kind === 'notes' && <NotesView ctx={ctx} embedded onOpen={(id) => setSel({ kind: 'element', id })} />}
        {sel.kind === 'map' && <ChoicesAhead ctx={ctx} onOpen={(id) => setSel({ kind: 'element', id })} />}
        {sel.kind === 'suggestions' && (<><h1>Suggestions waiting</h1><p className="muted">Nothing here changes your story until you accept it. "Not yet" keeps it waiting.</p>{pending.length === 0 ? <p className="muted">None waiting.</p> : <Suggestions ctx={ctx} items={pending} onDone={() => void load()} />}</>)}
        {sel.kind === 'kind' && (
          <>
            <h1>{kindLabel(sel.key)?.plural ?? sel.key}</h1>
            <ul className="list">
              {els.filter((e) => e.kind === sel.key && !e.parent_id).map((e) => (
                <li key={e.id} className="row"><button className="btn link grow" style={{ textAlign: 'left', fontSize: '1.05rem' }} onClick={() => setSel({ kind: 'element', id: e.id })}>{e.title}</button>{e.reserved && <span className="hers">{e.reserved}</span>}</li>
              ))}
            </ul>
            <form className="row" onSubmit={addElement} style={{ marginTop: '1rem' }}>
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="A name is enough to start" aria-label={`New ${kindLabel(sel.key)?.label ?? 'item'}`} style={{ maxWidth: 360 }} />
              <button className="btn" type="submit">Add {kindLabel(sel.key)?.label?.toLowerCase() ?? 'item'}</button>
            </form>
          </>
        )}
        {sel.kind === 'element' && <ElementPage key={sel.id} ctx={ctx} elementId={sel.id} onOpen={(id) => setSel({ kind: 'element', id })} onChanged={() => void load()} />}
      </div></div>
    </div>
  );
}

// A map of the choices ahead, not a to-do list: no due dates, no percentages (R-A-042).
function ChoicesAhead({ ctx, onOpen }: { ctx: Ctx; onOpen: (id: string) => void }) {
  const [m, setM] = useState<any>(null);
  useEffect(() => { api.get(`/api/projects/${ctx.projectId}/open-decisions`).then(setM).catch(() => {}); }, [ctx.projectId]);
  if (!m) return <p className="muted">Gathering…</p>;
  return (
    <>
      <h1>Choices ahead</h1>
      <p className="muted">Not a list to finish before you write. Many of these will answer themselves as you draft.</p>
      <div className="cols">
        <section><h2>{statusWord(ctx.settings, 'unanswered')}</h2>{m.stillOpen.length === 0 ? <p className="muted small">Nothing marked.</p> : <ul className="list">{m.stillOpen.map((s: any) => <li key={s.id} className="st" data-s="unanswered"><button className="btn link" onClick={() => onOpen(s.element_id)}>{s.element_title}</button>, {s.field.replace(/^x_/, '').replace(/_/g, ' ')}{valueText(s.value) ? `: ${valueText(s.value)}` : ''}</li>)}</ul>}</section>
        <section><h2>Possibilities, nothing chosen</h2>{m.choosing.length === 0 ? <p className="muted small">None.</p> : <ul className="list">{m.choosing.map((c: any) => <li key={c.element_id + c.field} className="st" data-s="developing"><button className="btn link" onClick={() => onOpen(c.element_id)}>{c.element_title}</button>, {c.field.replace(/^x_/, '').replace(/_/g, ' ')} <span className="faint small">({c.options} option{c.options === 1 ? '' : 's'})</span></li>)}</ul>}</section>
        <section><h2>Questions I have</h2>{m.questions.length === 0 ? <p className="muted small">None open.</p> : <ul className="list">{m.questions.map((q: any) => <li key={q.id} className="st" data-s="unanswered"><button className="btn link" style={{ textAlign: 'left' }} onClick={() => onOpen(q.id)}>{q.title}</button></li>)}</ul>}</section>
        <section><h2>Kept for you</h2>{m.reserved.length === 0 ? <p className="muted small">Nothing marked.</p> : <ul className="list">{m.reserved.map((r: any) => <li key={r.id}>{r.what === 'element' ? <button className="btn link" onClick={() => onOpen(r.id)}>{r.title}</button> : <span>{r.title} (scene)</span>} <span className="hers">{r.reserved}</span></li>)}</ul>}</section>
        <section><h2>Suggestions waiting</h2><p className="small">{m.pending.length === 0 ? 'None.' : `${m.pending.length} waiting for you.`}</p></section>
      </div>
    </>
  );
}
