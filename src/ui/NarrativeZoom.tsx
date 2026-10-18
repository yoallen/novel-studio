import { DoorNote } from './Door';
import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { ElementPage } from './ElementPage';
import { valueText } from './status';
import { Timelines, Viewpoint, Knowledge, Clues, Storylines, Review, Pacing, Names, Cast, ReaderMap, Soundtrack } from './ContinuityViews';

// Narrative Zoom: the whole story, an act, a beat, a scene, the page, and back, never losing your place
// (R-C-066, R-C-067); follow a character or object across the story (R-C-068); the board (R-C-004);
// beat placement under both of her models (R-C-007, R-C-008); the Ripple Effect before any move (R-C-075);
// alternate structures (D-17).

type Node = { level: 'story' } | { level: 'act'; key: string } | { level: 'beat'; id: string } | { level: 'card'; id: string } | { level: 'element'; id: string };
type Tab = 'zoom' | 'board' | 'beats' | 'alternates' | 'timelines' | 'viewpoint' | 'knowledge' | 'clues' | 'storylines' | 'review' | 'pacing' | 'names' | 'cast' | 'reader' | 'soundtrack';
export type ZoomRequest = { node: Node; nonce: number } | null;

const VIEWS: [Tab, string][] = [['zoom', 'Zoom'], ['board', 'Board'], ['beats', 'Where beats fall'], ['alternates', 'Alternate structures']];
const CHECKS: [Tab, string][] = [['timelines', 'Timelines'], ['viewpoint', 'Viewpoint'], ['knowledge', 'Who knows what'], ['clues', 'Setups and payoffs'], ['storylines', 'Storylines'], ['cast', 'Cast'], ['pacing', 'Pacing'], ['reader', 'Reader response'], ['soundtrack', 'Soundtrack'], ['names', 'Names'], ['review', 'Story review']];

/** The story strip above every page redraws when the structure changes here. */
const structureChanged = () => { try { window.dispatchEvent(new Event('storycanon:structure')); } catch { /* ignore */ } };
const sameNode = (a: Node, b: Node) => JSON.stringify(a) === JSON.stringify(b);

export function NarrativeZoom({ ctx, request }: { ctx: Ctx; request: ZoomRequest }) {
  const [tab, setTab] = useState<Tab>(() => { try { return (sessionStorage.getItem('ns-zoom-tab') as Tab) || 'zoom'; } catch { return 'zoom'; } });
  const [node, setNode] = useState<Node>(() => { try { const s = sessionStorage.getItem('ns-zoom-node'); return s ? JSON.parse(s) : { level: 'story' }; } catch { return { level: 'story' }; } });
  const [path, setPath] = useState<{ label: string; node: Node }[]>([]);
  const [view, setView] = useState<any>(null);
  const [error, setError] = useState('');
  const [move, setMove] = useState<any>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => { if (request) { setNode(request.node); setTab('zoom'); } }, [request]);
  useEffect(() => { try { sessionStorage.setItem('ns-zoom-node', JSON.stringify(node)); sessionStorage.setItem('ns-zoom-tab', tab); } catch { /* ignore */ } }, [node, tab]);
  const load = useCallback(() => api.post(`/api/projects/${ctx.projectId}/zoom`, { node }).then((v) => { setView(v); setError(''); }).catch((e) => { setError(e.message); if (node.level !== 'story') setNode({ level: 'story' }); }), [ctx.projectId, node]);
  useEffect(() => { void load(); }, [load, tick]);

  // Zoom remembers the path you took, not just the tree, so you can walk it back (R-C-073).
  const go = (n: Node) => { if (view) setPath((p) => [...p.slice(-11), { label: view.title ?? 'Story', node }]); setNode(n); };
  const back = () => setPath((p) => { const last = p[p.length - 1]; if (last) setNode(last.node); return p.slice(0, -1); });
  const refresh = () => { setTick((t) => t + 1); structureChanged(); };
  const tabBtn = ([k, l]: [Tab, string]) => <button key={k} role="tab" aria-selected={tab === k} className="btn" onClick={() => setTab(k)}>{l}</button>;
  // "Back" only when it goes somewhere the breadcrumb does not already show.
  const prev = path[path.length - 1];
  const showBack = !!prev && view && !view.breadcrumb.some((c: any) => sameNode(c.node, prev.node));

  return (
    <div className="scroll"><div className="content" style={{ maxWidth: 1180 }}>
      <div className="zoom-tabs">
        <div className="row zoom-views" role="tablist" aria-label="Narrative Zoom">
          {VIEWS.map(tabBtn)}
          <span className="grow" />
          <button className="btn small" onClick={ctx.openStuck}>I'm stuck</button>
        </div>
        <div className="row zoom-checks" role="tablist" aria-label="Continuity">
          <span className="zoom-checks-label">Continuity checks</span>
          {CHECKS.map(tabBtn)}
        </div>
      </div>
      {error && <div className="notice error" role="alert">{error}</div>}
      {tab === 'zoom' && view && (
        <>
          {(view.breadcrumb.length > 1 || showBack) && (
            <nav aria-label="Where you are" className="row small zoom-crumbs">
              {view.breadcrumb.length > 1 && view.breadcrumb.map((c: any, i: number) => (
                <span key={i} className="row" style={{ gap: '0.25rem' }}>
                  {i > 0 && <span className="faint">›</span>}
                  {i === view.breadcrumb.length - 1 ? <strong>{c.label}</strong> : <button className="btn link small" onClick={() => go(c.node)}>{c.label}</button>}
                </span>
              ))}
              <span className="grow" />
              {showBack && <button className="btn link small" onClick={back}>Back to {prev!.label}, where you came from</button>}
            </nav>
          )}
          <ZoomBody ctx={ctx} view={view} go={go} onMove={setMove} refresh={refresh} />
        </>
      )}
      {tab === 'board' && <Board ctx={ctx} tick={tick} onMove={setMove} onOpen={(n) => { setTab('zoom'); go(n); }} refresh={refresh} />}
      {tab === 'beats' && <Beats ctx={ctx} tick={tick} refresh={refresh} onOpen={(n) => { setTab('zoom'); go(n); }} />}
      {tab === 'alternates' && <Alternates ctx={ctx} tick={tick} refresh={refresh} />}
      {tab === 'timelines' && <Timelines ctx={ctx} tick={tick} onOpen={(n) => { setTab('zoom'); go(n); }} />}
      {tab === 'viewpoint' && <Viewpoint ctx={ctx} tick={tick} refresh={refresh} />}
      {tab === 'knowledge' && <Knowledge ctx={ctx} tick={tick} onOpen={(n) => { setTab('zoom'); go(n); }} />}
      {tab === 'clues' && <Clues ctx={ctx} tick={tick} onOpen={(n) => { setTab('zoom'); go(n); }} />}
      {tab === 'storylines' && <Storylines ctx={ctx} tick={tick} onOpen={(n) => { setTab('zoom'); go(n); }} />}
      {tab === 'cast' && <Cast ctx={ctx} tick={tick} onOpen={(n) => { setTab('zoom'); go(n as never); }} />}
      {tab === 'pacing' && <Pacing ctx={ctx} tick={tick} />}
      {tab === 'names' && <DoorNote ctx={ctx} what="possible misspellings of names"><Names ctx={ctx} tick={tick} /></DoorNote>}
      {tab === 'reader' && <ReaderMap ctx={ctx} tick={tick} />}
      {tab === 'soundtrack' && <Soundtrack ctx={ctx} tick={tick} />}
      {tab === 'review' && <DoorNote ctx={ctx} what="the story review"><Review ctx={ctx} tick={tick} onOpen={(n) => { setTab('zoom'); go(n); }} /></DoorNote>}
      {move && <MoveDialog ctx={ctx} move={move} onClose={() => setMove(null)} onDone={() => { setMove(null); refresh(); }} />}
    </div></div>
  );
}

