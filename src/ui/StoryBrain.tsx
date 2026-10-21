import { KIND_LABELS } from '../core/templates';
import { Pages } from './Pages';
import { slug } from './Help';
import { KindTeach } from './Teach';
import { worldbuildingOn, WORLD_KINDS } from '../core/catalog';
import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { ElementPage, Suggestions } from './ElementPage';
import { NotesView } from './NotesView';
import { statusWord, valueText } from './status';
import { RefText } from './RefText';

// The Story Brain: one trusted place where the story lives (R-A-043). Kinds on the left, the chosen
// record in the middle. Questions and ideas keep their own spaces (R-A-047 to R-A-050).
const MAIN = ['character', 'relationship', 'location', 'event', 'clue', 'object', 'storyline', 'theme', 'motif', 'line', 'song', 'scene_plan'];
/** One line under a kind's heading where the kind lives partly somewhere else or needs a word of context. */
const KIND_NOTE: Record<string, string> = {
  scene_plan: 'Scene cards live on the Board in Narrative Zoom, placed on their beats. Each one also has a record here, with everything you know about it.',
  act: "Your book's acts come from its beat sheet and show in Narrative Zoom. An act record here holds notes of your own about one act.",
  sequence: 'A sequence is a run of scenes that works as one movement, such as a chase or a wedding day. Records here hold your notes about them.',
  hidden_move: 'A hidden move is something a character does in secret, offstage, that the reader does not see yet. Only you see these. They also show in Narrative Zoom, under Who knows what, in story order.',
  note: 'Notes that came in from your planning documents: findings, conflicts and reminders, kept word for word. Numbers in them point back to your planning documents.',
};
type Sel = { kind: 'kind'; key: string } | { kind: 'element'; id: string; field?: string } | { kind: 'map' } | { kind: 'suggestions' } | { kind: 'notes' };

