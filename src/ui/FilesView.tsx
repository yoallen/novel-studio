import { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { statusWord, when } from './status';
import { diffWords } from './diff';

type Tab = 'in' | 'out' | 'documents';

// Bring work in (manuscripts, planning documents, plotting sheets) and send it out (manuscript and planning, any format).
export function FilesView({ ctx }: { ctx: Ctx }) {
  const [tab, setTab] = useState<Tab>(() => { try { return (sessionStorage.getItem('ns-files-tab') as Tab) || 'in'; } catch { return 'in'; } });
  useEffect(() => { try { sessionStorage.setItem('ns-files-tab', tab); } catch { /* ignore */ } }, [tab]);
  return (
    <div className="scroll"><div className="content" style={{ maxWidth: 1040 }}>
      <div className="row" role="tablist" aria-label="Import and export" style={{ marginBottom: '1rem' }}>
        {([['in', 'Bring something in'], ['out', 'Send something out'], ['documents', 'Your documents']] as [Tab, string][]).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={'btn small' + (tab === k ? '' : ' link')} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === 'in' && <ImportPanel ctx={ctx} onOpenDocument={(sourceId) => { try { sessionStorage.setItem('ns-doc-open', sourceId); } catch { /* ignore */ } setTab('documents'); }} />}
      {tab === 'out' && <ExportPanel ctx={ctx} />}
      {tab === 'documents' && <DocumentsPanel ctx={ctx} />}
    </div></div>
  );
}

// ---------------- import ----------------

function readFile(f: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1] ?? '');
    r.onerror = () => rej(new Error('The file could not be read.'));
    r.readAsDataURL(f);
  });
}

function ImportPanel({ ctx, onOpenDocument }: { ctx: Ctx; onOpenDocument: (sourceId: string) => void }) {
  const [list, setList] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [kind, setKind] = useState<'manuscript' | 'document' | 'sheet' | 'roundtrip'>('manuscript');
  const [docKind, setDocKind] = useState<'story_bible' | 'archive' | 'document'>('story_bible');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = () => api.get(`/api/projects/${ctx.projectId}/imports`).then(setList).catch((e) => setError(e.message));
  useEffect(() => { void load(); }, [ctx.projectId]);

  async function pick(f: File | undefined) {
    if (!f) return;
    setError(''); setBusy(true);
    const k = /\.xlsx$/i.test(f.name) ? 'sheet' : kind === 'sheet' ? 'manuscript' : kind;
    try {
      const r = await api.post(`/api/projects/${ctx.projectId}/imports`, { kind: k, name: f.name, data: await readFile(f), ...(k === 'document' ? { docKind } : {}) });
      setOpenId(r.id); await load();
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }

  if (openId) return <ImportReview ctx={ctx} id={openId} onBack={() => { setOpenId(null); void load(); }} />;
  const pending = list.filter((x) => x.status === 'pending');
  return (
    <>
      <h1>Bring something in</h1>
      <p className="muted">Nothing goes into your novel until you have looked it over. Your words come in exactly as written, and every planning passage keeps a link back to the page it came from.</p>
      {error && <div className="notice error" role="alert">{error}</div>}
      <section className="section">
        <div role="radiogroup" aria-label="What is it" className="cols" style={{ gap: '0.75rem 1.5rem' }}>
          {([
            ['manuscript', 'Chapters of my manuscript', 'Word, RTF, Markdown, OpenDocument or plain text. Chapters and scenes are proposed for you to check.'],
            ['document', 'A planning document', 'A story bible, an archive of decisions, character notes. Labels you gave things, like Decided or Still open, are kept just as you wrote them.'],
            ['sheet', 'A plotting spreadsheet', 'Your beat sheet in Excel. Where it puts each beat is saved as another way to place your beats, beside Save the Cat, so you can switch between them.'],
            ['roundtrip', "My editor's changes", 'A Word file you exported from here, revised with Track Changes. You decide each change.'],
          ] as const).map(([k, title, sub]) => (
            <label key={k} className="choice">
              <input type="radio" name="import-kind" checked={kind === k} onChange={() => setKind(k)} />
              <span><strong>{title}</strong><small>{sub}</small></span>
            </label>
          ))}
        </div>
        {kind === 'document' && (
          <label className="row small" style={{ marginTop: '0.75rem' }}>It is a
            <select value={docKind} onChange={(e) => setDocKind(e.target.value as never)} style={{ width: 'auto' }}>
              <option value="story_bible">story bible</option><option value="archive">archive of decisions</option><option value="document">other planning document</option>
            </select>
          </label>
        )}
        <label className="btn write" style={{ marginTop: '1rem', display: 'inline-block' }} aria-disabled={busy}>
          {busy ? 'Reading the file…' : 'Choose a file'}
          <input type="file" hidden disabled={busy} aria-label="File to bring in" accept={kind === 'sheet' ? '.xlsx' : kind === 'roundtrip' ? '.docx' : kind === 'document' ? '.docx,.rtf,.md,.txt,.odt' : '.docx,.rtf,.md,.markdown,.txt,.odt'} onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ''; }} />
        </label>
      </section>
      {pending.length > 0 && (
        <section className="section">
          <h2>Waiting for you to look over</h2>
          {pending.map((x) => <div key={x.id} className="row"><button className="btn link" onClick={() => setOpenId(x.id)}>{x.name}</button><span className="small faint">{kindName(x.kind)}, {when(x.created_at)}</span></div>)}
        </section>
      )}
      {list.some((x) => x.status !== 'pending') && (
        <section className="section">
          <h2>Done</h2>
          {list.filter((x) => x.status !== 'pending').slice(0, 20).map((x) => (
            <div key={x.id} className="row small"><span>{x.name}</span><span className="faint">{kindName(x.kind)}, {doneWord(x)}</span>{x.report?.verified === false && <span className="chip">not confirmed</span>}{x.kind === 'document' && x.source_id && <button className="btn link small" onClick={() => onOpenDocument(x.source_id)} aria-label={`Open ${x.name} in Your documents`}>Open it</button>}</div>
          ))}
        </section>
      )}
    </>
  );
}
/** What became of a finished import, in plain words. A planning document is always kept whole, even when nothing was checked in. */
function doneWord(x: any) {
  if (x.status === 'applied') return `added ${when(x.applied_at)}`;
  if (x.kind === 'document' && x.source_id) return 'kept whole, every passage searchable';
  return 'not brought in';
}
const kindName = (k: string) => (k === 'manuscript' ? 'manuscript' : k === 'sheet' ? 'plotting sheet' : k === 'roundtrip' ? "editor's changes" : 'planning document');