function NoBeats({ ctx, refresh }: { ctx: Ctx; refresh: () => void }) {
  return (
    <div className="notice">
      <p style={{ marginTop: 0 }}>This novel has no beat sheet. Frameworks are lenses you choose, never requirements. Your story works without one.</p>
      <button className="btn" onClick={() => void api.post(`/api/projects/${ctx.projectId}/structure/save-the-cat`).then(refresh)}>Use your Save the Cat beat sheet</button>
    </div>
  );
}

/**
 * An example from her beat sheet: slanted, marked with the fleuron, introduced as an example and
 * credited to the book it comes from, so it is never read as her own story. The text is hers, unchanged.
 */
export function SheetExample({ text, from }: { text: string; from?: { title: string; author: string } | null }) {
  return (
    <figure className="sheet-example">
      <figcaption>An example from your beat sheet{from ? <>, from <cite>{from.title}</cite> by {from.author}</> : ''}</figcaption>
      <blockquote>{text}</blockquote>
    </figure>
  );
}

function ZoomBody({ ctx, view, go, onMove, refresh }: { ctx: Ctx; view: any; go: (n: Node) => void; onMove: (m: any) => void; refresh: () => void }) {
  const lvl = view.node.level;
  const list = (items: any[], empty: string) => items.length === 0 ? <p className="muted small">{empty}</p> : (
    <ul className="list">{items.map((c: any, i: number) => (
      <li key={i} className="row">
        <button className="btn link" style={{ textAlign: 'left' }} onClick={() => go(c.node)}>{c.label}</button>
        {c.detail && <span className="faint small">{c.detail}</span>}
        {c.drafted !== undefined && <span className="mark" data-d={c.drafted ? 'drafted' : 'idea'} title={c.drafted ? 'Has prose' : 'Not drafted yet'} />}
        {c.cards && c.cards.length > 0 && <span className="small muted">{c.cards.map((x: any) => x.label).join('; ')}</span>}
      </li>
    ))}</ul>
  );
  if (lvl === 'story') {
    const worlds: Record<string, any> = Object.fromEntries((view.worlds ?? []).map((w: any) => [w.key, w]));
    let lastWorld: string | null = null;
    return (
      <>
        <h1>{view.title}</h1>
        {!view.hasBeats && <NoBeats ctx={ctx} refresh={refresh} />}
        {view.hasBeats && (
          <ul className="list story-overview">
            {view.children.flatMap((c: any, i: number) => {
              const w = c.world && c.world !== lastWorld ? worlds[c.world] : null;
              if (c.world) lastWorld = c.world;
              return [
                ...(w ? [<li key={`w-${w.key}`} className="world-band" data-world={w.key} aria-label={w.name}>
                  <div className="world-name">{w.name}</div>
                  <div className="world-meaning">{w.meaning}</div>
                  <details className="world-more"><summary>Read the full description from your sheet</summary><p>{w.description}</p></details>
                </li>] : []),
                <li key={i} className="row act-row">
                  <button className="btn link" style={{ textAlign: 'left' }} onClick={() => go(c.node)}>{c.label}</button>
                  {c.detail && <span className="faint small">{c.detail}</span>}
                </li>,
              ];
            })}
          </ul>
        )}
        {view.hasBeats && view.worlds.length > 0 && (
          <section className="section worlds-explained">
            <h2>The three worlds</h2>
            <p>In Save the Cat, the three acts are three states of being. Act One is the <strong>Thesis World</strong>: the hero's world before, who they are and what needs fixing. Act Two is the <strong>Antithesis World</strong>: the upside-down world they are thrown into. Act Three is the <strong>Synthesis World</strong>: a new self that combines the two.</p>
          </section>
        )}
        {view.unplaced.length > 0 && (
          <section className="section"><h2>Scenes not on a beat yet</h2>
            <p className="small muted">These cards have no spot yet. Open one and choose Move… to place it, or drag it on the Board.{view.mightOnly > 0 ? ` ${view.mightOnly} more ${view.mightOnly === 1 ? 'card might go' : 'cards might go'} on a beat; ${view.mightOnly === 1 ? 'it shows' : 'they show'} in pencil under ${view.mightOnly === 1 ? 'its' : 'their'} act.` : ''}</p>
            {list(view.unplaced, '')}
          </section>
        )}
      </>
    );
  }
  if (lvl === 'act') return (
    <>
      <h1>{view.title}</h1>
      {view.children.length === 0 ? <p className="muted small">No beats in this act.</p> : (
        <ul className="list act-beats">{view.children.map((c: any, i: number) => (
          <li key={i}>
            <div className="row">
              <button className="btn link" style={{ textAlign: 'left' }} onClick={() => go(c.node)}>{c.label}</button>
              {c.detail && <span className="faint small">{c.detail}</span>}
            </div>
            {(c.cards.length > 0 || c.candidates.length > 0) && (
              <ul className="beat-cards">
                {c.cards.map((x: any, j: number) => <li key={`d${j}`} className="st" data-s="established"><button className="btn link small" onClick={() => go(x.node)}>{x.label}</button></li>)}
                {c.candidates.map((x: any, j: number) => <li key={`c${j}`} className="st" data-s="developing"><button className="btn link small" onClick={() => go(x.node)}>{x.label}</button> <span className="faint small">might go here</span></li>)}
              </ul>
            )}
          </li>
        ))}</ul>
      )}
    </>
  );
  if (lvl === 'beat') {
    const d = view.def, l = view.landmark;
    const words = l?.at?.brody?.words ?? (Object.values(l?.at ?? {}).find(Boolean) as any)?.words;
    const draftedWords = l?.written ? l.written.end - l.written.start : 0;
    return (
      <>
        <h1>{view.title}</h1>
        {view.place && <p className="small muted beat-where">At {view.place} of the book{view.length.basis === 'target' && words ? `, around word ${words[0].toLocaleString()}${words[1] !== words[0] ? ` to ${words[1].toLocaleString()}` : ''} of ${view.length.words.toLocaleString()}` : ''}.{l?.written && draftedWords > 0 && l.written.percent != null ? ` In your draft it starts ${l.written.percent}% of the way into what you have written.` : ''}</p>}
        {d && (
          <details open className="beat-teach"><summary className="small muted">What this beat really does</summary>
            <p style={{ whiteSpace: 'pre-wrap' }}>{d.description}</p>
            {d.window && <p className="small"><strong>Where it goes:</strong> {d.window}</p>}
            {d.sceneType && <p className="small"><strong>Scene type:</strong> {d.sceneType}</p>}
            {d.test && <p className="small"><strong>A question to ask:</strong> {d.test}</p>}
            {d.example && <SheetExample text={d.example} from={d.exampleFrom} />}
            {view.key === 'stasis_death' && view.parent && <p className="small">The six things that need fixing have their own list on <button className="btn link small" style={{ padding: 0 }} onClick={() => go(view.parent.node)}>{view.parent.label}</button>.</p>}
          </details>
        )}
        {view.subBeats.length > 0 && <section className="section"><h2>Inside this beat</h2>{list(view.subBeats, '')}</section>}
        <section className="section"><h2>Scenes here</h2>{list(view.children, 'No scenes placed here yet.')}
          {view.candidates.length > 0 && <><h3 style={{ marginTop: '1rem' }}>Could go here</h3><ul className="list">{view.candidates.map((c: any, i: number) => <li key={i} className="st" data-s="developing"><button className="btn link" onClick={() => go(c.node)}>{c.label}</button></li>)}</ul></>}
          <PlaceCard ctx={ctx} beatId={view.node.id} cards={view.others} onPlaced={refresh} />
          <AddCard ctx={ctx} beatId={view.node.id} onAdded={refresh} />
        </section>
        <section className="section"><h2>Your plan for this beat</h2><ElementPage ctx={ctx} elementId={view.node.id} embedded onOpen={(id) => go({ level: 'element', id })} onChanged={refresh} /></section>
      </>
    );
  }
  if (lvl === 'card') return (
    <>
      <CardTitle title={view.title} id={view.node.id} onChanged={refresh} />
      <div className="row" style={{ marginBottom: '1rem' }}>
        {view.scene ? <button className="btn write" onClick={() => ctx.openScene(view.scene.id)}>Open the page</button>
          : <button className="btn write" onClick={() => void api.post(`/api/elements/${view.node.id}/write-scene`, {}).then((s) => ctx.openScene(s.id))}>Write this scene</button>}
        <button className="btn" onClick={() => onMove({ kind: 'card', planId: view.node.id, title: view.title, beatId: view.placement.decided?.beatId ?? null })}>Move…</button>
        {view.position && <span className="small muted">Scene {view.position.index} of {view.position.of}</span>}
      </div>
      <div className="cols">
        <section><h3>Placement</h3>
          {view.placement.decided ? <p className="small st fact-line" data-s="established">Decided: <button className="btn link small" style={{ padding: 0 }} onClick={() => go({ level: 'beat', id: view.placement.decided.beatId })}>{view.placement.decided.name}</button></p> : <p className="small muted">Not on a beat yet.</p>}
          {view.placement.candidates.map((c: any) => <p key={c.statementId} className="small st" data-s="developing">Might go at <button className="btn link small" style={{ padding: 0 }} onClick={() => go({ level: 'beat', id: c.beatId })}>{c.name}</button></p>)}
        </section>
        {view.pov && <section><h3>Viewpoint</h3><button className="btn link" onClick={() => go(view.pov.node)}>{view.pov.label}</button></section>}
        {view.fields.length > 0 && <section><h3>The plan</h3><ul className="list small">{view.fields.map((f: any) => <li key={f.field}><span className="muted">{f.label}:</span> {valueText(f.value)}</li>)}</ul></section>}
        <Rel title="How we got here" items={[...(view.previous ? [{ ...view.previous, label: `Before: ${view.previous.label}` }] : []), ...view.causes.map((c: any) => ({ ...c, label: `Caused by ${c.label}` }))]} go={go} />
        <Rel title="What must follow" items={[...view.consequences.map((c: any) => ({ ...c, label: `Causes ${c.label}` })), ...(view.next ? [{ ...view.next, label: `Next: ${view.next.label}` }] : [])]} go={go} />
        <Rel title="In this scene" items={view.inScene} go={go} />
        <Rel title="Reveals" items={view.reveals} go={go} />
        <Rel title="Sets up" items={view.plants} go={go} />
        <Rel title="Pays off" items={view.paysOff} go={go} />
        <Rel title="Depends on" items={view.dependsOn} go={go} />
      </div>
      {view.scene && <section className="section"><h3>The page</h3><blockquote className="tail">{view.scene.opening || 'Blank so far.'}{view.scene.opening?.length >= 400 ? '…' : ''}</blockquote><p className="small muted">{view.scene.words.toLocaleString()} words</p></section>}
      <section className="section"><h2>Your plan for this scene</h2><ElementPage ctx={ctx} elementId={view.node.id} embedded onOpen={(id) => go({ level: 'element', id })} onChanged={refresh} /></section>
    </>
  );
  // element: follow it across the story
  return (
    <>
      <h1>{view.title}</h1>
      <p className="small muted">Followed through the story in order.</p>
      <section><h2>Where it appears</h2>
        {view.appearances.length === 0 ? <p className="muted small">Not placed in any scene yet.</p> : <ul className="list">{view.appearances.map((a: any, i: number) => <li key={i} className="row"><span className="faint small">Scene {a.at} of {view.of}</span>{a.node ? <button className="btn link" onClick={() => go(a.node)}>{a.label}</button> : a.label}</li>)}</ul>}
      </section>
      <section className="section"><h2>Connections, in story order</h2>
        {view.connections.length === 0 ? <p className="muted small">No connections yet.</p> : <ul className="list">{view.connections.map((c: any, i: number) => <li key={i} className="row"><span className="faint small" style={{ minWidth: '5.5em' }}>{c.at ? `Scene ${c.at}` : 'Not placed'}</span><button className="btn link" onClick={() => go(c.node)}>{c.phrase}</button></li>)}</ul>}
      </section>
      <section className="section"><ElementPage ctx={ctx} elementId={view.node.id} onOpen={(id) => go({ level: 'element', id })} onChanged={refresh} /></section>
    </>
  );
}

