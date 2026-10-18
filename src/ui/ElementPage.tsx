import { FieldTeach, GroupTeach, KindTeach } from './Teach';
import { slug } from './Help';
import { aiName } from '../core/io/chat-exports';
import { KIND_LABELS } from '../core/templates';
import { askAbout } from './ConversationsView';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { statusWord, AUTHOR_STATUSES, ownedWord, valueText, when } from './status';
import { RefText } from './RefText';
import { RELATION_INFO, RELATION_GROUPS, relationInfo, relationPhrase } from '../core/relations';
import { GROUP_PLAIN } from '../core/groupnames';

const TIMING = [['', 'Timing'], ['backstory', 'Before the story'], ['story_start', 'True when the story opens'], ['in_story', 'Happens during the story'], ['unknown', 'Timing not decided']] as const;
const PRIMARY_GROUPS = new Set(['Storyline', 'Set piece', 'The move', 'Motif', 'Time', 'Viewpoint', 'The scene', 'In this book', 'On the board', 'Role in the story', 'Weiland Arc', 'What it does', 'How it happens', 'The line', 'Where it goes', 'Clue', 'Place', 'Thinking it through', 'Notes', 'Where they stand']);

// One story element, with every field showing what is decided, what is being shaped, what is still open
// and what is only an example, side by side and never merged (R-A-023, R-A-034).
// How a group is titled on the page, where its stored name would not say what it is.
const GROUP_TITLES: Record<string, Record<string, { title: string; about: string }>> = {
  beat: { 'On the board': { title: "Save the Cat's questions for this beat", about: 'Save the Cat (Blake Snyder, Jessica Brody) asks these at this beat. They belong to the beat sheet, not the Board tab.' } },
};

