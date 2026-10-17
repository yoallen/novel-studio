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

// ---------- names: every name the book uses, and the ones that look misspelled ----------
export function Names({ ctx, tick }: { ctx: Ctx; tick: number }) {
  const { d, e } = useData(`/api/projects/${ctx.projectId}/names`, tick);
  if (!d) return <p className="muted">{e || 'Reading the manuscript…'}</p>;
  return (
    <>
      <h2>Names in the book</h2>
      <p className="muted small">Every capitalized name used in the middle of a sentence, counted. A name spelled two ways is easy to miss on the page and easy to catch here.</p>
      {d.variants.length > 0 && (
        <section className="section" aria-label="Possible misspellings">
          <h3>Spelled another way?</h3>
          {d.variants.map((x: any) => (
            <div key={x.name} className="notice small">"{x.name}" appears {x.count} time{x.count === 1 ? '' : 's'}; {x.knownName ? 'your record says' : 'the book mostly says'} "{x.likely}". Intended?
              <span className="row" style={{ marginTop: '0.25rem' }}>{x.scenes.map((s: any) => <button key={s.id} className="btn link small" onClick={() => ctx.openScene(s.id)}>{s.title}</button>)}</span>
            </div>
          ))}
        </section>
      )}
      {d.noRecord.length > 0 && (
        <section className="section">
          <h3>Names with no record yet</h3>
          <p className="small muted">Used three times or more. A record lets the program follow them through the story.</p>
          <div className="row small">{d.noRecord.map((n: any) => <span key={n.name} className="chip">{n.name} ×{n.count}</span>)}</div>
        </section>
      )}
      <table className="small" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead><tr><th style={th}>Name</th><th style={{ ...th, textAlign: 'right' }}>Times</th><th style={th}>Record</th><th style={th}>Scenes</th></tr></thead>
        <tbody>{d.names.slice(0, 200).map((n: any) => (
          <tr key={n.name}><td style={td}>{n.name}</td><td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{n.count}</td><td style={td}>{n.record ? n.record.title : <span className="faint">none</span>}</td><td style={td}>{n.scenes.length}</td></tr>
        ))}</tbody>
      </table>
    </>
  );
}

