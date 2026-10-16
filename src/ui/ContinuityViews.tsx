import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { valueText } from './status';
import { ElementPage } from './ElementPage';

// Continuity inside Narrative Zoom: timelines, viewpoint, knowledge, clues, storylines, and the review.
type Open = (node: { level: 'card' | 'element'; id: string }) => void;
const v = (x: unknown) => (x == null || x === '' ? <span className="faint">not set</span> : valueText(x));
const th = { padding: '0.4rem', textAlign: 'left' as const, borderBottom: '1px solid var(--line-strong)' };
const td = { padding: '0.4rem', borderTop: '1px solid var(--line)', verticalAlign: 'top' as const };

function useData<T = any>(url: string, tick: number) {
  const [d, setD] = useState<T | null>(null);
  const [e, setE] = useState('');
  useEffect(() => { api.get(url).then(setD).catch((er) => setE(er.message)); }, [url, tick]);
  return { d, e };
}

export function Timelines({ ctx, tick, onOpen }: { ctx: Ctx; tick: number; onOpen: Open }) {
  const { d, e } = useData(`/api/projects/${ctx.projectId}/timelines`, tick);
  if (e) return <div className="notice error">{e}</div>;
  if (!d) return <p className="muted">Lining up the timelines…</p>;
  const row = (r: any) => (
    <tr key={r.key}><td style={td}>{r.narrative}</td><td style={td}>{r.planId ? <button className="btn link small" onClick={() => onOpen({ level: 'card', id: r.planId })}>{r.title}</button> : r.title}</td><td style={td}>{r.beat || <span className="faint">no beat</span>}</td><td style={td}>{v(r.day ?? r.date)}</td><td style={td}>{v(r.time)}</td><td style={td}>{v(r.location)}</td><td style={td}>{v(r.season ?? r.weather)}</td></tr>
  );
  const head = <thead><tr><th style={th}>Scene</th><th style={th}>Title</th><th style={th}>Beat</th><th style={th}>Day or date</th><th style={th}>Time</th><th style={th}>Where</th><th style={th}>Season, weather</th></tr></thead>;
  return (
    <>
      <h1>Two timelines</h1>
      <p className="muted small">The order the reader meets the story, and the order things actually happen. They can differ on purpose. Fill a scene's day and time in its card.</p>
      <h2>In the order of the book</h2>
      <div style={{ overflowX: 'auto' }}><table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.875rem' }}>{head}<tbody>{d.narrative.map(row)}</tbody></table></div>
      <h2 style={{ marginTop: '1.5rem' }}>In the order things happen</h2>
      {d.chronological.length === 0 ? <p className="muted small">No scene has a day or date yet.</p> : <div style={{ overflowX: 'auto' }}><table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.875rem' }}>{head}<tbody>{d.chronological.map(row)}</tbody></table></div>}
      {d.unplacedInTime > 0 && <p className="faint small">{d.unplacedInTime} scene{d.unplacedInTime === 1 ? ' has' : 's have'} no story time yet.</p>}
    </>
  );
}

export function Viewpoint({ ctx, tick, refresh }: { ctx: Ctx; tick: number; refresh: () => void }) {
  const { d, e } = useData(`/api/projects/${ctx.projectId}/pov`, tick);
  const [chars, setChars] = useState<any[]>([]);
  const [world, setWorld] = useState<string | null>(null);
  useEffect(() => { api.get(`/api/projects/${ctx.projectId}/elements?kind=character`).then(setChars).catch(() => {}); }, [ctx.projectId, tick]);
  if (e) return <div className="notice error">{e}</div>;
  if (!d) return <p className="muted">Gathering viewpoints…</p>;
  const setCh = (id: string, body: any) => void api.patch(`/api/chapters/${id}/pov`, body).then(refresh);
  const setSc = (s: any, patch: any) => void api.patch(`/api/scenes/${s.id}/pov`, { pov: { person: s.person ?? undefined, tense: s.tense ?? undefined, reliability: s.reliability ?? undefined, also: s.also.map((a: any) => a.id), ...patch } }).then(refresh);
  return (
    <>
      <h1>Viewpoint</h1>
      <div className="row" style={{ marginBottom: '1rem' }}>
        <span className="small muted grow">Defaults: {d.defaults.person ?? 'person not set'}, {d.defaults.tense ?? 'tense not set'}. Scenes inherit their chapter's viewpoint unless you set their own.</span>
        <button className="btn small" onClick={() => void api.post(`/api/projects/${ctx.projectId}/storyworld`).then((w) => setWorld(w.id))}>Story world and viewpoint rules</button>
      </div>
      {world && <section className="section"><ElementPage ctx={ctx} elementId={world} onOpen={() => {}} onChanged={refresh} /><button className="btn small" onClick={() => setWorld(null)}>Close</button></section>}
      {d.absences.map((a: any, i: number) => <p key={i} className="small muted">{a.character}: no viewpoint scene from {a.from} to {a.to} ({a.chapters} chapters). An observation, not a rule.</p>)}
      {d.chapters.map((c: any) => (
        <section key={c.id} className="section">
          <div className="row"><h2 className="grow" style={{ fontSize: '1.05rem' }}>{c.title}</h2>
            <label className="row small">Viewpoint <select value={c.pov?.id ?? ''} onChange={(ev) => setCh(c.id, { povElementId: ev.target.value || null })} style={{ width: 'auto' }}><option value="">None set</option>{chars.map((ch) => <option key={ch.id} value={ch.id}>{ch.title}</option>)}</select></label>
          </div>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.875rem' }}>
            <thead><tr><th style={th}>Scene</th><th style={th}>Viewpoint</th><th style={th}>Person</th><th style={th}>Tense</th><th style={th}>Reliability</th><th style={th}>Another head in this scene</th></tr></thead>
            <tbody>{c.scenes.map((s: any) => (
              <tr key={s.id}>
                <td style={td}><button className="btn link small" onClick={() => ctx.openScene(s.id)}>{s.title}</button></td>
                <td style={td}>{s.pov ? `${s.pov.title}${s.pov.inherited ? ' (from chapter)' : ''}` : <span className="faint">none</span>}</td>
                <td style={td}><input type="text" defaultValue={s.person ?? ''} aria-label={`Person for ${s.title}`} onBlur={(ev) => ev.target.value !== (s.person ?? '') && setSc(s, { person: ev.target.value })} style={{ width: '9em' }} /></td>
                <td style={td}><input type="text" defaultValue={s.tense ?? ''} aria-label={`Tense for ${s.title}`} onBlur={(ev) => ev.target.value !== (s.tense ?? '') && setSc(s, { tense: ev.target.value })} style={{ width: '7em' }} /></td>
                <td style={td}><select value={s.reliability ?? ''} onChange={(ev) => setSc(s, { reliability: ev.target.value || undefined })} aria-label={`Reliability for ${s.title}`} style={{ width: 'auto' }}><option value="">Not set</option><option>Reliable</option><option>Unreliable</option><option>Selectively informed</option></select></td>
                <td style={td}><select value={s.also[0]?.id ?? ''} onChange={(ev) => setSc(s, { also: ev.target.value ? [ev.target.value] : [] })} aria-label={`Second viewpoint for ${s.title}`} style={{ width: 'auto' }}><option value="">None</option>{chars.map((ch) => <option key={ch.id} value={ch.id}>{ch.title}</option>)}</select></td>
              </tr>
            ))}</tbody>
          </table>
        </section>
      ))}
    </>
  );
}

export function Knowledge({ ctx, tick, onOpen }: { ctx: Ctx; tick: number; onOpen: Open }) {
  const k = useData(`/api/projects/${ctx.projectId}/knowledge`, tick);
  const log = useData(`/api/projects/${ctx.projectId}/secret-log`, tick);
  if (k.e) return <div className="notice error">{k.e}</div>;
  if (!k.d) return <p className="muted">Working out who knows what…</p>;
  return (
    <>
      <h1>Who knows what, and when</h1>
      <p className="muted small">Built from what each scene reveals and who is in it. Mark a scene as revealing something in its connections ("reveals"), and a character's belief with "believes falsely" or "suspects".</p>
      {k.d.events.length === 0 ? <p className="muted">Nothing is revealed in any scene yet.</p> : k.d.events.map((ev: any) => (
        <section key={ev.id} className="section">
          <button className="btn link" style={{ fontWeight: 700 }} onClick={() => onOpen({ level: 'element', id: ev.id })}>{ev.title}</button>
          <ul className="list small">
            <li>The truth: {v(ev.truth)}</li>
            <li>When it happens: {v(ev.happens)}</li>
            <li>When the reader meets it: {ev.readerAt ? `scene ${ev.readerAt.index}, "${ev.readerAt.scene}"` : <span className="faint">not revealed yet</span>}</li>
            {ev.who.map((w: any) => <li key={w.id}>{w.title}: {w.learnsAt ? `learns it in scene ${w.learnsAt.index}, "${w.learnsAt.scene}"` : 'when not recorded'}{w.stance ? `; ${w.stance.relation.replace(/_/g, ' ')}${w.stance.note ? ` (${w.stance.note})` : ''}` : ''}</li>)}
          </ul>
        </section>
      ))}
      <h2 style={{ marginTop: '1.5rem' }}>The reader's view, scene by scene</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.875rem' }}>
        <thead><tr><th style={th}>Scene</th><th style={th}>Reader suspects</th><th style={th}>Revealed here</th><th style={th}>Who learns</th><th style={th}>Layer</th></tr></thead>
        <tbody>{k.d.timeline.map((t: any) => <tr key={t.index}><td style={td}>{t.planId ? <button className="btn link small" onClick={() => onOpen({ level: 'card', id: t.planId })}>{t.index}. {t.title}</button> : `${t.index}. ${t.title}`}</td><td style={td}>{v(t.readerSuspects)}</td><td style={td}>{t.reveals.join('; ') || <span className="faint">nothing</span>}</td><td style={td}>{t.learns.join('; ')}</td><td style={td}>{v(t.layer)}</td></tr>)}</tbody>
      </table>
      {log.d && log.d.length > 0 && (
        <section className="section">
          <h2>Secret operations (author only)</h2>
          <p className="muted small">The only place the real story lives in order. Never shown in viewpoint summaries.</p>
          {log.d.map((g: any, i: number) => (
            <div key={i}><h3>{g.actor?.title ?? 'Unassigned'}</h3>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.875rem' }}><thead><tr><th style={th}>When</th><th style={th}>The hidden move</th><th style={th}>What the others see</th><th style={th}>Who takes the blame</th></tr></thead>
                <tbody>{g.moves.map((m: any) => <tr key={m.id}><td style={td}>{v(m.when)}</td><td style={td}><button className="btn link small" onClick={() => onOpen({ level: 'element', id: m.id })}>{m.move ? valueText(m.move) : m.title}</button></td><td style={td}>{v(m.othersSee)}</td><td style={td}>{v(m.blame)}</td></tr>)}</tbody></table>
            </div>
          ))}
        </section>
      )}
      <AddHiddenMove ctx={ctx} />
    </>
  );
}

