import { useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';

// The push coach on the Today page of Where was I?: during a writing push, a note for the day, a milestone
// when one is crossed, what being behind or ahead takes, and, when she's stuck, the next scene to write
// with one question to start on. It speaks only during a push, and Settings can turn it off.

const tz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return ''; } })();
const n = (x: number) => x.toLocaleString();

/** Her sprints on this computer: minutes and words, newest last. Kept for her pace, nothing else. */
const sprintKey = (projectId: string) => `ns-sprints:${projectId}`;
export function recordSprint(projectId: string, minutes: number, words: number) {
  if (!(minutes >= 5) || !(words > 0)) return;
  try {
    const list = JSON.parse(localStorage.getItem(sprintKey(projectId)) || '[]') as { m: number; w: number }[];
    list.push({ m: Math.round(minutes), w: words });
    localStorage.setItem(sprintKey(projectId), JSON.stringify(list.slice(-20)));
  } catch { /* ignore */ }
}
export function sprintPace(projectId: string): number | null {
  try {
    const list = JSON.parse(localStorage.getItem(sprintKey(projectId)) || '[]') as { m: number; w: number }[];
    const m = list.reduce((a, s) => a + s.m, 0), w = list.reduce((a, s) => a + s.w, 0);
    return list.length && m > 0 ? w / m : null;
  } catch { return null; }
}

export function CoachCard({ ctx }: { ctx: Ctx }) {
  const [c, setC] = useState<any>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const wpm = sprintPace(ctx.projectId);
    const q = [tz ? `tz=${encodeURIComponent(tz)}` : '', wpm ? `wpm=${wpm.toFixed(2)}` : ''].filter(Boolean).join('&');
    api.get(`/api/projects/${ctx.projectId}/coach${q ? `?${q}` : ''}`).then(setC).catch(() => setC(null));
  }, [ctx.projectId]);
  if (!c?.show) return null;

  async function writeIt() {
    if (c.stuck.sceneId) { ctx.openScene(c.stuck.sceneId); return; }
    const s = await api.post(`/api/elements/${c.stuck.cardId}/write-scene`, {});
    ctx.openScene(s.id);
  }
  async function quiet() {
    await api.patch(`/api/projects/${ctx.projectId}/settings`, { coach: false });
    await ctx.refreshProject();
    setC(null);
  }

  const when = c.phase === 'before'
    ? (c.daysUntil === 1 ? `${c.name} starts tomorrow` : `${c.name} starts in ${c.daysUntil} days`)
    : c.phase === 'after' ? `${c.name} is done` : `${c.name || 'Your writing push'}, day ${c.dayNo} of ${c.daysTotal}`;
  const share = c.goal ? Math.min(1, Math.max(0, c.total / c.goal)) : null;
  const spotHead = c.spotlight ? (c.spotlight.kind === 'fun' ? 'Just for fun' : c.spotlight.kind === 'writer' ? 'About a writer' : 'About writing') : '';

  return (
    <section className="coach" aria-labelledby="coach-h">
      <header className="coach-top">
        <p className="coach-when">{when}</p>
        {/* How far along is drawn below, in the shape of the book; here, only the next milestone. */}
        {share != null && c.phase === 'during' && c.next && <p className="coach-next">Next milestone: {c.next.title.toLowerCase()}, {n(c.next.toGo)} words to go.</p>}
      </header>

      {/* One slip of paper: a milestone, when there is one, written above the day's note in the same pen. */}
      <article className="coach-note" data-own={c.note.kind === 'own' || undefined}>
        {c.milestone && (
          <div className="coach-milestone" role="status">
            <p className="coach-milestone-title">{c.milestone.title}{c.milestone.when === 'yesterday' ? ', yesterday' : ''}: {n(c.milestone.words)} words</p>
            <p className="coach-body">{c.milestone.body}</p>
          </div>
        )}
        <h3 id="coach-h">{c.note.title}</h3>
        <p className="coach-body">{c.note.body}</p>
        {c.note.from && <p className="coach-from">From {c.note.from}</p>}
      </article>

      {c.spotlight && (
        <aside className="coach-spot" data-kind={c.spotlight.kind}>
          <p className="coach-spot-head">{spotHead}</p>
          <p className="coach-spot-text">{c.spotlight.text}</p>
        </aside>
      )}

      {c.recap && (
        <p className="coach-pace">
          You wrote <b>{n(c.recap.total)}</b> words{c.recap.goal ? ` of ${n(c.recap.goal)}` : ''}{c.recap.met ? ', and you reached your goal' : ''}. You wrote on {c.recap.daysWritten} of {c.recap.daysTotal} days{c.recap.best ? `, and your biggest day was ${n(c.recap.best.words)} words` : ''}.
        </p>
      )}
      {c.pace && <p className="coach-pace" data-kind={c.pace.kind}>{c.pace.text}</p>}
      {c.where?.beat && <p className="coach-where"><span className="coach-where-head">Where you are in the book.</span> Your next scene sits at <b>{c.where.beat}</b>.{c.where.text ? ` ${c.where.text}` : ''}</p>}

      <div className="row small coach-actions">
        {c.stuck && !stuck && <button className="btn small" onClick={() => setStuck(true)}>I'm stuck</button>}
        <span className="grow" />
        <button className="btn link small" onClick={() => void quiet()} title="You can turn it back on in Settings, page 2">Turn off the coach</button>
      </div>
      {stuck && c.stuck && (
        <div className="coach-stuck">
          <p style={{ marginTop: 0 }}><b>Write this next:</b> {c.stuck.title}{c.stuck.beat ? <span className="muted"> ({c.stuck.beat})</span> : null}</p>
          {c.stuck.purpose && <p className="small"><span className="muted">What it must do:</span> {c.stuck.purpose}</p>}
          {c.stuck.turn && <p className="small"><span className="muted">Its turn:</span> {c.stuck.turn}</p>}
          {c.stuck.conflict && <p className="small"><span className="muted">Its conflict:</span> {c.stuck.conflict}</p>}
          <p className="coach-question">{c.stuck.question}</p>
          <div className="row small">
            <button className="btn small write" onClick={() => void writeIt()}>Write this scene</button>
            <button className="btn link small" onClick={() => setStuck(false)}>Not now</button>
          </div>
        </div>
      )}
    </section>
  );
}
