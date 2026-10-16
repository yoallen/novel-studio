import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError } from './api';
import { Library } from './Library';
import { Home } from './Home';
import { Desk } from './Desk';
import { SearchView } from './SearchView';
import { StoryBrain } from './StoryBrain';
import { ConversationsView } from './ConversationsView';
import { NarrativeZoom, Stuck, ZoomRequest } from './NarrativeZoom';
import { TrailView, HistoryView, TrashView } from './Records';
import { SettingsView } from './SettingsView';
import { CaptureDialog } from './CaptureDialog';
import { FilesView } from './FilesView';

export type View = 'home' | 'write' | 'brain' | 'zoom' | 'conversations' | 'search' | 'trail' | 'history' | 'trash' | 'files' | 'settings';
const VIEW_NAMES: Record<View, string> = {
  home: 'Where was I', write: 'The Writing Room', brain: 'Story Brain', zoom: 'Narrative Zoom', conversations: 'Conversations', search: 'Search', trail: 'Writing Trail', history: 'Story Trail', trash: 'Deleted', files: 'Import and export', settings: 'Settings',
};

export interface Ctx {
  projectId: string;
  project: any;
  settings: any;
  refreshProject: () => Promise<void>;
  openScene: (sceneId: string) => void;
  closeScene: () => void;
  go: (v: View) => void;
  setSaveState: (s: SaveState) => void;
  capture: () => void;
  showInMap: (sceneId: string) => void;
  openStuck: () => void;
  currentSceneId: string | null;
  cursorRef: React.MutableRefObject<{ from: number; to: number } | null>;
}
export type SaveState = { state: 'idle' | 'unsaved' | 'saving' | 'saved' | 'error'; message?: string };