/** `embedded`: shown inside Narrative Zoom, which already names the element and shows where it sits. */
export function ElementPage({ ctx, elementId, onOpen, onChanged, embedded }: { ctx: Ctx; elementId: string; onOpen: (id: string) => void; onChanged: () => void; embedded?: boolean }) {
  const [page, setPage] = useState<any>(null);
  const [error, setError] = useState('');
  const [all, setAll] = useState<any[]>([]);
  const [origin, setOrigin] = useState<any>(null);
  const [showHistory, setShowHistory] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [newField, setNewField] = useState('');
  const [fieldScope, setFieldScope] = useState<'every' | 'this'>('this');
  const [fieldList, setFieldList] = useState(false);
  const [compare, setCompare] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [addingArc, setAddingArc] = useState(false);
  const [arcValue, setArcValue] = useState('');
  const [preset, setPreset] = useState('');

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
  const arcs = page.children.filter((c: any) => c.element.kind === 'arc');
  const kindWord = kindLabel(el.kind).toLowerCase();
  const notes = (
    <label className="field"><span>Notes</span>
      <textarea rows={3} defaultValue={el.body} onBlur={(e) => { if (e.target.value !== el.body) void act(api.patch(`/api/elements/${el.id}`, { body: e.target.value })); }} />
    </label>
  );
  const configured = !!ctx.project?.profile?.setup?.configured;
  /** A new arc starts from what it is about, then opens on its own page to be filled in. */
  async function addArc() {
    const value = arcValue.trim();
    try {
      const a = await api.post(`/api/projects/${ctx.projectId}/elements`, { kind: 'arc', title: `${el.title}: ${value || `arc ${arcs.length + 1}`}`, parentId: el.id });
      if (value) await api.post(`/api/elements/${a.id}/statements`, { field: 'arc_value', value, status: 'developing' });
      setAddingArc(false); setArcValue(''); onChanged(); onOpen(a.id);
    } catch (e) { setError((e as Error).message); }
  }

  // The groups of places to write, in order. What is already written comes first; the empty places follow.
  // On a character, the basics (role, identity) lead and the catch-all "Other facts" comes last.
  const FIRST = isChar ? ['Role in the story', 'Identity'] : [];
  const LAST = isChar ? ['Other facts'] : [];
  const ordered = Object.entries(groups).map(([g, fs], i) => ({ g, fs: fs as any[], i, filled: (fs as any[]).some(filledField) }))
    .sort((x, y) => Number(y.filled) - Number(x.filled) || x.i - y.i);
  const lead = FIRST.map((g) => ordered.find((x) => x.g === g)).filter(Boolean) as typeof ordered;
  const tail = LAST.map((g) => ordered.find((x) => x.g === g)).filter(Boolean) as typeof ordered;
  const middle = ordered.filter((x) => !FIRST.includes(x.g) && !LAST.includes(x.g));

  const renderGroup = ({ g: group, fs: fields }: { g: string; fs: any[] }) => {
    // Empty groups stay folded so a new character never looks like a questionnaire (R-A-069).
    const hasContent = fields.some(filledField);
    const isOpen = expanded[group] ?? (hasContent || PRIMARY_GROUPS.has(group) || fields.some((f: any) => open[f.def.field] || f.def.custom) || fields.length <= 2);
    const shown = GROUP_TITLES[el.kind]?.[group];
    const title = shown ? shown.title : <GroupName group={group} />;
    if (!isOpen) return (
      <section key={group} id={secId(group)} className="section record-section row">
        <button className="btn link fold-toggle" onClick={() => setExpanded({ ...expanded, [group]: true })} aria-expanded="false"><span className="fold-mark" aria-hidden="true">▸</span>{title}</button>
        <span className="faint small">{fields.length} place{fields.length === 1 ? '' : 's'} to write, all optional</span>
        <div style={{ flexBasis: '100%' }}><GroupTeach kind={el.kind} group={group} /></div>
      </section>
    );
    return (
      <section key={group} id={secId(group)} className="section record-section">
        {/* A group that can fold shows the same triangle as every other fold in the program. */}
        {!hasContent ? <h2><button className="fold-toggle fold-head" onClick={() => setExpanded({ ...expanded, [group]: false })} aria-expanded="true"><span className="fold-mark" aria-hidden="true">▾</span>{title}</button></h2> : <h2>{title}</h2>}
        {shown?.about && <p className="small muted group-about">{shown.about}</p>}
        {!shown?.about && <GroupTeach kind={el.kind} group={group} />}
        {fields.map((f: any) => (
          <FieldBlock key={f.def.field} ctx={ctx} elId={el.id} kind={el.kind} f={f} open={!!open[f.def.field]} setOpen={(v: boolean) => setOpen({ ...open, [f.def.field]: v })}
            showHistory={!!showHistory[f.def.field]} toggleHistory={() => setShowHistory({ ...showHistory, [f.def.field]: !showHistory[f.def.field] })}
            add={add} act={act} onOrigin={(sid: string) => void api.get(`/api/origin?statement=${sid}`).then((o) => setOrigin({ ...o, factDate: madeAtOf(sid) }))} />
        ))}
      </section>
    );
  };
  const madeAtOf = (sid: string) => {
    for (const f of page.fields) for (const st of [...f.view.currentAll, ...f.view.possibilities, ...f.view.unanswered, ...f.view.illustrative, ...f.view.setAside, ...f.view.history]) if (st.id === sid) return st.made_at as string;
    return null;
  };

  // The jump list: every section on the page, in order.
  const jumpName = (g: string) => GROUP_TITLES[el.kind]?.[g]?.title ?? groupPlain(g);
  const jump: [string, string][] = [
    ...(page.pending.length ? [['sec-suggestions', 'Suggestions waiting'] as [string, string]] : []),
    ...lead.map((x) => [secId(x.g), jumpName(x.g)] as [string, string]),
    ...(isChar ? [['sec-arcs', 'Arcs'], ['sec-guardrails', 'Guardrails']] as [string, string][] : []),
    ...middle.map((x) => [secId(x.g), jumpName(x.g)] as [string, string]),
    ...(isChar ? [['sec-interview', 'Interview']] as [string, string][] : []),
    ...tail.map((x) => [secId(x.g), jumpName(x.g)] as [string, string]),
    ['sec-connections', 'Connections'],
  ];
  const between = el.kind === 'relationship' ? page.links.filter((l: any) => l.from_id === el.id && l.to_kind === 'character') : [];

  return (
    <article className="record">
      {error && <div className="notice error" role="alert">{error}</div>}
      {!embedded && page.parent && <button className="btn link small" onClick={() => onOpen(page.parent.id)}>Back to {page.parent.title}</button>}
      {!embedded && (
        <div className="row" style={{ alignItems: 'baseline' }}>
          <input className="record-title grow" aria-label="Name" defaultValue={el.title} onBlur={(e) => { if (e.target.value.trim() && e.target.value !== el.title) void act(api.patch(`/api/elements/${el.id}`, { title: e.target.value })); }} />
        </div>
      )}
      {el.kind === 'hidden_move' && (
        <label className="row small record-between">Whose move is this?
          <select value={el.parent_id ?? ''} onChange={(e) => void act(api.patch(`/api/elements/${el.id}`, { parentId: e.target.value || null }))} style={{ width: 'auto' }}>
            <option value="">Not chosen yet</option>
            {all.filter((x: any) => x.kind === 'character').map((x: any) => <option key={x.id} value={x.id}>{x.title}</option>)}
          </select>
        </label>
      )}
      {el.kind === 'relationship' && (
        <p className="record-between">{between.length
          ? <>Between {between.map((l: any, i: number) => <span key={l.id}>{i > 0 ? (i === between.length - 1 ? ' and ' : ', ') : ''}<button className="btn link" onClick={() => onOpen(l.to_id)}>{l.to_title}</button></span>)}</>
          : <span className="muted small">Connect the people in it under Connections (relates to), and they are named here.</span>}</p>
      )}
      {el.kind === 'question' && (
        <div className="question-state" role="group" aria-label="Where this question stands">
          <span className="small muted">This question is</span>
          {[['open', 'Open'], ['answered', 'Answered'], ['not_relevant', 'No longer relevant']].map(([k, l]) => (
            <button key={k} className={'btn small' + (el.state === k ? '' : ' link')} aria-pressed={el.state === k} onClick={() => void act(api.patch(`/api/elements/${el.id}`, { state: k }))}>{l}</button>
          ))}
          <span className="small muted">Write the answer under Answer below. Marking it Decided moves the question to Answered.</span>
        </div>
      )}
      <div className="row small" style={{ marginBottom: '1rem' }}>
        <label className="row">Kept for you
          <select value={el.reserved ?? ''} onChange={(e) => void act(api.patch(`/api/elements/${el.id}`, { reserved: e.target.value || null }))} style={{ width: 'auto' }}>
            <option value="">Not marked</option>
            {[ownedWord(ctx.settings), ...(ctx.settings.reservedMarkers as string[])].map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        {el.attrs?.written_by && <span className="chip">Written by {el.attrs.written_by === 'assistant' ? aiName(el.attrs.written_by_name) : 'you'}, kept by you, placement open</span>}
        {el.attrs?.suggested && <span className="chip">Suggested by {aiName(el.attrs.origin_name)}</span>}
        <button className="btn link small" onClick={() => void askAbout(ctx, { title: `About ${el.title}`, elementId: el.id }).catch((e) => setError(e.message))}>Ask about this</button>
        {(el.attrs?.turn_id) && <button className="btn link small" onClick={() => void api.get(`/api/origin?element=${el.id}`).then(setOrigin)}>Where did this come from?</button>}
      </div>
      <div className="legend" aria-hidden="true">
        <span className="st" data-s="established">{statusWord(ctx.settings, 'established')} (inked)</span>
        <span className="st" data-s="developing">{statusWord(ctx.settings, 'developing')} (pencil)</span>
        <span className="st" data-s="unanswered">{statusWord(ctx.settings, 'unanswered')} (a blank)</span>
        <span className="st" data-s="illustrative">{statusWord(ctx.settings, 'illustrative')}, never canon</span>
        <span className="legend-slip">{statusWord(ctx.settings, 'proposed')} (a slip, tucked in)</span>
      </div>
      {jump.length >= 4 && (
        <nav className="jump-list" aria-label="On this page">
          <span className="jump-head">On this page</span>
          {jump.map(([id, t]) => <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); const g = ordered.find((x) => secId(x.g) === id); if (g) setExpanded((ex) => ({ ...ex, [g.g]: true })); window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30); }}>{t}</a>)}
        </nav>
      )}
      <KindTeach kind={el.kind} label={kindPlural(el.kind)} helpAnchor={slug(`${kindPlural(el.kind)}: every field`)} />
      {!embedded && notes}

      {page.pending.length > 0 && (
        <section className="section record-section" id="sec-suggestions">
          <h3>Suggestions waiting for you</h3>
          <Suggestions ctx={ctx} items={page.pending} onDone={() => void load()} />
        </section>
      )}

      {lead.map(renderGroup)}

      {isChar && (
        <section className="section record-section" id="sec-arcs">
          <div className="row"><h2 className="grow">Arcs</h2>{!addingArc && <button className="btn small" onClick={() => setAddingArc(true)}>Add an arc</button>}</div>
          {addingArc && (
            <form className="arc-new" onSubmit={(e) => { e.preventDefault(); void addArc(); }}>
              <label className="field"><span>What part of life is this arc about?</span>
                <input type="text" autoFocus value={arcValue} onChange={(e) => setArcValue(e.target.value)} placeholder="A value, such as trust, courage or belonging" />
              </label>
              <p className="small muted">An arc follows one value as it changes. A character can carry more than one. The arc opens on its own page, where you fill in its Ghost, Lie, Want and Need.</p>
              <div className="row"><button className="btn" type="submit">Add the arc</button><button className="btn link" type="button" onClick={() => { setAddingArc(false); setArcValue(''); }}>Cancel</button></div>
            </form>
          )}
          {arcs.length === 0 && !addingArc && <p className="muted small">No arc yet. A character can carry more than one, each on a different value.</p>}
          {arcs.map((c: any) => <ArcChain key={c.element.id} ctx={ctx} arc={c} onOpen={onOpen} />)}
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
        <section className="section record-section" id="sec-guardrails">
          <h2>Guardrails</h2>
          <p className="muted small">What must stay true about this character. The collaborator checks every suggestion against these.</p>
          <ul className="list">{page.guardrails.map((g: any) => <li key={g.id} className="row"><span className="grow st" data-s="established">{g.body || g.title}</span><button className="btn small" onClick={() => void act(api.del(`/api/elements/${g.id}`))}>Remove</button></li>)}</ul>
          <AddLine label="Add a guardrail" onAdd={(t) => act(api.post(`/api/projects/${ctx.projectId}/elements`, { kind: 'guardrail', title: t.slice(0, 80), body: t, parentId: el.id }))} />
        </section>
      )}

      {isChar && <AcrossTime elId={el.id} tick={page} onOpen={onOpen} />}

      {isChar && <FillOneLine fields={page.fields} onPick={(f) => setOpen({ ...open, [f]: true })} />}

      {middle.map(renderGroup)}

      {isChar && !configured && (
        <p className="small muted section">More places to write come with the methods you choose in Novel setup, such as goal and motive (Ingermanson) or the wound and its fallout. <button className="btn link small" onClick={() => ctx.go('setup')}>Open Novel setup</button></p>
      )}

      {isChar && <Interview ctx={ctx} el={el} items={page.children.filter((c: any) => c.element.kind === 'interview')} act={act} />}

      {tail.map(renderGroup)}

      {el.kind === 'line' && (
        <div className="section row small">
          <span className="grow muted">Keeping a line does not place it. To tie it to a scene, connect it with "appears in" and the scene card.</span>
          <button className="btn small" onClick={() => { setPreset('appears_in|forward'); document.getElementById('sec-connections')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Tie it to a scene</button>
        </div>
      )}

      {embedded && notes}

      <section className="section record-section">
        <h3>Add your own field</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!newField.trim()) return;
          const req = fieldScope === 'this' ? api.post(`/api/elements/${el.id}/own-fields`, { label: newField, multi: fieldList }) : api.post(`/api/projects/${ctx.projectId}/fields`, { kind: el.kind, label: newField, multi: fieldList });
          void act(req).then(() => { setNewField(''); setFieldList(false); });
        }}>
          <div className="row">
            <input type="text" value={newField} onChange={(e) => setNewField(e.target.value)} placeholder="For example: Weather" aria-label="New field name" style={{ maxWidth: 320 }} />
            <button className="btn" type="submit">Add field</button>
          </div>
          <div className="row small" role="group" aria-label="Where the field goes" style={{ marginTop: '0.5rem' }}>
            <label className="choice-pill"><input type="radio" name={`scope-${el.id}`} checked={fieldScope === 'this'} onChange={() => setFieldScope('this')} />Just this {kindWord}</label>
            <label className="choice-pill"><input type="radio" name={`scope-${el.id}`} checked={fieldScope === 'every'} onChange={() => setFieldScope('every')} />Every {kindWord}</label>
            <label className="row"><input type="checkbox" checked={fieldList} onChange={(e) => setFieldList(e.target.checked)} />A list, with several entries</label>
          </div>
        </form>
      </section>

      <Connections ctx={ctx} el={el} links={page.links} all={all} preset={preset} onOpen={onOpen} act={act} />

      {el.kind === 'beat' ? (
        <div className="row small remove-beat" style={{ marginTop: '2.5rem' }}>
          <button className="btn small" onClick={() => { if (window.confirm(`Remove the beat "${el.title}" from this novel?\n\nYour notes on it go to Deleted, where you can restore them. Scene cards placed on it are kept and go back to "Not on a beat yet".`)) void api.del(`/api/elements/${el.id}`).then(onChanged); }}>Remove this beat from the novel</button>
          <span className="faint">Only if this book does not use it. Your scene cards stay.</span>
        </div>
      ) : (
        <div className="row" style={{ marginTop: '2rem' }}>
          <button className="btn small danger" onClick={() => { if (window.confirm(`Move "${el.title}" to Deleted? You can restore it from there.`)) void api.del(`/api/elements/${el.id}`).then(onChanged); }}>Delete</button>
        </div>
      )}



      {origin && <OriginDialog ctx={ctx} origin={origin} onClose={() => setOrigin(null)} />}
    </article>
  );
}

