import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { statusWord, AUTHOR_STATUSES, ownedWord, valueText, when } from './status';

const TIMING = [['', 'Timing'], ['backstory', 'Before the story'], ['story_start', 'True when the story opens'], ['in_story', 'Happens during the story'], ['unknown', 'Timing not decided']] as const;
const PRIMARY_GROUPS = new Set(['The scene', 'In this book', 'On the board', 'Role in the story', 'Weiland Arc', 'What it does', 'How it happens', 'The line', 'Where it goes', 'Clue', 'Place', 'Thinking it through', 'Notes', 'Where they stand']);
const RELATIONS = ['relates_to', 'causes', 'enables', 'motivates', 'depends_on', 'plants', 'pays_off', 'reveals', 'conceals', 'foreshadows', 'mirrors', 'contradicts', 'appears_in', 'pov_of', 'located_at', 'knows', 'suspects', 'believes_falsely', 'answers', 'raises', 'inspired_by', 'contains', 'part_of', 'realizes'];

// One story element, with every field showing what is decided, what is being shaped, what is still open
// and what is only an example, side by side and never merged (R-A-023, R-A-034).
export function ElementPage({ ctx, elementId, onOpen, onChanged }: { ctx: Ctx; elementId: string; onOpen: (id: string) => void; onChanged: () => void }) {
  const [page, setPage] = useState<any>(null);
  const [error, setError] = useState('');
  const [all, setAll] = useState<any[]>([]);
  const [origin, setOrigin] = useState<any>(null);
  const [showHistory, setShowHistory] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [newField, setNewField] = useState('');
  const [compare, setCompare] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = useCallback(() => api.get(`/api/elements/${elementId}/page`).then(setPage).catch((e) => setError(e.message)), [elementId]);
  useEffect(() => { void load(); api.get(`/api/projects/${ctx.projectId}/elements`).then(setAll).catch(() => {}); }, [load, ctx.projectId]);

  const el = page?.element;
  const groups = useMemo(() => {
    const g: Record<string, any[]> = {};
    for (const f of page?.fields ?? []) (g[f.def.group] ??= []).push(f);
    return g;
  }, [page]);

  async function act(p: Promise<unknown>) { try { await p; await load(); onChanged(); } catch (e) { setError((e as Error).message); } }
  const add = (elId: string, field: string, value: string, status: string, timing: string, multi: boolean, currentId?: string) =>
    act(api.post(`/api/elements/${elId}/statements`, { field, value: status === 'unanswered' && !value.trim() ? null : value, status, qualifiers: timing ? { timing } : undefined, supersedes: status === 'established' && !multi && currentId ? currentId : null }));

  if (!page) return <p className="muted">{error || 'Opening…'}</p>;

  const isChar = el.kind === 'character';
  const others = all.filter((x) => x.kind === 'character' && x.id !== el.id);

  return (
    <article>
      {error && <div className="notice error" role="alert">{error}</div>}
      {page.parent && <button className="btn link small" onClick={() => onOpen(page.parent.id)}>Back to {page.parent.title}</button>}
      <div className="row" style={{ alignItems: 'baseline' }}>
        <input className="scene-title grow" aria-label="Name" defaultValue={el.title} onBlur={(e) => { if (e.target.value.trim() && e.target.value !== el.title) void act(api.patch(`/api/elements/${el.id}`, { title: e.target.value })); }} />
      </div>
      <div className="row small" style={{ marginBottom: '1rem' }}>
        <label className="row">Kept for you
          <select value={el.reserved ?? ''} onChange={(e) => void act(api.patch(`/api/elements/${el.id}`, { reserved: e.target.value || null }))} style={{ width: 'auto' }}>
            <option value="">Not marked</option>
            {[ownedWord(ctx.settings), ...(ctx.settings.reservedMarkers as string[])].map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        {el.attrs?.written_by && <span className="chip">Written by {el.attrs.written_by === 'assistant' ? 'the assistant' : 'you'}, kept by you, placement open</span>}
        {el.attrs?.suggested && <span className="chip">Suggested by the assistant</span>}
        {(el.attrs?.turn_id) && <button className="btn link small" onClick={() => void api.get(`/api/origin?element=${el.id}`).then(setOrigin)}>Where did this come from?</button>}
      </div>
      <label className="field"><span>Notes</span>
        <textarea rows={4} defaultValue={el.body} onBlur={(e) => { if (e.target.value !== el.body) void act(api.patch(`/api/elements/${el.id}`, { body: e.target.value })); }} />
      </label>

      {page.pending.length > 0 && (
        <section className="section">
          <h3>Suggestions waiting for you</h3>
          <Suggestions ctx={ctx} items={page.pending} onDone={() => void load()} />
        </section>
      )}

      {isChar && (
        <section className="section">
          <div className="row"><h2 className="grow">Arcs</h2><button className="btn small" onClick={() => void act(api.post(`/api/projects/${ctx.projectId}/elements`, { kind: 'arc', title: `${el.title}: arc ${page.children.filter((c: any) => c.element.kind === 'arc').length + 1}`, parentId: el.id }))}>Add an arc</button></div>
          {page.children.filter((c: any) => c.element.kind === 'arc').length === 0 && <p className="muted small">No arc yet. A character can carry more than one, each on a different value.</p>}
          {page.children.filter((c: any) => c.element.kind === 'arc').map((c: any) => <ArcChain key={c.element.id} ctx={ctx} arc={c} onOpen={onOpen} />)}
          {others.length > 0 && (
            <div className="row small" style={{ marginTop: '0.75rem' }}>
              <label className="row">Read the Lies as a pair with
                <select value={compare} onChange={(e) => setCompare(e.target.value)} style={{ width: 'auto' }}><option value="">Choose a character</option>{others.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}</select>
              </label>
            </div>
          )}
          {compare && <PairedLies a={el.id} b={compare} />}
        </section>
      )}

      {isChar && (
        <section className="section">
          <h2>Guardrails</h2>
          <p className="muted small">What must stay true about this character. The assistant checks every suggestion against these.</p>
          <ul className="list">{page.guardrails.map((g: any) => <li key={g.id} className="row"><span className="grow st" data-s="established">{g.body || g.title}</span><button className="btn small" onClick={() => void act(api.del(`/api/elements/${g.id}`))}>Remove</button></li>)}</ul>
          <AddLine label="Add a guardrail" onAdd={(t) => act(api.post(`/api/projects/${ctx.projectId}/elements`, { kind: 'guardrail', title: t.slice(0, 80), body: t, parentId: el.id }))} />
        </section>
      )}

      {isChar && <FillOneLine fields={page.fields} onPick={(f) => setOpen({ ...open, [f]: true })} />}

      {Object.entries(groups).map(([group, fields]) => {
        // Empty groups stay folded so a new character never looks like a questionnaire (R-A-069).
        const hasContent = fields.some((f: any) => f.view.latest || f.view.unanswered.length || f.view.illustrative.length || f.view.currentAll.length);
        const isOpen = expanded[group] ?? (hasContent || PRIMARY_GROUPS.has(group) || fields.some((f: any) => open[f.def.field] || f.def.custom) || fields.length <= 2);
        if (!isOpen) return (
          <section key={group} className="section row">
            <button className="btn link" onClick={() => setExpanded({ ...expanded, [group]: true })} aria-expanded="false">{group}</button>
            <span className="faint small">{fields.length} place{fields.length === 1 ? '' : 's'} to write, all optional</span>
          </section>
        );
        return (
        <section key={group} className="section">
          <div className="row"><h2 className="grow">{group}</h2>{!hasContent && <button className="btn link small" onClick={() => setExpanded({ ...expanded, [group]: false })} aria-expanded="true">Fold</button>}</div>
          {fields.map((f: any) => (
            <FieldBlock key={f.def.field} ctx={ctx} elId={el.id} f={f} open={!!open[f.def.field]} setOpen={(v: boolean) => setOpen({ ...open, [f.def.field]: v })}
              showHistory={!!showHistory[f.def.field]} toggleHistory={() => setShowHistory({ ...showHistory, [f.def.field]: !showHistory[f.def.field] })}
              add={add} act={act} onOrigin={(sid: string) => void api.get(`/api/origin?statement=${sid}`).then(setOrigin)} />
          ))}
        </section>
        );
      })}

      <section className="section">
        <h3>Add your own field to every {String(el.kind).replace(/^x_/, '').replace(/_/g, ' ')}</h3>
        <form className="row" onSubmit={(e) => { e.preventDefault(); if (newField.trim()) void act(api.post(`/api/projects/${ctx.projectId}/fields`, { kind: el.kind, label: newField })).then(() => setNewField('')); }}>
          <input type="text" value={newField} onChange={(e) => setNewField(e.target.value)} placeholder="For example: Weather" aria-label="New field name" style={{ maxWidth: 320 }} />
          <button className="btn" type="submit">Add field</button>
        </form>
      </section>

      <section className="section">
        <h2>Connections</h2>
        <ul className="list">
          {page.links.map((l: any) => {
            const other = l.from_id === el.id ? { id: l.to_id, title: l.to_title } : { id: l.from_id, title: l.from_title };
            const phrase = l.from_id === el.id ? `${l.relation.replace(/_/g, ' ')} ${other.title}` : `${other.title} ${l.relation.replace(/_/g, ' ')} this`;
            return <li key={l.id} className="row"><button className="btn link grow" style={{ textAlign: 'left' }} onClick={() => onOpen(other.id)}>{phrase}</button>{l.strength === 'inferred' && <span className="chip">inferred</span>}<button className="btn small" onClick={() => void act(api.del(`/api/links/${l.id}`))}>Remove</button></li>;
          })}
        </ul>
        <LinkForm all={all.filter((x) => x.id !== el.id)} onLink={(toId, relation) => act(api.post(`/api/projects/${ctx.projectId}/links`, { fromId: el.id, toId, relation }))} />
      </section>

      <div className="row" style={{ marginTop: '2rem' }}>
        <button className="btn small danger" onClick={() => { if (window.confirm(`Move "${el.title}" to Deleted? You can restore it from there.`)) void api.del(`/api/elements/${el.id}`).then(onChanged); }}>Delete</button>
      </div>

      {origin && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="org-h" onKeyDown={(e) => e.key === 'Escape' && setOrigin(null)}>
          <div className="dialog">
            <h2 id="org-h">Where this came from</h2>
            {origin.none ? <p>This was entered directly, not from a conversation.</p> : (
              <>
                <p className="small muted">{origin.conversationTitle}, message {origin.position}, {origin.speaker} ({origin.speakerKind === 'assistant' ? 'the assistant' : origin.speakerKind === 'author' ? 'you' : 'a source'}), {when(origin.saidAt)}</p>
                <blockquote className="tail" style={{ whiteSpace: 'pre-wrap', maxHeight: '45vh', overflow: 'auto' }}>{origin.text}</blockquote>
              </>
            )}
            <button className="btn" onClick={() => setOrigin(null)}>Close</button>
          </div>
        </div>
      )}
    </article>
  );
}