function ImportReview({ ctx, id, onBack }: { ctx: Ctx; id: string; onBack: () => void }) {
  const [r, setR] = useState<any>(null);
  const [error, setError] = useState('');
  const [done, setDone] = useState<any>(null);
  const load = () => api.get(`/api/imports/${id}`).then(setR).catch((e) => setError(e.message));
  useEffect(() => { void load(); }, [id]);
  const edit = async (edits: Record<string, unknown>) => { try { setR(await api.patch(`/api/imports/${id}`, { ...edits, version: r.version })); } catch (e) { setError((e as Error).message); void load(); } };
  async function apply() {
    setError('');
    try { const out = await api.post(`/api/imports/${id}/apply`); setDone(out.import ?? out); await ctx.refreshProject(); }
    catch (e) { setError((e as Error).message); }
  }
  async function discard() { try { await api.post(`/api/imports/${id}/discard`); onBack(); } catch (e) { setError((e as Error).message); } }
  if (!r) return <p className="muted">{error || 'Opening…'}</p>;
  if (done) return <ImportDone ctx={ctx} r={done} onBack={onBack} />;
  return (
    <>
      <button className="btn link small" onClick={onBack}>All imports</button>
      <h1>{r.name}</h1>
      {error && <div className="notice error" role="alert">{error}</div>}
      {(r.report?.warnings ?? []).map((w: string) => <div key={w} className="notice small">{w}</div>)}
      {r.kind === 'manuscript' && <ManuscriptReview ctx={ctx} plan={r.plan} edit={edit} />}
      {r.kind === 'document' && <DocumentReview ctx={ctx} r={r} edit={edit} />}
      {r.kind === 'sheet' && <SheetReview plan={r.plan} edit={edit} />}
      {r.kind === 'roundtrip' && <RoundtripReview ctx={ctx} r={r} edit={edit} />}
      <div className="row" style={{ position: 'sticky', bottom: 0, background: 'var(--page)', padding: '0.75rem 0', borderTop: '1px solid var(--line)', marginTop: '1rem' }}>
        <button className="btn write" onClick={() => void apply()} disabled={r.status !== 'pending'}>{r.kind === 'manuscript' ? 'Add these chapters to my novel' : r.kind === 'sheet' ? (r.plan.asMethod ? 'Make it my beat sheet' : 'Use this sheet') : r.kind === 'roundtrip' ? 'Make my decisions' : 'Add the checked passages'}</button>
        <span className="small muted">One step. You can undo it from the Story Trail.</span>
        <span className="grow" />
        <button className="btn link small" onClick={() => void discard()}>Don't import this</button>
      </div>
    </>
  );
}

function ImportDone({ ctx, r, onBack }: { ctx: Ctx; r: any; onBack: () => void }) {
  const rep = r.report ?? {};
  return (
    <>
      <h1>Done: {r.name}</h1>
      {r.kind === 'manuscript' && (
        <div className={rep.verified ? 'notice' : 'notice error'} role="status" style={rep.verified ? { borderLeftColor: 'var(--ok, #2e7d32)' } : undefined}>
          {rep.chapters} chapter{rep.chapters === 1 ? '' : 's'}, {rep.scenes} scene{rep.scenes === 1 ? '' : 's'}, {Number(rep.words ?? 0).toLocaleString()} words added. {rep.verification}
        </div>
      )}
      {r.kind === 'document' && (
        <div className="notice" role="status">
          {rep.applied} passage{rep.applied === 1 ? '' : 's'} added to your records
          {rep.appliedByStatus ? ` (${Object.entries(rep.appliedByStatus).map(([k, n]) => `${n} ${statusWord(ctx.settings, k)}`).join(', ')})` : ''}.
          {' '}{rep.leftInDocument} stay in the document, where search and "Where did this come from?" still find them.
          {rep.skipped ? ` ${rep.skipped} were already in your records and were skipped.` : ''}
          {rep.flagged ? ` ${rep.flagged} need your decision and were left out.` : ''}
        </div>
      )}
      {r.kind === 'roundtrip' && (
        <div className="notice" role="status">
          {(rep.applied ?? []).length ? `${rep.applied.length} scene${rep.applied.length === 1 ? '' : 's'} updated: ${rep.applied.map((a: any) => `${a.title} (${a.accepted} accepted${a.rejected ? `, ${a.rejected} turned down` : ''}${a.undecided ? `, ${a.undecided} left as they were` : ''})`).join('; ')}. Each earlier version is kept in the scene's history.` : 'No scene changed.'}
          {(rep.skipped ?? []).map((x: any) => <div key={x.title}>{x.title} was not changed: {x.why}.</div>)}
        </div>
      )}
      {r.kind === 'sheet' && rep.methodName && <div className="notice" role="status">"{rep.methodName}" is now a beat sheet of your own, with {rep.beatsMade} beats, and this novel uses it. Other novels can choose it in Novel setup.</div>}
      {r.kind === 'sheet' && !rep.methodName && <div className="notice" role="status">The sheet is now one of your placement choices{rep.profileName ? ` ("${rep.profileName}")` : ''}. {rep.corrected ? `${rep.corrected} flagged number${rep.corrected === 1 ? ' was' : 's were'} corrected.` : ''} See it in Narrative Zoom, Where beats fall.</div>}
      <div className="row">
        {(r.kind === 'manuscript' || r.kind === 'roundtrip') && <button className="btn write" onClick={() => ctx.go('write')}>Go to the Writing Room</button>}
        {r.kind === 'document' && <button className="btn write" onClick={() => ctx.go('brain')}>Open the Story Brain</button>}
        {r.kind === 'sheet' && <button className="btn write" onClick={() => ctx.go('zoom')}>Open Narrative Zoom</button>}
        <button className="btn link" onClick={onBack}>Bring in something else</button>
      </div>
    </>
  );
}