// ---------- pacing: the shape of the book, scene by scene ----------
export function Pacing({ ctx, tick }: { ctx: Ctx; tick: number }) {
  const { d, e } = useData(`/api/projects/${ctx.projectId}/pacing`, tick);
  const [hover, setHover] = useState<number | null>(null);
  if (!d) return <p className="muted">{e || 'Measuring…'}</p>;
  const rows: any[] = d.rows;
  if (!rows.length) return <p className="muted">Write a scene or two and the shape of the book appears here.</p>;
  const max = Math.max(...rows.map((r) => r.words), 1);
  const W = 860, H = 180, gap = 2, bw = Math.max(3, Math.min(28, (W - gap * rows.length) / rows.length));
  const h = hover != null ? rows[hover] : null;
  return (
    <>
      <h2>Pacing</h2>
      <p className="muted small">Each bar is a scene, in reading order, by length. Your usual scene runs about {d.medianWords.toLocaleString()} words. Hover a bar for its viewpoint, beat and turn; click to open it.</p>
      {d.notes.map((n: string) => <div key={n} className="notice small">{n}</div>)}
      <div style={{ position: 'relative' }}>
        <svg role="img" aria-label={`Scene lengths for ${rows.length} scenes`} viewBox={`0 0 ${Math.max(W, rows.length * (bw + gap))} ${H + 20}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
          <line x1={0} x2={rows.length * (bw + gap)} y1={H - (d.medianWords / max) * H} y2={H - (d.medianWords / max) * H} stroke="var(--line-strong)" strokeDasharray="3 3" />
          {rows.map((r, i) => {
            const bh = Math.max(2, (r.words / max) * H);
            const x = i * (bw + gap);
            const newChapter = i > 0 && rows[i - 1].chapter.id !== r.chapter.id;
            return (
              <g key={r.id} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={() => ctx.openScene(r.id)} style={{ cursor: 'pointer' }}>
                {newChapter && <line x1={x - gap / 2} x2={x - gap / 2} y1={0} y2={H + 6} stroke="var(--line)" />}
                <rect x={x} y={0} width={bw + gap} height={H + 20} fill="transparent" />
                <path d={`M${x},${H} v${-(bh - 2)} q0,-2 2,-2 h${bw - 4} q2,0 2,2 v${bh - 2} z`} fill={hover === i ? 'var(--accent, var(--struct))' : 'var(--struct)'} opacity={hover == null || hover === i ? 1 : 0.55} />
              </g>
            );
          })}
        </svg>
        {h && (
          <div role="status" className="small" style={{ position: 'absolute', top: 0, right: 0, background: 'var(--page)', border: '1px solid var(--line-strong)', borderRadius: 6, padding: '0.4rem 0.6rem', maxWidth: 280 }}>
            <strong>{h.title}</strong><br />Chapter {h.chapter.number}, {h.words.toLocaleString()} words
            {h.pov && <><br />Viewpoint: {h.pov}</>}{h.beat && <><br />Beat: {h.beat}</>}{h.kind && <><br />{h.kind}</>}
            {(h.valueStart || h.valueEnd) && <><br />Turn: {h.valueStart ?? '?'} to {h.valueEnd ?? '?'}</>}
            <br />About {h.avgSentence} words a sentence, {h.dialoguePercent}% dialogue
          </div>
        )}
      </div>
      <details style={{ marginTop: '1rem' }}>
        <summary className="small">As a table</summary>
        <table className="small" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>#</th><th style={th}>Scene</th><th style={th}>Chapter</th><th style={{ ...th, textAlign: 'right' }}>Words</th><th style={th}>Viewpoint</th><th style={th}>Beat</th><th style={th}>Turn</th><th style={{ ...th, textAlign: 'right' }}>Dialogue</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.id}><td style={td}>{r.index}</td><td style={td}><button className="btn link small" onClick={() => ctx.openScene(r.id)}>{r.title}</button></td><td style={td}>{r.chapter.number}</td><td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.words.toLocaleString()}</td><td style={td}>{v(r.pov)}</td><td style={td}>{v(r.beat)}</td><td style={td}>{r.valueStart || r.valueEnd ? `${r.valueStart ?? '?'} to ${r.valueEnd ?? '?'}` : <span className="faint">not set</span>}</td><td style={{ ...td, textAlign: 'right' }}>{r.dialoguePercent}%</td></tr>
          ))}</tbody>
        </table>
      </details>
    </>
  );
}

// ---------- the cast: who is where, who meets whom, who has gone quiet, the Bechdel test ----------
const MARK: Record<string, { label: string; glyph: string }> = { pov: { label: 'viewpoint', glyph: '●' }, planned: { label: 'in the scene (your records)', glyph: '◉' }, named: { label: 'named on the page', glyph: '○' } };

export function Cast({ ctx, tick, onOpen }: { ctx: Ctx; tick: number; onOpen: Open }) {
  const [t, setT] = useState(0);
  const { d, e } = useData(`/api/projects/${ctx.projectId}/cast`, tick + t);
  const pairs = useData(`/api/projects/${ctx.projectId}/cast/pairs`, tick + t);
  const bech = useData(`/api/projects/${ctx.projectId}/cast/bechdel`, tick + t);
  const [open, setOpen] = useState<string | null>(null);
  const groups = useData(`/api/projects/${ctx.projectId}/cast/groups`, tick + t);
  const [pick, setPick] = useState<string[]>([]);
  const [only, setOnly] = useState(false);
  const [tog, setTog] = useState<any>(null);
  useEffect(() => {
    if (pick.length < 2) { setTog(null); return; }
    api.post(`/api/projects/${ctx.projectId}/cast/together`, { ids: pick, only }).then(setTog).catch(() => setTog(null));
  }, [pick.join('|'), only, ctx.projectId, tick, t]);
  if (!d) return <p className="muted">{e || 'Gathering the cast…'}</p>;
  if (!d.rows.length) return <p className="muted">No characters yet. Add them in the Story Brain, and this view shows where each one is in the story.</p>;
  const places: any[] = d.places;
  if (!places.length) return (
    <>
      <h2>The cast across the story</h2>
      <p className="muted">Nothing has a place in the story's order yet. A scene card counts once it is decided on a beat, and a written scene counts where it sits. Cards that only might go somewhere are not counted, so nothing here is guessed.</p>
    </>
  );
  const actStarts = places.map((p, i) => i === 0 || places[i - 1].act !== p.act);
  const go = (p: any) => (p.sceneId ? ctx.openScene(p.sceneId) : p.planId && onOpen({ level: 'card', id: p.planId }));
  const names = (cs: any[]) => (cs.length <= 2 ? cs.map((c) => c.title).join(' and ') : `${cs.slice(0, -1).map((c) => c.title).join(', ')} and ${cs[cs.length - 1].title}`);
  async function relate(...cs: any[]) {
    const r = await api.post(`/api/projects/${ctx.projectId}/elements`, { kind: 'relationship', title: names(cs) });
    for (const c of cs) await api.post(`/api/projects/${ctx.projectId}/links`, { fromId: r.id, toId: c.id, relation: 'relates_to' });
    onOpen({ level: 'element', id: r.id });
  }
  const sceneList = (ps: any[]) => <ol className="small" style={{ margin: '0.3rem 0 0 1rem' }}>{ps.map((pl: any) => <li key={pl.key}><button className="btn link small" onClick={() => go(pl)}>{pl.title}</button> <span className="faint">{pl.chapter ? `Chapter ${pl.chapter.number}, ` : ''}{d.acts[pl.act]}{pl.beat ? `, ${pl.beat}` : ''}</span></li>)}</ol>;
  async function answer(unit: string, a: 'yes' | 'no' | null) { await api.put(`/api/projects/${ctx.projectId}/cast/bechdel`, { unit, answer: a }); setT((x) => x + 1); }
  return (
    <>
      <h2>The cast across the story</h2>
      <p className="muted small">Where each character is, scene by scene, from your records, the viewpoint, and their names on the page. Click a mark to open the scene.</p>
      {d.notes.length > 0 && <section className="section" aria-label="Gone quiet">{d.notes.map((n: any) => <div key={n.text} className="notice small">{n.text}</div>)}</section>}
      <div className="row small" aria-label="Key">{Object.entries(MARK).map(([k, m]) => <span key={k}><span aria-hidden="true" className={`cast-mark ${k}`}>{m.glyph}</span> {m.label}</span>)}</div>
      <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
        <table className="cast-grid small" aria-label="Who is where">
          <thead>
            <tr><th />{places.map((p, i) => actStarts[i] ? <th key={p.key} colSpan={places.slice(i).findIndex((x, k) => k > 0 && x.act !== p.act) === -1 ? places.length - i : places.slice(i).findIndex((x, k) => k > 0 && x.act !== p.act)} className="act">{d.acts[p.act]}</th> : null)}</tr>
            <tr><th />{places.map((p, i) => <th key={p.key} className={actStarts[i] ? 'edge' : ''} title={`${p.title}${p.chapter ? `, Chapter ${p.chapter.number}` : ''}${p.beat ? `, ${p.beat}` : ''}${p.drafted ? '' : ' (not drafted yet)'}`}>{p.chapter ? p.chapter.number : '·'}</th>)}</tr>
          </thead>
          <tbody>
            {d.rows.map((r: any) => (
              <tr key={r.id}>
                <th scope="row"><button className="btn link small" onClick={() => onOpen({ level: 'element', id: r.id })}>{r.title}</button> <span className="faint">{r.count}</span></th>
                {places.map((p, i) => {
                  const how = r.cells[p.key];
                  return <td key={p.key} className={actStarts[i] ? 'edge' : ''}>{how && <button className={`cast-mark ${how}`} aria-label={`${r.title}, ${MARK[how]!.label}, ${p.title}`} title={`${r.title}: ${MARK[how]!.label} in "${p.title}"`} onClick={() => go(p)}>{MARK[how]!.glyph}</button>}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="section" aria-label="Who is together">
        <h3>Who is together</h3>
        <p className="small muted">Choose any two or more characters to see every scene they share. A relationship record can hold how things stand among them, for a pair, a family, a rivalry or a whole group.</p>
        <div className="row small" role="group" aria-label="Choose characters">
          {d.rows.map((r: any) => <button key={r.id} className={'chip' + (pick.includes(r.id) ? ' on' : '')} aria-pressed={pick.includes(r.id)} onClick={() => setPick(pick.includes(r.id) ? pick.filter((x) => x !== r.id) : [...pick, r.id])}>{r.title}</button>)}
          {pick.length > 0 && <button className="btn link small" onClick={() => setPick([])}>Clear</button>}
        </div>
        <label className="row small" style={{ marginTop: '0.4rem' }}><input type="checkbox" checked={only} onChange={(e) => setOnly(e.target.checked)} />Only scenes where no one else is there</label>
        {tog && (
          <div style={{ marginTop: '0.5rem' }} role="region" aria-label="Scenes together">
            <div className="row small">
              <strong className="grow">{names(tog.characters)}: {tog.scenes.length} scene{tog.scenes.length === 1 ? '' : 's'} together{only ? ', on their own' : ''}</strong>
              <span className="faint">{Object.entries(tog.byAct).map(([a, n]) => `${d.acts[a]} ${n}`).join(', ')}</span>
              {tog.record ? <button className="btn link small" onClick={() => onOpen({ level: 'element', id: tog.record.id })}>Their relationship</button> : <button className="btn link small" onClick={() => void relate(...tog.characters)}>Make a relationship record</button>}
            </div>
            {tog.scenes.length > 0 ? <ol className="small" style={{ margin: '0.3rem 0 0 1rem' }}>{tog.scenes.map((x: any) => <li key={x.place.key}><button className="btn link small" onClick={() => go(x.place)}>{x.place.title}</button> <span className="faint">{x.place.chapter ? `Chapter ${x.place.chapter.number}, ` : ''}{d.acts[x.place.act]}{x.alsoThere.length ? `; also there: ${x.alsoThere.join(', ')}` : ''}</span></li>)}</ol> : <p className="small faint">They are never all in one scene{only ? ' on their own' : ''} yet.</p>}
          </div>
        )}
      </section>

      {groups.d && groups.d.length > 0 && (
        <section className="section" aria-label="Groups that keep meeting">
          <h3>Groups that keep meeting</h3>
          <p className="small muted">Three or more characters who share two or more scenes.</p>
          <ul className="list small">
            {groups.d.map((g: any) => {
              const k = g.characters.map((c: any) => c.id).join('|');
              return (
                <li key={k}>
                  <div className="row">
                    <strong className="grow">{names(g.characters)}</strong>
                    <span>{g.scenes.length} scenes together</span>
                    <button className="btn link small" aria-expanded={open === k} onClick={() => setOpen(open === k ? null : k)}>{open === k ? 'Hide scenes' : 'Show scenes'}</button>
                    {g.record ? <button className="btn link small" onClick={() => onOpen({ level: 'element', id: g.record.id })}>Their relationship</button> : <button className="btn link small" onClick={() => void relate(...g.characters)}>Make a relationship record</button>}
                  </div>
                  {open === k && sceneList(g.scenes)}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="section" aria-label="Who meets whom">
        <h3>Two at a time</h3>
        <p className="small muted">Every pair that shares a scene, how often, and in which acts.</p>
        {!pairs.d ? <p className="muted small">…</p> : pairs.d.length === 0 ? <p className="small faint">No two characters share a scene yet.</p> : (
          <ul className="list small">
            {pairs.d.map((p: any) => {
              const k = `${p.a.id}|${p.b.id}`;
              return (
                <li key={k}>
                  <div className="row">
                    <strong className="grow">{p.a.title} and {p.b.title}</strong>
                    <span>{p.together.length} scene{p.together.length === 1 ? '' : 's'} together</span>
                    <span className="faint">{Object.entries(p.byAct).map(([a, n]) => `${d.acts[a]} ${n}`).join(', ')}</span>
                    {p.together.length > 0 && <button className="btn link small" aria-expanded={open === k} onClick={() => setOpen(open === k ? null : k)}>{open === k ? 'Hide scenes' : 'Show scenes'}</button>}
                    {p.relationship ? <button className="btn link small" onClick={() => onOpen({ level: 'element', id: p.relationship.id })}>Their relationship</button> : <button className="btn link small" onClick={() => void relate(p.a, p.b)}>Make a relationship record</button>}
                  </div>
                  {open === k && sceneList(p.together)}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="section" aria-label="Bechdel test">
        <h3>The Bechdel test</h3>
        <p className="small muted">Does the story have at least two named women who talk to each other about something other than a man? The program finds the scenes where two or more women are together; only you can say what they talk about. Gender comes only from what you write on each character's page, never from a name.</p>
        {bech.d && (
          <>
            <p><strong>{bech.d.result === 'passes' ? `Passes, in ${bech.d.passingScenes} scene${bech.d.passingScenes === 1 ? '' : 's'}.` : bech.d.result[0].toUpperCase() + bech.d.result.slice(1) + '.'}</strong></p>
            {bech.d.unsure.length > 0 && <p className="small muted">No gender recorded for: {bech.d.unsure.map((u: any) => <button key={u.id} className="btn link small" onClick={() => onOpen({ level: 'element', id: u.id })}>{u.title}</button>)}</p>}
            {bech.d.alone.length > 0 && <p className="small">Never in a scene with another woman: {bech.d.alone.join(', ')}.</p>}
            {bech.d.scenes.map((s: any) => (
              <div key={s.place.key} className="row small" style={{ borderTop: '1px solid var(--line)', padding: '0.35rem 0' }}>
                <button className="btn link small grow" style={{ textAlign: 'left' }} onClick={() => go(s.place)}>{s.place.title}</button>
                <span className="faint">{s.women.map((w: any) => w.title).join(', ')}</span>
                <span role="group" aria-label={`Do they talk about something other than a man in ${s.place.title}?`} className="row">
                  <button className={'btn small' + (s.answer === 'yes' ? ' write' : ' link')} aria-pressed={s.answer === 'yes'} onClick={() => void answer(s.place.key, s.answer === 'yes' ? null : 'yes')}>They do</button>
                  <button className={'btn small' + (s.answer === 'no' ? '' : ' link')} aria-pressed={s.answer === 'no'} onClick={() => void answer(s.place.key, s.answer === 'no' ? null : 'no')}>Not here</button>
                </span>
              </div>
            ))}
          </>
        )}
      </section>
    </>
  );
}

const RESPONSE_COLOR: Record<string, string> = { Profound: 'var(--tab-profound)', Funny: 'var(--tab-funny)', Relatable: 'var(--tab-relatable)', Shocking: 'var(--tab-shocking)' };

/** The reader response map: the tab a reader would reach for, chapter by chapter. */
export function ReaderMap({ ctx, tick }: { ctx: Ctx; tick: number }) {
  const { d, e } = useData(`/api/projects/${ctx.projectId}/reader-map`, tick);
  if (e) return <div className="notice error">{e}</div>;
  if (!d) return <p className="muted">Gathering the tabs…</p>;
  const all = [...new Set(['Profound', 'Funny', 'Relatable', 'Shocking', ...Object.keys(d.counts)])];
  return (
    <>
      <h1>Reader response</h1>
      <p className="muted small">The tab a reader would reach for in each chapter: purple for profound, pink for funny, yellow for relatable, green for shocking, and any of your own. Set them on each scene card, under Reader response. A chapter with no tab may need more.</p>
      <div className="row small" style={{ gap: '1rem', marginBottom: '1rem' }}>
        {all.map((r) => <span key={r} className="row" style={{ gap: '0.35rem' }}><span className="tab-mark" style={{ background: RESPONSE_COLOR[r] ?? 'var(--line-strong)' }} />{r}: {d.counts[r] ?? 0} chapter{(d.counts[r] ?? 0) === 1 ? '' : 's'}</span>)}
      </div>
      {d.chapters.length === 0 ? <p className="muted small">No chapters yet.</p> : (
        <ol className="reader-map" aria-label="Chapters and their tabs">
          {d.chapters.map((c: any) => (
            <li key={c.chapterId}>
              <span className="rm-num">{c.number}</span>
              <span className="rm-title">{c.title}</span>
              <span className="rm-tabs">{c.responses.length ? c.responses.map((r: string) => <span key={r} className="tab-mark" title={r} aria-label={r} style={{ background: RESPONSE_COLOR[r] ?? 'var(--line-strong)' }} />) : <span className="faint small">no tab yet</span>}</span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

/** The soundtrack: songs in the order they first play in the book. Titles only, never lyrics. */
export function Soundtrack({ ctx, tick }: { ctx: Ctx; tick: number }) {
  const { d, e } = useData(`/api/projects/${ctx.projectId}/soundtrack`, tick);
  if (e) return <div className="notice error">{e}</div>;
  if (!d) return <p className="muted">Gathering the songs…</p>;
  return (
    <>
      <h1>Soundtrack</h1>
      <p className="muted small">Add songs in the Story Brain, under Soundtrack, and connect each to the scenes it plays in (plays in) or the character it belongs to (theme song of). Titles and artists only.</p>
      {d.length === 0 ? <p className="muted small">No songs yet.</p> : (
        <ol className="list">{d.map((x: any) => (
          <li key={x.id}><strong>{x.title}</strong>{x.artist ? `, ${x.artist}` : ''}{x.carries ? <span className="muted">. {x.carries}</span> : null}
            <div className="small faint">{x.plays.length ? `Plays in ${x.plays.map((p: any) => `${p.chapter}, ${p.title}`).join('; ')}` : 'Not placed in a scene yet'}{x.belongsTo.length ? `. Theme song of ${x.belongsTo.join(', ')}` : ''}</div>
          </li>
        ))}</ol>
      )}
    </>
  );
}