export function App() {
  const [projectId, setProjectId] = useState<string | null>(() => { try { return localStorage.getItem('novel-studio-last-project'); } catch { return null; } });
  const [project, setProject] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [view, setView] = useState<View>('home');
  const [sceneId, setSceneId] = useState<string | null>(null);
  const [save, setSave] = useState<SaveState>({ state: 'idle' });
  const [capturing, setCapturing] = useState(false);
  const [zoomReq, setZoomReq] = useState<ZoomRequest>(null);
  const [stuck, setStuck] = useState(false);
  const [error, setError] = useState<string>('');
  const cursorRef = useRef<{ from: number; to: number } | null>(null);
  const viewRef = useRef<View>('home');
  viewRef.current = view;

  const refreshProject = useCallback(async () => {
    if (!projectId) return;
    try {
      const [p, s] = await Promise.all([api.get(`/api/projects/${projectId}`), api.get(`/api/projects/${projectId}/settings`)]);
      setProject(p); setSettings(s);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) { setProjectId(null); return; }
      setError((e as Error).message);
    }
  }, [projectId]);

  useEffect(() => {
    setProject(null); setSettings(null); setSceneId(null); setView('home');
    try { if (projectId) localStorage.setItem('novel-studio-last-project', projectId); else localStorage.removeItem('novel-studio-last-project'); } catch { /* ignore */ }
    void refreshProject();
    if (projectId) api.get(`/api/projects/${projectId}/writing-state`).then((w) => { if (w.state?.sceneId) setSceneId(w.state.sceneId); }).catch(() => {});
  }, [projectId, refreshProject]);

  // Leaving the page for anything else records a detour on the Writing Trail (R-B-016, R-B-017).
  const go = useCallback((v: View) => {
    if (viewRef.current === 'write' && v !== 'write' && sceneId && projectId) {
      api.post(`/api/projects/${projectId}/trail`, { from: { sceneId, cursor: cursorRef.current }, to: { view: v }, reason: `Went to ${VIEW_NAMES[v]}` }).catch(() => {});
    }
    setView(v);
  }, [sceneId, projectId]);

  const openScene = useCallback((id: string) => { setSceneId(id); setView('write'); }, []);

  // "Write" always lands on a page: the open scene, the next action's scene, or a new blank scene (R-B-013).
  const goWrite = useCallback(async () => {
    if (sceneId) { openScene(sceneId); return; }
    if (!projectId) return;
    try {
      const next = await api.get(`/api/projects/${projectId}/next-action`);
      if (next.sceneId) { openScene(next.sceneId); return; }
      const o = await api.get(`/api/projects/${projectId}/outline`);
      const all = (o.chapters as any[]).flatMap((c) => c.scenes as any[]);
      if (all.length) { openScene(all.reduce((a, b) => (a.updated_at > b.updated_at ? a : b)).id); return; }
      let chapterId = o.chapters[o.chapters.length - 1]?.id;
      if (!chapterId) chapterId = (await api.post(`/api/projects/${projectId}/chapters`, {})).id;
      const s = await api.post(`/api/chapters/${chapterId}/scenes`, {});
      openScene(s.id);
    } catch (e) { setError((e as Error).message); }
  }, [sceneId, projectId, openScene]);

  const returnToWriting = useCallback(async () => {
    if (!projectId) return;
    const w = await api.get(`/api/projects/${projectId}/writing-state`).catch(() => null);
    const target = w?.state?.sceneId ?? sceneId;
    await api.post(`/api/projects/${projectId}/trail/return`).catch(() => {});
    if (target) { setSceneId(target); setView('write'); }
  }, [projectId, sceneId]);

  // Keyboard: Ctrl+Shift+N capture, Ctrl+K search, Ctrl+Shift+W return to writing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!projectId) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.shiftKey && e.key.toLowerCase() === 'n') { e.preventDefault(); setCapturing(true); }
      else if (mod && !e.shiftKey && e.key.toLowerCase() === 'k') { e.preventDefault(); go('search'); }
      else if (mod && e.shiftKey && e.key.toLowerCase() === 'w') { e.preventDefault(); void returnToWriting(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [projectId, go, returnToWriting]);

  useEffect(() => { const f = () => void returnToWriting(); window.addEventListener('ns-return-to-writing', f); return () => window.removeEventListener('ns-return-to-writing', f); }, [returnToWriting]);

  // Close the writing session when the window closes.
  useEffect(() => {
    if (!projectId) return;
    const end = () => api.beacon(`/api/projects/${projectId}/sessions/end`);
    window.addEventListener('pagehide', end);
    return () => window.removeEventListener('pagehide', end);
  }, [projectId]);

  if (!api.hasToken()) {
    return <div className="content"><h1>Story Canon</h1><p>Open the program from its desktop shortcut. This window was opened without the app's security key, so it cannot reach your work.</p></div>;
  }
  if (!projectId) return <Library onOpen={setProjectId} />;
  if (!project || !settings) return <div className="content muted">{error || 'Opening your novel…'}</div>;

  const ctx: Ctx = { projectId, project, settings, refreshProject, openScene, closeScene: () => { setSceneId(null); api.put(`/api/projects/${projectId}/writing-state`, { sceneId: null }).catch(() => {}); }, go, setSaveState: setSave, capture: () => setCapturing(true), currentSceneId: sceneId, cursorRef,
    showInMap: (sid: string) => { void api.get(`/api/scenes/${sid}/locate`).then((node) => { setZoomReq({ node, nonce: Date.now() }); go('zoom'); }).catch((e) => setError(e.message)); },
    openStuck: () => setStuck(true) };
  const saveText = save.state === 'saving' ? 'Saving…' : save.state === 'saved' ? 'Saved' : save.state === 'unsaved' ? 'Not saved yet' : save.state === 'error' ? (save.message ?? 'Not saved') : '';

  return (
    <div className="app">
      <header className="topbar">
        <button className="btn link small" onClick={() => setProjectId(null)} title="All novels">Library</button>
        <span className="title">{project.title}</span>
        <nav aria-label="Views">
          {(['home', 'write', 'brain', 'zoom', 'conversations', 'search', 'history', 'trash', 'files', 'settings'] as View[]).map((v) => (
            <button key={v} aria-current={view === v ? 'page' : undefined} onClick={() => (v === 'write' ? void goWrite() : go(v))}>{VIEW_NAMES[v]}</button>
          ))}
        </nav>
        <span className="spacer" />
        {view === 'write' && saveText && <span className="saved" data-state={save.state} role="status" aria-live="polite"><span className="dot" />{saveText}</span>}
        <button className="btn small" onClick={() => setCapturing(true)} title="Capture a thought (Ctrl+Shift+N)">Capture</button>
        {view !== 'write' && sceneId && <button className="return" onClick={() => void returnToWriting()} title="Ctrl+Shift+W">Return to Writing</button>}
      </header>
      <main className="main">
        {view === 'home' && <Home ctx={ctx} />}
        {view === 'write' && <Desk ctx={ctx} sceneId={sceneId} />}
        {view === 'brain' && <StoryBrain ctx={ctx} />}
        {view === 'zoom' && <NarrativeZoom ctx={ctx} request={zoomReq} />}
        {view === 'conversations' && <ConversationsView ctx={ctx} />}
        {view === 'search' && <SearchView ctx={ctx} />}
        {view === 'trail' && <TrailView ctx={ctx} />}
        {view === 'history' && <HistoryView ctx={ctx} />}
        {view === 'trash' && <TrashView ctx={ctx} />}
        {view === 'files' && <FilesView ctx={ctx} />}
        {view === 'settings' && <SettingsView ctx={ctx} />}
      </main>
      {stuck && <Stuck ctx={ctx} onClose={() => setStuck(false)} />}
      {capturing && <CaptureDialog ctx={ctx} sceneId={view === 'write' ? sceneId : null} onClose={() => setCapturing(false)} />}
    </div>
  );
}
