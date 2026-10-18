import { useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { when } from './status';
import { diffWords } from './diff';

// Drafts: finishing a draft keeps the whole book exactly as it stands, and the next draft begins.
// Any scene can then be compared across drafts. The manuscript itself never changes here.
export function DraftsView({ ctx }: { ctx: Ctx }) {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [finishing, setFinishing] = useState(false);
  const [note, setNote] = useState('');
  const [nextName, setNextName] = useState('');
  const [cmp, setCmp] = useState<any>(null);
  const [scene, setScene] = useState<any>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [reopening, setReopening] = useState(false);
  const load = () => api.get(`/api/projects/${ctx.projectId}/drafts`).then(setDrafts).catch((e) => setError(e.message));
  useEffect(() => { void load(); }, [ctx.projectId]);
  const current = drafts.find((d) => !d.completed_at);
  const done = drafts.filter((d) => d.completed_at);

  async function finish() {
    setError('');
    try {
      const r = await api.post(`/api/projects/${ctx.projectId}/drafts/complete`, { note, nextName: nextName.trim() || undefined });
      setFinishing(false); setNote(''); setNextName('');
      setMsg(`${r.completed.name} is kept, ${Number(r.completed.words).toLocaleString()} words. You are now in the ${String(r.now.name).toLowerCase()}.`);
      await load(); await ctx.refreshProject();
    } catch (e) { setError((e as Error).message); }
  }

  if (scene) return (
    <div className="scroll"><div className="content">
      <button className="btn link small" onClick={() => setScene(null)}>Back to the comparison</button>
      <h1>{scene.scene.title}</h1>
      <SceneAcross data={scene} />
    </div></div>
  );

  return (
    <div className="scroll"><div className="content">
      <h1>Drafts</h1>
      <p className="muted">When a draft is done, keep it. The whole book is saved exactly as it stands, and you carry on writing in the next draft. Nothing in your manuscript changes, and you can compare any scene with any earlier draft.</p>
      {error && <div className="notice error" role="alert">{error}</div>}
      {msg && <div className="notice" role="status">{msg}</div>}
      {current && (
        <section className="section" aria-label="This draft">
          <h2>Now: {current.name}</h2>
          <p className="small muted">The pages you are writing now belong to {current.name.toLowerCase()}, begun {when(current.started_at)}. A draft is a version of the pages; the stage on the book's cover{ctx.project?.profile?.stage ? ` (${ctx.project.profile.stage})` : ''} is where the book as a whole stands. The two move separately: a book can be in planning while its first draft is open.</p>
          {!finishing ? <button className="btn write" onClick={() => setFinishing(true)}>This draft is done</button> : (
            <div className="dialog-inline">
              <label className="field"><span>A note about this draft (optional)</span><textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What this draft did, what the next one is for." /></label>
              <label className="field" style={{ maxWidth: 360 }}><span>Name for the next draft (optional)</span><input type="text" value={nextName} onChange={(e) => setNextName(e.target.value)} placeholder="For example: Second draft, or The voice pass" /></label>
              <div className="row"><button className="btn write" onClick={() => void finish()}>Keep {current.name.toLowerCase()} and start the next</button><button className="btn link" onClick={() => setFinishing(false)}>Not yet</button></div>
            </div>
          )}
        </section>
      )}
      {done.length > 0 && (
        <section className="section" aria-label="Kept drafts">
          <h2>Kept drafts</h2>
          <ul className="list">
            {[...done].reverse().map((d) => (
              <li key={d.id}>
                <div className="row"><strong className="grow">{d.name}</strong><span className="small faint">finished {when(d.completed_at)}, {Number(d.words).toLocaleString()} words, {d.scenes} scenes</span>
                  <button className="btn small" onClick={() => void api.get(`/api/projects/${ctx.projectId}/drafts/${d.id}/compare`).then(setCmp).catch((e) => setError(e.message))}>Compare with now</button>
                </div>
                {d.note && <p className="small muted" style={{ margin: '0.25rem 0 0' }}>{d.note}</p>}
              </li>
            ))}
          </ul>
          {!reopening ? <button className="btn link small" onClick={() => setReopening(true)}>I finished {done[done.length - 1].name.toLowerCase()} too soon</button> : (
            <div className="notice small">Reopen {done[done.length - 1].name.toLowerCase()}? Its kept copy is released and you carry on in it. Your writing is not touched.
              <div className="row"><button className="btn small" onClick={() => void api.post(`/api/projects/${ctx.projectId}/drafts/reopen`).then(() => { setReopening(false); setCmp(null); return load(); }).catch((e) => setError(e.message))}>Reopen it</button><button className="btn link small" onClick={() => setReopening(false)}>Keep it finished</button></div>
            </div>
          )}
        </section>
      )}
      {cmp && (
        <section className="section" aria-label="Comparison">
          <h2>{cmp.draft.name} and now</h2>
          <p>{Number(cmp.wordsThen).toLocaleString()} words then, {Number(cmp.wordsNow).toLocaleString()} now. {cmp.changed.length} scene{cmp.changed.length === 1 ? '' : 's'} changed, {cmp.unchanged} untouched, {cmp.added.length} new, {cmp.removed.length} no longer in the book.</p>
          {cmp.changed.length > 0 && <><h3 className="small">Changed</h3><ul className="list small">{cmp.changed.map((c: any) => <li key={c.id} className="row"><button className="btn link small grow" style={{ textAlign: 'left' }} onClick={() => void api.get(`/api/scenes/${c.id}/drafts`).then(setScene)}>{c.title}</button><span className="faint">{c.chapter}</span><span>{c.before.toLocaleString()} to {c.after.toLocaleString()} words</span></li>)}</ul></>}
          {cmp.added.length > 0 && <><h3 className="small">New since then</h3><ul className="list small">{cmp.added.map((c: any) => <li key={c.id}><button className="btn link small" onClick={() => ctx.openScene(c.id)}>{c.title}</button> <span className="faint">{c.chapter}</span></li>)}</ul></>}
          {cmp.removed.length > 0 && <><h3 className="small">In that draft, not in the book now</h3><ul className="list small">{cmp.removed.map((c: any) => <li key={c.id}>{c.title} <span className="faint">{c.chapter}, {c.words.toLocaleString()} words, still kept in that draft</span></li>)}</ul></>}
        </section>
      )}
    </div></div>
  );
}

/** One scene in every kept draft and now, compared with whichever she picks. */
export function SceneAcross({ data }: { data: any }) {
  const [pick, setPick] = useState(data.drafts.length ? data.drafts[data.drafts.length - 1].draft_id : null);
  const d = data.drafts.find((x: any) => x.draft_id === pick);
  if (!data.drafts.length) return <p className="muted">This scene is not in any kept draft yet.</p>;
  return (
    <>
      <div className="row small" role="radiogroup" aria-label="Compare with">
        <span>Compare now with</span>
        {data.drafts.map((x: any) => <label key={x.draft_id} className="row"><input type="radio" checked={pick === x.draft_id} onChange={() => setPick(x.draft_id)} />{x.name}</label>)}
      </div>
      {d && (
        <>
          <p className="small muted"><span className="diff"><span className="removed">Struck</span></span> was in {d.name.toLowerCase()}; <span className="diff"><span className="added">highlighted</span></span> is new since. {d.word_count.toLocaleString()} words then, {data.scene.word_count.toLocaleString()} now.</p>
          <div className="diff" style={{ fontFamily: 'var(--prose)', whiteSpace: 'pre-wrap', lineHeight: 1.7, border: '1px solid var(--line)', padding: '0.75rem', borderRadius: 'var(--r-sm)' }}>
            {diffWords(d.text, data.scene.text).map((p: any, i: number) => <span key={i} className={p.kind === 'same' ? '' : p.kind}>{p.text}</span>)}
          </div>
        </>
      )}
    </>
  );
}
