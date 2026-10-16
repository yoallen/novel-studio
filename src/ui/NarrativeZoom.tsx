import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { ElementPage } from './ElementPage';
import { valueText } from './status';

// Narrative Zoom: the whole story, an act, a beat, a scene, the page, and back, never losing your place
// (R-C-066, R-C-067); follow a character or object across the story (R-C-068); the board (R-C-004);
// beat placement under both of her models (R-C-007, R-C-008); the Ripple Effect before any move (R-C-075);
// alternate structures (D-17).

type Node = { level: 'story' } | { level: 'act'; key: string } | { level: 'beat'; id: string } | { level: 'card'; id: string } | { level: 'element'; id: string };
type Tab = 'zoom' | 'board' | 'beats' | 'alternates';
export type ZoomRequest = { node: Node; nonce: number } | null;

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
  const go = (n: Node, label?: string) => { if (view) setPath((p) => [...p.slice(-11), { label: view.title ?? 'Story', node }]); setNode(n); void label; };
  const back = () => setPath((p) => { const last = p[p.length - 1]; if (last) setNode(last.node); return p.slice(0, -1); });
  const refresh = () => setTick((t) => t + 1);

  return (
    <div className="scroll"><div className="content" style={{ maxWidth: 1180 }}>
      <div className="row" role="tablist" aria-label="Narrative Zoom" style={{ marginBottom: '1rem' }}>
        {([['zoom', 'Zoom'], ['board', 'Board'], ['beats', 'Beats and placement'], ['alternates', 'Alternate structures']] as [Tab, string][]).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={'btn small' + (tab === k ? '' : ' link')} onClick={() => setTab(k)}>{l}</button>
        ))}
        <span className="grow" />
        <button className="btn small" onClick={ctx.openStuck}>I'm stuck</button>
      </div>
      {error && <div className="notice error" role="alert">{error}</div>}
      {tab === 'zoom' && view && (
        <>
          <nav aria-label="Where you are" className="row small" style={{ marginBottom: '0.75rem' }}>
            {view.breadcrumb.map((c: any, i: number) => (
              <span key={i} className="row" style={{ gap: '0.25rem' }}>
                {i > 0 && <span className="faint">›</span>}
                {i === view.breadcrumb.length - 1 ? <strong>{c.label}</strong> : <button className="btn link small" onClick={() => go(c.node)}>{c.label}</button>}
              </span>
            ))}
            <span className="grow" />
            {path.length > 0 && <button className="btn link small" onClick={back}>Back to {path[path.length - 1]!.label}</button>}
          </nav>
          <ZoomBody ctx={ctx} view={view} go={go} onMove={setMove} refresh={refresh} />
        </>
      )}
      {tab === 'board' && <Board ctx={ctx} tick={tick} onMove={setMove} onOpen={(n) => { setTab('zoom'); go(n); }} refresh={refresh} />}
      {tab === 'beats' && <Beats ctx={ctx} tick={tick} onOpen={(n) => { setTab('zoom'); go(n); }} />}
      {tab === 'alternates' && <Alternates ctx={ctx} tick={tick} refresh={refresh} />}
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
  if (lvl === 'story') return (
    <>
      <h1>{view.title}</h1>
      {!view.hasBeats && <NoBeats ctx={ctx} refresh={refresh} />}
      {view.hasBeats && list(view.children, '')}
      {view.hasBeats && (
        <details style={{ marginTop: '1rem' }}><summary className="small muted">The three worlds</summary>
          {view.worlds.map((w: any) => <div key={w.key} style={{ margin: '0.75rem 0' }}><strong>{w.name}</strong> <span className="faint small">({w.beats.join(', ')})</span><p className="small muted" style={{ whiteSpace: 'pre-wrap' }}>{w.description}</p></div>)}
        </details>
      )}
      {view.unplaced.length > 0 && <section className="section"><h2>Scenes not on a beat yet</h2>{list(view.unplaced, '')}</section>}
    </>
  );
  if (lvl === 'act') return (<><h1>{view.title}</h1>{list(view.children, 'No beats in this act.')}</>);
  if (lvl === 'beat') {
    const d = view.def, l = view.landmark;
    return (
      <>
        <h1>{view.title}</h1>
        {l?.at?.brody && <p className="small muted">About {l.at.brody.percent.join('–')}% of the manuscript (novel percentages){l.at.snyder ? `, ${l.at.snyder.percent.join('–')}% (screenplay proportions)` : ''}{l.written?.percent != null ? `. Drafted at ${l.written.percent}%.` : '.'}</p>}
        {d && (
          <details open style={{ marginBottom: '1rem' }}><summary className="small muted">What this beat really does</summary>
            <p style={{ whiteSpace: 'pre-wrap' }}>{d.description}</p>
            {d.window && <p className="small"><strong>Where it goes:</strong> {d.window}</p>}
            {d.sceneType && <p className="small"><strong>Scene type:</strong> {d.sceneType}</p>}
            {d.test && <p className="small"><strong>A question to ask:</strong> {d.test}</p>}
            {d.example && <p className="small st" data-s="illustrative"><strong>Example from your sheet:</strong> {d.example}</p>}
          </details>
        )}
        {view.subBeats.length > 0 && <section><h2>Inside this beat</h2>{list(view.subBeats, '')}</section>}
        <section className="section"><h2>Scenes here</h2>{list(view.children, 'No scenes placed here yet.')}
          {view.candidates.length > 0 && <><h3 style={{ marginTop: '1rem' }}>Could go here</h3><ul className="list">{view.candidates.map((c: any, i: number) => <li key={i} className="st" data-s="developing"><button className="btn link" onClick={() => go(c.node)}>{c.label}</button></li>)}</ul></>}
          <AddCard ctx={ctx} beatId={view.node.id} onAdded={refresh} />
        </section>
        <section className="section"><ElementPage ctx={ctx} elementId={view.node.id} onOpen={(id) => go({ level: 'element', id })} onChanged={refresh} /></section>
      </>
    );
  }
  if (lvl === 'card') return (
    <>
      <h1>{view.title}</h1>
      <div className="row" style={{ marginBottom: '1rem' }}>
        {view.scene ? <button className="btn write" onClick={() => ctx.openScene(view.scene.id)}>Open the page</button>
          : <button className="btn write" onClick={() => void api.post(`/api/elements/${view.node.id}/write-scene`, {}).then((s) => ctx.openScene(s.id))}>Write this scene</button>}
        <button className="btn" onClick={() => onMove({ kind: 'card', planId: view.node.id, title: view.title, beatId: view.placement.decided?.beatId ?? null })}>Move…</button>
        {view.position && <span className="small muted">Scene {view.position.index} of {view.position.of}</span>}
      </div>
      <div className="cols">
        <section><h3>Placement</h3>
          {view.placement.decided ? <p className="small st" data-s="established">{view.placement.decided.name}</p> : <p className="small muted">Not on a beat yet.</p>}
          {view.placement.candidates.map((c: any) => <p key={c.statementId} className="small st" data-s="developing">Might go at {c.name}</p>)}
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
      <section className="section"><ElementPage ctx={ctx} elementId={view.node.id} onOpen={(id) => go({ level: 'element', id })} onChanged={refresh} /></section>
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

function Rel({ title, items, go }: { title: string; items: any[]; go: (n: Node) => void }) {
  if (!items.length) return null;
  return <section><h3>{title}</h3><ul className="list small">{items.map((c, i) => <li key={i}><button className="btn link small" style={{ textAlign: 'left' }} onClick={() => go(c.node)}>{c.label}</button></li>)}</ul></section>;
}

function AddCard({ ctx, beatId, onAdded }: { ctx: Ctx; beatId: string; onAdded: () => void }) {
  const [t, setT] = useState('');
  const [mode, setMode] = useState<'decide' | 'candidate'>('decide');
  return (
    <form className="row small" style={{ marginTop: '0.75rem' }} onSubmit={(e) => { e.preventDefault(); if (t.trim()) void api.post(`/api/projects/${ctx.projectId}/cards`, { title: t, beatId, mode }).then(() => { setT(''); onAdded(); }); }}>
      <input type="text" value={t} onChange={(e) => setT(e.target.value)} placeholder="A scene, in a few words" aria-label="New scene card" style={{ maxWidth: 320 }} />
      <select value={mode} onChange={(e) => setMode(e.target.value as 'decide' | 'candidate')} style={{ width: 'auto' }} aria-label="How sure"><option value="decide">It goes here</option><option value="candidate">It might go here</option></select>
      <button className="btn" type="submit">Add scene card</button>
    </form>
  );
}

// The board: four rows, beats as columns, cards under them (R-C-004). Dragging a card previews the move first.
function Board({ ctx, tick, onMove, onOpen, refresh }: { ctx: Ctx; tick: number; onMove: (m: any) => void; onOpen: (n: Node) => void; refresh: () => void }) {
  const [b, setB] = useState<any>(null);
  const [drag, setDrag] = useState<any>(null);
  useEffect(() => { api.get(`/api/projects/${ctx.projectId}/board`).then(setB).catch(() => {}); }, [ctx.projectId, tick]);
  if (!b) return <p className="muted">Laying out the board…</p>;
  if (!b.rows.some((r: any) => r.beats.length)) return <NoBeats ctx={ctx} refresh={refresh} />;
  const card = (c: any, candidate = false) => (
    <div key={c.id + (candidate ? 'c' : '')} draggable={!candidate} onDragStart={() => setDrag(c)} className="st" data-s={candidate ? 'developing' : 'established'}
      style={{ background: 'var(--page)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '0.35rem 0.5rem', margin: '0.3rem 0', cursor: candidate ? 'default' : 'grab', fontSize: '0.875rem' }}>
      <div className="row" style={{ gap: '0.3rem', flexWrap: 'nowrap' }}>
        <span className="mark" data-d={c.scene ? (c.scene.word_count > 0 ? 'drafted' : 'idea') : 'idea'} />
        <button className="btn link small grow" style={{ textAlign: 'left', padding: 0 }} onClick={() => onOpen({ level: 'card', id: c.id })}>{c.title}</button>
      </div>
      {(c.valueStart || c.valueEnd) && <div className="faint small">{valueText(c.valueStart) || '?'} → {valueText(c.valueEnd) || '?'}</div>}
      {candidate && <div className="faint small">might go here</div>}
      {c.reserved && <div className="hers">{c.reserved}</div>}
    </div>
  );
  return (
    <>
      <p className="small muted">Drag a card to another beat to see what the move would change before anything changes.</p>
      {b.rows.map((r: any) => (
        <section key={r.act} style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.05rem' }}>{r.name}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${r.beats.length}, minmax(150px, 1fr))`, gap: '0.5rem', overflowX: 'auto' }}>
            {r.beats.map((bt: any) => (
              <div key={bt.id} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag) onMove({ kind: 'card', planId: drag.id, title: drag.title, beatId: drag.placements.decided?.beatId ?? null, toBeatId: bt.id }); setDrag(null); }}
                style={{ background: 'var(--wash)', borderRadius: 'var(--r-md)', padding: '0.5rem', minHeight: '6rem' }}>
                <button className="btn link small" style={{ fontWeight: 700, padding: 0, textAlign: 'left' }} onClick={() => onOpen({ level: 'beat', id: bt.id })}>{bt.number ? `${bt.number}. ` : ''}{bt.name}</button>
                {bt.cards.map((c: any) => card(c))}
                {bt.candidates.map((c: any) => card(c, true))}
              </div>
            ))}
          </div>
        </section>
      ))}
      {b.unplaced.length > 0 && <section><h2 style={{ fontSize: '1.05rem' }}>Not on a beat yet</h2><div className="row">{b.unplaced.map((c: any) => <div key={c.id} style={{ width: 200 }}>{card(c)}</div>)}</div></section>}
    </>
  );
}