function AddHiddenMove({ ctx }: { ctx: Ctx }) {
  const [chars, setChars] = useState<any[]>([]);
  const [who, setWho] = useState('');
  const [t, setT] = useState('');
  const [done, setDone] = useState('');
  useEffect(() => { api.get(`/api/projects/${ctx.projectId}/elements?kind=character`).then(setChars).catch(() => {}); }, [ctx.projectId]);
  return (
    <form className="section row small" onSubmit={(e) => { e.preventDefault(); if (t.trim()) void api.post(`/api/projects/${ctx.projectId}/elements`, { kind: 'hidden_move', title: t, parentId: who || null }).then((m) => api.post(`/api/elements/${m.id}/statements`, { field: 'move', value: t, status: 'established' })).then(() => { setT(''); setDone('Added to the secret operations log.'); }); }}>
      <strong>Log a hidden move</strong>
      <select value={who} onChange={(e) => setWho(e.target.value)} style={{ width: 'auto' }} aria-label="Whose move"><option value="">Whose?</option>{chars.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
      <input type="text" value={t} onChange={(e) => setT(e.target.value)} placeholder="What they secretly do" aria-label="The hidden move" style={{ maxWidth: 360 }} />
      <button className="btn" type="submit">Add</button>{done && <span role="status">{done}</span>}
    </form>
  );
}

export function Clues({ ctx, tick, onOpen }: { ctx: Ctx; tick: number; onOpen: Open }) {
  const c = useData(`/api/projects/${ctx.projectId}/clues`, tick);
  const m = useData(`/api/projects/${ctx.projectId}/motifs`, tick);
  if (c.e) return <div className="notice error">{c.e}</div>;
  if (!c.d) return <p className="muted">Gathering setups and payoffs…</p>;
  const at = (xs: any[]) => xs.length === 0 ? <span className="faint">none</span> : xs.map((x: any, i: number) => <div key={i}><button className="btn link small" onClick={() => onOpen({ level: 'card', id: x.id })}>{x.title}</button>{x.at ? <span className="faint"> (scene {x.at})</span> : ''}</div>);
  return (
    <>
      <h1>Setups and payoffs</h1>
      <p className="muted small">If it pays off later, it has to be here first. Connect a scene to a clue with "plants", "reveals" or "pays off".</p>
      {c.d.length === 0 ? <p className="muted">No clues yet. Add one in the Story Brain under Clues.</p> : (
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.875rem' }}>
          <thead><tr><th style={th}>What</th><th style={th}>Planted</th><th style={th}>What it really means</th><th style={th}>Discovered</th><th style={th}>Pays off</th></tr></thead>
          <tbody>{c.d.map((r: any) => <tr key={r.id}><td style={td}><button className="btn link small" onClick={() => onOpen({ level: 'element', id: r.id })}>{r.title}</button>{r.significant && <div className="faint">must pay off</div>}</td><td style={td}>{at(r.plants)}</td><td style={td}>{v(r.truth)}</td><td style={td}>{at(r.reveals)}</td><td style={td}>{at(r.payoffs)}</td></tr>)}</tbody>
        </table>
      )}
      {m.d && m.d.length > 0 && (
        <section className="section"><h2>Motifs</h2>
          {m.d.map((mo: any) => <div key={mo.id} style={{ marginBottom: '0.75rem' }}><button className="btn link" onClick={() => onOpen({ level: 'element', id: mo.id })}>{mo.title}</button>
            {mo.appearances.length === 0 ? <p className="faint small">Not placed in any scene yet.</p> : <ul className="list small">{mo.appearances.map((a: any, i: number) => <li key={i}>Scene {a.index}, {a.scene}{a.note ? `: ${a.note}` : ''}</li>)}</ul>}</div>)}
        </section>
      )}
    </>
  );
}

export function Storylines({ ctx, tick, onOpen }: { ctx: Ctx; tick: number; onOpen: Open }) {
  const { d, e } = useData(`/api/projects/${ctx.projectId}/storylines`, tick);
  if (e) return <div className="notice error">{e}</div>;
  if (!d) return <p className="muted">Weaving…</p>;
  if (!d.strands.length) return <><h1>Storylines</h1><p className="muted">No storylines yet. Add as many as the story needs in the Story Brain under Storylines, then connect scene cards to them with "advances".</p></>;
  return (
    <>
      <h1>Storylines</h1>
      <p className="muted small">The strongest scenes move more than one thread. {d.touchPoints.length} scene{d.touchPoints.length === 1 ? ' moves' : 's move'} more than one.</p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead><tr><th style={th}>Scene</th>{d.strands.map((s: any) => <th key={s.id} style={th}><button className="btn link small" onClick={() => onOpen({ level: 'element', id: s.id })}>{s.letter ? `${s.letter}: ` : ''}{s.title}</button><div className="faint" style={{ fontWeight: 400 }}>{valueText(s.state) || ''}{s.values.length ? ` carrying ${s.values.map(valueText).join(', ')}` : ''}</div></th>)}</tr></thead>
          <tbody>{d.grid.map((g: any) => <tr key={g.index}><td style={td}>{g.planId ? <button className="btn link small" onClick={() => onOpen({ level: 'card', id: g.planId })}>{g.index}. {g.title}</button> : `${g.index}. ${g.title}`}</td>{d.strands.map((s: any) => <td key={s.id} style={{ ...td, textAlign: 'center' }}>{g.strands.includes(s.id) ? <span className="mark" data-d="drafted" style={{ display: 'inline-block' }} aria-label="moves this storyline" /> : ''}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </>
  );
}

// Every question the program can ask, in one place. Nothing here is an error and nothing changes the story.
export function Review({ ctx, tick, onOpen }: { ctx: Ctx; tick: number; onOpen: Open }) {
  const [r, setR] = useState<any>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [err, setErr] = useState('');
  const load = useCallback(() => api.get(`/api/projects/${ctx.projectId}/review`).then(setR).catch((e) => setErr(e.message)), [ctx.projectId]);
  useEffect(() => { void load(); }, [load, tick]);
  const respond = (f: any, status: string) => void api.post(`/api/projects/${ctx.projectId}/review/respond`, { key: f.key, status, note: notes[f.key] ?? '', text: f.message }).then(load).catch((e) => setErr(e.message));
  if (err) return <div className="notice error">{err}</div>;
  if (!r) return <p className="muted">Reading the story…</p>;
  const item = (f: any, later = false) => (
    <li key={f.key}>
      <div className="st" data-s={f.severity === 'note' ? 'developing' : 'unanswered'}>{f.message}</div>
      <div className="row small" style={{ marginTop: '0.3rem' }}>
        <span className="faint">{f.evidence ? 'A fact from your records' : f.severity === 'note' ? 'An observation' : 'A question'}{f.rule ? `, ${f.rule}` : ''}</span>
        {f.elements.slice(0, 3).map((e: any) => <button key={e.id} className="btn link small" onClick={() => onOpen({ level: 'element', id: e.id })}>{e.title}</button>)}
      </div>
      <div className="row small" style={{ marginTop: '0.3rem' }}>
        <input type="text" value={notes[f.key] ?? (later ? f.note?.note ?? '' : '')} onChange={(e) => setNotes({ ...notes, [f.key]: e.target.value })} placeholder="Why it is this way (optional)" aria-label="Your reason" style={{ maxWidth: 360 }} />
        <button className="btn small" onClick={() => respond(f, 'intentional')}>It's intentional</button>
        {!later && <button className="btn small" onClick={() => respond(f, 'deferred')}>Not now</button>}
        <button className="btn small" onClick={() => respond(f, 'resolved')}>I've dealt with it</button>
      </div>
    </li>
  );
  return (
    <>
      <h1>Story review</h1>
      <p className="muted">Questions, never verdicts. Your answer quiets a question for good, and your reason is kept. Nothing here changes your story.</p>
      {r.open.length === 0 ? <p>No open questions.</p> : <ul className="list">{r.open.map((f: any) => item(f))}</ul>}
      {r.later.length > 0 && <section className="section"><h2>Set aside for later</h2><ul className="list">{r.later.map((f: any) => item(f, true))}</ul></section>}
      {r.answered.length > 0 && <section className="section"><h2>Your answers</h2><ul className="list small">{r.answered.map((n: any) => <li key={n.id} className="row"><span className="grow">{n.finding_text}<br /><span className="faint">{n.status === 'intentional' ? 'Intentional' : 'Dealt with'}{n.note ? `: ${n.note}` : ''}</span></span><button className="btn small" onClick={() => void api.del(`/api/finding-notes/${n.id}`).then(load)}>Ask again</button></li>)}</ul></section>}
    </>
  );
}