/** A scene card's name, shown once, with a quiet way to rename it. */
function CardTitle({ title, id, onChanged }: { title: string; id: string; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [t, setT] = useState(title);
  useEffect(() => setT(title), [title]);
  if (editing) return (
    <form className="row" onSubmit={(e) => { e.preventDefault(); if (t.trim() && t !== title) void api.patch(`/api/elements/${id}`, { title: t }).then(() => { setEditing(false); onChanged(); }); else setEditing(false); }}>
      <input className="record-title grow" aria-label="Name" autoFocus value={t} onChange={(e) => setT(e.target.value)} />
      <button className="btn" type="submit">Save</button>
      <button className="btn link" type="button" onClick={() => { setT(title); setEditing(false); }}>Cancel</button>
    </form>
  );
  return <div className="row" style={{ alignItems: 'baseline' }}><h1 className="grow">{title}</h1><button className="btn link small" onClick={() => setEditing(true)}>Rename</button></div>;
}

function Rel({ title, items, go }: { title: string; items: any[]; go: (n: Node) => void }) {
  if (!items.length) return null;
  return <section><h3>{title}</h3><ul className="list small">{items.map((c, i) => <li key={i}><button className="btn link small" style={{ textAlign: 'left' }} onClick={() => go(c.node)}>{c.label}</button></li>)}</ul></section>;
}

const SURE = <>
  <option value="decide">It goes here</option>
  <option value="candidate">It might go here</option>
</>;

/** Place a card she already has on this beat: the ones with no spot are listed first. */
function PlaceCard({ ctx, beatId, cards, onPlaced }: { ctx: Ctx; beatId: string; cards: any[]; onPlaced: () => void }) {
  const [id, setId] = useState('');
  const [mode, setMode] = useState<'decide' | 'candidate'>('decide');
  const [error, setError] = useState('');
  if (!cards?.length) return null;
  const free = cards.filter((c) => !c.placed), placed = cards.filter((c) => c.placed);
  return (
    <form className="row small place-card" onSubmit={(e) => { e.preventDefault(); if (id) void api.post(`/api/elements/${id}/place`, { beatId, mode }).then(() => { setId(''); setError(''); onPlaced(); }).catch((x) => setError(x.message)); }}>
      <select value={id} onChange={(e) => setId(e.target.value)} aria-label="A card you already have" style={{ maxWidth: 320 }}>
        <option value="">Choose a card you already have…</option>
        {free.length > 0 && <optgroup label="Not on a beat yet">{free.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</optgroup>}
        {placed.length > 0 && <optgroup label="On another beat">{placed.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</optgroup>}
      </select>
      <select value={mode} onChange={(e) => setMode(e.target.value as 'decide' | 'candidate')} style={{ width: 'auto' }} aria-label="How sure, for a card you have">{SURE}</select>
      <button className="btn" type="submit" disabled={!id}>Place it here</button>
      {error && <span className="small" role="alert">{error}</span>}
    </form>
  );
}

function AddCard({ ctx, beatId, onAdded, compact }: { ctx: Ctx; beatId: string; onAdded: () => void; compact?: boolean }) {
  const [t, setT] = useState('');
  const [mode, setMode] = useState<'decide' | 'candidate'>('decide');
  return (
    <form className="row small" style={{ marginTop: '0.75rem' }} onSubmit={(e) => { e.preventDefault(); if (t.trim()) void api.post(`/api/projects/${ctx.projectId}/cards`, { title: t, beatId, mode }).then(() => { setT(''); onAdded(); }); }}>
      <input type="text" value={t} onChange={(e) => setT(e.target.value)} placeholder={compact ? 'A new card' : 'Or a new scene, in a few words'} aria-label="New scene card" autoFocus={compact} style={{ maxWidth: compact ? '100%' : 320 }} />
      {!compact && <select value={mode} onChange={(e) => setMode(e.target.value as 'decide' | 'candidate')} style={{ width: 'auto' }} aria-label="How sure">{SURE}</select>}
      <button className="btn" type="submit">{compact ? 'Add' : 'Add scene card'}</button>
    </form>
  );
}

// The board: four rows, beats as columns, cards under them (R-C-004). Dragging a card previews the move first.
function Board({ ctx, tick, onMove, onOpen, refresh }: { ctx: Ctx; tick: number; onMove: (m: any) => void; onOpen: (n: Node) => void; refresh: () => void }) {
  const [b, setB] = useState<any>(null);
  const [drag, setDrag] = useState<any>(null);
  const [over, setOver] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  useEffect(() => { api.get(`/api/projects/${ctx.projectId}/board`).then(setB).catch(() => {}); }, [ctx.projectId, tick]);
  if (!b) return <p className="muted">Laying out the board…</p>;
  if (!b.rows.some((r: any) => r.beats.length)) return <NoBeats ctx={ctx} refresh={refresh} />;
  const card = (c: any, candidate = false, place = false) => (
    <div key={c.id + (candidate ? 'c' : '')} draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', c.id); e.dataTransfer.effectAllowed = 'move'; setDrag(c); }} onDragEnd={() => { setDrag(null); setOver(null); }}
      className="st board-card" data-s={candidate ? 'developing' : 'established'}>
      <div className="row" style={{ gap: '0.3rem', flexWrap: 'nowrap' }}>
        <span className="mark" data-d={c.scene ? (c.scene.word_count > 0 ? 'drafted' : 'idea') : 'idea'} />
        <button className="btn link small grow" style={{ textAlign: 'left', padding: 0 }} onClick={() => onOpen({ level: 'card', id: c.id })}>{c.title}</button>
      </div>
      {(c.valueStart || c.valueEnd) && <div className="faint small">{valueText(c.valueStart) || '?'} → {valueText(c.valueEnd) || '?'}</div>}
      {candidate && <div className="faint small">might go here</div>}
      {c.reserved && <div className="hers">{c.reserved}</div>}
      {place && <button className="btn small" style={{ marginTop: '0.3rem' }} onClick={() => onMove({ kind: 'card', planId: c.id, title: c.title, beatId: null })}>Place on a beat…</button>}
    </div>
  );
  const drop = (beatId: string) => ({
    onDragOver: (e: React.DragEvent) => { if (drag) { e.preventDefault(); setOver(beatId); } },
    onDragLeave: () => setOver((o) => (o === beatId ? null : o)),
    onDrop: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (drag && drag.placements.decided?.beatId !== beatId) onMove({ kind: 'card', planId: drag.id, title: drag.title, beatId: drag.placements.decided?.beatId ?? null, toBeatId: beatId }); setDrag(null); setOver(null); },
    'data-over': over === beatId ? '' : undefined,
  });
  return (
    <>
      <p className="small muted">Drag a card onto a beat, or open a beat to add one. A card in pencil only might go there. Nothing moves until you have seen what the move would change.</p>
      {b.rows.map((r: any) => (
        <section key={r.act} className="board-act">
          <h2>{r.name}</h2>
          <div className="board-row" style={{ gridTemplateColumns: `repeat(${r.beats.length}, minmax(150px, 1fr))` }}>
            {r.beats.map((bt: any) => (
              <div key={bt.id} className="board-beat" {...drop(bt.id)}>
                <button className="btn link small" style={{ fontWeight: 700, padding: 0, textAlign: 'left' }} onClick={() => onOpen({ level: 'beat', id: bt.id })}>{bt.number ? `${bt.number}. ` : ''}{bt.name}</button>
                {bt.cards.filter((c: any) => c.placements.decided?.beatId === bt.id).map((c: any) => card(c))}
                {bt.candidates.map((c: any) => card(c, true))}
                {bt.children.map((ch: any) => (
                  <div key={ch.id} className="board-step" {...drop(ch.id)}>
                    <button className="btn link small board-step-name" onClick={() => onOpen({ level: 'beat', id: ch.id })}>{ch.name}</button>
                    {bt.cards.filter((c: any) => c.placements.decided?.beatId === ch.id).map((c: any) => card(c))}
                    {ch.candidates.map((c: any) => card(c, true))}
                  </div>
                ))}
                {adding === bt.id ? <AddCard ctx={ctx} beatId={bt.id} compact onAdded={() => { setAdding(null); refresh(); }} />
                  : <button className="btn link small board-add" onClick={() => setAdding(bt.id)} title={`Add a card to ${bt.name}`}>+ Add a card</button>}
              </div>
            ))}
          </div>
        </section>
      ))}
      {(b.unspotted ?? b.unplaced).length > 0 && (
        <section className="board-act"><h2>Not on a beat yet</h2>
          <p className="small muted">Cards with no spot yet. Drag one onto a beat above, or choose Place on a beat.</p>
          <div className="row" style={{ alignItems: 'stretch' }}>{(b.unspotted ?? b.unplaced).map((c: any) => <div key={c.id} style={{ width: 210 }}>{card(c, false, true)}</div>)}</div>
        </section>
      )}
    </>
  );
}

const pct = (a: number[]) => (a[0] === a[1] ? `${a[0]}%` : `${a[0]}% to ${a[1]}%`);

function Beats({ ctx, tick, refresh, onOpen }: { ctx: Ctx; tick: number; refresh: () => void; onOpen: (n: Node) => void }) {
  const [lm, setLm] = useState<any>(null);
  const [qs, setQs] = useState<any[]>([]);
  const [prof, setProf] = useState('');
  const [target, setTarget] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { api.get(`/api/projects/${ctx.projectId}/landmarks`).then(setLm).catch(() => {}); api.get(`/api/projects/${ctx.projectId}/structure-questions`).then(setQs).catch(() => {}); }, [ctx.projectId, tick]);
  if (!lm) return <p className="muted">Working out the numbers…</p>;
  const wpp: number[] = lm.length.wpp;
  const hasTarget = lm.length.basis === 'target';
  const p = lm.profiles.find((x: any) => x.key === prof) ?? lm.profiles[0];
  const range = (a: number[]) => (a[0] === a[1] ? a[0]!.toLocaleString() : `${a[0]!.toLocaleString()} to ${a[1]!.toLocaleString()}`);
  async function setIt() {
    const n = Number(target.replace(/[^0-9]/g, ''));
    try { await api.patch(`/api/projects/${ctx.projectId}/settings`, { targetWords: n }); setError(''); setTarget(''); await ctx.refreshProject(); refresh(); } catch (e) { setError((e as Error).message); }
  }
  return (
    <>
      <h1>Where beats fall</h1>
      <p className="muted">Where each beat lands in a book of your length. This page shows the numbers; to place a scene on a beat, open the beat or use the Board.</p>
      {!hasTarget && (
        <div className="notice">
          <p style={{ marginTop: 0 }}>Your book has no target length yet, so only the percentages are shown. Set one to see the word and page where each beat lands.</p>
          <form className="row" onSubmit={(e) => { e.preventDefault(); void setIt(); }}>
            <label className="row small">Target length <input type="text" inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="For example: 90000" aria-label="Target length in words" style={{ width: '10rem' }} /> words</label>
            <button className="btn" type="submit" disabled={!target.replace(/[^0-9]/g, '')}>Set the target</button>
          </form>
          {error && <p className="small" role="alert">{error}</p>}
        </div>
      )}
      {hasTarget && <p className="small muted">Based on your target of {lm.length.words.toLocaleString()} words. Pages are estimates at {wpp.join(' and ')} words per page. You can change the target in Settings.</p>}
      {lm.profiles.length > 1 && (
        <label className="row small" style={{ margin: '0.75rem 0' }}>Placement model
          <select value={p.key} onChange={(e) => setProf(e.target.value)} style={{ width: 'auto' }} title={p.source}>{lm.profiles.map((x: any) => <option key={x.key} value={x.key}>{x.name}</option>)}</select>
        </label>
      )}
      {qs.length > 0 && <div className="notice">{qs.map((q, i) => <p key={i} style={{ margin: '0.25rem 0' }}>{q.text}</p>)}</div>}
      <div style={{ overflowX: 'auto' }}>
        <table className="beats-table">
          <thead><tr>
            <th>Beat</th>
            <th>Where</th>
            {hasTarget && <th>Around word</th>}
            {hasTarget && <th>Page</th>}
            <th>Drafted so far</th>
          </tr></thead>
          <tbody>{lm.beats.map((b: any) => {
            const a = b.at[p.key];
            const words = b.written ? b.written.end - b.written.start : 0;
            return (
              <tr key={b.id}>
                <td style={{ paddingLeft: b.parentId ? '1.5rem' : undefined }}><button className="btn link small" onClick={() => onOpen({ level: 'beat', id: b.id })}>{b.number ? `${b.number}. ` : ''}{b.name}</button></td>
                <td>{a ? pct(a.percent) : <span className="faint">not set</span>}</td>
                {hasTarget && <td>{a ? range(a.words) : ''}</td>}
                {hasTarget && <td className="faint">{a ? wpp.map((w) => `p. ${range(a.pages[w])} at ${w}`).join('; ') : ''}</td>}
                <td>{b.written ? `${b.written.scenes} scene${b.written.scenes === 1 ? '' : 's'}, ${words > 0 ? `${words.toLocaleString()} words` : 'no words yet'}` : <span className="faint">nothing yet</span>}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </>
  );
}

/** The beats of this novel for a chooser: grouped by act, with the smaller steps shown inside their beat. */
function BeatOptions({ beats, disabled }: { beats: any[]; disabled?: string | null }) {
  const acts: [string, string][] = [['I', 'Act One'], ['IIA', 'Act Two, first half'], ['IIB', 'Act Two, second half'], ['III', 'Act Three']];
  const nameOf = (id: string) => beats.find((x) => x.id === id)?.name ?? '';
  return <>{acts.map(([k, n]) => {
    const here = beats.filter((b) => b.act === k);
    if (!here.length) return null;
    return <optgroup key={k} label={n}>{here.map((b) => <option key={b.id} value={b.id} disabled={b.id === disabled}>{b.parentId ? `   ${b.name} (a step inside ${nameOf(b.parentId)})` : `${b.number ? `${b.number}. ` : ''}${b.name}`}</option>)}</optgroup>;
  })}</>;
}

// Preview a move with the Ripple Effect, then make it, save it as an alternate, or leave it (R-C-075, R-C-076, D-17).
function MoveDialog({ ctx, move, onClose, onDone }: { ctx: Ctx; move: any; onClose: () => void; onDone: () => void }) {
  const [beats, setBeats] = useState<any[]>([]);
  const [to, setTo] = useState<string>(move.toBeatId ?? '');
  const [sure, setSure] = useState<'decide' | 'candidate'>('decide');
  const [p, setP] = useState<any>(null);
  const [error, setError] = useState('');
  const [altName, setAltName] = useState('');
  useEffect(() => { api.get(`/api/projects/${ctx.projectId}/landmarks`).then((lm) => setBeats(lm.beats)).catch(() => {}); }, [ctx.projectId]);
  const op = { type: 'moveCard', planId: move.planId, beatId: to || null };
  useEffect(() => { if (!to || sure !== 'decide') { setP(null); return; } api.post(`/api/projects/${ctx.projectId}/ripple/preview`, { op }).then(setP).catch((e) => setError(e.message)); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [to, sure]);
  async function commit() { try { await api.post(`/api/projects/${ctx.projectId}/ripple/commit`, { op }); onDone(); } catch (e) { setError((e as Error).message); } }
  async function maybe() { try { await api.post(`/api/elements/${move.planId}/place`, { beatId: to, mode: 'candidate' }); onDone(); } catch (e) { setError((e as Error).message); } }
  async function saveAlt() { try { await api.post(`/api/projects/${ctx.projectId}/alternates`, { name: altName || `${move.title} moved`, ops: [op] }); onDone(); } catch (e) { setError((e as Error).message); } }
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="mv-h" onKeyDown={(e) => e.key === 'Escape' && onClose()}><div className="dialog" style={{ width: 'min(760px, 94vw)' }}>
      <h2 id="mv-h">{move.beatId ? `Move "${move.title}"` : `Place "${move.title}" on a beat`}</h2>
      {error && <div className="notice error">{error}</div>}
      <label className="field"><span>To</span>
        <select value={to} onChange={(e) => setTo(e.target.value)} aria-label="Move to beat"><option value="">Choose a beat…</option><BeatOptions beats={beats} disabled={move.beatId} /></select>
      </label>
      <p className="faint small" style={{ marginTop: '-0.5rem' }}>Beats without a number are smaller steps inside a numbered beat, such as Stasis = Death inside Setup. Open one in Zoom to read what it is for.</p>
      <fieldset className="row small sure-choice" aria-label="How sure">
        <label className="choice-pill"><input type="radio" name="sure" checked={sure === 'decide'} onChange={() => setSure('decide')} />It goes here (decided)</label>
        <label className="choice-pill"><input type="radio" name="sure" checked={sure === 'candidate'} onChange={() => setSure('candidate')} />It might go here</label>
      </fieldset>
      <p className="faint small">The checks only count decided cards, so a "might" never raises a problem. A card can be a "might" on several beats while you decide.</p>
      {to && sure === 'candidate' && (
        <div className="row" style={{ marginTop: '1rem' }}>
          <button className="btn write" onClick={() => void maybe()}>Mark it as might go here</button>
          <button className="btn link" onClick={onClose}>Leave it</button>
        </div>
      )}
      {p && sure === 'decide' && (
        <div aria-live="polite">
          <p className="small muted">Nothing has changed yet. This is what the move would do.</p>
          <h3>Questions it would raise</h3>
          {p.newQuestions.length === 0 ? <p className="small">None.</p> : <ul className="list">{p.newQuestions.map((q: any) => <li key={q.key} className="st" data-s="unanswered">{q.message}</li>)}</ul>}
          {p.settled.length > 0 && <><h3>Questions it would settle</h3><ul className="list">{p.settled.map((q: any) => <li key={q.key} className="st" data-s="established">{q.message}</li>)}</ul></>}
          {p.moves.length > 0 && <><h3>What moves with it</h3><ul className="list small">{p.moves.map((m: any) => <li key={m.id}>{m.title}: {m.from ? `${m.from.beat ?? 'scene ' + m.from.position}` : 'not placed'} → {m.to ? `${m.to.beat ?? 'scene ' + m.to.position}` : 'not placed'}</li>)}</ul></>}
          {p.touches.length > 0 && <><h3>What it touches</h3><ul className="list small">{p.touches.map((t: any) => <li key={t.id}>{t.path} <span className="faint">({t.strength})</span></li>)}</ul></>}
          <div className="row" style={{ marginTop: '1rem' }}>
            <button className="btn write" onClick={() => void commit()}>Make this move</button>
            <input type="text" value={altName} onChange={(e) => setAltName(e.target.value)} placeholder="Name for an alternate" aria-label="Alternate name" style={{ maxWidth: 220 }} />
            <button className="btn" onClick={() => void saveAlt()}>Save as an alternate</button>
            <button className="btn link" onClick={onClose}>Leave it</button>
          </div>
          <p className="faint small">A move is one step in the Story Trail. You can undo it there.</p>
        </div>
      )}
      {!to && <div className="row"><button className="btn link" onClick={onClose}>Cancel</button></div>}
    </div></div>
  );
}

function Alternates({ ctx, tick, refresh }: { ctx: Ctx; tick: number; refresh: () => void }) {
  const [list, setList] = useState<any[] | null>(null);
  const [cmp, setCmp] = useState<any>(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get(`/api/projects/${ctx.projectId}/alternates`).then(setList).catch((e) => setError(e.message)); }, [ctx.projectId, tick]);
  return (
    <>
      <h1>Alternate structures</h1>
      <p className="muted">Try another shape for the story without losing the one you have. Compare, then adopt it or let it go. Your current structure stays untouched until you adopt.</p>
      {error && <div className="notice error">{error}</div>}
      {list && list.length === 0 && <p className="muted">None yet. Start one below, or choose "Save as an alternate" when you move a card.</p>}
      <ul className="list">{list?.map((a) => (
        <li key={a.id}>
          <div className="row"><strong className="grow">{a.name}</strong>
            <button className="btn small" onClick={() => void api.get(`/api/alternates/${a.id}/compare`).then(setCmp).catch((e) => setError(e.message))}>Compare</button>
            <button className="btn small" onClick={() => void api.post(`/api/alternates/${a.id}/adopt`).then(() => { setCmp(null); refresh(); }).catch((e) => setError(e.message))}>Adopt</button>
            <button className="btn small" onClick={() => void api.del(`/api/alternates/${a.id}`).then(() => { setCmp(null); refresh(); })}>Let it go</button>
          </div>
          {cmp?.alternate?.id === a.id && (
            <div style={{ marginTop: '0.5rem' }}>
              <p className="small muted">Compared with the story as it stands:</p>
              {cmp.newQuestions.length === 0 ? <p className="small">It raises no new questions.</p> : <ul className="list">{cmp.newQuestions.map((q: any) => <li key={q.key} className="st" data-s="unanswered">{q.message}</li>)}</ul>}
              {cmp.steps.flatMap((s: any) => s.moves).map((m: any) => <div key={m.id} className="small">{m.title}: {m.from?.beat ?? '?'} → {m.to?.beat ?? '?'}</div>)}
            </div>
          )}
        </li>
      ))}</ul>
      <StartAlternate ctx={ctx} onSaved={refresh} onError={setError} />
    </>
  );
}

/** Start an alternate from scratch: its first step is one card on a different beat. */
function StartAlternate({ ctx, onSaved, onError }: { ctx: Ctx; onSaved: () => void; onError: (m: string) => void }) {
  const [cards, setCards] = useState<any[]>([]);
  const [beats, setBeats] = useState<any[]>([]);
  const [card, setCard] = useState('');
  const [beat, setBeat] = useState('');
  const [name, setName] = useState('');
  useEffect(() => {
    api.get(`/api/projects/${ctx.projectId}/board`).then((b) => {
      const all = [...b.rows.flatMap((r: any) => r.beats.flatMap((x: any) => x.cards)), ...b.unplaced];
      setCards(all.filter((c: any, i: number) => all.findIndex((x: any) => x.id === c.id) === i));
    }).catch(() => {});
    api.get(`/api/projects/${ctx.projectId}/landmarks`).then((lm) => setBeats(lm.beats)).catch(() => {});
  }, [ctx.projectId]);
  if (!cards.length || !beats.length) return null;
  const c = cards.find((x) => x.id === card);
  return (
    <section className="section">
      <h2>Start an alternate</h2>
      <p className="small muted">Its first step: one card on a different beat. Nothing in your story changes.</p>
      <form className="row" onSubmit={(e) => { e.preventDefault(); if (card && beat) void api.post(`/api/projects/${ctx.projectId}/alternates`, { name: name.trim() || `${c?.title ?? 'A card'} moved`, ops: [{ type: 'moveCard', planId: card, beatId: beat }] }).then(() => { setCard(''); setBeat(''); setName(''); onSaved(); }).catch((x) => onError(x.message)); }}>
        <select value={card} onChange={(e) => setCard(e.target.value)} aria-label="Card to move in the alternate" style={{ maxWidth: 280 }}><option value="">Choose a card…</option>{cards.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}</select>
        <select value={beat} onChange={(e) => setBeat(e.target.value)} aria-label="Beat in the alternate" style={{ maxWidth: 280 }}><option value="">Choose a beat…</option><BeatOptions beats={beats} disabled={c?.placements?.decided?.beatId} /></select>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name for the alternate" aria-label="New alternate name" style={{ maxWidth: 220 }} />
        <button className="btn" type="submit" disabled={!card || !beat}>Save as an alternate</button>
      </form>
    </section>
  );
}

// "When I'm Stuck, Start Here": one beat, what it does, its example, one sentence (R-B-021, R-C-006).
export function Stuck({ ctx, onClose, fromSceneId, onShowBeat }: { ctx: Ctx; onClose: () => void; fromSceneId?: string | null; onShowBeat?: (beatId: string) => void }) {
  const [beats, setBeats] = useState<any[]>([]);
  const [i, setI] = useState(0);
  const [detail, setDetail] = useState<any>(null);
  const [line, setLine] = useState('');
  const [saved, setSaved] = useState<{ beatId: string; name: string } | null>(null);
  // Opened from inside a scene: start at that scene's own beat, if it has one.
  const [scene, setScene] = useState<{ title: string; beatId: string } | null>(null);
  useEffect(() => {
    void (async () => {
      try {
        const lm = await api.get(`/api/projects/${ctx.projectId}/landmarks`);
        const list = lm.beats.filter((b: any) => b.number);
        setBeats(list);
        if (!fromSceneId) return;
        const c = await api.get(`/api/scenes/${fromSceneId}/context`);
        const beatId = c.card?.beat?.id ?? c.card?.mightGo?.[0]?.id ?? null;
        const at = beatId ? list.findIndex((b: any) => b.id === beatId) : -1;
        if (at >= 0) { setI(at); setScene({ title: c.scene.title, beatId }); }
      } catch { /* the first beat is still a fine place to start */ }
    })();
  }, [ctx.projectId, fromSceneId]);
  const b = beats[i];
  useEffect(() => { if (b) api.get(`/api/beats/${b.id}`).then(setDetail).catch(() => {}); setSaved(null); }, [b]);
  async function save() {
    if (!line.trim() || !b) return;
    await api.post(`/api/elements/${b.id}/statements`, { field: 'event', value: line, status: 'developing' });
    setLine(''); setSaved({ beatId: b.id, name: b.name });
  }
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="st-h" onKeyDown={(e) => e.key === 'Escape' && onClose()}><div className="dialog stuck">
      {beats.length === 0 ? <><h2 id="st-h">Start here</h2><p>Write one sentence of anything. It counts.</p><button className="btn" onClick={() => { onClose(); ctx.capture(); }}>Write one sentence</button></> : (
        <>
          <p className="small muted">{scene && b?.id === scene.beatId ? `"${scene.title}" sits at this beat. ` : ''}Read only this beat. Do not look at the others.</p>
          <h2 id="st-h">{b?.number}. {b?.name}</h2>
          {detail?.def?.description && <section className="stuck-teach"><h3 className="small">What this beat does</h3><p className="small" style={{ whiteSpace: 'pre-wrap' }}>{detail.def.description}</p></section>}
          {detail?.def?.example && <SheetExample text={detail.def.example} from={detail.def.exampleFrom} />}
          <label className="field" style={{ marginTop: '1rem' }}><span>One sentence of what happens at this beat</span><input type="text" value={line} onChange={(e) => setLine(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void save()} /></label>
          <div className="row"><button className="btn write" onClick={() => void save()}>Save the sentence</button>{saved && <span role="status" className="small">Saved. That counts. It is on the beat {saved.name}, in pencil under "What it is (your plan)". {onShowBeat && <button className="btn link small" onClick={() => onShowBeat(saved.beatId)}>See it there</button>}</span>}</div>
          <div className="section small">
            <p className="muted">Or the next smallest step:</p>
            <div className="row"><button className="btn small" onClick={() => { onClose(); ctx.go('brain'); }}>Fill in one line about a character</button><button className="btn small" onClick={() => { onClose(); ctx.capture(); }}>Write one line in a narrator's voice, complaining about anything</button></div>
          </div>
          <div className="row" style={{ marginTop: '1rem' }}>
            <button className="btn link" onClick={onClose}>Close</button>
            <span className="grow" />
            <label className="row small faint">A different beat <select value={i} onChange={(e) => setI(Number(e.target.value))} style={{ width: 'auto' }} aria-label="Which beat">{beats.map((x, j) => <option key={x.id} value={j}>{x.number}. {x.name}</option>)}</select></label>
          </div>
        </>
      )}
    </div></div>
  );
}
