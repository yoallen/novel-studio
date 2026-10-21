import { Pages } from './Pages';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { valueText } from './status';
import { ElementPage } from './ElementPage';

// Continuity inside Narrative Zoom: timelines, viewpoint, knowledge, clues, storylines, and the review.
type Open = (node: { level: 'card' | 'element'; id: string }) => void;
const v = (x: unknown) => (x == null || x === '' ? <span className="faint" style={{ whiteSpace: 'nowrap' }}>not set</span> : valueText(x));
const th = { padding: '0.4rem', textAlign: 'left' as const, borderBottom: '1px solid var(--line-strong)' };
const td = { padding: '0.4rem', borderTop: '1px solid var(--line)', verticalAlign: 'top' as const };

/**
 * "How this view works": what the view shows, where its information comes from, and what to do with it.
 * Folded to one line so it never crowds the view; once opened, it is remembered as read (per view, in this browser).
 */
export function HowItWorks({ view, shows, from, todo }: { view: string; shows: ReactNode; from: ReactNode; todo: ReactNode }) {
  const key = `storycanon.how.${view}`;
  const [read, setRead] = useState(() => { try { return localStorage.getItem(key) === '1'; } catch { return false; } });
  return (
    <details className="how-it-works" data-read={read ? 'yes' : undefined} onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open && !read) { try { localStorage.setItem(key, '1'); } catch { /* private window: fine */ } setRead(true); } }}>
      <summary>How this view works</summary>
      <dl>
        <dt>What it shows</dt><dd>{shows}</dd>
        <dt>Where it comes from</dt><dd>{from}</dd>
        <dt>What to do with it</dt><dd>{todo}</dd>
      </dl>
    </details>
  );
}