function FieldBlock({ ctx, elId, f, open, setOpen, showHistory, toggleHistory, add, act, onOrigin }: any) {
  const v = f.view, d = f.def;
  const [text, setText] = useState('');
  const [status, setStatus] = useState(v.current ? 'developing' : 'developing');
  const [timing, setTiming] = useState('');
  const current: any[] = d.multi ? v.currentAll : v.current ? [v.current] : [];
  const nothing = !current.length && !v.possibilities.length && !v.unanswered.length && !v.illustrative.length;
  const row = (st: any, kind: string) => (
    <div key={st.id} className="st" data-s={kind} style={{ marginBottom: '0.4rem' }}>
      <div style={{ whiteSpace: 'pre-wrap' }}>{st.status === 'unanswered' && !valueText(st.value) ? <span className="muted">Still open</span> : valueText(st.value)}</div>
      <div className="row small faint">
        <span>{statusWord(ctx.settings, st.status)}{st.speaker_kind === 'assistant' ? ', suggested by the assistant' : st.speaker_kind === 'source' ? `, from ${st.speaker_name || 'a document'}` : ''}{st.qualifiers?.timing ? `, ${TIMING.find((t) => t[0] === st.qualifiers.timing)?.[1] ?? ''}` : ''}{st.qualifiers?.accepted_by ? ', accepted by you' : ''}, {when(st.made_at)}</span>
        {st.status !== 'established' && st.status !== 'illustrative' && <button className="btn link small" onClick={() => void act(api.post(`/api/statements/${st.id}/status`, { status: 'established', replaceCurrent: !d.multi }))}>Decide this</button>}
        {st.status === 'established' && <button className="btn link small" onClick={() => void act(api.post(`/api/statements/${st.id}/status`, { status: 'developing' }))}>Not decided after all</button>}
        {st.status !== 'set_aside' && <button className="btn link small" onClick={() => void act(api.post(`/api/statements/${st.id}/status`, { status: 'set_aside' }))}>Set aside</button>}
        {st.turn_id && <button className="btn link small" onClick={() => onOrigin(st.id)}>Where did this come from?</button>}
      </div>
    </div>
  );
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div className="row"><strong className="grow">{d.label}{d.private ? <span className="faint small"> (private, never exported)</span> : ''}{d.custom ? <span className="faint small"> (your field)</span> : ''}</strong>
        <button className="btn link small" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Add'}</button></div>
      {d.prompt && nothing && <p className="faint small" style={{ margin: 0 }}>{d.prompt}</p>}
      {d.identity && nothing && <p className="muted small" style={{ margin: 0 }}>Not yet specified</p>}
      {current.map((st) => row(st, 'established'))}
      {v.possibilities.map((st: any) => row(st, st.status))}
      {v.unanswered.map((st: any) => row(st, 'unanswered'))}
      {v.illustrative.map((st: any) => row(st, 'illustrative'))}
      {(v.setAside.length > 0 || v.history.length > 0) && <button className="btn link small" onClick={toggleHistory}>{showHistory ? 'Hide' : 'Show'} earlier and set-aside versions ({v.setAside.length + v.history.length})</button>}
      {showHistory && [...v.setAside, ...v.history].map((st: any) => (
        <div key={st.id} className="small faint" style={{ marginLeft: '1rem', whiteSpace: 'pre-wrap' }}>{valueText(st.value)} ({st.superseded_by_id ? 'replaced' : statusWord(ctx.settings, st.status)}, {when(st.made_at)})
          {st.status === 'set_aside' && <button className="btn link small" onClick={() => void act(api.post(`/api/statements/${st.id}/status`, { status: 'developing' }))}>Bring back</button>}
        </div>
      ))}
      {open && (
        <form onSubmit={(e) => { e.preventDefault(); void add(elId, d.field, text, status, timing, !!d.multi, v.current?.id).then(() => { setText(''); setOpen(false); }); }} style={{ marginTop: '0.5rem' }}>
          <textarea rows={2} autoFocus value={text} onChange={(e) => setText(e.target.value)} aria-label={d.label} />
          <div className="row small" style={{ marginTop: '0.4rem' }}>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 'auto' }} aria-label="Status">
              {AUTHOR_STATUSES.map((s) => <option key={s} value={s}>{statusWord(ctx.settings, s)}</option>)}
            </select>
            {(d.timed || d.group === 'Identity') && <select value={timing} onChange={(e) => setTiming(e.target.value)} style={{ width: 'auto' }} aria-label="Timing">{TIMING.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>}
            <button className="btn" type="submit" disabled={!text.trim() && status !== 'unanswered'}>Save</button>
            {status === 'established' && !d.multi && v.current && <span className="faint">The earlier decision stays in history.</span>}
            {status === 'developing' && <span className="faint">Sits beside any other possibilities.</span>}
          </div>
        </form>
      )}
    </div>
  );
}

