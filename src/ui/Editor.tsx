import { doorClosed } from '../core/goals';
import { withoutLater } from '../core/later';
import { LaterNotes } from './laterMarks';
import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { api, ApiError } from './api';
import type { Ctx } from './App';
import { registerFlush, registerEditor, selectRange, textMap, currentEditor } from './flush';

// Saving model (R-B-005, R-B-006):
//  - every pause of under a second writes the text to the crash-safe journal, and the indicator says Saved;
//  - after a longer pause, on leaving the scene, or on closing the window, it is committed as a revision;
//  - two windows can never silently overwrite each other: a stale commit is refused and both versions are shown.
const JOURNAL_MS = 700;
const COMMIT_MS = 20_000;

export function Editor({ ctx, sceneId, onChanged, onWords, quiet }: { ctx: Ctx; sceneId: string; onChanged: () => void; onWords?: (n: number) => void; quiet?: boolean }) {
  const [scene, setScene] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [words, setWords] = useState(0);
  const [recovery, setRecovery] = useState<any>(null);
  const [conflict, setConflict] = useState<any>(null);
  const [error, setError] = useState('');
  const version = useRef(0);
  const committedJson = useRef('');
  const dirty = useRef(false);
  const journalTimer = useRef<number>();
  const commitTimer = useRef<number>();
  const cursorTimer = useRef<number>();
  const sessionStarted = useRef(false);
  const busy = useRef<Promise<void> | null>(null);
  // The latest text lives in a ref so it can still be saved after the editor itself is torn down.
  const latest = useRef<unknown>(null);
  const recoveryPending = useRef(false);
  // Until the page can take typing, say so: nothing typed before then can be lost.
  const [opening, setOpening] = useState(true);

  const editor = useEditor({
    extensions: [StarterKit.configure({ link: false }), Placeholder.configure({ placeholder: 'Write anything. A sentence counts.' }), LaterNotes],
    content: { type: 'doc', content: [] },
    editable: false,
    onUpdate: ({ editor: ed }) => {
      latest.current = ed.getJSON();
      dirty.current = true;
      const n = countWords(ed.getText({ blockSeparator: '\n' }));
      setWords(n); onWords?.(n);
      ctx.setSaveState({ state: 'unsaved' });
      if (!sessionStarted.current) { sessionStarted.current = true; api.post(`/api/projects/${ctx.projectId}/sessions/start`).catch(() => {}); }
      window.clearTimeout(journalTimer.current);
      journalTimer.current = window.setTimeout(() => void journal(), JOURNAL_MS);
      window.clearTimeout(commitTimer.current);
      commitTimer.current = window.setTimeout(() => void commit(), COMMIT_MS);
    },
    onSelectionUpdate: ({ editor: ed }) => {
      const { from, to } = ed.state.selection;
      ctx.cursorRef.current = { from, to };
      window.clearTimeout(cursorTimer.current);
      cursorTimer.current = window.setTimeout(() => {
        api.put(`/api/projects/${ctx.projectId}/writing-state`, { sceneId, cursor: { from, to }, view: { scrollTop: document.querySelector('.pagewrap')?.scrollTop ?? 0 } }).catch(() => {});
      }, 800);
    },
  });

  useEffect(() => { registerEditor(editor ?? null); return () => registerEditor(null); }, [editor]);

  // Door closed or a sprint running: no red underlines on the page. Spelling waits for December.
  const hush = !!quiet || doorClosed(ctx.settings);
  useEffect(() => { editor?.view.dom.setAttribute('spellcheck', hush ? 'false' : 'true'); }, [editor, hush]);

  // Today's goal, as Where was I? works it out (a day she set, or an even share of what is left).
  const [target, setTarget] = useState<number | null>(null);
  useEffect(() => {
    const tz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return ''; } })();
    const load = () => api.get(`/api/projects/${ctx.projectId}/progress${tz ? `?tz=${encodeURIComponent(tz)}` : ''}`).then((r) => setTarget(r.dailyGoal ?? null)).catch(() => setTarget(null));
    void load();
    // A new day brings a new goal, even with the page left open overnight.
    const t = window.setInterval(() => void load(), 5 * 60_000);
    return () => window.clearInterval(t);
  }, [ctx.projectId, ctx.settings]);

  async function journal(opts: { keepalive?: boolean } = {}) {
    if (!dirty.current || !latest.current || recoveryPending.current) return;
    try {
      await api.put(`/api/scenes/${sceneId}/autosave`, { doc: latest.current, baseVersion: version.current }, opts);
      ctx.setSaveState({ state: 'saved' });
    } catch (e) { ctx.setSaveState({ state: 'error', message: e instanceof ApiError && e.status === 0 ? 'Not saved: service unreachable' : 'Not saved' }); }
  }

  async function commit(opts: { keepalive?: boolean } = {}) {
    if (!latest.current || recoveryPending.current) return;
    const docJson = JSON.stringify(latest.current);
    if (docJson === committedJson.current) { dirty.current = false; return; }
    if (busy.current) await busy.current;
    const run = (async () => {
      try {
        const saved = await api.put(`/api/scenes/${sceneId}/prose`, { doc: JSON.parse(docJson), expectVersion: version.current }, opts);
        version.current = saved.prose_version;
        committedJson.current = docJson;
        dirty.current = JSON.stringify(latest.current) !== docJson;
        if (!dirty.current) ctx.setSaveState({ state: 'saved' });
        onChanged();
      } catch (e) {
        if (e instanceof ApiError && e.status === 409) setConflict({ mine: JSON.parse(docJson), theirs: e.detail?.current });
        else ctx.setSaveState({ state: 'error', message: e instanceof ApiError && e.status === 0 ? 'Not saved: service unreachable' : 'Not saved' });
      }
    })();
    busy.current = run;
    await run;
    busy.current = null;
  }

  // Load the scene, offer recovery of uncommitted typing, and put the cursor back where it was.
  useEffect(() => {
    let alive = true;
    if (!editor) return;
    setOpening(true);
    (async () => {
      try {
        const [s, ws, recs] = await Promise.all([
          api.get(`/api/scenes/${sceneId}`),
          api.get(`/api/projects/${ctx.projectId}/writing-state`),
          api.get(`/api/projects/${ctx.projectId}/recoveries`),
        ]);
        if (!alive) return;
        setScene(s); setTitle(s.title); titleRef.current = s.title; savedTitle.current = s.title; setWords(s.word_count);
        version.current = s.prose_version;
        committedJson.current = JSON.stringify(s.doc);
        editor.commands.setContent(s.doc, { emitUpdate: false });
        latest.current = s.doc;
        const rec = recs.find((r: any) => r.scene_id === sceneId);
        if (rec) {
          // Nothing may overwrite kept typing until she has chosen: the page stays read-only meanwhile.
          recoveryPending.current = true;
          setRecovery(await api.get(`/api/scenes/${sceneId}/recovery`));
          setOpening(false);
          return;
        }
        editor.setEditable(true); setOpening(false);
        if (findLater(sceneId)) { ctx.setSaveState({ state: 'saved' }); return; }
        const cur = ws?.state?.sceneId === sceneId ? ws.state.cursor : null;
        const size = editor.state.doc.content.size;
        if (cur && typeof cur.from === 'number') {
          editor.commands.setTextSelection({ from: Math.min(cur.from, size), to: Math.min(cur.to ?? cur.from, size) });
          editor.commands.scrollIntoView();
        } else editor.commands.focus('end');
        editor.commands.focus();
        ctx.setSaveState({ state: 'saved' });
        api.put(`/api/projects/${ctx.projectId}/writing-state`, { sceneId }).catch(() => {});
      } catch (e) { if (alive) setError((e as Error).message); }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, sceneId]);

  // Commit when leaving the scene or closing the window.
  useEffect(() => {
    registerFlush(async () => { if (dirty.current) { await journal(); await commit(); } });
    // Journal first, then commit: if the commit is refused (another window) or never arrives, the typing
    // is still in the journal and is offered back the next time the scene opens.
    const flush = () => { if (dirty.current) void journal({ keepalive: true }).then(() => commit({ keepalive: true })); };
    window.addEventListener('pagehide', flush);
    const onVis = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVis);
      window.clearTimeout(journalTimer.current); window.clearTimeout(commitTimer.current); window.clearTimeout(cursorTimer.current);
      registerFlush(null);
      flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  // The title is saved from a ref, so a quick Enter or a click elsewhere can never save a stale value.
  const titleRef = useRef('');
  const savedTitle = useRef('');
  async function saveTitle() {
    const t = titleRef.current.trim();
    if (!t) { setTitle(savedTitle.current); titleRef.current = savedTitle.current; return; }
    if (t === savedTitle.current) return;
    savedTitle.current = t;
    try { await api.patch(`/api/scenes/${sceneId}`, { title: t }); onChanged(); }
    catch (e) { savedTitle.current = ''; setError((e as Error).message); }
  }

  async function useRecovered() {
    if (!editor || !recovery) return;
    editor.commands.setContent(recovery.doc, { emitUpdate: false });
    latest.current = recovery.doc;
    dirty.current = true;
    recoveryPending.current = false;
    setRecovery(null);
    await commit();
    editor.setEditable(true); setOpening(false); editor.commands.focus('end');
  }
  async function keepSaved() {
    // The kept typing is saved as an earlier version first, so choosing never discards anything.
    if (recovery) {
      try {
        const cur = await api.get(`/api/scenes/${sceneId}`);
        const saved = await api.put(`/api/scenes/${sceneId}/prose`, { doc: recovery.doc, expectVersion: cur.prose_version, reason: 'kept typing (not chosen)' });
        const back = await api.put(`/api/scenes/${sceneId}/prose`, { doc: cur.doc, expectVersion: saved.prose_version, reason: 'kept the saved version' });
        version.current = back.prose_version; committedJson.current = JSON.stringify(back.doc); latest.current = back.doc;
      } catch { /* fall through: the journal entry stays until she decides again */ return; }
    }
    recoveryPending.current = false; setRecovery(null);
    editor?.setEditable(true); setOpening(false); editor?.commands.focus('end');
  }

  async function resolveConflict(choice: 'mine' | 'theirs' | 'both') {
    if (!editor || !conflict) return;
    const theirs = conflict.theirs;
    if (choice === 'theirs') {
      version.current = theirs.version; committedJson.current = JSON.stringify(theirs.doc);
      editor.commands.setContent(theirs.doc, { emitUpdate: false }); latest.current = theirs.doc; dirty.current = false; ctx.setSaveState({ state: 'saved' });
    } else if (choice === 'mine') {
      version.current = theirs.version; setConflict(null); await commit(); return;
    } else {
      const mine = latest.current;
      const copy = await api.post(`/api/chapters/${scene.chapter_id}/scenes`, { title: `${scene.title} (my version)`, doc: mine, afterSceneId: sceneId });
      version.current = theirs.version; committedJson.current = JSON.stringify(theirs.doc);
      editor.commands.setContent(theirs.doc, { emitUpdate: false }); latest.current = theirs.doc; dirty.current = false; ctx.setSaveState({ state: 'saved' });
      onChanged();
      setConflict(null);
      ctx.openScene(copy.id);
      return;
    }
    setConflict(null);
  }

  return (
    <div className="page" data-opening={opening || undefined}>
      {error && <div className="notice error" role="alert">{error}</div>}
      {opening && <p className="opening" role="status">Opening the page…</p>}
      {scene?.reserved && <p className="hers" style={{ marginBottom: '1rem' }}>{scene.reserved}</p>}
      <input className="scene-title" aria-label="Scene title" disabled={!scene} value={title} onChange={(e) => { setTitle(e.target.value); titleRef.current = e.target.value; }} onBlur={() => void saveTitle()} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void saveTitle(); editor?.commands.focus(); } }} />
      <EditorContent editor={editor} />
      {!quiet && <div className="wordline"><span>{words.toLocaleString()} words in this scene{target ? `, today's goal ${target.toLocaleString()}` : ''}</span>{!hush && <span className="faint"> Ctrl+Shift+L leaves a note for later</span>}</div>}

      {recovery && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="rec-h"><div className="dialog">
          <h2 id="rec-h">Typing from {new Date(recovery.saved_at).toLocaleString()} was kept</h2>
          <p>The program closed before this typing became a saved version. Nothing has been lost. Choose which one to keep; the other stays in this scene's earlier versions.</p>
          <h3>Kept typing</h3><blockquote className="tail">{recovery.text.slice(-600) || '(empty)'}</blockquote>
          <div className="row"><button className="btn write" onClick={() => void useRecovered()}>Use the kept typing</button><button className="btn" onClick={() => void keepSaved()}>Keep the saved version</button></div>
        </div></div>
      )}
      {conflict && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="con-h"><div className="dialog">
          <h2 id="con-h">This scene was changed in another window</h2>
          <p>Nothing has been overwritten. Choose what to keep.</p>
          <h3>The other window's version</h3><blockquote className="tail">{conflict.theirs?.text?.slice(-500) || '(empty)'}</blockquote>
          <div className="row">
            <button className="btn write" onClick={() => void resolveConflict('both')}>Keep both as separate scenes</button>
            <button className="btn" onClick={() => void resolveConflict('mine')}>Keep this window's</button>
            <button className="btn" onClick={() => void resolveConflict('theirs')}>Keep the other window's</button>
          </div>
        </div></div>
      )}
    </div>
  );
}

function countWords(text: string): number {
  const m = withoutLater(text).match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu);
  return m ? m.length : 0;
}

/** Opened from the list of notes for later: select that note on the page. */
export function showLaterNote(sceneId: string, raw: string, nth: number) {
  try { sessionStorage.setItem('ns-later', JSON.stringify({ sceneId, raw, nth })); } catch { /* ignore */ }
}
function findLater(sceneId: string): boolean {
  let want: { sceneId: string; raw: string; nth: number } | null = null;
  try { want = JSON.parse(sessionStorage.getItem('ns-later') ?? 'null'); } catch { /* ignore */ }
  if (!want || want.sceneId !== sceneId) return false;
  try { sessionStorage.removeItem('ns-later'); } catch { /* ignore */ }
  return selectLaterNow(want.raw, want.nth);
}
/** Select a note on the open page: its nth appearance, since the same note can be left twice. */
export function selectLaterNow(raw: string, nth: number): boolean {
  const ed = currentEditor();
  if (!ed) return false;
  const text = textMap(ed).text;
  let at = -1;
  for (let i = 0; i <= nth; i++) { const next = text.indexOf(raw, at + 1); if (next < 0) break; at = next; }
  return at >= 0 && selectRange(at, at + raw.length);
}
