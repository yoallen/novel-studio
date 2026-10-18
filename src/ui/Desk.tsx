import { ReadBack } from './ReadBack';
import { askAbout } from './ConversationsView';
import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { Editor } from './Editor';
import { ScenePanel } from './ScenePanel';
import { flushEditor } from './flush';
import { sceneCircle, CIRCLE_WORDS } from '../core/labels';

// The writing desk: binder, page, and the scene's plan beside it. Focus mode hides everything but the page (R-B-004):
// the binder and plan, and the tabs, the story strip and the header too. Esc or "Leave focus" brings them back,
// and Ctrl+Shift+N still captures a thought.
export function Desk({ ctx, sceneId }: { ctx: Ctx; sceneId: string | null }) {
  const [outline, setOutline] = useState<any>(null);
  const [reading, setReading] = useState(false);
  const [panel, setPanel] = useState<boolean>(() => { try { return localStorage.getItem('ns-panel') !== '0'; } catch { return true; } });
  const [focus, setFocus] = useState(false);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);
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
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focus]);
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

  async function addChapter() { const c = await api.post(`/api/projects/${ctx.projectId}/chapters`, {}); const s = await api.post(`/api/chapters/${c.id}/scenes`, {}); setTick((t) => t + 1); ctx.openScene(s.id); }
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
  // Deleting moves things to Deleted things in Story Trail; nothing is lost.
  const [partEdit, setPartEdit] = useState<{ id: string; title: string } | null>(null);
  async function savePart() {
    if (!partEdit) return;
    const c = outline?.chapters.find((x: any) => x.id === partEdit.id);
    if (c && partEdit.title.trim() !== (c.part_title ?? '')) await api.put(`/api/chapters/${c.id}/part`, { title: partEdit.title }).catch((e) => setError(e.message));
    setPartEdit(null); setTick((t) => t + 1);
  }
  async function deleteScene(s: any) {
    if (!window.confirm(`Move "${s.title}" to Deleted? You can restore it from Story Trail, under Deleted things.`)) return;
    if (s.id === sceneId) await flushEditor();
    await api.del(`/api/scenes/${s.id}`).catch((e) => setError(e.message));
    if (s.id === sceneId) ctx.closeScene();
    setTick((t) => t + 1);
  }
  async function deleteChapter(c: any) {
    const n = c.scenes.length;
    if (!window.confirm(`Move "${c.title}"${n ? ` and its ${n} scene${n === 1 ? '' : 's'}` : ''} to Deleted? You can restore it whole from Story Trail, under Deleted things.`)) return;
    if (c.scenes.some((x: any) => x.id === sceneId)) { await flushEditor(); ctx.closeScene(); }
    await api.del(`/api/chapters/${c.id}`).catch((e) => setError(e.message));
    setTick((t) => t + 1);
  }

  const quiet = focus || ctx.sprinting;
  const cls = quiet ? 'desk focus' : panel ? 'desk' : 'desk no-panel';
  return (
    <div className={cls}>
      {!quiet && (
        <aside className="binder" aria-label="Chapters and scenes">
          {error && <div className="notice error">{error}</div>}
          {outline && (
            <>
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
                          <button className="btn link small" aria-label="Delete this scene" title="Moves this scene to Deleted. You can restore it from Story Trail, under Deleted things." onClick={() => void deleteScene(s)}>Delete</button>
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
              <button className="btn small" onClick={() => void addChapter()}>Add chapter</button>
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
          {!quiet && <button className="btn link small" onClick={() => { setReading(false); setPanel((p) => !(p && !reading)); }}>{panel && !reading ? 'Hide scene plan' : 'Show scene plan'}</button>}
          {!quiet && sceneId && <button className="btn link small" aria-pressed={panel && reading} onClick={() => { if (panel && reading) { setPanel(false); setReading(false); } else { setReading(true); setPanel(true); } }}>Read it back</button>}
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
        {sceneId ? <Editor key={sceneId + ':' + editorNonce} ctx={ctx} sceneId={sceneId} quiet={ctx.sprinting} onChanged={() => { setLive(null); setTick((t) => t + 1); }} onWords={(n) => setLive({ id: sceneId, words: n })} />
          : <div className="page"><p className="muted">Choose a scene on the left, or add one, and start writing.</p></div>}
      </div>
      {!quiet && panel && sceneId && reading && <aside className="panel" aria-label="Read it back"><ReadBack ctx={ctx} /></aside>}
      {!quiet && panel && sceneId && !reading && <aside className="panel" aria-label="Scene plan"><ScenePanel key={sceneId} ctx={ctx} sceneId={sceneId} tick={tick} onChanged={() => setTick((t) => t + 1)} onReloadPage={() => setEditorNonce((n) => n + 1)} /></aside>}
    </div>
  );
}

function liveDelta(outline: any, live: { id: string; words: number } | null): number {
  if (!live) return 0;
  for (const c of outline.chapters) for (const s of c.scenes) if (s.id === live.id) return live.words - s.word_count;
  return 0;
}