function ArcChain({ ctx, arc, onOpen }: { ctx: Ctx; arc: any; onOpen: (id: string) => void }) {
  const get = (k: string) => arc.fields.find((f: any) => f.def.field === k)?.view;
  const show = (k: string) => {
    const v = get(k);
    if (!v) return null;
    if (v.current) return <div className="st" data-s="established">{valueText(v.current.value)}</div>;
    const opts = [...v.possibilities, ...v.unanswered];
    if (!opts.length) return <div className="faint small">Open</div>;
    return opts.map((o: any) => <div key={o.id} className="st" data-s={o.status}>{valueText(o.value) ? <>{valueText(o.value)} <span className="faint small">({statusWord(ctx.settings, o.status)})</span></> : statusWord(ctx.settings, o.status)}</div>);
  };
  const type = get('arc_type')?.current?.value ?? get('arc_type')?.latest?.value;
  const value = get('arc_value')?.current?.value ?? get('arc_value')?.latest?.value;
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: '0.75rem 1rem', margin: '0.5rem 0' }}>
      <div className="row"><button className="btn link grow" style={{ textAlign: 'left' }} onClick={() => onOpen(arc.element.id)}>{arc.element.title}</button><span className="small muted">{[type, value && `on ${value}`].filter(Boolean).join(' ') || 'Type and value not set'}</span></div>
      <div className="cols" style={{ gap: '0.75rem 1.5rem' }}>
        {[['ghost', 'Ghost'], ['lie', 'Lie'], ['want', 'Want'], ['need', 'Need']].map(([k, l], i) => (
          <div key={k}><div className="small muted">{i > 0 ? 'which leads to the ' : ''}{l}</div>{show(k!)}</div>
        ))}
      </div>
    </div>
  );
}

