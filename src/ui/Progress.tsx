import { openAtPage } from './Pages';
import { useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { doorClosed } from '../core/goals';

// Drafting progress on Where was I: one column per day, marked the way facts are marked.
// Ink where the day's goal was met, pencil where words went down short of it, a blank line
// where none did, and the author's magenta under today.

const tz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return ''; } })();
const n = (x: number) => x.toLocaleString();
const longDay = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', timeZone: 'UTC' });
const monthOf = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString(undefined, { month: 'long', timeZone: 'UTC' });

export function DraftingProgress({ ctx }: { ctx: Ctx }) {
  const [r, setR] = useState<any>(null);
  const load = () => api.get(`/api/projects/${ctx.projectId}/progress${tz ? `?tz=${encodeURIComponent(tz)}` : ''}`).then(setR).catch(() => setR(null));
  useEffect(() => { void load(); }, [ctx.projectId]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!r) return null;

  const name = r.push?.name || (r.push ? 'Your writing push' : monthOf(r.today));
  const daily: number | null = r.dailyGoal;
  const top = Math.max(daily ?? 0, ...r.days.map((d: any) => Math.max(d.words, d.goal ?? 0)), 1);
  const rest = (d: any) => d.set && d.goal === 0;
  const markOf = (d: any) => d.future ? (rest(d) ? 'rest' : 'future') : d.words <= 0 ? (rest(d) ? 'rest' : 'blank') : d.goal == null || d.words >= d.goal ? 'ink' : 'pencil';
  const said = (d: any) => {
    const set = d.set ? (d.goal === 0 ? ', a rest day you set' : `, a day you set at ${n(d.goal)}`) : '';
    if (d.future) return `${longDay(d.day)}, still ahead${set}`;
    return `${longDay(d.day)}${d.today ? ' (today)' : ''}: ${d.words < 0 ? `${n(-d.words)} words cut` : `${n(d.words)} words`}${d.goal ? (d.words >= d.goal ? ', goal met' : ` of ${n(d.goal)}`) : ''}${set}`;
  };
  const showNumber = (d: any, i: number) => i === 0 || d.today || Number(d.day.slice(8)) % 5 === 0;

  return (
    <section className="drafting" aria-labelledby="drafting-h">
      <h3 id="drafting-h">{name}</h3>

      {r.status === 'ahead' ? (
        <>
          <p className="drafting-lead">{name} starts {r.daysLeft === 0 ? 'today' : `on ${longDay(r.start)}`}.{r.goal ? ` ${n(r.goal)} words in ${r.days.length} days is about ${n(r.perDayNeeded)} a day${r.setDays.length ? ' on the days you have not set' : ''}.` : ''}</p>
          {/* Until the push begins, today still counts and is still shown. */}
          <p className="small muted" style={{ margin: '0 0 0.75rem' }}>Today, {n(Math.max(0, r.todayWords))} words. The chart below fills in once {name} begins.</p>
        </>
      ) : r.status === 'ended' ? (
        <p className="drafting-lead">{name} is done: <b>{n(r.total)}</b> words{r.goal ? ` of ${n(r.goal)}` : ''}.</p>
      ) : (
        <p className="drafting-lead">{daily === 0 && r.todaySet
          ? <>Today is a rest day you set.{r.todayWords > 0 ? <> You wrote <b>{n(r.todayWords)}</b> words anyway, and they all count.</> : ''}</>
          : daily === 0 && r.push?.words && r.remaining > 0 ? <>Today, <b>{n(Math.max(0, r.todayWords))}</b> words. Your set days cover what is left, so today is yours to spend.</>
          : <>Today, <b>{n(Math.max(0, r.todayWords))}</b> words{daily ? <> of your {n(daily)}</> : ''}.{daily && r.todayWords >= daily ? ' The day’s goal is met.' : ''}</>}</p>
      )}

      <ol className="tally" aria-label={`Words each day, ${longDay(r.start)} to ${longDay(r.end)}`} style={{ gridTemplateColumns: `repeat(${r.days.length}, minmax(0, 1fr))` }}>
        {r.days.map((d: any, i: number) => (
          <li key={d.day} data-mark={markOf(d)} data-today={d.today || undefined} aria-label={said(d)} title={said(d)}>
            <span className="tally-col">
              <span className="tally-bar" style={{ height: `${d.words > 0 ? Math.max(6, (d.words / top) * 100) : 0}%` }} />
              {d.goal > 0 && <span className="tally-goal" data-set={d.set || undefined} style={{ bottom: `${(d.goal / top) * 100}%` }} />}
            </span>
            <span className="tally-day" aria-hidden="true">{showNumber(d, i) ? Number(d.day.slice(8)) : ''}</span>
          </li>
        ))}
      </ol>

      <dl className="drafting-figures">
        {r.status !== 'ahead' && <div><dt>{r.push ? 'So far' : `${monthOf(r.today)} so far`}</dt><dd>{n(r.total)}{r.goal ? <span className="muted"> of {n(r.goal)}</span> : null} words</dd></div>}
        {r.status === 'running' && r.goal ? (
          <div><dt>To finish on time</dt><dd>{r.remaining === 0 ? 'Done. Everything now is extra.'
            : r.perDayNeeded == null && r.shortfall > 0 ? <>Your set days leave {n(r.shortfall)} words with no day to write them. Raise a set day or clear one.</>
            : !r.perDayNeeded ? <>Your set days cover what is left.</>
            : daily != null && r.todayWords >= daily && r.afterToday ? <>about {n(r.afterToday.perDay)} a day after today<span className="muted">, {r.afterToday.days} day{r.afterToday.days === 1 ? '' : 's'} left{r.setDays.some((x: any) => x.day > r.today) ? ', counting the days you set' : ''}</span></>
            : <>about {n(r.perDayNeeded)} a day<span className="muted">, {r.daysLeft} day{r.daysLeft === 1 ? '' : 's'} left{r.setDays.length ? ', counting the days you set' : ''}</span></>}</dd></div>
        ) : null}
        {r.status === 'running' && r.behind != null && r.remaining !== 0 && Math.abs(r.behind) >= 50 ? (
          <div><dt>Against the plan</dt><dd>{r.behind > 0 ? <>{n(r.behind)} behind<span className="muted">, spread over the days ahead</span></> : <>{n(-r.behind)} ahead</>}</dd></div>
        ) : null}
        {r.status !== 'ahead' && <div><dt>Days in a row</dt><dd>{r.streak === 0 ? <span className="muted">Starts with your next words</span> : n(r.streak)}</dd></div>}
        <div><dt>The whole book</dt><dd>{n(r.bookWords)}{r.targetWords ? <span className="muted"> of {n(r.targetWords)}</span> : null} words</dd></div>
      </dl>

      {r.push?.words && r.status !== 'ended' ? <SetDays ctx={ctx} r={r} onChanged={() => void load()} /> : null}
      {r.push && r.status !== 'ended' && (
        doorClosed(ctx.settings)
          ? <p className="small door-note" style={{ margin: '0.5rem 0 0' }}>The door is closed through {longDay(ctx.settings.doorClosedUntil)}. Nothing judges the draft until then.</p>
          : <p className="small" style={{ margin: '0.5rem 0 0' }}><button className="btn link small" onClick={() => void api.patch(`/api/projects/${ctx.projectId}/settings`, { doorClosedUntil: r.end }).then(() => ctx.refreshProject())}>Close the door through {longDay(r.end)}</button> <span className="muted">Nothing judges the draft until then. Change it in Settings.</span></p>
      )}

      {!daily && !r.push && (
        <p className="small muted">Set a daily word goal, or a writing push such as November, and this shows how you are tracking. <button className="btn link small" onClick={() => { openAtPage(`settings:${ctx.projectId}`, 1); ctx.go('settings'); }}>Settings</button></p>
      )}
    </section>
  );
}

