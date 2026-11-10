import { ReadBack } from './ReadBack';
import { askAbout } from './ConversationsView';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { Editor } from './Editor';
import { ScenePanel } from './ScenePanel';
import { RemindMe } from './RemindMe';
import { flushEditor, currentEditor } from './flush';
import { sceneCircle, CIRCLE_WORDS } from '../core/labels';

// The writing desk: binder, page, and the scene's plan beside it. Focus mode hides everything but the page (R-B-004):
// the binder and plan, and the tabs, the story strip and the header too. Esc or "Leave focus" brings them back,
// and Ctrl+Shift+N still captures a thought.
export function Desk({ ctx, sceneId }: { ctx: Ctx; sceneId: string | null }) {
  const [outline, setOutline] = useState<any>(null);
  // What the panel beside the page shows: the scene plan, Read it back, or Remind me.
  const [side, setSide] = useState<'plan' | 'read' | 'remind'>('plan');
  const toggleSide = (s: 'plan' | 'read' | 'remind') => { if (panel && side === s) { setPanel(false); setSide('plan'); } else { setSide(s); setPanel(true); } };
  const [panel, setPanel] = useState<boolean>(() => { try { return localStorage.getItem('ns-panel') !== '0'; } catch { return true; } });
  const [focus, setFocus] = useState(false);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);
  const newChapterRef = useRef<() => Promise<void>>(async () => {});
  const toggleSideRef = useRef<(s: 'plan' | 'read' | 'remind') => void>(() => {});
  const [live, setLive] = useState<{ id: string; words: number } | null>(null);

  const loadOutline = useCallback(() => api.get(`/api/projects/${ctx.projectId}/outline`).then(setOutline).catch((e) => setError(e.message)), [ctx.projectId]);
  // Scene cards from the plan that have no page yet, in story order.
  const [planned, setPlanned] = useState<any[]>([]);
  useEffect(() => { api.get(`/api/projects/${ctx.projectId}/planned-order`).then((l: any[]) => setPlanned(l.filter((c) => !c.sceneId))).catch(() => setPlanned([])); }, [ctx.projectId, tick]);
  async function writeCard(id: string) { try { const s = await api.post(`/api/elements/${id}/write-scene`, {}); setTick((t) => t + 1); ctx.openScene(s.id); } catch (e) { setError((e as Error).message); } }
  useEffect(() => { void loadOutline(); }, [loadOutline, tick]);
  useEffect(() => { try { localStorage.setItem('ns-panel', panel ? '1' : '0'); } catch { /* ignore */ } }, [panel]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') { e.preventDefault(); setFocus((f) => !f); }
      if (e.key === 'Escape' && focus) setFocus(false);
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter' && !ctx.sprinting) { e.preventDefault(); void newChapterRef.current(); }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'm' && !ctx.sprinting && !focus) { e.preventDefault(); toggleSideRef.current('remind'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focus, ctx.sprinting]);
  // Focus reaches past the desk: the whole window goes quiet while it is on.
  useEffect(() => {
    const app = document.querySelector('.app');
    if (focus) app?.setAttribute('data-focus', ''); else app?.removeAttribute('data-focus');
    return () => app?.removeAttribute('data-focus');
  }, [focus]);
  // "Show in Narrative Zoom" for a scene that is not on the plan says so here, plainly.
  const [notOnPlan, setNotOnPlan] = useState(false);
  useEffect(() => setNotOnPlan(false), [sceneId]);
  async function showPlace() {
    if (!sceneId) return;
    await flushEditor();
    try {
      const node = await api.get(`/api/scenes/${sceneId}/locate`);
      if (node.level === 'story') { setNotOnPlan(true); return; }
      ctx.showInMap(sceneId);
    } catch (e) { setError((e as Error).message); }
  }
  async function askAboutScene() {
    if (!sceneId) return;
    await flushEditor();
    const title = outline?.chapters?.flatMap((c: any) => c.scenes).find((x: any) => x.id === sceneId)?.title ?? '';
    // The conversation is about this scene: its card is chosen in "Focus on", so the collaborator reads its plan too.
    const card = await api.post(`/api/scenes/${sceneId}/card`, {}).catch(() => null);
    await askAbout(ctx, { title: `About the scene ${title}`.trim(), sceneId, elementId: card?.id ?? null });
  }

  const ladder: any[] = ctx.settings.sceneLadder;
  // The circle follows the status she chose: empty, half (being written) or full (written).
  const circle = (status: string) => sceneCircle(ladder, status);

  // New chapter: a blank chapter right after the one she is in (or at the end), open and ready to write.
  async function newChapter() {
    try {
      if (sceneId) await flushEditor();
      const here = outline?.chapters?.find((c: any) => c.scenes.some((s: any) => s.id === sceneId));
      const c = await api.post(`/api/projects/${ctx.projectId}/chapters`, { after: here?.id ?? null });
      const s = await api.post(`/api/chapters/${c.id}/scenes`, {});
      setTick((t) => t + 1); ctx.openScene(s.id);
    } catch (e) { setError((e as Error).message); }
  }
  newChapterRef.current = newChapter;
  toggleSideRef.current = toggleSide;
  // Split the chapter here: asks first, then cuts at the cursor in one undoable step.
  const [split, setSplit] = useState<SplitPlan | null>(null);
  async function askSplit(s: any) {
    const ed = currentEditor();
    if (!ed) return;
    await flushEditor();
    const plan = planSplit(ed, outline.chapters, s);
    if (typeof plan === 'string') { setError(plan); return; }
    setSplit(plan);
  }
  async function doSplit() {
    if (!split) return;
    try {
      const fresh = await api.get(`/api/scenes/${split.sceneId}`);
      const r = await api.post(`/api/scenes/${split.sceneId}/split-chapter`, { before: split.before, after: split.after, expectVersion: fresh.prose_version });
      setSplit(null); setEditorNonce((n) => n + 1); setTick((t) => t + 1); ctx.openScene(r.sceneId);
    } catch (e) { setSplit(null); setError((e as Error).message); }
  }
  async function addScene(chapterId: string, afterSceneId?: string) { const s = await api.post(`/api/chapters/${chapterId}/scenes`, { afterSceneId: afterSceneId ?? null }); setTick((t) => t + 1); ctx.openScene(s.id); }
  const [renaming, setRenaming] = useState<{ id: string; title: string } | null>(null);
  const [editorNonce, setEditorNonce] = useState(0);
  async function finishRename() {
    if (!renaming) return;
    const c = outline?.chapters.find((x: any) => x.id === renaming.id);
    if (c && renaming.title.trim() && renaming.title !== c.title) await api.patch(`/api/chapters/${c.id}`, { title: renaming.title }).catch((e) => setError(e.message));
    setRenaming(null); setTick((x) => x + 1);
  }
  async function moveScene(s: any, dir: -1 | 1) {
    const chapters = outline.chapters as any[];
    const ci = chapters.findIndex((c) => c.id === s.chapter_id);
    const ch = chapters[ci];
    const idx = ch.scenes.findIndex((x: any) => x.id === s.id);
    if (dir === -1 && idx > 0) await api.post(`/api/scenes/${s.id}/move`, { chapterId: ch.id, index: idx - 1 });
    else if (dir === 1 && idx < ch.scenes.length - 1) await api.post(`/api/scenes/${s.id}/move`, { chapterId: ch.id, index: idx + 1 });
    else if (dir === -1 && ci > 0) await api.post(`/api/scenes/${s.id}/move`, { chapterId: chapters[ci - 1].id, index: chapters[ci - 1].scenes.length });
    else if (dir === 1 && ci < chapters.length - 1) await api.post(`/api/scenes/${s.id}/move`, { chapterId: chapters[ci + 1].id, index: 0 });
    setTick((t) => t + 1);
  }
  // Deleting moves things to Deleted Things in Story Trail; nothing is lost.
  const [partEdit, setPartEdit] = useState<{ id: string; title: string } | null>(null);
  async function savePart() {
    if (!partEdit) return;
    const c = outline?.chapters.find((x: any) => x.id === partEdit.id);
    if (c && partEdit.title.trim() !== (c.part_title ?? '')) await api.put(`/api/chapters/${c.id}/part`, { title: partEdit.title }).catch((e) => setError(e.message));
    setPartEdit(null); setTick((t) => t + 1);
  }
  async function deleteScene(s: any) {
    if (!window.confirm(`Move "${s.title}" to Deleted Things? You can restore it from there, in Story Trail.`)) return;
    if (s.id === sceneId) await flushEditor();
    await api.del(`/api/scenes/${s.id}`).catch((e) => setError(e.message));
    if (s.id === sceneId) ctx.closeScene();
    setTick((t) => t + 1);
  }
  async function deleteChapter(c: any) {
    const n = c.scenes.length;
    if (!window.confirm(`Move "${c.title}"${n ? ` and its ${n} scene${n === 1 ? '' : 's'}` : ''} to Deleted Things? You can restore it whole from there, in Story Trail.`)) return;
    if (c.scenes.some((x: any) => x.id === sceneId)) { await flushEditor(); ctx.closeScene(); }
    await api.del(`/api/chapters/${c.id}`).catch((e) => setError(e.message));
    setTick((t) => t + 1);
  }

  const quiet = focus || ctx.sprinting;
  const cls = quiet ? 'desk focus' : panel ? 'desk' : 'desk no-panel';
  return (
    <div className={cls}>
      {!quiet && (
        <aside className="binder" aria-label="Binder">
          {error && <div className="notice error">{error}</div>}
          {outline && (
            <>
              <h2 className="binder-head">Binder</h2>
              <p className="small muted binder-sub">Your chapters and scenes, in order.</p>
              <p className="small muted" style={{ margin: '0 0 0.75rem' }}>{(outline.totalWords + liveDelta(outline, live)).toLocaleString()} words{ctx.settings.targetWords ? ` of ${Number(ctx.settings.targetWords).toLocaleString()}` : ''}</p>
              {outline.chapters.map((c: any) => (
                <div className="chapter" key={c.id}>
                  {(c.part_title || partEdit?.id === c.id) && (
                    partEdit?.id === c.id
                      ? <input type="text" autoFocus aria-label="Part name" value={partEdit!.title} placeholder="Part One: Winter" onChange={(e) => setPartEdit({ id: c.id, title: e.target.value })} onBlur={() => void savePart()} onKeyDown={(e) => { if (e.key === 'Enter') void savePart(); if (e.key === 'Escape') setPartEdit(null); }} />
                      : <button className="part-head" title="Double-click to rename" onDoubleClick={() => setPartEdit({ id: c.id, title: c.part_title })}>{c.part_title}</button>
                  )}
                  <div className="chapter-head">
                    {renaming?.id === c.id
                      ? <input type="text" autoFocus aria-label="Chapter name" value={renaming!.title} onChange={(e) => setRenaming({ id: c.id, title: e.target.value })} onBlur={() => void finishRename()} onKeyDown={(e) => { if (e.key === 'Enter') void finishRename(); if (e.key === 'Escape') setRenaming(null); }} />
                      : <button className="name" onDoubleClick={() => setRenaming({ id: c.id, title: c.title })} title="Double-click to rename">{c.title}</button>}
                    <span className="wc">{(c.word_count + (c.scenes.some((x: any) => x.id === live?.id) ? liveDelta(outline, live) : 0)).toLocaleString()}</span>
                  </div>
                  {c.scenes.map((s: any) => (
                    <div key={s.id} className="scene-item">
                      <button className="scene-row" aria-current={s.id === sceneId ? 'true' : undefined} onClick={() => ctx.openScene(s.id)}>
                        <span className="mark" data-c={circle(s.status)} title={`${ladder.find((x) => x.key === s.status)?.label ?? s.status}: ${CIRCLE_WORDS[circle(s.status)]}`} />
                        <span className="grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                        <span className="wc">{(live && live.id === s.id ? live.words : s.word_count).toLocaleString()}</span>
                      </button>
                      {s.id === sceneId && (
                        <span className="scene-tools" role="group" aria-label="This scene">
                          <button className="btn link small" aria-label="Move scene up" onClick={() => void moveScene(s, -1)}>↑ Up</button>
                          <button className="btn link small" aria-label="Move scene down" onClick={() => void moveScene(s, 1)}>↓ Down</button>
                          <button className="btn link small" aria-label="Delete this scene" title="Moves this scene to Deleted Things. You can restore it from Story Trail." onClick={() => void deleteScene(s)}>Delete</button>
                          <button className="btn link small" title="Start a new chapter at the cursor. Asks first." onClick={() => void askSplit(s)}>Split the chapter here</button>
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="row" style={{ gap: '0.75rem' }}>
                    <button className="btn link small" onClick={() => void addScene(c.id, c.scenes[c.scenes.length - 1]?.id)}>Add scene</button>
                    <button className="btn link small faint" aria-label={`Delete ${c.title}`} onClick={() => void deleteChapter(c)}>Delete chapter</button>
                    {c.part_title
                      ? <button className="btn link small faint" onClick={() => void api.put(`/api/chapters/${c.id}/part`, { title: '' }).then(() => setTick((t) => t + 1))}>Remove this part heading</button>
                      : <button className="btn link small faint" onClick={() => setPartEdit({ id: c.id, title: '' })}>Start a part here</button>}
                  </div>
                </div>
              ))}
              <button className="btn small" title="A blank chapter right after this one (Ctrl+Shift+Enter)" onClick={() => void newChapter()}>New chapter</button>
              {planned.length > 0 && (
                <section className="planned" aria-label="Planned, not written yet">
                  <h3>Planned, not written yet</h3>
                  <p className="small muted" style={{ margin: '0 0 0.5rem' }}>Scene cards from your plan, in story order. Write one and its page appears in the right place above.</p>
                  {planned.map((c) => (
                    <div key={c.id} className="planned-card">
                      <span className="grow"><span className="planned-title">{c.title}</span>{c.beat && <span className="planned-beat">{c.decided ? '' : 'might go at '}{c.beat}</span>}</span>
                      <button className="btn link small" aria-label={`Write ${c.title}`} onClick={() => void writeCard(c.id)}>Write it</button>
                    </div>
                  ))}
                </section>
              )}
            </>
          )}
        </aside>
      )}
      <div className="pagewrap">
        <div className="row" style={{ justifyContent: 'flex-end', padding: '0.5rem 1rem 0' }}>
          {!quiet && <button className="btn link small" onClick={() => toggleSide('plan')}>{panel && side === 'plan' ? 'Hide scene plan' : 'Show scene plan'}</button>}
          {!quiet && sceneId && <button className="btn link small" aria-pressed={panel && side === 'read'} onClick={() => toggleSide('read')}>Read it back</button>}
          {!quiet && sceneId && <button className="btn link small" aria-pressed={panel && side === 'remind'} title="Your story and your craft, without leaving the page (Ctrl+Shift+M)" onClick={() => toggleSide('remind')}>Remind me</button>}
          {!quiet && sceneId && <button className="btn link small" onClick={() => void showPlace()} title="Where this scene sits in your plan: its card and its beat">Show in Narrative Zoom</button>}
          {!quiet && <button className="btn link small" onClick={() => ctx.openStuck(sceneId ?? undefined)}>I'm stuck</button>}
          {!quiet && sceneId && <button className="btn link small" onClick={() => void askAboutScene()}>Ask about this scene</button>}
          {!quiet && <button className="btn link small" onClick={() => ctx.go('trail')}>Writing Trail</button>}
          {!quiet && <button className="btn link small" onClick={ctx.startSprint} title="A set time of nothing but the page">Sprint</button>}
          {!ctx.sprinting && !focus && <button className="btn link small" onClick={() => setFocus(true)} title="Only the page, nothing else on screen (Ctrl+Shift+F)">Focus</button>}
          {focus && <span className="leave-focus"><span className="faint small">Esc leaves focus. Ctrl+Shift+N still captures a thought.</span><button className="btn small" onClick={() => setFocus(false)}>Leave focus</button></span>}
        </div>
        {notOnPlan && !quiet && (
          <div className="notice small not-on-plan" role="status">
            <p>This scene is not on your plan yet, so Narrative Zoom has no place to show it. Fill in any line of its scene plan and it becomes a card you can put on a beat.</p>
            <div className="row"><button className="btn link small" onClick={() => { setNotOnPlan(false); ctx.go('zoom'); }}>Open Narrative Zoom anyway</button><button className="btn link small" onClick={() => setNotOnPlan(false)}>Close</button></div>
          </div>
        )}
        {sceneId ? <Editor key={sceneId + ':' + editorNonce} ctx={ctx} sceneId={sceneId} quiet={ctx.sprinting} chapters={outline?.chapters} onNewChapter={() => void newChapter()} onChanged={() => { setLive(null); setTick((t) => t + 1); }} onWords={(n) => setLive({ id: sceneId, words: n })} />
          : <div className="page"><p className="muted">Choose a scene on the left, or add one, and start writing.</p></div>}
      </div>
      {split && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="split-h"><div className="dialog">
          <h2 id="split-h">Split the chapter here?</h2>
          <p>{split.lead}</p>
          {split.excerpt && <blockquote className="split-excerpt">{split.excerpt}</blockquote>}
          <p>{split.what} Your words don't change, and none of them count as new writing. It's one step in the Story Trail, so you can undo it.</p>
          <div className="row"><button className="btn write" autoFocus onClick={() => void doSplit()}>Split the chapter here</button><button className="btn" onClick={() => setSplit(null)}>Not now</button></div>
        </div></div>
      )}
      {!quiet && panel && sceneId && side === 'read' && <aside className="panel" aria-label="Read it back"><ReadBack ctx={ctx} /></aside>}
      {!quiet && panel && sceneId && side === 'remind' && <aside className="panel" aria-label="Remind me"><RemindMe key={sceneId} ctx={ctx} sceneId={sceneId} onShowPlan={() => setSide('plan')} /></aside>}
      {!quiet && panel && sceneId && side === 'plan' && <aside className="panel" aria-label="Scene plan"><ScenePanel key={sceneId} ctx={ctx} sceneId={sceneId} tick={tick} onChanged={() => setTick((t) => t + 1)} onReloadPage={() => setEditorNonce((n) => n + 1)} /></aside>}
    </div>
  );
}

function liveDelta(outline: any, live: { id: string; words: number } | null): number {
  if (!live) return 0;
  for (const c of outline.chapters) for (const s of c.scenes) if (s.id === live.id) return live.words - s.word_count;
  return 0;
}

interface SplitPlan { sceneId: string; before: unknown; after: unknown; lead: string; excerpt: string; what: string }

/**
 * Where a split would fall and what it would do, in words. The cut never lands inside a word: a cursor in the
 * middle of one moves back to the word's start, so both halves together hold exactly the scene's words.
 */
function planSplit(ed: NonNullable<ReturnType<typeof currentEditor>>, chapters: any[], s: any): SplitPlan | string {
  const { doc } = ed.state;
  let pos = ed.state.selection.from;
  const $p = doc.resolve(pos);
  if ($p.parent.isTextblock) {
    const text = $p.parent.textContent;
    let off = $p.parentOffset;
    while (off > 0 && /[\p{L}\p{N}'’\-]/u.test(text[off - 1]!) && /[\p{L}\p{N}'’\-]/u.test(text[off] ?? ' ')) off--;
    pos = $p.start() + off;
  }
  const before = doc.cut(0, pos), after = doc.cut(pos);
  const hasBefore = /[\p{L}\p{N}]/u.test(before.textContent), hasAfter = /[\p{L}\p{N}]/u.test(after.textContent);
  const ci = chapters.findIndex((c) => c.id === s.chapter_id);
  const ch = chapters[ci];
  const later = ch.scenes.slice(ch.scenes.findIndex((x: any) => x.id === s.id) + 1).map((x: any) => x.title as string);
  if (!hasBefore && ch.scenes[0]?.id === s.id) return `${s.title} already begins ${ch.title}. Put the cursor where the new chapter should start, then choose Split the chapter here.`;
  if (!hasAfter && !later.length) return `${s.title} is the last scene of ${ch.title}, and the cursor is at its end. To start a blank chapter after it, choose New chapter.`;
  const name = /^Chapter \d+$/.test(ch.title) ? `Chapter ${Number(/\d+/.exec(ch.title)![0]) + 1}` : 'a new chapter';
  const Name = name[0]!.toUpperCase() + name.slice(1);
  const movers = later.length === 0 ? '' : later.length === 1 ? `${later[0]} moves with it` : later.length === 2 ? `${later[0]} and ${later[1]} move with it` : `the ${later.length} scenes after it move with it`;
  const excerptOf = (t: string) => { const w = t.replace(/\s+/g, ' ').trim(); return w.length > 140 ? `${w.slice(0, 140).replace(/\s\S*$/, '')}…` : w; };
  if (!hasBefore) return { sceneId: s.id, before: before.toJSON(), after: after.toJSON(), lead: `${Name} will begin with ${s.title}.`, excerpt: '', what: `${s.title} becomes the first scene of ${name}${movers ? `, and ${movers}` : ''}.` };
  if (!hasAfter) return { sceneId: s.id, before: before.toJSON(), after: after.toJSON(), lead: `${Name} will begin right after ${s.title}, with ${later[0]}.`, excerpt: '', what: `${later.length === 1 ? `${later[0]} becomes` : `${later.length === 2 ? `${later[0]} and ${later[1]}` : `The ${later.length} scenes after ${s.title}`} become`} ${name}.` };
  return { sceneId: s.id, before: before.toJSON(), after: after.toJSON(), lead: `${Name} will begin where your cursor is in ${s.title}:`, excerpt: excerptOf(after.textBetween(0, after.content.size, ' ')), what: `Everything after the cursor becomes the first scene of ${name}${movers ? `, and ${movers}` : ''}.` };
}
