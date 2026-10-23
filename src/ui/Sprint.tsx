import { useEffect, useRef, useState } from 'react';
import { api } from './api';
import { flushEditor } from './flush';
import { recordSprint } from './Coach';

// A sprint: a set stretch of focused writing. While it runs, the page is all there is: no binder, no
// tabs, no notices, no word counts, no red underlines. Only a small clock in the corner, and Capture
// (Ctrl+Shift+N) for a thought that will not wait. When time is up she sees what she wrote and can
// keep going; nothing ever stops her mid-sentence.

export interface SprintState {
  minutes: number;
  startedAt: string;
  /** When the clock runs out, or null while it is paused. */
  endsAt: number | null;
  /** Time left when paused. */
  left: number;
  full: boolean;
  /** Time is up and she kept going: the page stays quiet, with no clock. */
  overtime: boolean;
}

const CHOICES = [15, 30, 60];

export function SprintChooser({ onStart, onClose }: { onStart: (minutes: number, full: boolean) => void; onClose: () => void }) {
  const [minutes, setMinutes] = useState<number>(() => { try { return Number(localStorage.getItem('ns-sprint-min')) || 30; } catch { return 30; } });
  const [other, setOther] = useState('');
  const [full, setFull] = useState<boolean>(() => { try { return localStorage.getItem('ns-sprint-full') !== '0'; } catch { return true; } });
  const chosen = other ? Math.round(Number(other)) : minutes;
  const ok = Number.isFinite(chosen) && chosen >= 1 && chosen <= 240;
  function start() {
    if (!ok) return;
    try { localStorage.setItem('ns-sprint-min', String(chosen)); localStorage.setItem('ns-sprint-full', full ? '1' : '0'); } catch { /* ignore */ }
    onStart(chosen, full);
  }
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="sprint-h" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') { e.preventDefault(); start(); } }}>
      <div className="dialog sprint-dialog">
        <h2 id="sprint-h">Sprint</h2>
        <p className="small muted" style={{ marginTop: 0 }}>A set time of nothing but the page. Everything else goes away until the clock runs out: the binder, the tabs, notices, word counts and red underlines. Ctrl+Shift+N still catches a thought that will not wait.</p>
        <div className="row" role="radiogroup" aria-label="How long">
          {CHOICES.map((m) => (
            <label key={m} className="choice-pill"><input type="radio" name="sprint-min" checked={!other && minutes === m} onChange={() => { setMinutes(m); setOther(''); }} />{m} minutes</label>
          ))}
          <label className="row small">Other <input type="number" min={1} max={240} value={other} onChange={(e) => setOther(e.target.value)} aria-label="Other length, in minutes" style={{ width: '5rem' }} /> minutes</label>
        </div>
        <label className="row small" style={{ margin: '0.75rem 0' }}><input type="checkbox" checked={full} onChange={(e) => setFull(e.target.checked)} />Fill the whole screen</label>
        <div className="row">
          <button className="btn write" disabled={!ok} onClick={start} autoFocus>Start the sprint</button>
          <button className="btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const say = (ms: number) => {
  const m = Math.ceil(ms / 60_000);
  return ms <= 0 ? 'Time' : ms < 60_000 ? 'Under a minute' : `${m} min`;
};

/** The small clock in the corner. A click shows Pause and End; otherwise it stays out of the way. */
export function SprintClock({ sprint, onPause, onResume, onEnd, onTimeUp, problem }: { sprint: SprintState; onPause: () => void; onResume: () => void; onEnd: () => void; onTimeUp: () => void; problem?: string }) {
  const [now, setNow] = useState(Date.now());
  const [open, setOpen] = useState(false);
  const fired = useRef(false);
  useEffect(() => { const t = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(t); }, []);
  const left = sprint.endsAt == null ? sprint.left : sprint.endsAt - now;
  useEffect(() => { if (!sprint.overtime && sprint.endsAt != null && left <= 0 && !fired.current) { fired.current = true; onTimeUp(); } }, [left, sprint, onTimeUp]);
  // A save problem is the one thing worth breaking the quiet for.
  const warn = problem ? <span data-unsaved role="alert">{problem}</span> : null;
  if (sprint.overtime) {
    return <div className="sprint-clock" data-open={open || undefined}>{warn}<button className="sprint-time" onClick={() => setOpen((o) => !o)} aria-expanded={open}>Still writing</button>{open && <button className="btn link small" onClick={onEnd}>Done</button>}</div>;
  }
  return (
    <div className="sprint-clock" data-open={open || problem ? true : undefined} role="timer" aria-label={`Sprint, ${say(left)} left${sprint.endsAt == null ? ', paused' : ''}`}>
      {warn}
      <button className="sprint-time" onClick={() => setOpen((o) => !o)} aria-expanded={open} title="Pause or end the sprint">{sprint.endsAt == null ? `Paused, ${say(left)}` : say(left)}</button>
      {open && (
        <span className="row small" style={{ gap: '0.5rem' }}>
          {sprint.endsAt == null ? <button className="btn link small" onClick={() => { onResume(); setOpen(false); }}>Resume</button> : <button className="btn link small" onClick={() => { onPause(); setOpen(false); }}>Pause</button>}
          <button className="btn link small" onClick={onEnd}>End the sprint</button>
        </span>
      )}
    </div>
  );
}

/** Time is up: what she wrote, in a note that never takes the cursor from the page. */
export function SprintEnd({ projectId, sprint, kind, onKeepGoing, onDone, onAnother }: { projectId: string; sprint: SprintState; kind: 'time' | 'early' | 'over'; onKeepGoing: () => void; onDone: () => void; onAnother: () => void }) {
  const [words, setWords] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    void (async () => {
      await flushEditor(); // the last words typed count
      try { const r = await api.get(`/api/projects/${projectId}/words-since?at=${encodeURIComponent(sprint.startedAt)}`); if (alive) setWords(r.words); recordSprint(projectId, kind === 'time' ? sprint.minutes : (Date.now() - Date.parse(sprint.startedAt)) / 60000, r.words); } catch { if (alive) setWords(null); }
    })();
    return () => { alive = false; };
  }, [projectId, sprint.startedAt]); // eslint-disable-line react-hooks/exhaustive-deps
  const span = kind === 'time' ? `in ${sprint.minutes} minute${sprint.minutes === 1 ? '' : 's'}` : 'this sprint';
  const counted = words == null ? 'Counting…' : words > 0 ? `${words.toLocaleString()} word${words === 1 ? '' : 's'} ${span}.` : words < 0 ? `You cut ${(-words).toLocaleString()} words ${span}. That is writing too.` : 'Time with the page counts too.';
  return (
    <div className="sprint-end" role="status">
      <p><strong>{kind === 'time' ? 'Time.' : 'Sprint over.'}</strong> {counted}{kind === 'time' ? ' Finish your sentence; nothing has stopped.' : ''}</p>
      <div className="row small">
        {kind === 'time' && <button className="btn small write" onClick={onKeepGoing}>Keep going</button>}
        <button className="btn small" onClick={onAnother}>Another sprint</button>
        <button className="btn link small" onClick={onDone}>Done</button>
      </div>
    </div>
  );
}

export async function enterFull() { try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); return true; } catch { return false; } }
export async function leaveFull() { try { if (document.fullscreenElement) await document.exitFullscreen(); } catch { /* ignore */ } }
