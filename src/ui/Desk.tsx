import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { Editor } from './Editor';
import { ScenePanel } from './ScenePanel';

// The writing desk: binder, page, and the scene's plan beside it. Focus mode hides everything but the page (R-B-004).
export function Desk({ ctx, sceneId }: { ctx: Ctx; sceneId: string | null }) {
  const [outline, setOutline] = useState<any>(null);
  const [panel, setPanel] = useState<boolean>(() => { try { return localStorage.getItem('ns-panel') !== '0'; } catch { return true; } });
  const [focus, setFocus] = useState(false);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);

  const loadOutline = useCallback(() => api.get(`/api/projects/${ctx.projectId}/outline`).then(setOutline).catch((e) => setError(e.message)), [ctx.projectId]);
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

  const ladder: any[] = ctx.settings.sceneLadder;
  const drafted = (status: string) => {
    const step = ladder.find((x) => x.key === status);
    if (!step?.drafted) return 'idea';
    const i = ladder.indexOf(step), firstRevise = ladder.findIndex((x) => x.key === 'revising');
    return firstRevise >= 0 && i >= firstRevise ? 'revising' : 'drafted';
  };

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

  const cls = focus ? 'desk focus' : panel ? 'desk' : 'desk no-panel';
  return (
    <div className={cls}>
      {!focus && (
        <aside className="binder" aria-label="Chapters and scenes">
          {error && <div className="notice error">{error}</div>}
          {outline && (
            <>
              <p className="small muted" style={{ margin: '0 0 0.75rem' }}>{outline.totalWords.toLocaleString()} words{ctx.settings.targetWords ? ` of ${Number(ctx.settings.targetWords).toLocaleString()}` : ''}</p>
              {outline.chapters.map((c: any) => (
                <div className="chapter" key={c.id}>
                  <div className="chapter-head">
                    {renaming?.id === c.id
                      ? <input type="text" autoFocus aria-label="Chapter name" value={renaming!.title} onChange={(e) => setRenaming({ id: c.id, title: e.target.value })} onBlur={() => void finishRename()} onKeyDown={(e) => { if (e.key === 'Enter') void finishRename(); if (e.key === 'Escape') setRenaming(null); }} />
                      : <button className="name" onDoubleClick={() => setRenaming({ id: c.id, title: c.title })} title="Double-click to rename">{c.title}</button>}
                    <span className="faint small">{c.word_count.toLocaleString()}</span>
                  </div>
                  {c.scenes.map((s: any) => (
                    <div key={s.id} className="row" style={{ gap: 0, flexWrap: 'nowrap' }}>
                      <button className="scene-row" aria-current={s.id === sceneId ? 'true' : undefined} onClick={() => ctx.openScene(s.id)}>
                        <span className="mark" data-d={drafted(s.status)} title={ladder.find((x) => x.key === s.status)?.label ?? s.status} />
                        <span className="grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                        <span className="wc">{s.word_count.toLocaleString()}</span>
                      </button>
                      {s.id === sceneId && (
                        <span className="row" style={{ gap: 0, flexWrap: 'nowrap' }}>
                          <button className="btn link small" aria-label="Move scene up" onClick={() => void moveScene(s, -1)}>↑</button>
                          <button className="btn link small" aria-label="Move scene down" onClick={() => void moveScene(s, 1)}>↓</button>
                        </span>
                      )}
                    </div>
                  ))}
                  <button className="btn link small" onClick={() => void addScene(c.id, c.scenes[c.scenes.length - 1]?.id)}>Add scene</button>
                </div>
              ))}
              <button className="btn small" onClick={() => void addChapter()}>Add chapter</button>
            </>
          )}
        </aside>
      )}
      <div className="pagewrap">
        <div className="row" style={{ justifyContent: 'flex-end', padding: '0.5rem 1rem 0' }}>
          {!focus && <button className="btn link small" onClick={() => setPanel((p) => !p)}>{panel ? 'Hide scene plan' : 'Show scene plan'}</button>}
          <button className="btn link small" onClick={() => setFocus((f) => !f)} title="Ctrl+Shift+F">{focus ? 'Leave focus' : 'Focus'}</button>
        </div>
        {sceneId ? <Editor key={sceneId + ':' + editorNonce} ctx={ctx} sceneId={sceneId} onChanged={() => setTick((t) => t + 1)} />
          : <div className="page"><p className="muted">Choose a scene on the left, or add one, and start writing.</p></div>}
      </div>
      {!focus && panel && sceneId && <aside className="panel" aria-label="Scene plan"><ScenePanel key={sceneId} ctx={ctx} sceneId={sceneId} onChanged={() => setTick((t) => t + 1)} onReloadPage={() => setEditorNonce((n) => n + 1)} /></aside>}
    </div>
  );
}