// Her name-swap test: read two characters' Lies as a pair; if the names can swap and nothing changes,
// they are doubles, not foils (R-A-082).
function PairedLies({ a, b }: { a: string; b: string }) {
  const [pair, setPair] = useState<any[] | null>(null);
  const [swap, setSwap] = useState(false);
  useEffect(() => {
    Promise.all([a, b].map(async (id) => {
      const p = await api.get(`/api/elements/${id}/page`);
      const lies = p.children.filter((c: any) => c.element.kind === 'arc').flatMap((c: any) => {
        const v = c.fields.find((f: any) => f.def.field === 'lie')?.view;
        return v ? [...(v.current ? [v.current] : []), ...v.possibilities] : [];
      });
      return { name: p.element.title as string, lies };
    })).then(setPair).catch(() => setPair([]));
  }, [a, b]);
  if (!pair) return null;
  const [x, y] = pair as [any, any];
  const sub = (t: string, from: string, to: string) => t.split(from.split(' ')[0]!).join(to.split(' ')[0]!);
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: '0.75rem 1rem', marginTop: '0.75rem' }}>
      <div className="row"><strong className="grow">The two Lies, read as a pair</strong><label className="row small"><input type="checkbox" checked={swap} onChange={(e) => setSwap(e.target.checked)} />Swap the names</label></div>
      {[x, y].map((c, i) => {
        const other = i === 0 ? y : x;
        return (
          <div key={c.name} style={{ margin: '0.5rem 0' }}>
            <div className="small muted">{swap ? other.name : c.name}</div>
            {c.lies.length === 0 ? <div className="faint small">No Lie written yet.</div> : c.lies.map((l: any) => <div key={l.id} className="st" data-s={l.status} style={{ fontFamily: 'var(--prose)' }}>{swap ? sub(valueText(l.value), c.name, other.name) : valueText(l.value)}</div>)}
          </div>
        );
      })}
      <p className="faint small" style={{ marginTop: '0.5rem' }}>If you can swap the names and nothing changes, they are doubles, not foils. A foil shows how different two people are; a double shows how alike.</p>
    </div>
  );
}