function Beats({ ctx, tick, onOpen }: { ctx: Ctx; tick: number; onOpen: (n: Node) => void }) {
  const [lm, setLm] = useState<any>(null);
  const [qs, setQs] = useState<any[]>([]);
  useEffect(() => { api.get(`/api/projects/${ctx.projectId}/landmarks`).then(setLm).catch(() => {}); api.get(`/api/projects/${ctx.projectId}/structure-questions`).then(setQs).catch(() => {}); }, [ctx.projectId, tick]);
  if (!lm) return <p className="muted">Working out the numbers…</p>;
  const wpp: number[] = lm.length.wpp;
  const range = (a: number[]) => (a[0] === a[1] ? a[0]!.toLocaleString() : `${a[0]!.toLocaleString()}–${a[1]!.toLocaleString()}`);
  return (
    <>
      <h1>Beats and placement</h1>
      <p className="small muted">{lm.length.basis === 'target' ? `Based on your target of ${lm.length.words.toLocaleString()} words.` : `No target set, so this uses what you have drafted (${lm.length.words.toLocaleString()} words). Set a target in Settings.`} Percentages are {lm.unit}. Pages are estimates at {wpp.join(' and ')} words per page.</p>
      {qs.length > 0 && <div className="notice">{qs.map((q, i) => <p key={i} style={{ margin: '0.25rem 0' }}>{q.text}</p>)}</div>}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.875rem' }}>
          <thead><tr style={{ textAlign: 'left' }}>
            <th style={{ padding: '0.4rem' }}>Beat</th>
            {lm.profiles.map((p: any) => <th key={p.key} style={{ padding: '0.4rem' }} title={p.source}>{p.name}</th>)}
            <th style={{ padding: '0.4rem' }}>Drafted</th>
          </tr></thead>
          <tbody>{lm.beats.map((b: any) => (
            <tr key={b.id} style={{ borderTop: '1px solid var(--line)' }}>
              <td style={{ padding: '0.4rem', paddingLeft: b.parentId ? '1.5rem' : '0.4rem' }}><button className="btn link small" onClick={() => onOpen({ level: 'beat', id: b.id })}>{b.number ? `${b.number}. ` : ''}{b.name}</button></td>
              {lm.profiles.map((p: any) => { const a = b.at[p.key]; return <td key={p.key} style={{ padding: '0.4rem' }}>{a ? <>{a.percent[0] === a.percent[1] ? a.percent[0] : a.percent.join('–')}%, words {range(a.words)}<br /><span className="faint">{wpp.map((w) => `p. ${range(a.pages[w])} at ${w}`).join('; ')}</span></> : <span className="faint">not set</span>}</td>; })}
              <td style={{ padding: '0.4rem' }}>{b.written ? `${b.written.percent}% (${b.written.scenes} scene${b.written.scenes === 1 ? '' : 's'})` : <span className="faint">not yet</span>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}

// Preview a move with the Ripple Effect, then make it, save it as an alternate, or leave it (R-C-075, R-C-076, D-17).
function MoveDialog({ ctx, move, onClose, onDone }: { ctx: Ctx; move: any; onClose: () => void; onDone: () => void }) {
  const [beats, setBeats] = useState<any[]>([]);
  const [to, setTo] = useState<string>(move.toBeatId ?? '');
  const [p, setP] = useState<any>(null);
  const [error, setError] = useState('');
  const [altName, setAltName] = useState('');
  useEffect(() => { api.get(`/api/projects/${ctx.projectId}/landmarks`).then((lm) => setBeats(lm.beats)).catch(() => {}); }, [ctx.projectId]);
  const op = { type: 'moveCard', planId: move.planId, beatId: to || null };
  useEffect(() => { if (!to) { setP(null); return; } api.post(`/api/projects/${ctx.projectId}/ripple/preview`, { op }).then(setP).catch((e) => setError(e.message)); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [to]);
  async function commit() { try { await api.post(`/api/projects/${ctx.projectId}/ripple/commit`, { op }); onDone(); } catch (e) { setError((e as Error).message); } }
  async function saveAlt() { try { await api.post(`/api/projects/${ctx.projectId}/alternates`, { name: altName || `${move.title} moved`, ops: [op] }); onDone(); } catch (e) { setError((e as Error).message); } }
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="mv-h" onKeyDown={(e) => e.key === 'Escape' && onClose()}><div className="dialog" style={{ width: 'min(760px, 94vw)' }}>
      <h2 id="mv-h">Move "{move.title}"</h2>
      {error && <div className="notice error">{error}</div>}
      <label className="field"><span>To</span>
        <select value={to} onChange={(e) => setTo(e.target.value)} aria-label="Move to beat"><option value="">Choose a beat…</option>{beats.map((b) => <option key={b.id} value={b.id} disabled={b.id === move.beatId}>{b.parentId ? '   ' : ''}{b.number ? `${b.number}. ` : ''}{b.name}</option>)}</select>
      </label>
      {p && (
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
      {!p && <div className="row"><button className="btn link" onClick={onClose}>Cancel</button></div>}
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
      {list && list.length === 0 && <p className="muted">None yet. When you move a card on the board, choose "Save as an alternate".</p>}
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
    </>
  );
}

// "When I'm Stuck, Start Here": one beat, its example, one sentence (R-B-021, R-C-006).
export function Stuck({ ctx, onClose }: { ctx: Ctx; onClose: () => void }) {
  const [beats, setBeats] = useState<any[]>([]);
  const [i, setI] = useState(0);
  const [detail, setDetail] = useState<any>(null);
  const [line, setLine] = useState('');
  const [saved, setSaved] = useState('');
  useEffect(() => { api.get(`/api/projects/${ctx.projectId}/landmarks`).then((lm) => setBeats(lm.beats.filter((b: any) => b.number))).catch(() => {}); }, [ctx.projectId]);
  const b = beats[i];
  useEffect(() => { if (b) api.get(`/api/beats/${b.id}`).then(setDetail).catch(() => {}); setSaved(''); }, [b]);
  async function save() {
    if (!line.trim() || !b) return;
    await api.post(`/api/elements/${b.id}/statements`, { field: 'event', value: line, status: 'developing' });
    setLine(''); setSaved('Saved. That counts.');
  }
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="st-h" onKeyDown={(e) => e.key === 'Escape' && onClose()}><div className="dialog">
      {beats.length === 0 ? <><h2 id="st-h">Start here</h2><p>Write one sentence of anything. It counts.</p><button className="btn" onClick={() => { onClose(); ctx.capture(); }}>Write one sentence</button></> : (
        <>
          <p className="small muted">Read only this beat. Do not look at the others.</p>
          <div className="row"><h2 id="st-h" className="grow">{b?.number}. {b?.name}</h2><select value={i} onChange={(e) => setI(Number(e.target.value))} style={{ width: 'auto' }} aria-label="Which beat">{beats.map((x, j) => <option key={x.id} value={j}>{x.number}. {x.name}</option>)}</select></div>
          {detail?.def?.example && <p className="st" data-s="illustrative">{detail.def.example}</p>}
          {detail?.def?.description && <details><summary className="small muted">What this beat does</summary><p className="small" style={{ whiteSpace: 'pre-wrap' }}>{detail.def.description}</p></details>}
          <label className="field" style={{ marginTop: '1rem' }}><span>One sentence of what happens at this beat</span><input type="text" value={line} onChange={(e) => setLine(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void save()} /></label>
          <div className="row"><button className="btn write" onClick={() => void save()}>Save the sentence</button>{saved && <span role="status" className="small">{saved}</span>}</div>
          <div className="section small">
            <p className="muted">Or the next smallest step:</p>
            <div className="row"><button className="btn small" onClick={() => { onClose(); ctx.go('brain'); }}>Fill in one line about a character</button><button className="btn small" onClick={() => { onClose(); ctx.capture(); }}>Write one line in a narrator's voice, complaining about anything</button></div>
          </div>
          <div className="row" style={{ marginTop: '1rem' }}><button className="btn link" onClick={onClose}>Close</button></div>
        </>
      )}
    </div></div>
  );
}