const filledField = (f: any) => !!(f.view.latest || f.view.unanswered.length || f.view.illustrative.length || f.view.currentAll.length);

function FieldBlock({ ctx, elId, kind, f, open, setOpen, showHistory, toggleHistory, add, act, onOrigin }: any) {
  const v = f.view, d = f.def;
  const [text, setText] = useState('');
  const [status, setStatus] = useState(v.current ? 'developing' : 'developing');
  const [timing, setTiming] = useState('');
  const current: any[] = d.multi ? v.currentAll : v.current ? [v.current] : [];
  const nothing = !current.length && !v.possibilities.length && !v.unanswered.length && !v.illustrative.length;
  const row = (st: any, kind: string) => (
    <div key={st.id} className="st fact" data-s={kind}>
      <div style={{ whiteSpace: 'pre-wrap' }}>{st.status === 'unanswered' && !valueText(st.value) ? <span className="muted">Still open: nothing written yet</span> : <RefText text={valueText(st.value)} projectId={ctx.projectId} />}</div>
      {/* The margin: what this is (its status, loud), where it came from, when, then what she can do with it. */}
      <div className="fact-margin">
        <span className="fact-line"><span className="fact-status" data-s={st.status}>{statusWord(ctx.settings, st.status)}</span><time className="fact-when" dateTime={st.made_at}>{when(st.made_at)}</time></span>
        {(st.speaker_kind === 'assistant' || st.speaker_kind === 'source' || st.qualifiers?.accepted_by) && (
          <span className="fact-source">{st.speaker_kind === 'assistant' ? `Suggested by ${aiName(st.speaker_name)}` : st.speaker_kind === 'source' ? `From ${st.speaker_name || 'a document'}` : ''}{st.qualifiers?.accepted_by ? `${st.speaker_kind === 'assistant' || st.speaker_kind === 'source' ? ', accepted by you' : 'Accepted by you'}` : ''}</span>
        )}
        {st.qualifiers?.timing && <span className="fact-source">{TIMING.find((t) => t[0] === st.qualifiers.timing)?.[1] ?? ''}</span>}
        <div className="fact-actions" role="group" aria-label="What you can do with this">
          {st.status === 'unanswered' && !valueText(st.value) && <button className="btn fact-act primary" onClick={() => setOpen(true)}>Write it</button>}
          {st.status !== 'established' && st.status !== 'illustrative' && !(st.status === 'unanswered' && !valueText(st.value)) && <button className="btn fact-act primary" onClick={() => void act(api.post(`/api/statements/${st.id}/status`, { status: 'established', replaceCurrent: !d.multi }))}>Decide this</button>}
          {st.status === 'established' && <button className="btn fact-act" onClick={() => void act(api.post(`/api/statements/${st.id}/status`, { status: 'developing' }))}>Not decided after all</button>}
          {st.status !== 'set_aside' && <button className="btn fact-act" onClick={() => void act(api.post(`/api/statements/${st.id}/status`, { status: 'set_aside' }))}>Set aside</button>}
          {(st.turn_id || st.excerpt_id || st.note) && <button className="btn fact-act" onClick={() => onOrigin(st.id)}>Where did this come from?</button>}
        </div>
      </div>
    </div>
  );
  return (
    <div className="field-block" style={{ marginBottom: '1rem' }}>
      <div className="row"><strong className="grow">{d.label}{d.private ? <span className="faint small"> (private, never exported)</span> : ''}{d.custom ? <span className="faint small"> ({d.own ? 'your field, here only' : 'your field'})</span> : ''}</strong>
        {d.custom && !d.own && d.id && <button className="btn link small faint" title="Takes this field off every record of this kind. Anything written in it stays in Story Trail and search." onClick={() => { if (window.confirm(`Remove your field "${d.label}" from every record of this kind?\n\nAnything already written in it stays in Story Trail and search.`)) void act(api.del(`/api/fields/${d.id}`)); }}>Remove field</button>}
        <button className="btn link small" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Add'}</button></div>
      <FieldTeach kind={kind} field={d.field} hint={d.prompt} />
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
          {d.suggestions?.length > 0 && (
            <div className="suggest" role="group" aria-label={`Suggestions for ${d.label}`}>
              {d.suggestions.map((w: string) => <button key={w} type="button" className="chip" aria-pressed={text === w} onClick={() => setText(w)}>{w}</button>)}
              <span className="faint small">or your own words</span>
            </div>
          )}
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
    if (v.current) return <div className="st" data-s="established"><RefText text={valueText(v.current.value)} projectId={ctx.projectId} /></div>;
    const opts = [...v.possibilities, ...v.unanswered];
    if (!opts.length) return <button className="blank-line" aria-label={`Write the ${k}`} title="Open the arc to write this" onClick={() => onOpen(arc.element.id)} />;
    return opts.map((o: any) => <div key={o.id} className="st" data-s={o.status}>{valueText(o.value) ? <><RefText text={valueText(o.value)} projectId={ctx.projectId} /> <span className="faint small">({statusWord(ctx.settings, o.status)})</span></> : statusWord(ctx.settings, o.status)}</div>);
  };
  const type = get('arc_type')?.current?.value ?? get('arc_type')?.latest?.value;
  const value = get('arc_value')?.current?.value ?? get('arc_value')?.latest?.value;
  const chain = [['ghost', 'Ghost'], ['lie', 'Lie'], ['want', 'Want'], ['need', 'Need']].filter(([k]) => get(k!));
  return (
    <div className="arc-sheet">
      <div className="row" style={{ alignItems: 'baseline' }}>
        <button className="arc-title grow" onClick={() => onOpen(arc.element.id)}>{arc.element.title}</button>
        <button className="btn small" onClick={() => onOpen(arc.element.id)} aria-label={`Open and change ${arc.element.title}`}>Open and change</button>
      </div>
      <p className="small" style={{ margin: '0 0 0.75rem' }}>
        {type ? <span className="chip">{valueText(type)}</span> : <span className="muted">Arc type not set</span>}{' '}
        {value ? <span className="muted">About {valueText(value)}.</span> : <span className="muted">What it is about is not set.</span>}
      </p>
      {chain.length > 0 ? (
        <div className="cols" style={{ gap: '0.75rem 1.5rem' }}>
          {chain.map(([k, l], i) => (
            <div key={k}><div className="small muted">{i > 0 ? 'which leads to the ' : ''}{l}</div>{show(k!)}</div>
          ))}
        </div>
      ) : <p className="small muted">Open the arc to write where it starts, how it turns and who they are at the end. Weiland's Ghost, Lie, Want and Need come with Weiland in Novel setup.</p>}
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
      <div className="row"><strong className="grow">The two Lies, read as a pair</strong><label className="row small" title="A reading test only. Nothing you wrote is changed."><input type="checkbox" checked={swap} onChange={(e) => setSwap(e.target.checked)} />Read with the names swapped</label></div>
      {[x, y].map((c, i) => {
        const other = i === 0 ? y : x;
        return (
          <div key={c.name} style={{ margin: '0.5rem 0' }}>
            <div className="small muted">{swap ? other.name : c.name}</div>
            {c.lies.length === 0 ? <div className="faint small">No Lie written yet.</div> : c.lies.map((l: any) => <div key={l.id} className="st" data-s={l.status} style={{ fontFamily: 'var(--prose)' }}>{swap ? sub(valueText(l.value), c.name, other.name) : valueText(l.value)}</div>)}
          </div>
        );
      })}
      <p className="faint small" style={{ marginTop: '0.5rem' }}>The swap is a reading test and changes nothing you wrote. If you can swap the names and nothing changes, they are doubles, not foils. A foil shows how different two people are; a double shows how alike.</p>
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

/** A character across the book: their selves, and their age in every scene they are in. */
function AcrossTime({ elId, tick, onOpen }: { elId: string; tick: unknown; onOpen: (id: string) => void }) {
  const [d, setD] = useState<any>(null);
  useEffect(() => { api.get(`/api/elements/${elId}/across-time`).then(setD).catch(() => setD(null)); }, [elId, tick]);
  if (!d || (!d.selves.length && d.born == null && d.fixedAge == null)) return null;
  const aged = d.scenes.filter((x: any) => x.age != null);
  return (
    <section className="section record-section" aria-label="Across time">
      <h2>Across time</h2>
      {d.selves.length > 0 && (
        <>
          <h3 className="small">The same person at other ages</h3>
          <ul className="list">{d.selves.map((x: any) => <li key={x.id}><button className="btn link" style={{ padding: 0 }} onClick={() => onOpen(x.id)}>{x.title}</button>{x.age != null ? `, ${x.age}` : ''}</li>)}</ul>
        </>
      )}
      {(d.born != null || d.fixedAge != null) && (
        aged.length ? (
          <>
            <h3 className="small">Age in each scene</h3>
            <ul className="list small">{aged.map((x: any) => <li key={x.sceneId}>{x.chapter}, {x.title}{x.year != null ? ` (${x.year})` : ''}: {x.age}</li>)}</ul>
          </>
        ) : <p className="small muted">{d.fixedAge != null ? `Always ${d.fixedAge}.` : 'Give scenes a year, and connect this character to them, to see their age in each.'}</p>
      )}
    </section>
  );
}

/** Interview a character: questions answered in their own voice, kept in pencil. */
function Interview({ ctx, el, items, act }: { ctx: Ctx; el: any; items: any[]; act: (p: Promise<unknown>) => Promise<unknown> }) {
  const [sets, setSets] = useState<any[]>([]);
  const [own, setOwn] = useState('');
  useEffect(() => { api.get('/api/interview-sets').then(setSets).catch(() => {}); }, []);
  const latest = (it: any, k: string) => { const v = it.fields.find((f: any) => f.def.field === k)?.view; return v?.current ?? v?.latest ?? v?.possibilities?.[0] ?? null; };
  const save = (it: any, k: string, value: string) => {
    const cur = latest(it, k);
    if ((cur?.value ?? '') === value || (!cur && !value.trim())) return;
    void act(api.post(`/api/elements/${it.element.id}/statements`, { field: k, value: value.trim() || '(no answer)', status: 'developing', supersedes: cur?.id ?? null }));
  };
  const setOf = (it: any) => { try { return (JSON.parse(it.element.attrs_json || '{}').set as string) ?? ''; } catch { return ''; } };
  const bySet = (key: string) => items.filter((it) => setOf(it) === key);
  const groups = [...sets.map((x) => ({ key: x.key, name: x.name, about: x.about })), { key: '', name: 'Your own questions', about: '' }].filter((g) => bySet(g.key).length);
  return (
    <section className="section record-section" id="sec-interview" aria-label="Interview">
      <div className="row"><h2 className="grow">Interview {el.title}</h2></div>
      {items.length === 0 && <p className="muted small">Ask {el.title} questions and answer in their own voice. Answers stay in pencil.</p>}
      {groups.map((g) => (
        <div key={g.key} style={{ marginBottom: '1rem' }}>
          <h3 className="small">{g.name}</h3>
          {g.about && <p className="small muted">{g.about}</p>}
          {bySet(g.key).map((it) => (
            <div key={it.element.id} className="interview-q">
              <label className="field"><span>{it.element.title}</span>
                <textarea rows={2} defaultValue={String(latest(it, 'answer')?.value ?? '').replace(/^\(no answer\)$/, '')} onBlur={(e) => save(it, 'answer', e.target.value)} placeholder={`As ${el.title}…`} />
              </label>
            </div>
          ))}
        </div>
      ))}
      {sets.filter((x) => !bySet(x.key).length).map((x) => (
        <div key={x.key} className="interview-set">
          <button className="btn small" onClick={() => void act(api.post(`/api/elements/${el.id}/interview`, { set: x.key }))}>Add the questions: {x.name}</button>
          <p className="small muted">{x.about}</p>
        </div>
      ))}
      <form className="row" style={{ marginTop: '0.5rem' }} onSubmit={(e) => { e.preventDefault(); if (own.trim()) void act(api.post(`/api/elements/${el.id}/interview`, { question: own })).then(() => setOwn('')); }}>
        <input type="text" value={own} onChange={(e) => setOwn(e.target.value)} placeholder="A question of your own" aria-label="Your own interview question" style={{ maxWidth: 360 }} />
        <button className="btn small" type="submit" disabled={!own.trim()}>Ask</button>
      </form>
    </section>
  );
}

function kindPlural(kind: string) { return KIND_LABELS[kind]?.plural ?? String(kind).replace(/^x_/, '').replace(/_/g, ' '); }

function kindLabel(kind: string) { return KIND_LABELS[kind]?.label ?? String(kind).replace(/^x_/, '').replace(/_/g, ' '); }
const secId = (group: string) => 'sec-' + group.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const groupPlain = (group: string) => GROUP_PLAIN[group]?.name ?? group;

/** A group heading: a plain name first, and the teacher it comes from in small type. */
function GroupName({ group }: { group: string }) {
  const g = GROUP_PLAIN[group];
  return g ? <>{g.name} <span className="group-from">({g.from})</span></> : <>{group}</>;
}

// Connections, read the right way round on this page and gathered by what they say, so fifteen
// "appears in" rows become one line with fifteen names. Every connection word is explained where it is chosen.
function Connections({ ctx, el, links, all, preset, onOpen, act }: { ctx: Ctx; el: any; links: any[]; all: any[]; preset: string; onOpen: (id: string) => void; act: (p: Promise<unknown>) => Promise<unknown> }) {
  const grouped: { key: string; heading: string; rows: { l: any; other: { id: string; title: string; kind: string } }[] }[] = [];
  for (const l of links) {
    const fwd = l.from_id === el.id;
    const other = fwd ? { id: l.to_id, title: l.to_title, kind: l.to_kind } : { id: l.from_id, title: l.from_title, kind: l.from_kind };
    const info = relationInfo(l.relation);
    let key = `${l.relation}|${fwd ? 'f' : 'b'}`;
    let heading = `${el.title} ${(fwd ? info.forward : info.back).replace('{x}', '…')}`;
    if (l.relation === 'relates_to' && !fwd && l.from_kind === 'relationship') { key = 'in-relationship'; heading = `${el.title} is in these relationships`; }
    if (l.relation === 'relates_to' && fwd && el.kind === 'relationship' && l.to_kind === 'character') { key = 'between'; heading = 'The people in it'; }
    let g = grouped.find((x) => x.key === key);
    if (!g) { g = { key, heading, rows: [] }; grouped.push(g); }
    g.rows.push({ l, other });
  }
  const anyInferred = links.some((l) => l.strength === 'inferred');
  return (
    <section className="section record-section" id="sec-connections">
      <h2>Connections</h2>
      <p className="small muted">How this {kindLabel(el.kind).toLowerCase()} ties to the rest of the story. Each heading reads from here outward.</p>
      {anyInferred && <p className="small muted"><span className="chip">inferred</span> means the program worked the connection out from your planning (for example, a character named in a scene's plan) rather than you drawing it. Point at it to see why. Remove any that are wrong.</p>}
      {grouped.length === 0 && <p className="small muted">None yet.</p>}
      {grouped.map((g) => (
        <div key={g.key} className="conn-group">
          <h3 className="conn-verb">{g.heading}</h3>
          <ul className="list conn-list">
            {g.rows.map(({ l, other }) => (
              <li key={l.id} className="row">
                <button className="btn link grow" style={{ textAlign: 'left' }} onClick={() => onOpen(other.id)}>{other.title} <span className="faint small">{kindLabel(other.kind).toLowerCase()}</span></button>
                {l.strength === 'inferred' && <span className="chip" title={l.note || 'Worked out by the program, not drawn by you.'}>inferred</span>}
                <button className="btn small" onClick={() => void act(api.del(`/api/links/${l.id}`))}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <LinkForm el={el} all={all.filter((x) => x.id !== el.id)} preset={preset} onLink={(toId, relation, back) => act(api.post(`/api/projects/${ctx.projectId}/links`, back ? { fromId: toId, toId: el.id, relation } : { fromId: el.id, toId, relation }))} />
    </section>
  );
}

function LinkForm({ el, all, preset, onLink }: { el: any; all: any[]; preset: string; onLink: (toId: string, relation: string, back: boolean) => Promise<unknown> }) {
  const [to, setTo] = useState('');
  const [choice, setChoice] = useState(preset || 'relates_to|forward');
  useEffect(() => { if (preset) setChoice(preset); }, [preset]);
  const [rel, dir] = choice.split('|') as [string, 'forward' | 'back'];
  const info = relationInfo(rel);
  const target = all.find((x) => x.id === to);
  // Targets gathered under their kind, in name order.
  const byKind = new Map<string, any[]>();
  for (const x of [...all].sort((a, b) => String(a.title).localeCompare(String(b.title)))) {
    const k = KIND_LABELS[x.kind]?.plural ?? kindLabel(x.kind);
    byKind.set(k, [...(byKind.get(k) ?? []), x]);
  }
  return (
    <form className="link-form" onSubmit={(e) => { e.preventDefault(); if (to) void onLink(to, rel, dir === 'back').then(() => setTo('')); }}>
      <h3 className="small">Make a connection</h3>
      <div className="row">
        <span className="link-from">{el.title}</span>
        <select value={choice} onChange={(e) => setChoice(e.target.value)} style={{ width: 'auto', maxWidth: 280 }} aria-label="Relationship">
          {RELATION_GROUPS.map((grp) => (
            <optgroup key={grp} label={grp}>
              {RELATION_INFO.filter((r) => r.group === grp).flatMap((r) => [
                <option key={`${r.key}|forward`} value={`${r.key}|forward`}>{r.forward}</option>,
                ...(r.back !== r.forward ? [<option key={`${r.key}|back`} value={`${r.key}|back`}>{r.back.replace('{x}', '…')}</option>] : []),
              ])}
            </optgroup>
          ))}
        </select>
        <select value={to} onChange={(e) => setTo(e.target.value)} style={{ maxWidth: 320 }} aria-label="Connect to">
          <option value="">Choose…</option>
          {[...byKind.entries()].map(([k, xs]) => <optgroup key={k} label={k}>{xs.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}</optgroup>)}
        </select>
        <button className="btn" type="submit" disabled={!to}>Connect</button>
      </div>
      <p className="small link-reads"><span className="muted">Reads:</span> <strong>{el.title} {relationPhrase(rel, dir, target ? target.title : '…')}</strong>{info.about ? <><br /><span className="muted">{info.about}</span></> : null}</p>
    </form>
  );
}

const ORIGIN_STATUS: Record<string, string> = { established: 'established', decided: 'established', developing: 'developing', open: 'unanswered', 'still open': 'unanswered', proposed: 'proposed', suggestion: 'proposed', illustrative: 'illustrative', example: 'illustrative', 'set aside': 'set_aside' };
const ORIGIN_KEYS: Record<string, string> = { Field: 'About', Value: 'What it says', Status: 'Status in your planning', Sources: 'Where your planning got it', History: 'How it changed', Statement: 'What it says', Question: 'The question', Rule: 'The rule' };

/** Where a fact came from, in readable words: the document and row, the passage itself, and the conversation. */
function OriginDialog({ ctx, origin, onClose }: { ctx: Ctx; origin: any; onClose: () => void }) {
  const doc = origin.document;
  const text: string = doc?.text ?? '';
  const lines = text.split('\n').map((l) => l.match(/^([A-Z][A-Za-z ]{1,30}): (.*)$/)).filter(Boolean) as RegExpMatchArray[];
  const structured = lines.length >= 2 && lines.length === text.split('\n').filter((l) => l.trim()).length;
  // The original passages a row points to: paragraphs of her Story Bible.
  const [passages, setPassages] = useState<any[]>([]);
  useEffect(() => {
    const src = (lines.find((m) => m[1] === 'Sources')?.[2] ?? '') + ' ' + (origin.note ?? '');
    const codes = new Set<string>();
    for (const m of src.matchAll(/\bSB (L\d+(?:[-–]\d+)?(?:, L\d+(?:[-–]\d+)?)*)/g)) for (const x of m[1]!.matchAll(/L(\d+)/g)) codes.add(`SB L${x[1]}`);
    if (!codes.size) return;
    api.get(`/api/projects/${ctx.projectId}/refs?codes=${encodeURIComponent([...codes].slice(0, 6).join('|'))}`).then((r: any[]) => setPassages(r.filter((x) => x.text))).catch(() => {});
  }, [origin]);
  const status = (v: string) => { const k = ORIGIN_STATUS[v.trim().toLowerCase()]; return k ? statusWord(ctx.settings, k) : v; };
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="org-h" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="dialog">
        <h2 id="org-h">Where this came from</h2>
        {origin.none ? <p>This was entered directly, not from a conversation or a document.</p> : (
          <div style={{ maxHeight: '65vh', overflow: 'auto' }}>
            {doc && (
              <>
                <p className="small">From <strong>{doc.name}</strong>{doc.locator ? <>, <RefText text={String(doc.locator)} projectId={ctx.projectId} /></> : ''}</p>
                {(doc.madeAt || origin.factDate) && (
                  <p className="small muted">
                    {origin.factDate ? `The fact is dated ${when(origin.factDate)}, when it was settled in your planning. ` : ''}
                    {doc.madeAt ? `The document that carried it in is dated ${when(doc.madeAt)}.` : ''}
                  </p>
                )}
                {text && (structured ? (
                  <dl className="origin-rows">
                    {lines.map((m, i) => (
                      <div key={i}><dt>{ORIGIN_KEYS[m[1]!] ?? m[1]}</dt><dd>{m[1] === 'Status' ? status(m[2]!) : <RefText text={m[2]!} projectId={ctx.projectId} />}</dd></div>
                    ))}
                  </dl>
                ) : <blockquote className="tail" style={{ whiteSpace: 'pre-wrap' }}><RefText text={text} projectId={ctx.projectId} /></blockquote>)}
                {passages.length > 0 && (
                  <>
                    <h3 className="small">The original passage{passages.length === 1 ? '' : 's'}</h3>
                    {passages.map((p) => (
                      <div key={p.code} className="origin-passage">
                        <p className="small muted">{p.what}{p.locator ? `, under ${String(p.locator).replace(/, paragraph \d+$/, '')}` : ''}</p>
                        <blockquote className="tail" style={{ whiteSpace: 'pre-wrap' }}>{p.text}</blockquote>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
            {origin.note && !doc && <p className="small" style={{ whiteSpace: 'pre-wrap' }}><RefText text={origin.note} projectId={ctx.projectId} /></p>}
            {origin.hasTurn !== false && origin.conversationTitle && (
              <>
                <h3 className="small">In the conversation</h3>
                <p className="small muted">{origin.conversationTitle}, message {origin.position}, {origin.speaker} ({origin.speakerKind === 'assistant' ? (aiName(origin.speaker) === 'the collaborator' ? 'the collaborator' : 'an AI') : origin.speakerKind === 'author' ? 'you' : 'a source'}), {when(origin.saidAt)}</p>
                <blockquote className="tail" style={{ whiteSpace: 'pre-wrap' }}>{origin.text}</blockquote>
              </>
            )}
            <p className="small faint">Numbers such as CK-003 or SB L60 are references from your planning documents. Click one to see what it points to.</p>
          </div>
        )}
        <button className="btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