function FillOneLine({ fields, onPick }: { fields: any[]; onPick: (field: string) => void }) {
  const blocks = ['Physical', 'Personality', 'Environmental', 'Psychological'];
  const empty = fields.filter((f) => blocks.includes(f.def.group) && !f.view.latest && !f.view.unanswered.length);
  if (!empty.length) return null;
  return (
    <div className="section row small">
      <span className="grow muted">Low-energy day? One line counts.</span>
      <button className="btn small" onClick={() => { const f = empty[Math.floor(Math.random() * empty.length)]; onPick(f.def.field); setTimeout(() => document.querySelector<HTMLTextAreaElement>(`textarea[aria-label="${f.def.label}"]`)?.focus(), 50); }}>Fill in one line</button>
    </div>
  );
}

function AddLine({ label, onAdd }: { label: string; onAdd: (text: string) => Promise<unknown> }) {
  const [t, setT] = useState('');
  return <form className="row" onSubmit={(e) => { e.preventDefault(); if (t.trim()) void onAdd(t.trim()).then(() => setT('')); }} style={{ marginTop: '0.5rem' }}><input type="text" value={t} onChange={(e) => setT(e.target.value)} aria-label={label} placeholder={label} /><button className="btn" type="submit">Add</button></form>;
}

function LinkForm({ all, onLink }: { all: any[]; onLink: (toId: string, relation: string) => Promise<unknown> }) {
  const [to, setTo] = useState('');
  const [rel, setRel] = useState('relates_to');
  return (
    <form className="row" onSubmit={(e) => { e.preventDefault(); if (to) void onLink(to, rel).then(() => setTo('')); }} style={{ marginTop: '0.5rem' }}>
      <select value={rel} onChange={(e) => setRel(e.target.value)} style={{ width: 'auto' }} aria-label="Relationship">{RELATIONS.map((r) => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}</select>
      <select value={to} onChange={(e) => setTo(e.target.value)} style={{ maxWidth: 320 }} aria-label="Connect to"><option value="">Choose…</option>{all.map((x) => <option key={x.id} value={x.id}>{x.title} ({String(x.kind).replace(/^x_/, '').replace(/_/g, ' ')})</option>)}</select>
      <button className="btn" type="submit" disabled={!to}>Connect</button>
    </form>
  );
}

export function Suggestions({ ctx, items, onDone }: { ctx: Ctx; items: any[]; onDone: () => void }) {
  const [error, setError] = useState('');
  async function go(p: Promise<unknown>) { try { await p; onDone(); } catch (e) { setError((e as Error).message); } }
  return (
    <>
      {error && <div className="notice error">{error}</div>}
      <ul className="list">
        {items.map((p) => (
          <li key={p.id}>
            <div className="st" data-s="proposed" style={{ whiteSpace: 'pre-wrap' }}>{p.kind === 'statement' ? valueText(p.after?.value ?? p.after) : p.kind === 'element' ? `New ${p.after?.kind}: ${p.after?.title}` : `Connect: ${p.target.relation}`}</div>
            <div className="small faint">{statusWord(ctx.settings, 'proposed')}{p.target?.field ? `, for ${String(p.target.field).replace(/_/g, ' ')}` : ''}{p.rationale ? `. ${p.rationale}` : ''}{p.status === 'deferred' ? ' (you said not yet)' : ''}</div>
            <div className="row" style={{ marginTop: '0.3rem' }}>
              {p.kind === 'statement' && <button className="btn small" onClick={() => void go(api.post(`/api/proposals/${p.id}/accept`, { status: 'established' }))}>Accept as {statusWord(ctx.settings, 'established')}</button>}
              <button className="btn small" onClick={() => void go(api.post(`/api/proposals/${p.id}/accept`, { status: 'developing' }))}>{p.kind === 'statement' ? `Accept as ${statusWord(ctx.settings, 'developing')}` : 'Accept'}</button>
              {p.status !== 'deferred' && <button className="btn small" onClick={() => void go(api.post(`/api/proposals/${p.id}/decide`, { status: 'deferred' }))}>Not yet</button>}
              <button className="btn small" onClick={() => void go(api.post(`/api/proposals/${p.id}/decide`, { status: 'rejected' }))}>No</button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
