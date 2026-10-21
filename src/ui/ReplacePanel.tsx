import { useEffect, useRef, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { flushEditor } from './flush';

interface Match { n: number; before: string; found: string; after: string }
interface SceneHits { sceneId: string; version: number; sceneTitle: string; sceneNumber: number; chapterTitle: string; chapterNumber: number; kept: boolean; matches: Match[] }
interface Preview { total: number; scenes: SceneHits[] }

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const key = (s: SceneHits, m: Match) => `${s.sceneId}:${m.n}`;

// Find and replace in her pages only. She sees every change first, ticks what should change,
// and the whole replace is one step in the Story Trail.
export function ReplacePanel({ ctx, startWith }: { ctx: Ctx; startWith: string }) {
  const [find, setFind] = useState(startWith);
  const [repl, setRepl] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWords, setWholeWords] = useState(true);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [off, setOff] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ replaced: number; scenes: number } | null>(null);
  const timer = useRef<number>();
  const asked = useRef(0);

  async function look() {
    const n = ++asked.current;
    if (!find.trim()) { setPreview(null); return; }
    try {
      await flushEditor(); // the last words typed are on the page before anything is counted
      const p = await api.post<Preview>(`/api/projects/${ctx.projectId}/replace/preview`, { find, replace: repl, matchCase, wholeWords });
      if (n !== asked.current) return;
      setPreview(p); setOff(new Set()); setError('');
    } catch (e) { if (n === asked.current) setError((e as Error).message); }
  }

  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void look(), 250);
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [find, repl, matchCase, wholeWords, ctx.projectId]);

  const open = (preview?.scenes ?? []).filter((s) => !s.kept);
  const ticked = open.flatMap((s) => s.matches.filter((m) => !off.has(key(s, m))).map(() => s.sceneId));
  const tickedScenes = new Set(ticked).size;
  const toggle = (ks: string[], on: boolean) => { const n = new Set(off); ks.forEach((k) => (on ? n.delete(k) : n.add(k))); setOff(n); };

  async function replaceNow() {
    if (!preview || !ticked.length) return;
    setBusy(true); setError('');
    try {
      await flushEditor();
      const picks = open.map((s) => ({ sceneId: s.sceneId, version: s.version, matches: s.matches.filter((m) => !off.has(key(s, m))).map((m) => m.n) })).filter((p) => p.matches.length);
      const r = await api.post(`/api/projects/${ctx.projectId}/replace`, { find, replace: repl, matchCase, wholeWords, picks });
      setDone({ replaced: r.replaced, scenes: r.scenes });
      setPreview(null);
      void ctx.refreshProject();
    } catch (e) {
      setError((e as Error).message);
      void look();
    } finally { setBusy(false); }
  }

  // Chapters in order, each with its scenes.
  const chapters: { title: string; number: number; scenes: SceneHits[] }[] = [];
  for (const s of preview?.scenes ?? []) {
    const last = chapters[chapters.length - 1];
    if (last && last.number === s.chapterNumber) last.scenes.push(s);
    else chapters.push({ title: s.chapterTitle, number: s.chapterNumber, scenes: [s] });
  }

  return (
    <section className="section replace" aria-labelledby="replace-h">
      <h2 id="replace-h">Replace in your pages</h2>
      <p className="small muted">This changes only your pages, the scenes you wrote in the Writing Room. Story records, conversations and documents stay as they are. You see every change below before anything moves.</p>
      <div className="row" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <label className="field grow"><span>Find</span><input value={find} onChange={(e) => { setFind(e.target.value); setDone(null); }} /></label>
        <label className="field grow"><span>Replace with</span><input value={repl} onChange={(e) => { setRepl(e.target.value); setDone(null); }} /></label>
      </div>
      <div className="row small">
        <label className="row"><input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} />Match case</label>
        <label className="row" title="Finds Ana on its own, not inside Banana or Anabel."><input type="checkbox" checked={wholeWords} onChange={(e) => setWholeWords(e.target.checked)} />Whole words only</label>
      </div>
      {error && <div className="notice error" role="alert">{error}</div>}
      {done && (
        <div className="notice" role="status">
          Replaced {done.replaced} in {plural(done.scenes, 'scene', 'scenes')}. To undo, use Story Trail.{' '}
          <button className="btn link small" onClick={() => ctx.go('history')}>Open Story Trail</button>
        </div>
      )}
      {preview && find.trim() && (
        preview.total === 0 ? <p className="muted small">Nothing in your pages matches that.</p> : (
          <>
            <p className="small muted" aria-live="polite">{plural(preview.total, 'match', 'matches')} in {plural(preview.scenes.length, 'scene', 'scenes')}. {ticked.length} ticked. Nothing changes until you click the button.</p>
            <div className="row" style={{ marginBottom: '0.6rem' }}>
              <button className="btn write" disabled={busy || !ticked.length} onClick={() => void replaceNow()}>Replace {ticked.length} in {plural(tickedScenes, 'scene', 'scenes')}</button>
              <button className="btn link small" onClick={() => setOff(new Set())}>Tick all</button>
              <button className="btn link small" onClick={() => toggle(open.flatMap((s) => s.matches.map((m) => key(s, m))), false)}>Untick all</button>
            </div>
            {chapters.map((c) => (
              <div key={c.number} className="replace-chapter">
                <h3>Chapter {c.number}: {c.title}</h3>
                {c.scenes.map((s) => {
                  const ks = s.matches.map((m) => key(s, m));
                  const allOn = !s.kept && ks.every((k) => !off.has(k));
                  return (
                    <div key={s.sceneId} className="replace-scene" style={{ marginBottom: '0.9rem' }}>
                      <label className="row"><input type="checkbox" disabled={s.kept} checked={allOn} onChange={(e) => toggle(ks, e.target.checked)} aria-label={`Every match in ${s.sceneTitle}`} /><strong>{s.sceneTitle}</strong><span className="small faint">{plural(s.matches.length, 'match', 'matches')}</span></label>
                      {s.kept && <p className="small notice">This scene has typing kept after the program closed unexpectedly. Open it in the Writing Room and decide about that first. Then it can be replaced here.</p>}
                      <ul className="list" style={{ marginLeft: '1.5rem' }}>
                        {s.matches.map((m) => (
                          <li key={m.n}>
                            <label className="check">
                              <input type="checkbox" disabled={s.kept} checked={!s.kept && !off.has(key(s, m))} onChange={(e) => toggle([key(s, m)], e.target.checked)} aria-label={`${s.sceneTitle}, match ${m.n + 1}`} />
                              <span className="diff">{m.before}<span className="removed">{m.found}</span>{repl && <span className="added">{repl}</span>}{m.after}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        )
      )}
    </section>
  );
}