/** Planned scene cards sit beside written scenes; this says which is which. Written scenes need no mark. */
const STANDING: Record<string, { label: string; hint: string }> = {
  card: { label: 'planned', hint: 'A scene card on its beat, not written yet' },
  might: { label: 'planned, might go here', hint: 'A scene card that might go at this beat, not decided or written yet' },
  unplaced: { label: 'planned, no beat yet', hint: 'A scene card with no beat yet, so it has no place in the order' },
};
export function Planned({ s }: { s?: string | null }) {
  const m = s ? STANDING[s] : null;
  return m ? <span className="planned-tag" title={m.hint}>{m.label}</span> : null;
}
/** A unit's number in reading order; a card with no beat has none. */
const num = (index: number, standing?: string | null) => (standing === 'unplaced' ? '' : `${index}. `);

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
    <tr key={r.key}><td style={td}>{r.standing === 'unplaced' ? '' : r.narrative}</td><td style={td}>{r.planId ? <button className="btn link small" onClick={() => onOpen({ level: 'card', id: r.planId })}>{r.title}</button> : r.title} <Planned s={r.standing} />{(r.callsUp?.length || r.calledUpBy?.length) ? <div className="small faint">{r.callsUp.length ? `Calls up: ${r.callsUp.join('; ')}` : ''}{r.callsUp.length && r.calledUpBy.length ? '. ' : ''}{r.calledUpBy.length ? `Called up by: ${r.calledUpBy.join('; ')}` : ''}</div> : null}</td><td style={td}>{r.beat || <span className="faint">no beat</span>}</td><td style={td}>{v(r.when)}</td><td style={td}>{v(r.year ?? r.day ?? r.date)}</td><td style={td}>{v(r.time)}</td><td style={td}>{v(r.location)}</td><td style={td}>{v(r.season ?? r.weather)}</td></tr>
  );
  const head = <thead><tr><th style={th}>Scene</th><th style={th}>Title</th><th style={th}>Beat</th><th style={th}>When</th><th style={th}>Year, day or date</th><th style={th}>Time</th><th style={th}>Where</th><th style={th}>Season, weather</th></tr></thead>;
  return (
    <>
      <h1>Two timelines</h1>
      <HowItWorks view="timelines"
        shows="Every scene and scene card twice: once in the order the reader meets them, once in the order things happen in the story. Planned cards are marked."
        from={<>Each scene card's story time. "When" and "Year" are the same boxes as "When (story time)" and "Year" in the Writing Room. "Day in the story", "Date" and "Time of day" are on the card, under Story time.</>}
        todo='Give scenes a year, a day number or a date, and they line up in story order below. Words like "the next morning" show in the When column but cannot be sorted.' />
      <p className="muted small">The order the reader meets the story, and the order things actually happen. They can differ on purpose. Fill in a scene's story time on its card, or in the Writing Room beside the page.</p>
      <Pages storeKey={`timelines:${ctx.projectId}`} label="Two timelines" pages={[
        { title: 'In the order of the book', filled: true, content: (<>
      <div style={{ overflowX: 'auto' }}><table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.875rem' }}>{head}<tbody>{d.narrative.map(row)}</tbody></table></div>
        </>) },
        { title: 'In the order things happen', filled: d.chronological.length > 0, content: (<>
      {d.chronological.length === 0 ? <p className="muted small">No scene has a year, day or date yet.</p> : <div style={{ overflowX: 'auto' }}><table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.875rem' }}>{head}<tbody>{d.chronological.map(row)}</tbody></table></div>}
          {d.unplacedInTime > 0 && <p className="faint small">{d.unplacedInTime} scene{d.unplacedInTime === 1 ? ' has' : 's have'} no year, day or date yet, so {d.unplacedInTime === 1 ? 'it is' : 'they are'} not in story order.</p>}
        </>) },
      ]} />
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
  // Only what the scene says for itself is saved back, never what it takes from its chapter or the book.
  const setSc = (s: any, patch: any) => void api.patch(`/api/scenes/${s.id}/pov`, { pov: { person: s.own?.person ?? undefined, tense: s.own?.tense ?? undefined, reliability: s.reliability ?? undefined, also: s.also.map((a: any) => a.id), ...patch } }).then(refresh);
  const setWho = (s: any, povElementId: string | null) => void api.patch(`/api/scenes/${s.id}`, { povElementId }).then(refresh);
  const sub = (t: string) => <div className="faint small" style={{ fontWeight: 400 }}>{t}</div>;
  return (
    <>
      <h1>Viewpoint</h1>
      <HowItWorks view="viewpoint"
        shows={<>Whose eyes each scene is seen through, in what person and tense, and whether the reader can trust them. Reliable: they tell it straight. Unreliable: they may mislead, on purpose or not. Selectively informed: honest, but missing pieces. A second viewpoint is another character whose thoughts we also hear in the same scene, sometimes called head-hopping.</>}
        from={<>Three places, in this order: a scene's own viewpoint wins (it is the same setting as "Viewpoint character" beside the page in the Writing Room). A scene with none takes its chapter's. Person and tense fall back to the book's, from the story world or Novel setup.</>}
        todo="Set a chapter's viewpoint once and let its scenes follow; change a single scene only where it differs. Viewpoint rules in the story world let the Story review ask about slips." />
      <div className="row" style={{ marginBottom: '0.5rem' }}>
        <span className="small muted grow">Book defaults: {d.defaults.person ?? 'person not set'}; {d.defaults.tense ? `${String(d.defaults.tense).toLowerCase()} tense` : 'tense not set'}.</span>
        <button className="btn small" onClick={() => void api.post(`/api/projects/${ctx.projectId}/storyworld`).then((w) => setWorld(w.id))}>Story world and viewpoint rules</button>
      </div>
      <p className="small muted" style={{ marginTop: 0, marginBottom: '1rem' }}>A scene's own viewpoint wins. It is the same setting as "Viewpoint character" in the Writing Room. Scenes without one take their chapter's.</p>
      {world && <section className="section"><ElementPage ctx={ctx} elementId={world} onOpen={() => {}} onChanged={refresh} /><button className="btn small" onClick={() => setWorld(null)}>Close</button></section>}
      {d.absences.map((a: any, i: number) => <p key={i} className="small muted">{a.character}: no viewpoint scene from {a.from} to {a.to} ({a.chapters} chapters). An observation, not a rule.</p>)}
      {d.chapters.length === 0 && <p className="muted">No chapters yet. Once the Writing Room has chapters and scenes, each one shows here with its viewpoint.</p>}
      {d.chapters.map((c: any) => (
        <section key={c.id} className="section">
          <div className="row"><h2 className="grow" style={{ fontSize: '1.05rem' }}>{c.title}</h2>
            <label className="row small">Viewpoint <select value={c.pov?.id ?? ''} onChange={(ev) => setCh(c.id, { povElementId: ev.target.value || null })} style={{ width: 'auto' }}><option value="">None set</option>{chars.map((ch) => <option key={ch.id} value={ch.id}>{ch.title}</option>)}</select></label>
          </div>
          <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.875rem' }}>
            <thead><tr>
              <th style={th}>Scene</th>
              <th style={th}>Viewpoint{sub('whose eyes')}</th>
              <th style={th}>Person{sub('first, third…')}</th>
              <th style={th}>Tense</th>
              <th style={th}>Reliability{sub('can the reader trust them?')}</th>
              <th style={th}>Second viewpoint{sub('another character whose thoughts we hear here')}</th>
            </tr></thead>
            <tbody>{c.scenes.map((s: any) => (
              <tr key={s.id}>
                <td style={{ ...td, minWidth: '9em' }}><button className="btn link small" style={{ textAlign: 'left' }} onClick={() => ctx.openScene(s.id)}>{s.title}</button></td>
                <td style={td}><select value={s.own?.povId ?? ''} onChange={(ev) => setWho(s, ev.target.value || null)} aria-label={`Viewpoint character for ${s.title}`} style={{ width: 'auto', maxWidth: '14em' }}>
                  <option value="">{c.pov ? `${c.pov.title} (from chapter)` : 'Not set'}</option>{chars.map((ch) => <option key={ch.id} value={ch.id}>{ch.title}</option>)}</select></td>
                <td style={td}><input type="text" defaultValue={s.own?.person ?? ''} placeholder={s.person ? 'Same as book' : ''} title={s.person ?? ''} aria-label={`Person for ${s.title}`} onBlur={(ev) => ev.target.value !== (s.own?.person ?? '') && setSc(s, { person: ev.target.value || undefined })} style={{ width: '15em' }} /></td>
                <td style={td}><input type="text" defaultValue={s.own?.tense ?? ''} placeholder={s.tense ? 'Same as book' : ''} aria-label={`Tense for ${s.title}`} onBlur={(ev) => ev.target.value !== (s.own?.tense ?? '') && setSc(s, { tense: ev.target.value || undefined })} style={{ width: '8em' }} /></td>
                <td style={td}><select value={s.reliability ?? ''} onChange={(ev) => setSc(s, { reliability: ev.target.value || undefined })} aria-label={`Reliability for ${s.title}`} style={{ width: 'auto' }}><option value="">Not set</option><option value="Reliable">Reliable</option><option value="Unreliable">Unreliable</option><option value="Selectively informed">Selectively informed</option></select></td>
                <td style={td}><select value={s.also[0]?.id ?? ''} onChange={(ev) => setSc(s, { also: ev.target.value ? [ev.target.value] : [] })} aria-label={`Second viewpoint for ${s.title}`} style={{ width: 'auto' }}><option value="">None</option>{chars.map((ch) => <option key={ch.id} value={ch.id}>{ch.title}</option>)}</select></td>
              </tr>
            ))}</tbody>
          </table>
          </div>
        </section>
      ))}
    </>
  );
}

export function Knowledge({ ctx, tick, onOpen }: { ctx: Ctx; tick: number; onOpen: Open }) {
  const [added, setAdded] = useState(0);
  const k = useData(`/api/projects/${ctx.projectId}/knowledge`, tick);
  const log = useData(`/api/projects/${ctx.projectId}/secret-log`, tick + added);
  if (k.e) return <div className="notice error">{k.e}</div>;
  if (!k.d) return <p className="muted">Working out who knows what…</p>;
  const at = (x: any) => `${x.standing === 'unplaced' ? 'planned card' : `scene ${x.index}`}, "${x.scene}"${x.standing === 'card' || x.standing === 'might' ? ' (planned)' : ''}`;
  return (
    <>
      <h1>Who knows what, and when</h1>
      <HowItWorks view="knowledge"
        shows="Each secret or fact: the truth, when the reader meets it, and when each character learns it. Then the reader's view, scene by scene, including planned scene cards."
        from={<>Connections on your scenes and cards: a scene that "reveals" something, the characters who "appear in" it, and a character who "knows", "suspects" or "believes falsely". The scene card's "What the reader suspects" and "Visible or hidden story" fill the table.</>}
        todo="Look for a character acting on something they have not learned yet, or a reveal that lands before its setup. The secret operations log keeps the true order of what a schemer does behind everyone's back." />
      <p className="muted small">Built from what each scene reveals and who is in it. Mark a scene as revealing something in its connections ("reveals"), and a character's belief with "believes falsely" or "suspects".</p>
      <Pages storeKey={`knowledge:${ctx.projectId}`} label="Who knows what" pages={[
        { title: 'Secrets and who learns them', filled: k.d.events.length > 0, content: (<>
      {k.d.events.length === 0 ? <p className="muted">Nothing is revealed in any scene yet.</p> : k.d.events.map((ev: any) => (
        <section key={ev.id} className="section">
          <button className="btn link" style={{ fontWeight: 700 }} onClick={() => onOpen({ level: 'element', id: ev.id })}>{ev.title}</button>
          <ul className="list small">
            <li>The truth: {v(ev.truth)}</li>
            <li>When it happens: {v(ev.happens)}</li>
            <li>When the reader meets it: {ev.readerAt ? at(ev.readerAt) : <span className="faint">not revealed yet</span>}</li>
            {ev.who.map((w: any) => <li key={w.id}>{w.title}: {w.learnsAt ? `learns it in ${at(w.learnsAt)}` : 'when not recorded'}{w.stance ? `; ${w.stance.relation.replace(/_/g, ' ')}${w.stance.note ? ` (${w.stance.note})` : ''}` : ''}</li>)}
          </ul>
        </section>
      ))}
        </>) },
        { title: "The reader's view, scene by scene", filled: k.d.timeline.length > 0, content: (<>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.875rem' }}>
        <thead><tr><th style={th}>Scene</th><th style={th}>Reader suspects</th><th style={th}>Revealed here</th><th style={th}>Who learns</th><th style={th}>Visible or hidden story<div className="faint small" style={{ fontWeight: 400 }}>what the characters believe, or what is really going on</div></th></tr></thead>
        <tbody>{k.d.timeline.map((t: any) => <tr key={t.index}><td style={td}>{t.planId ? <button className="btn link small" onClick={() => onOpen({ level: 'card', id: t.planId })}>{num(t.index, t.standing)}{t.title}</button> : `${num(t.index, t.standing)}${t.title}`} <Planned s={t.standing} /></td><td style={td}>{v(t.readerSuspects)}</td><td style={td}>{t.reveals.join('; ') || <span className="faint">nothing</span>}</td><td style={td}>{t.learns.join('; ')}</td><td style={td}>{v(t.layer)}</td></tr>)}</tbody>
      </table>
        </>) },
        { title: 'Secret operations (author only)', filled: !!(log.d && log.d.length), content: (<>
      {log.d && log.d.length > 0 && (
        <section className="section">
          <p className="muted small">The only place the real story lives in order. Never shown in viewpoint summaries.</p>
          {log.d.map((g: any, i: number) => (
            <div key={i}><h3>{g.actor?.title ?? 'Unassigned'}</h3>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.875rem' }}><thead><tr><th style={th}>When</th><th style={th}>The hidden move</th><th style={th}>What the others see</th><th style={th}>Who takes the blame</th></tr></thead>
                <tbody>{g.moves.map((m: any) => <tr key={m.id}><td style={td}>{v(m.when)}</td><td style={td}><button className="btn link small" onClick={() => onOpen({ level: 'element', id: m.id })}>{m.move ? valueText(m.move) : m.title}</button></td><td style={td}>{v(m.othersSee)}</td><td style={td}>{v(m.blame)}</td></tr>)}</tbody></table>
            </div>
          ))}
        </section>
      )}
      <AddHiddenMove ctx={ctx} onAdded={() => setAdded((x) => x + 1)} />
        </>) },
      ]} />
    </>
  );
}

function AddHiddenMove({ ctx, onAdded }: { ctx: Ctx; onAdded: () => void }) {
  const [chars, setChars] = useState<any[]>([]);
  const [who, setWho] = useState('');
  const [t, setT] = useState('');
  const [done, setDone] = useState('');
  useEffect(() => { api.get(`/api/projects/${ctx.projectId}/elements?kind=character`).then(setChars).catch(() => {}); }, [ctx.projectId]);
  return (
    <form className="section row small" onSubmit={(e) => { e.preventDefault(); if (t.trim()) void api.post(`/api/projects/${ctx.projectId}/elements`, { kind: 'hidden_move', title: t, parentId: who || null }).then((m) => api.post(`/api/elements/${m.id}/statements`, { field: 'move', value: t, status: 'established' })).then(() => { setT(''); setDone('Added to the secret operations log.'); onAdded(); }); }}>
      <strong>Log a hidden move</strong>
      <select value={who} onChange={(e) => setWho(e.target.value)} style={{ width: 'auto' }} aria-label="Whose move"><option value="">Whose?</option>{chars.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
      <input type="text" value={t} onChange={(e) => setT(e.target.value)} placeholder="What they secretly do" aria-label="The hidden move" style={{ maxWidth: 360 }} />
      <button className="btn" type="submit">Add</button>{done && <span role="status">{done}</span>}
      <p className="faint small" style={{ flexBasis: '100%', margin: 0 }}>A hidden move is something a character does in secret that the others misread or blame on someone else. It is kept here and in the Story Brain under Secret operations, filed under that character.</p>
    </form>
  );
}

export function Clues({ ctx, tick, onOpen }: { ctx: Ctx; tick: number; onOpen: Open }) {
  const c = useData(`/api/projects/${ctx.projectId}/clues`, tick);
  const m = useData(`/api/projects/${ctx.projectId}/motifs`, tick);
  if (c.e) return <div className="notice error">{c.e}</div>;
  if (!c.d) return <p className="muted">Gathering setups and payoffs…</p>;
  const card = (x: any, i: number) => (
    <div key={i}><button className="btn link small" onClick={() => onOpen({ level: 'card', id: x.id })}>{x.title}</button>{x.at && x.standing !== 'unplaced' ? <span className="faint"> (scene {x.at})</span> : ''} <Planned s={x.standing} /></div>
  );
  // Her own words from the clue's page, then the cards and beats those words name, then any scene connections.
  const at = (xs: any[], ws: any[] = []) => (xs.length === 0 && ws.length === 0) ? <span className="faint">none</span> : (
    <>
      {ws.map((w: any, i: number) => (
        <div key={`w${i}`} className="clue-words">
          <span className="st" data-s={w.sure ? 'established' : 'developing'}>{w.text}</span>
          {w.cards.map((x: any, j: number) => card(x, j))}
          {w.beats.length > 0 && <div className="faint small inline-names">at the beat {w.beats.map((b: any, j: number) => <span key={b.id}>{j ? ', ' : ''}<button className="btn link small" onClick={() => onOpen({ level: 'element', id: b.id })}>{b.title}</button></span>)}</div>}
        </div>
      ))}
      {xs.map(card)}
    </>
  );
  return (
    <>
      <h1>Setups and payoffs</h1>
      <HowItWorks view="clues"
        shows="Every clue: where it is planted, what it really means, where the truth comes out, and where it pays off."
        from={<>The clue's own page: "Where it is planted" and "Where it pays off", in your words. When those words name a scene card or a beat, it is shown under them. Scene connections count too: "plants", "reveals" and "pays off".</>}
        todo="Look for a payoff with nothing planted, and a clue you marked significant that never pays off. The Story review asks about both." />
      <p className="muted small">If it pays off later, it has to be here first. Fill in "Where it is planted" and "Where it pays off" on each clue, or connect a scene to a clue with "plants", "reveals" or "pays off".</p>
      <Pages storeKey={`clues:${ctx.projectId}`} label="Setups and payoffs" pages={[
        { title: 'Clues', filled: c.d.length > 0, content: (<>
      {c.d.length === 0 ? <p className="muted">No clues yet. Add one in the Story Brain under Clues.</p> : (
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.875rem' }}>
          <thead><tr><th style={th}>What</th><th style={th}>Planted</th><th style={th}>What it really means</th><th style={{ ...th, minWidth: "9em" }}>Truth comes out<div className="faint small" style={{ fontWeight: 400 }}>scenes that reveal it</div></th><th style={th}>Pays off</th></tr></thead>
          <tbody>{c.d.map((r: any) => <tr key={r.id}><td style={td}><button className="btn link small" onClick={() => onOpen({ level: 'element', id: r.id })}>{r.title}</button>{r.significant && <div className="faint">must pay off</div>}</td><td style={td}>{at(r.plants, r.plantedWords)}</td><td style={td}>{v(r.truth)}</td><td style={td}>{at(r.reveals)}</td><td style={td}>{at(r.payoffs, r.paidOffWords)}</td></tr>)}</tbody>
        </table>
      )}
        </>) },
        { title: 'Motifs', hidden: !(m.d && m.d.length > 0), filled: true, content: !(m.d && m.d.length > 0) ? null : (

        <section className="section">
          {m.d.map((mo: any) => <div key={mo.id} style={{ marginBottom: '0.75rem' }}><button className="btn link" onClick={() => onOpen({ level: 'element', id: mo.id })}>{mo.title}</button>
            {mo.appearances.length === 0 ? <p className="faint small">Not placed in any scene yet.</p> : <ul className="list small">{mo.appearances.map((a: any, i: number) => <li key={i}>{a.standing === 'unplaced' ? '' : `Scene ${a.index}, `}{a.scene}{a.note ? `: ${a.note}` : ''} <Planned s={a.standing} /></li>)}</ul>}</div>)}
        </section>
      
        ) },
      ]} />
    </>
  );
}

export function Storylines({ ctx, tick, onOpen }: { ctx: Ctx; tick: number; onOpen: Open }) {
  const { d, e } = useData(`/api/projects/${ctx.projectId}/storylines`, tick);
  if (e) return <div className="notice error">{e}</div>;
  if (!d) return <p className="muted">Weaving…</p>;
  if (!d.strands.length) return <><h1>Storylines</h1><HowItWorks view="storylines"
        shows="Each storyline as a column and every scene and scene card as a row, with a mark where the scene moves that storyline forward."
        from={<>Storyline records in the Story Brain, and connections from scenes and cards to them with "moves forward". Planned cards are marked.</>}
        todo="Look for a storyline that goes quiet for a long stretch, or one that never shares a scene with another. The strongest scenes move more than one." /><p className="muted">No storylines yet. Add as many as the story needs in the Story Brain under Storylines, then connect scene cards to them with "advances".</p></>;
  return (
    <>
      <h1>Storylines</h1>
      <HowItWorks view="storylines"
        shows="Each storyline as a column and every scene and scene card as a row, with a mark where the scene moves that storyline forward."
        from={<>Storyline records in the Story Brain, and connections from scenes and cards to them with "moves forward". Planned cards are marked.</>}
        todo="Look for a storyline that goes quiet for a long stretch, or one that never shares a scene with another. The strongest scenes move more than one." />
      <p className="muted small">The strongest scenes move more than one thread. {d.touchPoints.length} scene{d.touchPoints.length === 1 ? ' moves' : 's move'} more than one.</p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead><tr><th style={th}>Scene</th>{d.strands.map((s: any) => <th key={s.id} style={th}><button className="btn link small" onClick={() => onOpen({ level: 'element', id: s.id })}>{s.letter ? `${s.letter}: ` : ''}{s.title}</button><div className="faint" style={{ fontWeight: 400 }}>{s.storyType ? <em>{valueText(s.storyType)}. </em> : null}{valueText(s.state) || ''}{s.values.length ? ` carrying ${s.values.map(valueText).join(', ')}` : ''}</div></th>)}</tr></thead>
          <tbody>{d.grid.map((g: any) => <tr key={g.index}><td style={td}>{g.planId ? <button className="btn link small" onClick={() => onOpen({ level: 'card', id: g.planId })}>{num(g.index, g.standing)}{g.title}</button> : `${num(g.index, g.standing)}${g.title}`} <Planned s={g.standing} /></td>{d.strands.map((s: any) => <td key={s.id} style={{ ...td, textAlign: 'center' }}>{g.strands.includes(s.id) ? <span className="mark" data-d="drafted" style={{ display: 'inline-block' }} aria-label="moves this storyline" /> : ''}</td>)}</tr>)}</tbody>
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
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const load = useCallback(() => api.get(`/api/projects/${ctx.projectId}/review`).then((x) => { setR(x); setCheckedAt(new Date()); }).catch((e) => setErr(e.message)), [ctx.projectId]);
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
      <HowItWorks view="review"
        shows="Every question the program can ask about your story right now, in one place, with the answers you have already given."
        from={<>Your records. It compares causes and effects across scenes and cards ("causes", "enables", "depends on"), beats on your beat sheet, viewpoint rules in your story world, clues marked significant, storylines, Ghost timing, and characters in two places at the same story time.</>}
        todo="Answer each question: dealt with, intentional (with your reason), or not now. Questions appear as your records give it something to compare: connections between scenes, cards placed on beats, story times and places, viewpoint rules." />
      <p className="muted">Questions, never verdicts. Your answer quiets a question for good, and your reason is kept. Nothing here changes your story.</p>
      <p className="small faint">It checks cause and effect, your beat sheet, viewpoint rules, clues, storylines and story time{checkedAt ? `, and last looked at ${checkedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}.</p>
      {r.open.length === 0 ? (
        <div className="review-empty">
          <p>No open questions.</p>
          <p className="small muted">Every check ran and none found anything to ask in what is recorded so far. More connections between scenes, cards placed on beats, story times and viewpoint rules give it more to compare.</p>
        </div>
      ) : <ul className="list">{r.open.map((f: any) => item(f))}</ul>}
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
      <HowItWorks view="names"
        shows="Every name your written scenes use, how often, in how many scenes, and which record it belongs to. Names that look like misspellings are listed first."
        from={<>The words on the page. A capitalized word in the middle of a sentence counts as a name. At the start of a sentence every word is capitalized, so there it counts only when it is a name from your records, such as a character, place or storyline.</>}
        todo='Check any "Spelled another way?" note. Give a name used often its own record, so the program can follow that person or place through the story.' />
      <p className="muted small">Every name the book uses, counted: capitalized words in the middle of a sentence, and names from your records wherever they appear. A name spelled two ways is easy to miss on the page and easy to catch here.</p>
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
  const how = (
    <HowItWorks view="pacing"
      shows="Each written scene as a bar, in reading order. The taller the bar, the longer the scene. The dashed line is your usual scene length."
      from={<>The words on the page in the Writing Room. The viewpoint, beat and turn come from each scene's card. Scene cards with no writing yet have no length, so they are not drawn.</>}
      todo="Look for a run of very long or very short scenes, or one scene far longer than the rest. Click a bar to open that scene." />
  );
  if (!rows.length) return <><h2>Pacing</h2>{how}<p className="muted">Write a scene or two and the shape of the book appears here.</p></>;
  const max = Math.max(...rows.map((r) => r.words), 1);
  // Room on the left for the word scale and below for scene numbers and chapters.
  const L = 56, B = 40, H = 180, W = 860, gap = 2;
  const bw = Math.max(3, Math.min(28, (W - L - gap * rows.length) / rows.length));
  const plotW = rows.length * (bw + gap);
  const every = bw >= 14 ? 1 : bw >= 7 ? 2 : bw >= 4 ? 5 : 10;
  const h = hover != null ? rows[hover] : null;
  const y = (w: number) => H - (w / max) * H;
  const medianY = y(d.medianWords);
  return (
    <>
      <h2>Pacing</h2>
      {how}
      <p className="muted small">Each bar is a scene, in reading order, by length. Your usual scene runs about {d.medianWords.toLocaleString()} words. Hover a bar for its viewpoint, beat and turn; click to open it.</p>
      {d.notes.map((n: string) => <div key={n} className="notice small">{n}</div>)}
      <div style={{ position: 'relative' }}>
        <svg role="img" aria-label={`Scene lengths for ${rows.length} scene${rows.length === 1 ? '' : 's'}`} viewBox={`0 0 ${Math.max(W, L + plotW + 8)} ${H + B + 8}`} style={{ width: '100%', maxWidth: W, height: 'auto' }} className="pacing-chart">
          <g transform="translate(0,8)">
            {/* The word scale */}
            <text x={L - 8} y={4} textAnchor="end" className="axis">{max.toLocaleString()}</text>
            <text x={L - 8} y={H} textAnchor="end" className="axis">0</text>
            <text x={12} y={H / 2} textAnchor="middle" className="axis" transform={`rotate(-90 12 ${H / 2})`}>words</text>
            <line x1={L} x2={L} y1={0} y2={H} stroke="var(--line-strong)" />
            <line x1={L} x2={L + plotW} y1={H} y2={H} stroke="var(--line-strong)" />
            <line x1={L} x2={L + plotW} y1={medianY} y2={medianY} stroke="var(--line-strong)" strokeDasharray="3 3" />
            <text x={L + plotW + 4} y={medianY + 4} className="axis">usual</text>
            {rows.map((r, i) => {
              const bh = Math.max(2, (r.words / max) * H);
              const x = L + i * (bw + gap);
              const newChapter = i === 0 || rows[i - 1].chapter.id !== r.chapter.id;
              return (
                <g key={r.id} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={() => ctx.openScene(r.id)} style={{ cursor: 'pointer' }}>
                  <title>{`${r.index}. ${r.title}, ${r.words.toLocaleString()} words`}</title>
                  {newChapter && i > 0 && <line x1={x - gap / 2} x2={x - gap / 2} y1={0} y2={H + 22} stroke="var(--line)" />}
                  {newChapter && <text x={x + 1} y={H + 34} className="axis chapter">Ch {r.chapter.number}</text>}
                  <rect x={x} y={0} width={bw + gap} height={H + 20} fill="transparent" />
                  <path d={`M${x},${H} v${-(bh - 2)} q0,-2 2,-2 h${bw - 4} q2,0 2,2 v${bh - 2} z`} fill={hover === i ? 'var(--accent, var(--struct))' : 'var(--struct)'} opacity={hover == null || hover === i ? 1 : 0.55} />
                  {(i % every === 0 || i === rows.length - 1) && <text x={x + bw / 2} y={H + 14} textAnchor="middle" className="axis">{r.index}</text>}
                </g>
              );
            })}
          </g>
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
      <p className="small faint">Bars are numbered in reading order; the table below names each one.{d.unwritten ? ` ${d.unwritten} scene card${d.unwritten === 1 ? ' is' : 's are'} not written yet, so ${d.unwritten === 1 ? 'it has' : 'they have'} no length to show.` : ''}</p>
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
const MARK: Record<string, { label: string; glyph: string }> = { pov: { label: 'viewpoint', glyph: '●' }, planned: { label: 'in the scene (your records)', glyph: '■' }, named: { label: 'named on the page', glyph: '○' } };

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
      <p className="muted">No scenes or scene cards yet. Write a scene, or add scene cards on the Board, and each character shows up where you put them.</p>
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
  const jump = (label: string) => document.querySelector(`[aria-label="${label}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Characters in no scene and no card yet: one calm line, not a box each.
  const absent = d.rows.filter((r: any) => !r.count);
  const quiet = d.notes.filter((n: any) => !absent.some((r: any) => r.id === n.characterId));
  const bResult = bech.d ? (bech.d.result === 'passes' ? `passes, in ${bech.d.passingScenes} scene${bech.d.passingScenes === 1 ? '' : 's'}` : bech.d.result) : null;
  const headTitle = (p: any) => `${p.standing === 'unplaced' ? '' : `${p.index}. `}${p.title}${p.chapter ? `, Chapter ${p.chapter.number}` : ''}${p.beat ? `, ${p.beat}` : ''}${p.drafted ? '' : ` (${STANDING[p.standing]?.label ?? 'planned'})`}`;
  return (
    <>
      <h2>The cast across the story</h2>
      <HowItWorks view="cast"
        shows="Each character as a row and every scene and scene card as a column, in reading order, with a mark wherever they are. Below the grid: who shares scenes, groups that keep meeting, every pair, and the Bechdel test."
        from={<>Your records ("appears in" on a scene card), each scene's viewpoint, and the character's name on the written page. Planned scene cards count too and are shaded, so you can see the cast of a book before it is written.</>}
        todo="Look for a character who vanishes for a long stretch, or two characters who never meet. Click a mark to open that scene or card." />
      <p className="muted small">Where each character is, scene by scene, from your records, the viewpoint, and their names on the page. Click a mark to open the scene.</p>
      {bResult && <p className="small muted">The Bechdel test asks whether two named women talk to each other about something other than a man. Right now: {bResult}. It has its own page below.</p>}
      <Pages storeKey={`cast:${ctx.projectId}`} label="The cast" pages={[
        { title: 'Across the story', filled: true, content: (<>
      {(quiet.length > 0 || absent.length > 0) && (
        <section className="section" aria-label="Gone quiet">
          {quiet.map((n: any) => <div key={n.text} className="notice small">{n.text}</div>)}
          {absent.length > 0 && <p className="small muted inline-names">Not in any scene or card yet: {absent.map((r: any, i: number) => <span key={r.id}>{i ? ', ' : ''}<button className="btn link small" onClick={() => onOpen({ level: 'element', id: r.id })}>{r.title}</button></span>)}.</p>}
        </section>
      )}
      <div className="row small cast-key" aria-label="Key">
        {Object.entries(MARK).map(([k, m]) => <span key={k}><span aria-hidden="true" className={`cast-mark ${k}`}>{m.glyph}</span> {m.label}</span>)}
        <span><span aria-hidden="true" className="cast-key-planned" /> planned scene card, not written yet</span>
      </div>
      <p className="small faint" style={{ margin: '0.25rem 0 0' }}>Columns are scenes and scene cards in reading order, numbered. Hover a number for its title.</p>
      <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
        <table className="cast-grid small" aria-label="Who is where">
          <thead>
            <tr><th />{places.map((p, i) => actStarts[i] ? <th key={p.key} colSpan={places.slice(i).findIndex((x, k) => k > 0 && x.act !== p.act) === -1 ? places.length - i : places.slice(i).findIndex((x, k) => k > 0 && x.act !== p.act)} className="act">{d.acts[p.act]}</th> : null)}</tr>
            <tr><th className="faint" style={{ textAlign: 'left', fontWeight: 400 }}>Scene</th>{places.map((p, i) => <th key={p.key} className={[actStarts[i] ? 'edge' : '', p.drafted ? '' : 'planned'].join(' ').trim()} title={headTitle(p)} aria-label={headTitle(p)}>{p.standing === 'unplaced' ? '·' : p.index}</th>)}</tr>
          </thead>
          <tbody>
            {d.rows.map((r: any) => (
              <tr key={r.id}>
                <th scope="row"><button className="btn link small" onClick={() => onOpen({ level: 'element', id: r.id })}>{r.title}</button> <span className="faint">{r.count}</span></th>
                {places.map((p, i) => {
                  const how = r.cells[p.key];
                  return <td key={p.key} className={[actStarts[i] ? 'edge' : '', p.drafted ? '' : 'planned'].join(' ').trim()}>{how && <button className={`cast-mark ${how}`} aria-label={`${r.title}, ${MARK[how]!.label}, ${p.title}`} title={`${r.title}: ${MARK[how]!.label} in "${p.title}"${p.drafted ? '' : ' (planned)'}`} onClick={() => go(p)}>{MARK[how]!.glyph}</button>}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

        </>) },
        { title: 'Who is together', content: (<>
      <section className="section" aria-label="Who is together">
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

        </>) },
        { title: 'Groups that keep meeting', hidden: !(groups.d && groups.d.length > 0), filled: true, content: !(groups.d && groups.d.length > 0) ? null : (

        <section className="section" aria-label="Groups that keep meeting">
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
      
        ) },
        { title: 'Two at a time', filled: !!pairs.d?.length, content: (<>
      <section className="section" aria-label="Who meets whom">
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

        </>) },
        { title: 'The Bechdel test', filled: bech.d?.result === 'passes', content: (<>
      <section className="section" aria-label="Bechdel test">
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
        </>) },
      ]} />
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
      <HowItWorks view="reader"
        shows="Chapter by chapter, the colored tabs a reader would stick in the book: the spots they would want to find again."
        from={<>Each scene card's "What you want the reader to feel", under Reader response. A chapter shows the tabs of all its scenes.</>}
        todo="A chapter with no tab may need a moment that makes the reader laugh, nod, gasp or stop. A long run of one color may want another kind." />
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
      <HowItWorks view="soundtrack"
        shows="The songs in your story, in the order they first play in the book."
        from={<>Song records in the Story Brain, under Soundtrack, connected to scenes with "plays in" or to a character with "theme song of".</>}
        todo="Use it to hear the book's mood from start to end, or to keep a character's theme song consistent. Titles and artists only, never lyrics." />
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