/** Days she sets herself: a lighter day, a rest day, or a bigger one. The rest of the push takes up the difference. */
function SetDays({ ctx, r, onChanged }: { ctx: Ctx; r: any; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState<string>(r.today >= r.start ? r.today : r.start);
  const [words, setWords] = useState('500');
  const [error, setError] = useState('');
  async function put(d: string, w: number | null) {
    setError('');
    try { await api.put(`/api/projects/${ctx.projectId}/day-goal`, { day: d, words: w }); await ctx.refreshProject(); onChanged(); setOpen(false); }
    catch (e) { setError((e as Error).message); }
  }
  const first = r.today >= r.start ? r.today : r.start;
  return (
    <div className="set-days">
      {r.setDays.length > 0 && (
        <ul className="small" aria-label="Days you set">
          {r.setDays.map((x: any) => (
            <li key={x.day}>{longDay(x.day)}: {x.words === 0 ? 'rest day' : `${n(x.words)} words`} <button className="btn link small" aria-label={`Clear ${longDay(x.day)}`} onClick={() => void put(x.day, null)}>Clear</button></li>
          ))}
        </ul>
      )}
      {!open ? (
        <button className="btn link small" onClick={() => setOpen(true)}>Set a lighter day</button>
      ) : (
        <div className="row small" role="group" aria-label="Set a day">
          <label className="row">Day <input type="date" value={day} min={first} max={r.end} onChange={(e) => setDay(e.target.value)} style={{ width: 'auto' }} /></label>
          <label className="row">Words <input type="number" min={0} step={50} value={words} onChange={(e) => setWords(e.target.value)} style={{ width: '6rem' }} /></label>
          <button className="btn small" disabled={!day || words === '' || Number(words) < 0} onClick={() => void put(day, Math.round(Number(words)))}>Set it</button>
          <button className="btn link small" onClick={() => void put(day, 0)}>Make it a rest day</button>
          <button className="btn link small" onClick={() => setOpen(false)}>Cancel</button>
        </div>
      )}
      {open && <p className="small muted" style={{ margin: '0.4rem 0 0' }}>That day's goal becomes your number, and the days you have not set share the difference. Nothing is held against you.</p>}
      {error && <div className="notice error small" role="alert">{error}</div>}
    </div>
  );
}
