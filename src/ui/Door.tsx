import { useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { doorClosed, localDay } from '../core/goals';

// Door closed: through a day she chooses, nothing in the program judges the draft. The phrase is
// Stephen King's: the first draft is written with the door closed, for the writer alone; the door
// opens for revision. Everything is still there, and any of it can be looked at on purpose.

const longDay = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', timeZone: 'UTC' });

/** In place of a judging tool while the door is closed. */
export function DoorNote({ ctx, what, children }: { ctx: Ctx; what: string; children: React.ReactNode }) {
  const [look, setLook] = useState(false);
  if (!doorClosed(ctx.settings) || look) return <>{children}</>;
  return (
    <p className="small door-note" role="note">The door is closed until {longDay(ctx.settings.doorClosedUntil)}, so {what} wait{what.endsWith('s') ? '' : 's'} until then. <button className="btn link small" onClick={() => setLook(true)}>Look anyway</button></p>
  );
}

/** Settings: close the door until a day, or open it. */
export function DoorSetting({ ctx, onError }: { ctx: Ctx; onError: (m: string) => void }) {
  const until: string | null = ctx.settings.doorClosedUntil ?? null;
  const closed = doorClosed(ctx.settings);
  const suggested = ctx.settings.push?.end && ctx.settings.push.end >= localDay() ? ctx.settings.push.end : (() => { const d = new Date(); d.setDate(d.getDate() + 30); return localDay(d); })();
  const [day, setDay] = useState<string>(closed && until ? until : suggested);
  async function save(v: string | null) {
    try { await api.patch(`/api/projects/${ctx.projectId}/settings`, { doorClosedUntil: v }); await ctx.refreshProject(); } catch (e) { onError((e as Error).message); }
  }
  return (
    <section className="section" aria-labelledby="door-h">
      <h2 id="door-h">Door closed</h2>
      <p className="muted small">A first draft is for getting the story down, not for getting it right. With the door closed, nothing judges your pages: no red spelling underlines, no echoes, watch words or long sentences in Read it back, no story review or misspelled names in Narrative Zoom, and the collaborator stays quiet about problems unless you ask. Your plans, notes, search and reading aloud all stay. Anything can still be looked at on purpose, and the door opens on its own the day after the date you choose.</p>
      <div className="row small">
        {closed ? (
          <>
            <span>The door is closed through <strong>{longDay(until!)}</strong>.</span>
            <label className="row">Change the day <input type="date" value={day} min={localDay()} onChange={(e) => setDay(e.target.value)} style={{ width: 'auto' }} /></label>
            {day !== until && <button className="btn small" onClick={() => void save(day)}>Save</button>}
            <button className="btn link small" onClick={() => void save(null)}>Open the door now</button>
          </>
        ) : (
          <>
            <label className="row">Keep it closed through <input type="date" value={day} min={localDay()} onChange={(e) => setDay(e.target.value)} style={{ width: 'auto' }} /></label>
            <button className="btn small" disabled={!day} onClick={() => void save(day)}>Close the door</button>
          </>
        )}
      </div>
    </section>
  );
}