function ManuscriptReview({ ctx, plan, edit }: { ctx: Ctx; plan: any; edit: (e: Record<string, unknown>) => Promise<void> }) {
  const [have, setHave] = useState<any[] | null>(null);
  useEffect(() => { api.get(`/api/projects/${ctx.projectId}/outline`).then((o) => setHave(o.chapters ?? [])).catch(() => setHave(null)); }, [ctx.projectId]);
  const last = have?.[have.length - 1];
  const words = plan.chapters.reduce((a: number, c: any) => a + (c.include ? c.scenes.filter((s: any) => s.include).reduce((b: number, s: any) => b + s.words, 0) : 0), 0);
  return (
    <>
      <p className="muted">Here is how the file reads: {plan.chapters.length} chapter{plan.chapters.length === 1 ? '' : 's'}, {plan.totalWords.toLocaleString()} words. Rename, join or leave out anything before it goes in. The words themselves are never changed.</p>
      {have && <p className="notice small" role="note">{have.length === 0 ? 'These become the first chapters of your novel.' : `They go in after your last chapter${last ? ` ("${last.title}")` : ''}, so the first one becomes chapter ${have.length + 1}. Your ${have.length === 1 ? 'chapter stays' : `${have.length} chapters stay`} just as ${have.length === 1 ? 'it is' : 'they are'}. You can move chapters later in the Writing Room.`}</p>}
      {plan.findings.map((f: string) => <div key={f} className="notice small">{f}</div>)}
      <ol style={{ listStyle: 'none', padding: 0 }}>
        {plan.chapters.map((c: any, ci: number) => (
          <li key={c.key} className="section" style={{ opacity: c.include ? 1 : 0.55, borderLeft: '3px solid var(--line-strong)', paddingLeft: '0.75rem' }}>
            <div className="row">
              <input type="checkbox" checked={c.include} onChange={(e) => void edit({ chapters: { [c.key]: { include: e.target.checked } } })} aria-label={`Include ${c.title}`} />
              <input type="text" defaultValue={c.title} aria-label="Chapter title" onBlur={(e) => { if (e.target.value !== c.title) void edit({ chapters: { [c.key]: { title: e.target.value } } }); }} style={{ fontWeight: 700, maxWidth: 420 }} />
              {ci > 0 && <label className="row small"><input type="checkbox" checked={c.joinPrevious} onChange={(e) => void edit({ chapters: { [c.key]: { joinPrevious: e.target.checked } } })} />Part of the chapter before</label>}
              {c.note && <span className="small faint">{c.note}</span>}
            </div>
            <ul style={{ listStyle: 'none', paddingLeft: '1.6rem', margin: '0.4rem 0 0' }}>
              {c.scenes.map((s: any, si: number) => (
                <li key={s.key} className="row small" style={{ opacity: s.include ? 1 : 0.55, alignItems: 'baseline' }}>
                  <input type="checkbox" checked={s.include} onChange={(e) => void edit({ scenes: { [s.key]: { include: e.target.checked } } })} aria-label={`Include ${s.title}`} />
                  <input type="text" defaultValue={s.title} aria-label="Scene title" onBlur={(e) => { if (e.target.value !== s.title) void edit({ scenes: { [s.key]: { title: e.target.value } } }); }} style={{ maxWidth: 220 }} />
                  <span className="faint">{s.words.toLocaleString()} words</span>
                  <span className="muted grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--prose)' }}>{firstLine(s)}</span>
                  {si > 0 && <label className="row"><input type="checkbox" checked={s.joinPrevious} onChange={(e) => void edit({ scenes: { [s.key]: { joinPrevious: e.target.checked } } })} />Same scene as before</label>}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <p className="small muted">{words.toLocaleString()} words will go in. Checked afterwards, word for word.</p>
    </>
  );
}
const firstLine = (s: any) => { const b = s.blocks.find((x: any) => x.type === 'p'); return b ? b.runs.map((r: any) => r.text).join('').slice(0, 140) : ''; };

function DocumentReview({ ctx, r, edit }: { ctx: Ctx; r: any; edit: (e: Record<string, unknown>) => Promise<void> }) {
  const plan = r.plan;
  const [show, setShow] = useState<'placed' | 'left' | 'all'>('placed');
  const [els, setEls] = useState<any[]>([]);
  const [fieldsByKind, setFieldsByKind] = useState<Record<string, any[]>>({});
  useEffect(() => { api.get(`/api/projects/${ctx.projectId}/elements`).then((x) => setEls(x.filter((e: any) => !['thought', 'guardrail', 'scene_plan'].includes(e.kind)))).catch(() => {}); }, [ctx.projectId]);
  const kinds = useMemo(() => [...new Set([...els.map((e) => e.kind), ...plan.newElements.map((n: any) => n.kind), 'beat'])], [els, plan]);
  useEffect(() => { for (const k of kinds) if (!fieldsByKind[k]) api.get(`/api/projects/${ctx.projectId}/fields?kind=${encodeURIComponent(k)}`).then((f) => setFieldsByKind((m) => ({ ...m, [k]: f }))).catch(() => {}); }, [kinds]);
  const elById = (id: string | null) => els.find((e) => e.id === id);
  const counts = { placed: plan.items.filter((i: any) => i.include).length, left: plan.items.filter((i: any) => !i.include && !i.already).length, already: plan.items.filter((i: any) => i.already).length };
  const items = plan.items.filter((i: any) => (show === 'all' ? true : show === 'placed' ? i.include : !i.include && !i.already));
  const groups: [string, any[]][] = [];
  for (const it of items) { const g = it.path[0] ?? 'Before the first heading'; const last = groups[groups.length - 1]; if (last && last[0] === g) last[1].push(it); else groups.push([g, [it]]); }
  const destKind = (it: any) => (it.arc ? 'arc' : it.newElement ? it.newElement.kind : it.beatKey && !it.elementId ? 'beat' : elById(it.elementId)?.kind);
  const statusOptions = ['established', 'developing', 'unanswered', 'illustrative', 'proposed'];
  return (
    <>
      <p className="muted">Each passage keeps your label, and its exact words stay in the document. Checked passages go into the record shown beside them.</p>
      <div className="row small" style={{ marginBottom: '0.75rem' }}>
        <label className="row">Document date
          <input type="date" defaultValue={plan.docDate ? String(plan.docDate).slice(0, 10) : ''} onChange={(e) => void edit({ docDate: e.target.value ? `${e.target.value}T12:00:00.000Z` : null })} style={{ width: 'auto' }} />
        </label>
        <span className="faint">{plan.dateFrom ? `from the ${plan.dateFrom}` : 'not set'}. Your later decisions stay ahead of anything dated earlier.</span>
      </div>
      {plan.findings.map((f: string) => <div key={f} className="notice small">{f}</div>)}
      {plan.newElements.length > 0 && (
        <section className="section">
          <h2>New records it would make</h2>
          {plan.newElements.map((n: any) => (
            <div key={n.key} className="row small"><span className="chip">{n.kind === 'set_piece' ? 'Set piece' : n.kind === 'character' ? 'Character' : n.kind}</span>
              <input type="text" defaultValue={n.title} aria-label="New record name" onBlur={(e) => { if (e.target.value.trim() && e.target.value !== n.title) void edit({ newElements: { [n.key]: { title: e.target.value.trim() } } }); }} style={{ maxWidth: 320 }} />
            </div>
          ))}
        </section>
      )}
      <div className="row small" role="tablist" aria-label="Which passages">
        {([['placed', `Going in (${counts.placed})`], ['left', `Staying in the document (${counts.left})`], ['all', 'All']] as const).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={show === k} className={'btn small' + (show === k ? '' : ' link')} onClick={() => setShow(k)}>{l}</button>
        ))}
        {counts.already > 0 && <span className="faint">{counts.already} already in your records</span>}
      </div>
      {groups.map(([g, its]) => (
        <section key={g} className="section">
          <h2 style={{ fontSize: '1rem' }}>{g}</h2>
          {its.map((it: any) => {
            const k = destKind(it);
            const fields = (k && fieldsByKind[k]) || [];
            return (
              <div key={it.id} className="row" style={{ alignItems: 'flex-start', borderTop: '1px solid var(--line)', padding: '0.5rem 0', opacity: it.already ? 0.6 : 1 }}>
                <input type="checkbox" checked={it.include} disabled={it.already} onChange={(e) => void edit({ items: { [it.id]: { include: e.target.checked } } })} aria-label="Include this passage" style={{ marginTop: '0.3em' }} />
                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="small faint">{it.path.slice(1).join(' > ')}</div>
                  <div style={{ fontFamily: 'var(--prose)', whiteSpace: 'pre-wrap' }}>{it.label && <strong>{it.label}. </strong>}{it.text.length > 420 ? it.text.slice(0, 417) + '…' : it.text || <span className="faint">(an open slot, no text)</span>}</div>
                  {it.note && <div className="small muted">{it.note}</div>}
                  {!it.already && (
                    <div className="row small" style={{ marginTop: '0.3rem' }}>
                      <select aria-label="Status" value={it.status} onChange={(e) => void edit({ items: { [it.id]: { status: e.target.value } } })} style={{ width: 'auto' }}>
                        {it.status === 'unlabeled' && <option value="unlabeled">No label</option>}
                        {statusOptions.map((s) => <option key={s} value={s}>{statusWord(ctx.settings, s)}</option>)}
                      </select>
                      <span>into</span>
                      <select aria-label="Record" value={it.elementId ?? (it.newElement ? `new:${it.newElement.key}` : it.beatKey ? `beat:${it.beatKey}` : '')} style={{ width: 'auto', maxWidth: 240 }}
                        onChange={(e) => { const v = e.target.value; if (!v.includes(':')) void edit({ items: { [it.id]: { elementId: v || null, include: !!v && it.include } } }); }}>
                        <option value="">Stays in the document</option>
                        {it.newElement && <option value={`new:${it.newElement.key}`}>{it.newElement.title} (new)</option>}
                        {it.beatKey && !it.elementId && <option value={`beat:${it.beatKey}`}>{it.path[it.path.length - 1]} (beat)</option>}
                        {els.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
                      </select>
                      {it.arc && <span className="faint">arc</span>}
                      <select aria-label="Field" value={it.field ?? ''} onChange={(e) => void edit({ items: { [it.id]: { field: e.target.value || null } } })} style={{ width: 'auto', maxWidth: 220 }}>
                        <option value="">Which part…</option>
                        {it.field && !fields.some((f: any) => f.field === it.field) && <option value={it.field}>{it.field.replace(/_/g, ' ')}</option>}
                        {fields.map((f: any) => <option key={f.field} value={f.field}>{f.label}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      ))}
      {!items.length && <p className="muted">Nothing here.</p>}
    </>
  );
}

function RoundtripReview({ ctx, r, edit }: { ctx: Ctx; r: any; edit: (e: Record<string, unknown>) => Promise<void> }) {
  const plan = r.plan;
  const changed = plan.scenes.filter((s: any) => s.status !== 'unchanged' || s.comments.length);
  const set = (sceneId: string, e: Record<string, unknown>) => edit({ roundtrip: { [sceneId]: e } });
  return (
    <>
      <p className="muted">{r.report.changes} change{r.report.changes === 1 ? '' : 's'} in {r.report.changed} scene{r.report.changed === 1 ? '' : 's'}{r.report.comments ? `, and ${r.report.comments} comment${r.report.comments === 1 ? '' : 's'}` : ''}. Nothing changes until you decide. Anything you leave undecided stays as you wrote it.</p>
      {(r.report.findings ?? []).map((f: string) => <div key={f} className="notice small">{f}</div>)}
      <label className="row small"><input type="checkbox" checked={plan.keepComments} onChange={(e) => void edit({ keepComments: e.target.checked })} />Keep the editor's comments as notes beside each scene</label>
      {!changed.length && <p className="muted">The editor did not change anything.</p>}
      {changed.map((s: any) => (
        <section key={s.sceneId} className="section" aria-label={`Changes in ${s.title}`}>
          <div className="row"><h2 style={{ margin: 0 }} className="grow">{s.title}</h2><span className="small faint">{s.chapter}</span>
            {s.groups.length > 0 && <><button className="btn small" onClick={() => void set(s.sceneId, { all: 'accept' })}>Accept all</button><button className="btn link small" onClick={() => void set(s.sceneId, { all: 'reject' })}>Turn all down</button></>}
          </div>
          {s.status === 'diverged' && <div className="notice small">You have changed this scene since you exported it. The editor's changes were made to the earlier text.</div>}
          {s.groups.map((g: any) => (
            <div key={g.id} className="row" style={{ alignItems: 'flex-start', borderTop: '1px solid var(--line)', padding: '0.45rem 0' }}>
              <div className="grow diff" style={{ fontFamily: 'var(--prose)' }}>
                <span className="faint">…{g.before}</span>{g.removed && <span className="removed">{g.removed}</span>}{g.added && <span className="added">{g.added}</span>}<span className="faint">{g.after}…</span>
                <div className="small faint" style={{ fontFamily: 'var(--ui)' }}>{g.author}{g.date ? `, ${when(g.date)}` : ''}</div>
              </div>
              <div className="row small" role="group" aria-label="Decision">
                <button className={'btn small' + (g.decision === 'accept' ? ' write' : '')} aria-pressed={g.decision === 'accept'} onClick={() => void set(s.sceneId, { decisions: { [g.id]: g.decision === 'accept' ? null : 'accept' } })}>Accept</button>
                <button className={'btn small' + (g.decision === 'reject' ? '' : ' link')} aria-pressed={g.decision === 'reject'} onClick={() => void set(s.sceneId, { decisions: { [g.id]: g.decision === 'reject' ? null : 'reject' } })}>Turn down</button>
              </div>
            </div>
          ))}
          {(s.status === 'untracked' || s.status === 'diverged') && s.editorText && (
            <details style={{ marginTop: '0.5rem' }} open={s.status === 'untracked'}>
              <summary className="small">Compare the editor's text with yours</summary>
              <p className="small muted"><span className="diff"><span className="removed">Struck</span></span> is only in yours; <span className="diff"><span className="added">highlighted</span></span> is only in the editor's.</p>
              <div className="diff" style={{ maxHeight: '40vh', overflow: 'auto', border: '1px solid var(--line)', padding: '0.6rem', borderRadius: 'var(--r-sm)', fontFamily: 'var(--prose)', whiteSpace: 'pre-wrap' }}>
                {diffWords(s.appText, s.editorText).map((p: any, i: number) => <span key={i} className={p.kind === 'same' ? '' : p.kind}>{p.text}</span>)}
              </div>
              <label className="row small"><input type="checkbox" checked={s.useEditor} onChange={(e) => void set(s.sceneId, { useEditor: e.target.checked })} />Use the editor's version of this scene</label>
            </details>
          )}
          {s.comments.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              {s.comments.map((c: any, i: number) => <div key={i} className="small" style={{ borderLeft: '3px solid var(--line-strong)', paddingLeft: '0.5rem', margin: '0.3rem 0' }}><strong>{c.author}:</strong> {c.text} <span className="faint">(near "{c.near.slice(0, 50)}")</span></div>)}
            </div>
          )}
        </section>
      ))}
    </>
  );
}

function SheetReview({ plan, edit }: { plan: any; edit: (e: Record<string, unknown>) => Promise<void> }) {
  const read = plan.read;
  const d = String(plan.density);
  return (
    <>
      <label className="choice" style={{ marginBottom: '0.75rem' }}>
        <input type="checkbox" checked={plan.asMethod} onChange={(e) => void edit({ asMethod: e.target.checked })} />
        <span><strong>Make this a beat sheet of my own</strong><small>Each row becomes a beat, placed where the sheet puts it. Every novel can then use it, like Save the Cat.</small></span>
      </label>
      <p className="muted">{read.beats.filter((b: any) => b.key).length} of {read.beats.length} rows matched your Save the Cat beats. The descriptions and "where it goes" notes stay with each beat as your own teaching.</p>
      {read.flags.map((f: string) => <div key={f} className="notice small">{f}</div>)}
      <div className="row small" style={{ marginBottom: '0.75rem' }}>
        {read.densities.length > 1 && <span role="radiogroup" aria-label="Words per page" className="row">Use the numbers at {read.densities.map((w: number) => <label key={w} className="row"><input type="radio" checked={plan.density === w} onChange={() => void edit({ density: w })} />{w} words per page</label>)}</span>}
        <label className="row"><input type="checkbox" checked={plan.useCorrections} onChange={(e) => void edit({ useCorrections: e.target.checked })} />Use the suggested corrections for flagged numbers</label>
        <label className="row"><input type="checkbox" checked={plan.keepGuidance} onChange={(e) => void edit({ keepGuidance: e.target.checked })} />Keep each beat's description</label>
      </div>
      <label className="field" style={{ maxWidth: 420 }}><span>Name for this placement choice</span><input type="text" defaultValue={plan.profileName} onBlur={(e) => { if (e.target.value !== plan.profileName) void edit({ profileName: e.target.value }); }} /></label>
      <table className="small" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={{ textAlign: 'left' }}>Row in the sheet</th><th style={{ textAlign: 'left' }}>Beat</th><th style={{ textAlign: 'right' }}>Words ({d} per page)</th><th style={{ textAlign: 'left' }}>Notes</th></tr></thead>
        <tbody>
          {read.beats.map((b: any) => {
            const corr = plan.corrections[`${b.row}@${d}`];
            const w = plan.useCorrections && corr ? corr : b.words[d];
            return (
              <tr key={b.row} style={{ borderTop: '1px solid var(--line)', verticalAlign: 'top' }}>
                <td>{b.name}</td>
                <td>{b.key ? b.key.replace(/_/g, ' ') : <span className="chip">no match</span>}</td>
                <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{w ? (w[0] === w[1] ? w[0].toLocaleString() : `${w[0].toLocaleString()} to ${w[1].toLocaleString()}`) : b.wordsText[d] || ''}</td>
                <td>{b.flags.filter((f: string) => f.startsWith(`At ${d} `) || !/^At \d/.test(f)).map((f: string) => <div key={f} className="muted">{f}</div>)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

// ---------------- export ----------------

type Saved = { where: 'desktop'; path: string } | { where: 'browser' } | { where: 'cancelled' };

/** Save an exported file. On the desktop she picks the place and is told the exact path; in a browser it goes where downloads go. */
async function download(r: { filename: string; mime: string; data: string }): Promise<Saved> {
  const desktop = (window as any).storyCanon;
  if (desktop?.saveFile) {
    const path = await desktop.saveFile(r.filename, r.data);
    return path ? { where: 'desktop', path } : { where: 'cancelled' };
  }
  const bytes = Uint8Array.from(atob(r.data), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: r.mime }));
  const a = document.createElement('a');
  a.href = url; a.download = r.filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return { where: 'browser' };
}

/** Where the file went, in one sentence, with a way to find it or save it again. */
function SavedNote({ saved, onAgain }: { saved: Saved; onAgain: () => void }) {
  const desktop = (window as any).storyCanon;
  if (saved.where === 'desktop') return <div className="saved-where">Saved to <strong className="path">{saved.path}</strong>. {desktop?.showFile && <button className="btn link small" onClick={() => void desktop.showFile(saved.path)}>Show it in its folder</button>}</div>;
  if (saved.where === 'cancelled') return <div className="saved-where">The file was made but not saved, because the save window was closed. <button className="btn link small" onClick={onAgain}>Save it</button></div>;
  return <div className="saved-where">Your browser saved it where downloads go, usually the Downloads folder. <button className="btn link small" onClick={onAgain}>Save it again</button></div>;
}

const SECTIONS: [string, string][] = [['characters', 'Character profiles'], ['beats', 'Beat sheet'], ['places', 'Places'], ['set_pieces', 'Set pieces'], ['open_decisions', 'Open decisions'], ['setups_payoffs', 'Setups and payoffs'], ['timeline', 'Timeline'], ['soundtrack', 'Soundtrack'], ['all_records', 'Every other record']];
const FORMATS: [string, string][] = [['docx', 'Word (.docx)'], ['pdf', 'PDF'], ['epub', 'E-book (.epub)'], ['odt', 'OpenDocument (.odt)'], ['rtf', 'Rich Text (.rtf)'], ['md', 'Markdown (.md)'], ['txt', 'Plain text (.txt)'], ['html', 'Web page (.html)'], ['json', 'Story Canon data (.json), for other programs']];

function ExportPanel({ ctx }: { ctx: Ctx }) {
  const [presets, setPresets] = useState<any[]>([]);
  const [outline, setOutline] = useState<any[]>([]);
  const [req, setReq] = useState<any>({ format: 'docx', manuscript: true, chapterIds: null, sections: [], includePrivate: false, includeExamples: true, chapterHeading: 'number_title', options: { sceneBreak: '* * *', titlePage: true, manuscriptFormat: false, sceneTitles: false, chapterOnNewPage: true } });
  const [preset, setPreset] = useState('working');
  const [preview, setPreview] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [presetName, setPresetName] = useState('');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [profile, setProfile] = useState('brody');
  const [kept, setKept] = useState<any[]>([]);
  useEffect(() => {
    api.get(`/api/projects/${ctx.projectId}/export/presets`).then(setPresets).catch(() => {});
    api.get(`/api/projects/${ctx.projectId}/outline`).then((o) => setOutline(o.chapters ?? [])).catch(() => {});
    api.get(`/api/projects/${ctx.projectId}/landmarks`).then((l) => { setProfiles(l.profiles ?? []); if (l.profiles?.[0]) setProfile(l.profiles[0].key); }).catch(() => {});
    api.get(`/api/projects/${ctx.projectId}/drafts`).then((d: any[]) => setKept(d.filter((x) => x.completed_at))).catch(() => {});
  }, [ctx.projectId]);
  useEffect(() => {
    setResult(null);
    if (!req.manuscript && !req.sections.length) { setPreview(null); return; }
    const t = setTimeout(() => { api.post(`/api/projects/${ctx.projectId}/export/preview`, req).then(setPreview).catch((e) => setError(e.message)); }, 200);
    return () => clearTimeout(t);
  }, [req, ctx.projectId]);
  const choose = (p: any) => { setPreset(p.key); setReq((r: any) => ({ ...r, chapterIds: null, includePrivate: false, includeExamples: true, ...p.request, options: { ...r.options, ...(p.request.options ?? {}) } })); };
  const set = (patch: any) => { setPreset(''); setReq((r: any) => ({ ...r, ...patch })); };
  const setOpt = (patch: any) => { setPreset(''); setReq((r: any) => ({ ...r, options: { ...r.options, ...patch } })); };
  const chosen = new Set<string>(req.chapterIds ?? outline.map((c) => c.id));
  async function go() {
    setError(''); setBusy(true); setResult(null); setSaved(null);
    try { const r = await api.post(`/api/projects/${ctx.projectId}/export`, req); setResult(r); setSaved(await download(r)); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function sheet() {
    setError('');
    try { const r = await api.post(`/api/projects/${ctx.projectId}/export/beat-sheet`, { profile }); setResult(r); setSaved(await download(r)); }
    catch (e) { setError((e as Error).message); }
  }
  async function savePreset() {
    if (!presetName.trim()) return;
    try { setPresets(await api.post(`/api/projects/${ctx.projectId}/export/presets`, { name: presetName.trim(), request: req })); setPresetName(''); }
    catch (e) { setError((e as Error).message); }
  }
  const isText = ['txt', 'md', 'json'].includes(req.format);
  // A real chapter of hers shows what each heading style looks like.
  const sample = outline.find((c) => c.title && !/^chapter\s+\d+$/i.test(String(c.title).trim()));
  const sampleN = sample?.number ?? 2, sampleT = sample?.title ?? 'Its Title';
  return (
    <>
      <h1>Send something out</h1>
      <p className="muted">Exporting never changes your novel. Each file is read back after it is made and checked against your chapters, word for word.</p>
      {error && <div className="notice error" role="alert">{error}</div>}
      <section className="section">
        <h2>Start from</h2>
        <div className="cols" style={{ gap: '0.5rem 1.5rem' }} role="radiogroup" aria-label="Export presets">
          {presets.map((p) => (
            <label key={p.key} className="choice">
              <input type="radio" name="preset" checked={preset === p.key} onChange={() => choose(p)} />
              <span><strong>{p.name}</strong>{!p.builtIn && <> <button className="btn link small" onClick={(e) => { e.preventDefault(); void api.del(`/api/projects/${ctx.projectId}/export/presets/${p.key}`).then(setPresets); }}>Remove</button></>}<small>{p.description || 'Your own choices.'}</small></span>
            </label>
          ))}
        </div>
      </section>
      <div className="cols export-cols">
        <section>
          <h2>What goes in</h2>
          <label className="row"><input type="checkbox" checked={req.manuscript} onChange={(e) => set({ manuscript: e.target.checked })} />The manuscript</label>
          {req.manuscript && kept.length > 0 && (
            <label className="row small" style={{ paddingLeft: '1.6rem' }}>Version
              <select aria-label="Version" value={req.draftId ?? ''} onChange={(e) => set({ draftId: e.target.value || null, chapterIds: null })} style={{ width: 'auto' }}>
                <option value="">The book as it is now</option>
                {kept.map((d) => <option key={d.id} value={d.id}>{d.name}, as kept</option>)}
              </select>
            </label>
          )}
          {req.manuscript && !req.draftId && outline.length > 0 && (
            <div style={{ paddingLeft: '1.6rem', maxHeight: 220, overflow: 'auto' }}>
              <div role="radiogroup" aria-label="Which chapters" className="row small">
                <label className="row"><input type="radio" name="which-chapters" checked={!req.chapterIds} onChange={() => set({ chapterIds: null })} />Every chapter</label>
                <label className="row"><input type="radio" name="which-chapters" checked={!!req.chapterIds} onChange={() => set({ chapterIds: outline.map((c) => c.id) })} />Only the chapters I pick</label>
              </div>
              {req.chapterIds && (
                <fieldset className="chapter-pick" aria-label="Chapters to include">
                  <legend className="small muted">Untick any chapter to leave it out.</legend>
                  {outline.map((c) => (
                    <label key={c.id} className="row small"><input type="checkbox" checked={chosen.has(c.id)} onChange={(e) => { const s = new Set(chosen); if (e.target.checked) s.add(c.id); else s.delete(c.id); set({ chapterIds: outline.map((x) => x.id).filter((x) => s.has(x)) }); }} />{c.number}. {c.title}</label>
                  ))}
                </fieldset>
              )}
            </div>
          )}
          <div style={{ marginTop: '0.5rem' }}>
            {SECTIONS.map(([k, l]) => <label key={k} className="row"><input type="checkbox" checked={req.sections.includes(k)} onChange={(e) => set({ sections: e.target.checked ? [...req.sections, k] : req.sections.filter((x: string) => x !== k) })} />{l}</label>)}
          </div>
          {req.sections.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <label className="row small"><input type="checkbox" checked={req.includeExamples} onChange={(e) => set({ includeExamples: e.target.checked })} />Include examples, labeled "{statusWord(ctx.settings, 'illustrative')}"</label>
              <label className="row small"><input type="checkbox" checked={req.includePrivate} onChange={(e) => set({ includePrivate: e.target.checked })} />Include private writing aids (casting, theme music, playlists)</label>
            </div>
          )}
        </section>
        <section>
          <h2>How it looks</h2>
          <label className="field"><span>Format</span><select aria-label="Format" value={req.format} onChange={(e) => set({ format: e.target.value })}>{FORMATS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          {req.manuscript && (
            <label className="field"><span>Chapter headings</span><select aria-label="Chapter headings" aria-describedby="heading-hint" value={req.chapterHeading} onChange={(e) => set({ chapterHeading: e.target.value })}>
              <option value="number_title">Number and title: Chapter {sampleN}: {sampleT}</option><option value="number">Number only: Chapter {sampleN}</option><option value="title">Title only: {sampleT}</option>
            </select><small id="heading-hint" className="muted">How each chapter starts in the file. A chapter with no title of its own just says Chapter {sampleN}.</small></label>
          )}
          {req.manuscript && <label className="field"><span>Between scenes</span><input type="text" value={req.options.sceneBreak} maxLength={20} onChange={(e) => setOpt({ sceneBreak: e.target.value || '* * *' })} style={{ maxWidth: 120 }} /></label>}
          {!isText && <label className="row small"><input type="checkbox" checked={req.options.titlePage} onChange={(e) => setOpt({ titlePage: e.target.checked })} />Title page</label>}
          {['docx', 'rtf', 'odt', 'pdf'].includes(req.format) && <label className="row small"><input type="checkbox" checked={req.options.manuscriptFormat} onChange={(e) => setOpt({ manuscriptFormat: e.target.checked })} />Manuscript format (double-spaced, 12 point, name and title in the header)</label>}
          {req.manuscript && <label className="row small"><input type="checkbox" checked={req.options.sceneTitles} onChange={(e) => setOpt({ sceneTitles: e.target.checked })} />Show scene titles</label>}
        </section>
      </div>
      {preview && (
        <section className="section" aria-label="Before you export">
          <p className="small">{preview.chapters.length ? `${preview.chapters.length} chapter${preview.chapters.length === 1 ? '' : 's'}` : ''}{preview.chapters.length && preview.sections.length ? ' and ' : ''}{preview.sections.length ? preview.sections.join(', ') : ''}, as {preview.label}.</p>
          {preview.losses.map((l: string) => <div key={l} className="notice small">{l}</div>)}
        </section>
      )}
      <div className="row" style={{ marginTop: '1rem' }}>
        <button className="btn write" disabled={busy || (!req.manuscript && !req.sections.length)} onClick={() => void go()}>{busy ? 'Making the file…' : 'Export'}</button>
        <span className="grow" />
        <input type="text" placeholder="Save these choices as…" value={presetName} onChange={(e) => setPresetName(e.target.value)} aria-label="Preset name" style={{ maxWidth: 220 }} />
        <button className="btn small" disabled={!presetName.trim()} onClick={() => void savePreset()}>Save these choices</button>
      </div>
      {result && (
        <div className={result.verification.ok ? 'notice' : 'notice error'} role="status" style={{ marginTop: '1rem' }}>
          <strong>{result.filename}</strong> ({Math.max(1, Math.round(result.bytes / 1024)).toLocaleString()} KB). {result.verification.note}
          {saved && <SavedNote saved={saved} onAgain={() => void download(result).then(setSaved)} />}
        </div>
      )}
      <section className="section">
        <h2>Your plotting sheet</h2>
        <p className="small muted">Your beat sheet layout, filled in with this novel's length, both page densities, and what is planned at each beat.</p>
        <div className="row">
          <select value={profile} onChange={(e) => setProfile(e.target.value)} aria-label="Placement" style={{ width: 'auto' }}>{profiles.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}</select>
          <button className="btn" onClick={() => void sheet()}>Export the sheet (.xlsx)</button>
        </div>
      </section>
    </>
  );
}

// ---------------- documents ----------------

function DocumentsPanel({ ctx }: { ctx: Ctx }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [open, setOpen] = useState<any>(null);
  const [q, setQ] = useState('');
  useEffect(() => { api.get(`/api/projects/${ctx.projectId}/documents`).then(setDocs).catch(() => {}); }, [ctx.projectId]);
  // Arriving from Search: open the document and bring the passage into view.
  const [found] = useState<string | null>(() => { try { const x = sessionStorage.getItem('ns-doc-passage'); sessionStorage.removeItem('ns-doc-passage'); return x; } catch { return null; } });
  useEffect(() => {
    let src: string | null = null;
    try { src = sessionStorage.getItem('ns-doc-open'); sessionStorage.removeItem('ns-doc-open'); } catch { /* ignore */ }
    if (src) void api.get(`/api/sources/${src}`).then(setOpen).catch(() => {});
  }, []);
  useEffect(() => { if (open && found) document.getElementById(`passage-${found}`)?.scrollIntoView({ block: 'center' }); }, [open, found]);
  if (open) {
    const ps = open.passages.filter((p: any) => !q || p.text.toLowerCase().includes(q.toLowerCase()));
    return (
      <>
        <button className="btn link small" onClick={() => setOpen(null)}>All documents</button>
        <h1>{open.source.name}</h1>
        <p className="small muted">{open.passages.length} passages, kept word for word{open.source.made_at ? `, dated ${new Date(open.source.made_at).toLocaleDateString()}` : ''}.</p>
        <input type="search" placeholder="Find in this document" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Find in this document" style={{ maxWidth: 360, marginBottom: '1rem' }} />
        {ps.map((p: any) => (
          <div key={p.id} id={`passage-${p.id}`} className={found === p.id ? 'found' : undefined} style={{ borderTop: '1px solid var(--line)', padding: '0.5rem 0' }}>
            <div className="small faint">{p.locator}</div>
            <div style={{ fontFamily: 'var(--prose)', whiteSpace: 'pre-wrap' }}>{p.text}</div>
            {p.became.length > 0 && <div className="row small" style={{ marginTop: '0.25rem' }}>{p.became.map((b: any) => <span key={b.id} className="chip">{b.element_title}, {String(b.field).replace(/_/g, ' ')}: {statusWord(ctx.settings, b.status)}</span>)}</div>}
          </div>
        ))}
      </>
    );
  }
  return (
    <>
      <h1>Your documents</h1>
      <p className="muted">Every planning document you brought in, whole. What became a record shows where it went; the rest is still here and still searchable.</p>
      {!docs.length && <p className="muted">No documents yet. Bring one in from the first tab.</p>}
      {docs.map((d) => (
        <div key={d.id} className="row"><button className="btn link" onClick={() => void api.get(`/api/sources/${d.id}`).then(setOpen)}>{d.name}</button><span className="small faint">{d.passages} passages{d.made_at ? `, dated ${new Date(d.made_at).toLocaleDateString()}` : ''}</span></div>
      ))}
    </>
  );
}