export function StoryBrain({ ctx }: { ctx: Ctx }) {
  const [kinds, setKinds] = useState<any[]>([]);
  const [els, setEls] = useState<any[]>([]);
  const [sel, setSel] = useState<Sel>(() => { try { const s = sessionStorage.getItem('ns-brain-sel'); return s ? JSON.parse(s) : { kind: 'kind', key: 'character' }; } catch { return { kind: 'kind', key: 'character' }; } });
  const [pending, setPending] = useState<any[]>([]);
  const [slips, setSlips] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [newKind, setNewKind] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');
  const [choicesCount, setChoicesCount] = useState<number | null>(null);
  const [summaries, setSummaries] = useState<Record<string, any>>({});
  // Other novels on her shelf she can bring records from (removed ones are not listed).
  const [others, setOthers] = useState<any[]>([]);
  const [bringing, setBringing] = useState(false);
  const [brought, setBrought] = useState<any>(null);

  const load = useCallback(async () => {
    try {
      const [k, e, p, sl] = await Promise.all([api.get(`/api/projects/${ctx.projectId}/kinds`), api.get(`/api/projects/${ctx.projectId}/elements`), api.get(`/api/projects/${ctx.projectId}/proposals`), api.get(`/api/projects/${ctx.projectId}/proposed-facts`)]);
      setKinds(k); setEls(e); setPending(p.filter((x: any) => x.status === 'pending' || x.status === 'deferred')); setSlips(sl);
      api.get(`/api/projects/${ctx.projectId}/open-decisions`).then((m) => setChoicesCount(m.stillOpen.length + m.choosing.length)).catch(() => {});
    } catch (er) { setError((er as Error).message); }
  }, [ctx.projectId]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { api.get('/api/projects').then((ps: any[]) => setOthers(ps.filter((p) => p.id !== ctx.projectId))).catch(() => setOthers([])); }, [ctx.projectId]);
  // What was just brought stays in view on that list only.
  useEffect(() => { if (brought && !(sel.kind === 'kind' && sel.key === brought.kind)) setBrought(null); }, [sel, brought]);
  useEffect(() => { try { sessionStorage.setItem('ns-brain-sel', JSON.stringify(sel)); } catch { /* ignore */ } }, [sel]);
  // A line about each record in a list: a few telling fields and how much is decided.
  useEffect(() => { if (sel.kind === 'kind') api.get(`/api/projects/${ctx.projectId}/summaries?kind=${encodeURIComponent(sel.key)}`).then(setSummaries).catch(() => setSummaries({})); }, [sel, els, ctx.projectId]);
  // A record from another book is never shown under this one.
  // A record just made may not be in the list yet, so look again before turning away.
  useEffect(() => {
    if (sel.kind !== 'element' || !els.length || els.some((e) => e.id === sel.id)) return;
    api.get(`/api/projects/${ctx.projectId}/elements`).then((fresh: any[]) => { if (fresh.some((e) => e.id === sel.id)) setEls(fresh); else setSel({ kind: 'kind', key: 'character' }); }).catch(() => setSel({ kind: 'kind', key: 'character' }));
  }, [els, sel, ctx.projectId]);

  const count = (k: string) => els.filter((e) => e.kind === k).length;
  // Guardrails show in the list: the ones for the whole book live nowhere else.
  const hidden = new Set(['arc', 'question', 'idea', 'thought', 'interview']);
  const world = worldbuildingOn(ctx.project?.profile?.setup);
  // Worldbuilding kinds appear only when worldbuilding is on for this book (or it already has some).
  const usual = (k: any) => MAIN.includes(k.key) || (world && WORLD_KINDS.includes(k.key)) || k.custom || count(k.key) > 0;
  const visibleKinds = kinds.filter((k) => !hidden.has(k.key) && usual(k));
  const moreKinds = kinds.filter((k) => !hidden.has(k.key) && !usual(k) && !WORLD_KINDS.includes(k.key));
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
      <aside className="binder contents" aria-label="Story Brain sections">
        <button className="scene-row" aria-current={sel.kind === 'notes' ? 'true' : undefined} onClick={() => setSel({ kind: 'notes' })}>Questions and ideas<span className="wc">{count('question') + count('idea') + count('thought')}</span></button>
        <button className="scene-row" aria-current={sel.kind === 'map' ? 'true' : undefined} onClick={() => setSel({ kind: 'map' })}>Choices ahead{choicesCount != null && <span className="wc">{choicesCount}</span>}</button>
        <button className="scene-row" aria-current={sel.kind === 'suggestions' ? 'true' : undefined} onClick={() => setSel({ kind: 'suggestions' })}>Suggestions waiting<span className="wc">{pending.length + slips.length}</span></button>
        <div className="section" />
        {visibleKinds.map((k) => (
          <button key={k.key} className="scene-row" aria-current={sel.kind === 'kind' && sel.key === k.key ? 'true' : undefined}
            // The story world is one record: open it straight away rather than a list of one.
            onClick={() => { const only = els.filter((e) => e.kind === k.key); setSel(k.key === 'storyworld' && only.length === 1 ? { kind: 'element', id: only[0].id } : { kind: 'kind', key: k.key }); }}>{k.plural}<span className="wc">{count(k.key)}</span></button>
        ))}
        {showAll && moreKinds.length > 0 && (<>
          <div className="binder-subhead">More kinds you can use</div>
          {moreKinds.map((k) => (
            <button key={k.key} className="scene-row" aria-current={sel.kind === 'kind' && sel.key === k.key ? 'true' : undefined} onClick={() => setSel({ kind: 'kind', key: k.key })}>{k.plural}<span className="wc">{count(k.key)}</span></button>
          ))}
        </>)}
        {moreKinds.length > 0 && <button className="btn link small" onClick={() => setShowAll((s) => !s)}>{showAll ? 'Show fewer kinds' : 'Show every kind'}</button>}
        <form onSubmit={addKind} className="section">
          <label className="field"><span>Add your own kind</span><input type="text" value={newKind} onChange={(e) => setNewKind(e.target.value)} placeholder="For example: Running gag" /></label>
          <button className="btn small" type="submit">Add kind</button>
        </form>
      </aside>
      <div className="pagewrap"><div className="content" style={{ maxWidth: 920 }}>
        {error && <div className="notice error" role="alert">{error}</div>}
        {sel.kind === 'notes' && <NotesView ctx={ctx} embedded onOpen={(id) => setSel({ kind: 'element', id })} />}
        {sel.kind === 'map' && <ChoicesAhead ctx={ctx} onOpen={(id) => setSel({ kind: 'element', id })} onNotes={() => setSel({ kind: 'notes' })} />}
        {sel.kind === 'suggestions' && (<>
          <h1>Suggestions waiting</h1>
          <p className="muted">A suggestion is an idea someone else offered: the collaborator, or a chat or document you brought in. Nothing here is part of your story until you accept it. Accept it as decided or as still developing, keep it waiting with "Not yet", or say no.</p>
          <Pages storeKey={`suggest:${ctx.projectId}`} label="Suggestions waiting" pages={[
            { title: `From the collaborator (${pending.length})`, filled: pending.length > 0, content: (<>
          {pending.length === 0 ? <p className="muted small">None waiting.</p> : <Suggestions ctx={ctx} items={pending} onDone={() => void load()} />}
            </>) },
            { title: `From your planning documents (${slips.length})`, filled: slips.length > 0, content: (<>
          <p className="muted small">These came in marked as suggestions ("Here's a suggestion") in a document or chat you brought in. Each sits on its record as a slip.</p>
          {slips.length === 0 ? <p className="muted small">None waiting.</p> : (
            <ul className="list">
              {slips.map((x) => (
                <li key={x.id}>
                  <div className="st" data-s="proposed" style={{ whiteSpace: 'pre-wrap' }}>{valueText(x.value)}</div>
                  <div className="small faint">For <button className="btn link small" onClick={() => setSel({ kind: 'element', id: x.element_id })}>{x.element_title}</button>, {String(x.field).replace(/^x_/, '').replace(/_/g, ' ')}{x.speaker_name ? `, from ${x.speaker_name}` : ''}</div>
                  <div className="row" style={{ marginTop: '0.3rem' }}>
                    <button className="btn small" onClick={() => void api.post(`/api/statements/${x.id}/status`, { status: 'established', replaceCurrent: true }).then(load)}>Accept as {statusWord(ctx.settings, 'established')}</button>
                    <button className="btn small" onClick={() => void api.post(`/api/statements/${x.id}/status`, { status: 'developing' }).then(load)}>Accept as {statusWord(ctx.settings, 'developing')}</button>
                    <button className="btn small" onClick={() => void api.post(`/api/statements/${x.id}/status`, { status: 'set_aside' }).then(load)}>No, set it aside</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
            </>) },
          ]} />
        </>)}
        {sel.kind === 'kind' && (
          <>
            <h1>{kindLabel(sel.key)?.plural ?? sel.key}</h1>
            {KIND_NOTE[sel.key] && <p className="kind-note">{KIND_NOTE[sel.key]}{sel.key === 'scene_plan' && <> <button className="btn link small" onClick={() => ctx.go('zoom')}>Open Narrative Zoom</button></>}</p>}
            {sel.key === 'beat' && (() => {
              const all = els.filter((e) => e.kind === 'beat');
              const subs = all.filter((e) => all.some((p) => p.id === e.parent_id));
              return subs.length > 0 ? <p className="kind-note">{all.length - subs.length} beats, plus {subs.length} smaller step{subs.length === 1 ? '' : 's'} inside them (the steps of {[...new Set(subs.map((x) => els.find((p) => p.id === x.parent_id)?.title))].join(' and ')}). The count beside Beats includes both; the Board shows the {all.length - subs.length} beats.</p> : null;
            })()}
            <KindTeach kind={sel.key} label={kindLabel(sel.key)?.plural ?? sel.key} helpAnchor={slug(`${kindLabel(sel.key)?.plural ?? sel.key}: every field`)} />
            <KindList els={els.filter((e) => e.kind === sel.key)} all={els} summaries={summaries} onOpen={(id) => setSel({ kind: 'element', id })} />
            {!(sel.key === 'storyworld' && count('storyworld') > 0) && (
            <form className="row" onSubmit={addElement} style={{ marginTop: '1.5rem' }}>
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="A name is enough to start" aria-label={`New ${kindLabel(sel.key)?.label ?? 'item'}`} style={{ maxWidth: 360 }} />
              <button className="btn" type="submit">Add {kindLabel(sel.key)?.label?.toLowerCase() ?? 'item'}</button>
            </form>)}
            {!(sel.key === 'storyworld' && count('storyworld') > 0) && (
              <div className="bring-row">
                <button className="btn small" disabled={others.length === 0} aria-describedby={others.length === 0 ? 'bring-none' : undefined} onClick={() => setBringing(true)}>Bring from another novel</button>
                {others.length === 0 && <span id="bring-none" className="small muted"> There is no other novel on your shelf to bring from yet.</span>}
              </div>
            )}
            {brought && brought.kind === sel.key && (
              <div className="notice bring-done" role="status">
                Brought {brought.brought.length} {brought.brought.length === 1 ? brought.words.one : brought.words.many} from {brought.novel}.{' '}
                {brought.brought.map((b: any, i: number) => <span key={b.id}>{i > 0 ? ', ' : ''}<button className="btn link" onClick={() => setSel({ kind: 'element', id: b.id })}>{b.title}</button></span>)}
              </div>
            )}
            {bringing && <BringDialog ctx={ctx} kind={sel.key} kindName={kindLabel(sel.key)} novels={others} onClose={() => setBringing(false)}
              onDone={(r) => { setBringing(false); setBrought({ ...r, kind: sel.key }); void load(); }} />}
            {sel.key === 'beat' && <p className="small muted">A beat you add here joins the Board after the last beat. To change the beat sheet itself, use My methods. <button className="btn link small" onClick={() => ctx.go('methods')}>Open My methods</button></p>}
          </>
        )}
        {sel.kind === 'element' && <ElementPage key={sel.id} ctx={ctx} elementId={sel.id} focusField={sel.field} onOpen={(id) => setSel({ kind: 'element', id })} onChanged={() => void load()} />}
      </div></div>
    </div>
  );
}

// A map of the choices ahead, not a to-do list: no due dates, no percentages (R-A-042).
/** "Anthony's arc" already says arc: the kind is not said twice. */
const kindInTitle = (title: string, kind: string) => !!kind && String(title).toLowerCase().endsWith(String(kind).toLowerCase());

/** Rows gathered by the kind of record they belong to, in the order kinds first appear. */
function byKind(rows: any[]): [string, any[]][] {
  const m = new Map<string, any[]>();
  for (const r of rows) { const k = (r.element_kind && KIND_LABELS[r.element_kind]?.plural) || (r.kind_label ? r.kind_label[0].toUpperCase() + r.kind_label.slice(1) : 'Other'); m.set(k, [...(m.get(k) ?? []), r]); }
  return [...m.entries()];
}

function ChoicesAhead({ ctx, onOpen, onNotes }: { ctx: Ctx; onOpen: (id: string) => void; onNotes: () => void }) {
  const [m, setM] = useState<any>(null);
  useEffect(() => { api.get(`/api/projects/${ctx.projectId}/open-decisions`).then(setM).catch(() => {}); }, [ctx.projectId]);
  if (!m) return <p className="muted">Gathering…</p>;
  return (
    <>
      <h1>Choices ahead</h1>
      <p className="muted">Not a list to finish before you write. Many of these will answer themselves as you draft.</p>
      <Pages storeKey={`choices:${ctx.projectId}`} label="Choices ahead" pages={[
        { title: `${statusWord(ctx.settings, 'unanswered')} (${m.stillOpen.length})`, filled: m.stillOpen.length > 0, content: (
          <section><p className="small muted">Places you marked as not decided yet, gathered by kind of record.</p>{m.stillOpen.length === 0 ? <p className="muted small">Nothing marked.</p> : byKind(m.stillOpen).map(([k, rows]) => (
            <div key={k} className="choices-kind"><h3>{k} <span className="faint small">({rows.length})</span></h3><ul className="list">{rows.map((s: any) => <li key={s.id} className="st" data-s="unanswered"><button className="btn link" onClick={() => onOpen(s.element_id)}>{s.element_title}</button>, {s.field_label}{valueText(s.value) ? <>: <RefText text={valueText(s.value)} projectId={ctx.projectId} /></> : ''}</li>)}</ul></div>))}</section>) },
        { title: `Possibilities (${m.choosing.length})`, filled: m.choosing.length > 0, content: (
          <section><p className="small muted">Places with ideas in pencil and no decision yet, gathered by kind of record.</p>{m.choosing.length === 0 ? <p className="muted small">None.</p> : byKind(m.choosing).map(([k, rows]) => (
            <div key={k} className="choices-kind"><h3>{k} <span className="faint small">({rows.length})</span></h3><ul className="list">{rows.map((c: any) => <li key={c.element_id + c.field} className="st" data-s="developing"><button className="btn link" onClick={() => onOpen(c.element_id)}>{c.element_title}</button>, {c.field_label} <span className="faint small">({c.options === 1 ? 'one idea so far' : `${c.options} ideas side by side`})</span></li>)}</ul></div>))}</section>) },
        { title: `Questions I have (${m.questions.length})`, filled: m.questions.length > 0, content: (
          <section><p className="small muted">Your open questions, the same ones kept in Questions and ideas. <button className="btn link small" onClick={onNotes}>Open Questions and ideas</button></p>{m.questions.length === 0 ? <p className="muted small">None open.</p> : <ul className="list">{m.questions.map((q: any) => <li key={q.id} className="st" data-s="unanswered"><button className="btn link" style={{ textAlign: 'left' }} onClick={() => onOpen(q.id)}><RefText text={q.title} inert /></button></li>)}</ul>}</section>) },
        { title: `Kept for you (${m.reserved.length})`, filled: m.reserved.length > 0, content: (
          <section>{m.reserved.length === 0 ? <p className="muted small">Nothing marked.</p> : <ul className="list">{m.reserved.map((r: any) => <li key={r.id}>{r.what === 'element' ? <button className="btn link" onClick={() => onOpen(r.id)}>{r.title}</button> : <span>{r.title} (scene)</span>} <span className="hers">{r.reserved}</span></li>)}</ul>}</section>) },
        { title: `Suggestions waiting (${m.pending.length + (m.slips ?? 0)})`, filled: m.pending.length + (m.slips ?? 0) > 0, content: (
          <section><p className="small">{m.pending.length + (m.slips ?? 0) === 0 ? 'None.' : `${m.pending.length + (m.slips ?? 0)} waiting for you, in Suggestions waiting in the list on the left.`}</p></section>) },
      ]} />
    </>
  );
}

/** A kind's records. Records inside another of the same kind (a Finale's steps) sit under it; records that belong
 *  to another kind of record (a character's hidden moves) say whose they are. */
function KindList({ els, all, summaries, onOpen }: { els: any[]; all: any[]; summaries: Record<string, any>; onOpen: (id: string) => void }) {
  const ids = new Set(els.map((e) => e.id));
  const top = els.filter((e) => !e.parent_id || !ids.has(e.parent_id));
  const kids = (id: string) => els.filter((e) => e.parent_id === id);
  if (!els.length) return <p className="muted small">None yet.</p>;
  const row = (e: any, inner = false): React.ReactNode => {
    const sm = summaries[e.id];
    const owner = e.parent_id && !ids.has(e.parent_id) ? all.find((p) => p.id === e.parent_id) : null;
    const counts = sm ? [sm.established && `${sm.established} decided`, sm.developing && `${sm.developing} developing`, sm.unanswered && `${sm.unanswered} still open`].filter(Boolean).join(', ') : '';
    return (
      <li key={e.id} className={'kind-row' + (inner ? ' inner' : '')}>
        <div className="row">
          <button className="btn link grow" style={{ textAlign: 'left', fontSize: inner ? '1rem' : '1.05rem' }} onClick={() => onOpen(e.id)}><RefText text={e.title} inert /></button>
          {e.reserved && <span className="hers">{e.reserved}</span>}
          {counts && <span className="kind-counts">{counts}</span>}
        </div>
        {(owner || sm?.bits?.length > 0) && (
          <div className="kind-summary">{owner && <span>{owner.title}. </span>}{(sm?.bits ?? []).map((b: any, i: number) => <span key={i}><span className="faint">{b.label}:</span> {b.value} </span>)}</div>
        )}
        {kids(e.id).length > 0 && <ul className="list kind-inner">{kids(e.id).map((k) => row(k, true))}</ul>}
      </li>
    );
  };
  return <ul className="list kind-list">{top.map((e) => row(e))}</ul>;
}

/**
 * Bring records from another novel on her shelf. She picks the novel, ticks the records she wants, and they come
 * over as copies, each saying where it came from. Nothing is merged and nothing in the other novel changes.
 */
function BringDialog({ ctx, kind, kindName, novels, onClose, onDone }: { ctx: Ctx; kind: string; kindName: any; novels: any[]; onClose: () => void; onDone: (r: any) => void }) {
  const [from, setFrom] = useState<string>(novels.length === 1 ? novels[0].id : '');
  const [data, setData] = useState<any>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    setData(null); setPicked(new Set()); setError('');
    if (!from) return;
    api.get(`/api/projects/${ctx.projectId}/bring?from=${encodeURIComponent(from)}&kind=${encodeURIComponent(kind)}`).then(setData).catch((e) => setError((e as Error).message));
  }, [from, kind, ctx.projectId]);
  const one = (kindName?.label ?? 'record').toLowerCase(), many = (kindName?.plural ?? 'records').toLowerCase();
  const toggle = (id: string) => setPicked((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  async function bring() {
    if (!picked.size) return;
    setBusy(true); setError('');
    try { onDone(await api.post(`/api/projects/${ctx.projectId}/bring`, { from, ids: [...picked] })); }
    catch (e) { setError((e as Error).message); setBusy(false); }
  }
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="bring-h" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="dialog">
        <h2 id="bring-h">Bring {many} from another novel</h2>
        <p className="small muted">Choose the ones you want. Each comes over as its own copy, with what you decided and what is still in pencil. Changing the copy never changes the original.</p>
        <label className="field"><span>From which novel?</span>
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            <option value="">Choose a novel</option>
            {novels.map((n) => <option key={n.id} value={n.id}>{n.title}</option>)}
          </select>
        </label>
        {error && <div className="notice error" role="alert">{error}</div>}
        {from && !data && !error && <p className="muted small">Looking…</p>}
        {data && (data.records.length === 0 ? <p className="muted">{data.novel.title} has no {many} yet.</p> : (
          <>
            <ul className="list bring-list" aria-label={`${kindName?.plural ?? 'Records'} in ${data.novel.title}`}>
              {data.records.map((r: any) => (
                <li key={r.id} className="bring-item">
                  <label className="row" style={{ alignItems: 'flex-start', gap: '0.5rem' }}>
                    <input type="checkbox" checked={picked.has(r.id)} onChange={() => toggle(r.id)} />
                    <span className="grow">
                      <strong>{r.title}</strong>
                      <span className="small muted" style={{ display: 'block' }}>{r.line}</span>
                      {r.alreadyHere && <span className="small bring-warn" style={{ display: 'block' }}>Already here: {r.title}. If you bring it, you will have two, and you can choose later what to keep.</span>}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="small muted">Connections stay behind, because the records they point to are in the other novel.</p>
          </>
        ))}
        <div className="row" style={{ marginTop: '1rem' }}>
          <button className="btn" disabled={!picked.size || busy} onClick={() => void bring()}>{picked.size ? `Bring ${picked.size} ${picked.size === 1 ? one : many}` : `Bring ${many}`}</button>
          <button className="btn link" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
