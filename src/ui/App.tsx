import { useCallback, useEffect, useRef, useState } from 'react';
import { BRAND } from '../brand';
import { api, ApiError } from './api';
import { SyncNotice } from './SyncViews';
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
import { NovelSetup } from './NovelSetup';
import { DraftsView } from './DraftsView';
import { MethodsView } from './MethodsView';
import { Help } from './Help';
import { SprintChooser, SprintClock, SprintEnd, SprintState, enterFull, leaveFull } from './Sprint';
import { flushEditor, currentEditor } from './flush';

export type View = 'home' | 'write' | 'brain' | 'zoom' | 'conversations' | 'search' | 'trail' | 'history' | 'trash' | 'files' | 'settings' | 'setup' | 'drafts' | 'methods' | 'help';
const VIEW_NAMES: Record<View, string> = {
  home: 'Where was I?', write: 'The Writing Room', brain: 'Story Brain', zoom: 'Narrative Zoom', conversations: 'Conversations', search: 'Search', trail: 'Writing Trail', history: 'Story Trail', trash: 'Deleted', files: 'Import and export', settings: 'Settings', setup: 'Novel setup', drafts: 'Drafts', methods: 'My methods', help: 'Help',
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
  /** Open I'm stuck. Given the open scene's id (from the Writing Room), it starts at that scene's beat. */
  openStuck: (fromSceneId?: unknown) => void;
  currentSceneId: string | null;
  /** A sprint is running: the page is all there is. */
  sprinting: boolean;
  startSprint: () => void;
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
  const [captured, setCaptured] = useState('');
  useEffect(() => {
    let t = 0;
    const f = (e: Event) => { const m = (e as CustomEvent).detail?.message; if (!m) return; setCaptured(m); window.clearTimeout(t); t = window.setTimeout(() => setCaptured(''), 5000); };
    window.addEventListener('ns-captured', f);
    return () => { window.removeEventListener('ns-captured', f); window.clearTimeout(t); };
  }, []);
  const [zoomReq, setZoomReq] = useState<ZoomRequest>(null);
  // I'm stuck remembers the scene it was opened from, so it can start at that scene's beat.
  const [stuck, setStuck] = useState<false | { sceneId: string | null }>(false);
  // "Return to Writing" is offered once there is writing to return to: she has been on the page, or the page has words.
  const [beenWriting, setBeenWriting] = useState(false);
  const [error, setError] = useState<string>('');
  const cursorRef = useRef<{ from: number; to: number } | null>(null);
  const [sprint, setSprint] = useState<SprintState | null>(null);
  const [choosingSprint, setChoosingSprint] = useState(false);
  const [sprintEnd, setSprintEnd] = useState<'time' | 'early' | 'over' | null>(null);
  const sprintRef = useRef<SprintState | null>(null);
  sprintRef.current = sprint;
  const [helpAt, setHelpAt] = useState<string | null>(null);
  const [helpNonce, setHelpNonce] = useState(0);
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
    setProject(null); setSettings(null); setSceneId(null);
    // What a view had open belongs to its own book: switching books never shows the other book's record.
    try {
      if (projectId && sessionStorage.getItem('ns-book') !== projectId) {
        for (const k of ['ns-brain-sel', 'ns-conv', 'ns-zoom-node', 'ns-zoom-tab']) sessionStorage.removeItem(k);
        sessionStorage.setItem('ns-book', projectId);
      }
    } catch { /* ignore */ }
    let first: View = 'home';
    try { const v = sessionStorage.getItem('ns-open-view'); if (v) { first = v as View; sessionStorage.removeItem('ns-open-view'); } } catch { /* ignore */ }
    setView(first);
    try { if (projectId) localStorage.setItem('novel-studio-last-project', projectId); else localStorage.removeItem('novel-studio-last-project'); } catch { /* ignore */ }
    void refreshProject();
    setBeenWriting(false);
    if (projectId) api.get(`/api/projects/${projectId}/writing-state`).then((w) => {
      if (!w.state?.sceneId) return;
      setSceneId(w.state.sceneId);
      // A page with words on it is worth returning to, even in a new session.
      api.get(`/api/scenes/${w.state.sceneId}`).then((s) => { if (s.word_count > 0) setBeenWriting(true); }).catch(() => {});
    }).catch(() => {});
  }, [projectId, refreshProject]);

  useEffect(() => { if (view === 'write') setBeenWriting(true); }, [view]);

  // Leaving the page for anything else records a detour on the Writing Trail (R-B-016, R-B-017).
  const go = useCallback((v: View) => {
    // The Writing Trail is part of the Writing Room: opening it is not a detour of its own.
    if (viewRef.current === 'write' && v !== 'write' && v !== 'trail' && sceneId && projectId) {
      api.post(`/api/projects/${projectId}/trail`, { from: { sceneId, cursor: cursorRef.current }, to: { view: v }, reason: `Went to ${VIEW_NAMES[v]}` }).catch(() => {});
      // Save the page first, so the next view never mistakes ordinary typing for typing kept after a crash.
      void flushEditor().finally(() => setView(v));
      return;
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
      if (next.planId) { const s = await api.post(`/api/elements/${next.planId}/write-scene`, {}); openScene(s.id); return; }
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

  async function startSprint(minutes: number, full: boolean) {
    setChoosingSprint(false); setSprintEnd(null);
    await flushEditor();
    await goWrite();
    setSprint({ minutes, startedAt: new Date().toISOString(), endsAt: Date.now() + minutes * 60_000, left: minutes * 60_000, full, overtime: false });
    if (full) void enterFull();
    // The cursor goes straight to the end of the page, so the first words typed land in the scene.
    const focusPage = (tries: number) => { const ed = currentEditor(); if (ed && ed.isEditable) ed.commands.focus('end'); else if (tries > 0) window.setTimeout(() => focusPage(tries - 1), 150); };
    window.setTimeout(() => focusPage(20), 100);
  }
  function stopSprint() { setSprint(null); setSprintEnd(null); void leaveFull(); }

  // "Learn more" anywhere opens Help at the right section; F1 opens Help.
  useEffect(() => {
    const f = (e: Event) => { setHelpAt(String((e as CustomEvent).detail ?? '') || null); setHelpNonce((n) => n + 1); setView('help'); };
    const k = (e: KeyboardEvent) => { if (e.key === 'F1' && !sprintRef.current) { e.preventDefault(); setHelpAt(null); setView('help'); } };
    window.addEventListener('ns-help', f); window.addEventListener('keydown', k);
    return () => { window.removeEventListener('ns-help', f); window.removeEventListener('keydown', k); };
  }, []);

  // Keyboard: Ctrl+Shift+N capture, Ctrl+K search, Ctrl+Shift+W return to writing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!projectId) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.shiftKey && e.key.toLowerCase() === 'n') { e.preventDefault(); setCapturing(true); }
      else if (sprintRef.current) return; // during a sprint nothing leads away from the page
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
    return <div className="content"><h1>{BRAND.name}</h1><p>Open the program from its desktop shortcut. This window was opened without the app's security key, so it cannot reach your work.</p></div>;
  }
  if (!projectId) return <Library onOpen={setProjectId} />;
  if (!project || !settings) return <div className="content muted">{error || 'Opening your novel…'}</div>;

  const ctx: Ctx = { projectId, project, settings, refreshProject, openScene, closeScene: () => { setSceneId(null); api.put(`/api/projects/${projectId}/writing-state`, { sceneId: null }).catch(() => {}); }, go, setSaveState: setSave, capture: () => setCapturing(true), currentSceneId: sceneId, cursorRef,
    sprinting: !!sprint, startSprint: () => setChoosingSprint(true),
    showInMap: (sid: string) => { void api.get(`/api/scenes/${sid}/locate`).then((node) => { setZoomReq({ node, nonce: Date.now() }); go('zoom'); }).catch((e) => setError(e.message)); },
    openStuck: (from?: unknown) => setStuck({ sceneId: typeof from === 'string' ? from : null }) };
  const saveText = save.state === 'saving' ? 'Saving…' : save.state === 'saved' ? 'Saved' : save.state === 'unsaved' ? 'Not saved yet' : save.state === 'error' ? (save.message ?? 'Not saved') : '';

  const PRIMARY: View[] = ['home', 'write', 'brain', 'zoom', 'conversations'];
  const SECONDARY: View[] = ['search', 'history', 'files', 'settings', 'help'];
  // Pages reached from another one light up the tab they belong to.
  const PARENT: Partial<Record<View, View>> = { setup: 'settings', methods: 'settings', trash: 'history', drafts: 'write', trail: 'write' };
  const tab = (v: View) => <button key={v} aria-current={view === v || PARENT[view] === v ? 'page' : undefined} onClick={() => (v === 'write' ? void goWrite() : go(v))}>{VIEW_NAMES[v]}{v === 'home' && <span className="home-tag" aria-hidden="true">your novel's home page</span>}</button>;
  return (
    <div className="app" data-sprint={sprint ? true : undefined}>
      <Strip projectId={projectId} sceneId={sceneId} refresh={view} onOpen={() => go('zoom')} />
      <div className="colophon" aria-hidden="true">{BRAND.company ? `${BRAND.name}, ${BRAND.company}` : BRAND.name}</div>
      <div className="leaf" data-view={view}>
        <header className="running">
          {view !== 'write' && sceneId && beenWriting && (
            <button className="ribbon" onClick={() => void returnToWriting()} title="Return to Writing (Ctrl+Shift+W)"><span>Return to Writing</span></button>
          )}
          <button className="btn link small" onClick={() => setProjectId(null)} title="All novels">Library</button>
          <BookSwitcher current={projectId!} title={project.title} onOpen={(id) => setProjectId(id)} />
          <span className="spacer" />
          {view === 'write' && saveText && <span className="saved" data-state={save.state} role="status" aria-live="polite"><span className="dot" />{saveText}</span>}
          <span className="where">{VIEW_NAMES[view]}</span>
          {captured && <span className="captured-note small" role="status">{captured}</span>}
          <button className="btn small" onClick={() => setCapturing(true)} title="Capture a thought (Ctrl+Shift+N)">Capture</button>
        </header>
        <SyncNotice projectId={projectId} onTook={() => window.location.reload()} />
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
          {view === 'setup' && <NovelSetup ctx={ctx} />}
          {view === 'drafts' && <DraftsView ctx={ctx} />}
          {view === 'methods' && <MethodsView ctx={ctx} />}
          {view === 'help' && <Help key={helpNonce} anchor={helpAt} />}
        </main>
      </div>
      {/* The views, cut into the fore-edge like a dictionary's thumb index. */}
      <nav aria-label="Views" className="thumbs">
        {PRIMARY.map(tab)}
        <span className="and" aria-hidden="true">and</span>
        <div className="minor">{SECONDARY.map(tab)}</div>
      </nav>
      {sprint && !sprintEnd && (
        <SprintClock sprint={sprint} problem={save.state === 'error' ? (save.message ?? 'Not saved') : undefined}
          onPause={() => setSprint((x) => x && x.endsAt != null ? { ...x, left: Math.max(0, x.endsAt - Date.now()), endsAt: null } : x)}
          onResume={() => { setSprint((x) => x && x.endsAt == null ? { ...x, endsAt: Date.now() + x.left } : x); currentEditor()?.commands.focus(); }}
          onEnd={() => setSprintEnd(sprint.overtime ? 'over' : 'early')}
          onTimeUp={() => setSprintEnd('time')} />
      )}
      {sprint && sprintEnd && (
        <SprintEnd projectId={projectId} sprint={sprint} kind={sprintEnd}
          onKeepGoing={() => { setSprint((x) => x && { ...x, overtime: true }); setSprintEnd(null); currentEditor()?.commands.focus(); }}
          onDone={stopSprint}
          onAnother={() => { stopSprint(); setChoosingSprint(true); }} />
      )}
      {choosingSprint && <SprintChooser onStart={(m, f) => void startSprint(m, f)} onClose={() => setChoosingSprint(false)} />}
      {stuck && <Stuck ctx={ctx} fromSceneId={stuck.sceneId} onClose={() => setStuck(false)} onShowBeat={(id) => { setStuck(false); setZoomReq({ node: { level: 'beat', id }, nonce: Date.now() }); go('zoom'); }} />}
      {capturing && <CaptureDialog ctx={ctx} sceneId={view === 'write' ? sceneId : null} onClose={() => setCapturing(false)} />}
    </div>
  );
}

/** The book's shape, always in view: the beats (or, for a book found in the writing, its chapters), what is placed, and where she is. */
function Strip({ projectId, sceneId, refresh, onOpen }: { projectId: string; sceneId: string | null; refresh: string; onOpen: () => void }) {
  const [d, setD] = useState<any>(null);
  // Narrative Zoom says when the structure changes (a beat sheet chosen, a card placed), so the strip redraws at once.
  const [bump, setBump] = useState(0);
  useEffect(() => { const on = () => setBump((n) => n + 1); window.addEventListener('storycanon:structure', on); return () => window.removeEventListener('storycanon:structure', on); }, []);
  useEffect(() => { api.get(`/api/projects/${projectId}/strip${sceneId ? `?scene=${sceneId}` : ''}`).then(setD).catch(() => setD(null)); }, [projectId, sceneId, refresh, bump]);
  const segs: any[] = d?.segments ?? [];
  if (!segs.length) return <div className="strip" />;
  const pct = (x: number) => `${Math.max(0, Math.min(100, x * 100))}%`;
  const acts = d.mode === 'beats' ? (['I', 'IIA', 'IIB', 'III'] as const).map((a) => { const ss = segs.filter((x) => x.act === a); return ss.length ? { a, from: Math.min(...ss.map((x) => x.from)), to: Math.max(...ss.map((x) => x.to)) } : null; }).filter(Boolean) as { a: string; from: number; to: number }[] : [];
  const here = segs.find((x) => x.id === d.here);
  const placed = segs.reduce((n, x) => n + x.decided, 0), maybe = segs.reduce((n, x) => n + x.maybe, 0);
  const summary = d.mode === 'beats' ? `${placed} card${placed === 1 ? '' : 's'} placed, ${maybe} that might go somewhere${here ? `, you are at ${here.name}` : ''}` : `${segs.length} chapter${segs.length === 1 ? '' : 's'}${here ? `, you are in ${here.name}` : ''}`;
  return (
    <div className="strip" role="group" aria-label={`The book's shape: ${summary}`}>
      <div className="line">
        {acts.map((x, i) => {
          const next = acts[i + 1];
          const to = next ? (x.to + next.from) / 2 : 1;
          const from = i === 0 ? 0 : (acts[i - 1]!.to + x.from) / 2;
          return <span key={x.a} className="act" style={{ left: pct(from), width: `calc(${pct(to - from)} - 3px)` }}><em>{d.acts[x.a]}</em></span>;
        })}
        {d.mode === 'chapters' && segs.map((x, i) => <span key={x.id} className="act" style={{ left: pct(x.from), width: `calc(${pct(x.to - x.from)} - 3px)` }}>{i === 0 || x.to - x.from > 0.08 ? <em>{x.name}</em> : null}</span>)}
        {segs.map((x) => {
          const mid = (x.from + x.to) / 2;
          const pips = [...Array(Math.min(x.decided, 5)).fill('d'), ...Array(Math.min(x.maybe, Math.max(0, 5 - x.decided))).fill('m')];
          return (
            <button key={x.id} className={x.to - x.from > 0.02 ? 'beat span' : 'beat'} style={x.to - x.from > 0.02 ? { left: pct(x.from), width: pct(x.to - x.from) } : { left: pct(mid) }} onClick={onOpen}
              title={`${x.name}${x.decided ? `, ${x.decided} placed` : ''}${x.maybe ? `, ${x.maybe} might go here` : ''}`} aria-label={x.name}>
              {pips.map((p, k) => <i key={k} className={`pip ${p}`} style={{ left: `calc(50% + ${(k - (pips.length - 1) / 2) * 7}px)` }} />)}
            </button>
          );
        })}
        {here && <span className="here" style={{ left: pct((here.from + here.to) / 2) }} title={`You are at ${here.name}`} />}
      </div>
    </div>
  );
}

/** Move between books without going back to the Library: each one opens where you left it. */
function BookSwitcher({ current, title, onOpen }: { current: string; title: string; onOpen: (id: string) => void }) {
  const [books, setBooks] = useState<{ id: string; title: string; stage: string | null }[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => { if (open) api.get('/api/library').then(setBooks).catch(() => {}); }, [open]);
  return (
    <span className="switcher">
      <button className="title" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} title="Switch to another novel">{title} <span aria-hidden="true" className="faint">▾</span></button>
      {open && (
        <ul role="menu" className="switch-menu" onMouseLeave={() => setOpen(false)}>
          {books.map((b) => (
            <li key={b.id} role="none"><button role="menuitem" aria-current={b.id === current ? 'true' : undefined} onClick={() => { setOpen(false); if (b.id !== current) onOpen(b.id); }}>{b.title}{b.stage && <span className="faint small"> {b.stage}</span>}</button></li>
          ))}
        </ul>
      )}
    </span>
  );
}
