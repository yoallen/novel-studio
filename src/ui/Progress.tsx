import { useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';

// Drafting progress on Where was I: one column per day, marked the way facts are marked.
// Ink where the day's goal was met, pencil where words went down short of it, a blank line
// where none did, and the author's magenta under today.

const tz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return ''; } })();
const n = (x: number) => x.toLocaleString();
const longDay = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', timeZone: 'UTC' });
const monthOf = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString(undefined, { month: 'long', timeZone: 'UTC' });

export function DraftingProgress({ ctx }: { ctx: Ctx }) {
  const [r, setR] = useState<any>(null);
  useEffect(() => {
    api.get(`/api/projects/${ctx.projectId}/progress${tz ? `?tz=${encodeURIComponent(tz)}` : ''}`).then(setR).catch(() => setR(null));
  }, [ctx.projectId]);
  if (!r) return null;

  const name = r.push?.name || (r.push ? 'Your writing push' : monthOf(r.today));
  const daily: number | null = r.dailyGoal;
  const top = Math.max(daily ?? 0, ...r.days.map((d: any) => d.words), 1);
  const markOf = (d: any) => d.future ? 'future' : d.words <= 0 ? 'blank' : !daily || d.words >= daily ? 'ink' : 'pencil';
  const said = (d: any) => d.future ? `${longDay(d.day)}, still ahead` :
    `${longDay(d.day)}${d.today ? ' (today)' : ''}: ${d.words < 0 ? `${n(-d.words)} words cut` : `${n(d.words)} words`}${daily && !d.future ? (d.words >= daily ? ', goal met' : '') : ''}`;
  const showNumber = (d: any, i: number) => i === 0 || d.today || Number(d.day.slice(8)) % 5 === 0;

  return (
    <section className="drafting" aria-labelledby="drafting-h">
      <h3 id="drafting-h">{name}</h3>

      {r.status === 'ahead' ? (
        <p className="drafting-lead">{name} starts {r.daysLeft === 0 ? 'today' : `on ${longDay(r.start)}`}.{r.goal ? ` ${n(r.goal)} words in ${r.days.length} days is about ${n(r.perDayNeeded)} a day.` : ''}</p>
      ) : r.status === 'ended' ? (
        <p className="drafting-lead">{name} is done: <b>{n(r.total)}</b> words{r.goal ? ` of ${n(r.goal)}` : ''}.</p>
      ) : (
        <p className="drafting-lead">Today, <b>{n(Math.max(0, r.todayWords))}</b> words{daily ? <> of your {n(daily)}</> : ''}.{daily && r.todayWords >= daily ? ' The day’s goal is met.' : ''}</p>
      )}

      <ol className="tally" aria-label={`Words each day, ${longDay(r.start)} to ${longDay(r.end)}`} style={{ gridTemplateColumns: `repeat(${r.days.length}, minmax(0, 1fr))`, ['--goal' as string]: daily ? daily / top : 0 }} data-goal={daily ? true : undefined}>
        {r.days.map((d: any, i: number) => (
          <li key={d.day} data-mark={markOf(d)} data-today={d.today || undefined} aria-label={said(d)} title={said(d)}>
            <span className="tally-col"><span className="tally-bar" style={{ height: `${d.words > 0 ? Math.max(6, (d.words / top) * 100) : 0}%` }} /></span>
            <span className="tally-day" aria-hidden="true">{showNumber(d, i) ? Number(d.day.slice(8)) : ''}</span>
          </li>
        ))}
      </ol>

      <dl className="drafting-figures">
        {r.status !== 'ahead' && <div><dt>{r.push ? 'So far' : `${monthOf(r.today)} so far`}</dt><dd>{n(r.total)}{r.goal ? <span className="muted"> of {n(r.goal)}</span> : null}</dd></div>}
        {r.status === 'running' && r.goal ? (
          <div><dt>To finish on time</dt><dd>{r.remaining === 0 ? 'Done. Everything now is extra.' : <>about {n(r.perDayNeeded)} a day<span className="muted">, {r.daysLeft} day{r.daysLeft === 1 ? '' : 's'} left</span></>}</dd></div>
        ) : null}
        {r.status !== 'ahead' && <div><dt>Days in a row</dt><dd>{r.streak === 0 ? <span className="muted">Starts with your next words</span> : n(r.streak)}</dd></div>}
        <div><dt>The whole book</dt><dd>{n(r.bookWords)}{r.targetWords ? <span className="muted"> of {n(r.targetWords)}</span> : null}</dd></div>
      </dl>

      {!daily && !r.push && (
        <p className="small muted">Set a daily word goal, or a writing push such as November, and this shows how you are tracking. <button className="btn link small" onClick={() => ctx.go('settings')}>Settings</button></p>
      )}
    </section>
  );
}
