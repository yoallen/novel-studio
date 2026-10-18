import { useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { showLaterNote, selectLaterNow } from './Editor';
import { flushEditor } from './flush';

// Notes left in the page for later, [[like this]], gathered in one list. Click one to open its scene
// with the note selected. A note leaves the list when its brackets leave the page.
export function LaterList({ ctx, sceneId, limit }: { ctx: Ctx; sceneId?: string; limit?: number }) {
  const [list, setList] = useState<any[] | null>(null);
  const [all, setAll] = useState(false);
  useEffect(() => {
    let alive = true;
    const load = () => api.get(`/api/projects/${ctx.projectId}/later`).then((l) => { if (alive) setList(l); }).catch(() => { if (alive) setList([]); });
    // In the scene plan, save the page first so a note just typed is in the list.
    if (sceneId) void flushEditor().then(load); else void load();
    return () => { alive = false; };
  }, [ctx.projectId, sceneId]);
  if (!list) return null;
  const mine = sceneId ? list.filter((x) => x.sceneId === sceneId) : list;
  if (sceneId && !mine.length) return null;
  const shown = all || !limit ? mine : mine.slice(0, limit);
  return (
    <section className={sceneId ? 'section' : undefined} aria-label="Left for later" style={sceneId ? undefined : { marginBottom: '2rem' }}>
      <h3>Left for later{mine.length ? ` (${mine.length})` : ''}</h3>
      {!mine.length ? (
        <p className="small muted">Nothing waiting. While you write, type a note inside double brackets, [[like this]], or press Ctrl+Shift+L, and keep going. It lands here, and it is not counted as story words.</p>
      ) : (
        <>
          <ul className="later-list">
            {shown.map((x, i) => (
              <li key={`${x.sceneId}-${x.raw}-${x.nth}-${i}`}>
                <button className="btn link small" style={{ textAlign: 'left' }} onClick={() => { if (sceneId === x.sceneId && selectLaterNow(x.raw, x.nth)) return; showLaterNote(x.sceneId, x.raw, x.nth); ctx.openScene(x.sceneId); }}>
                  <span className="later-text">{x.note || '(an empty note)'}</span>
                </button>
                {!sceneId && <span className="later-where">Chapter {x.chapterNumber}, {x.sceneTitle}{x.before ? `: “${x.before.trim()}”` : ''}</span>}
              </li>
            ))}
          </ul>
          {limit && mine.length > limit && <button className="btn link small" onClick={() => setAll((a) => !a)}>{all ? 'Show fewer' : `Show all ${mine.length}`}</button>}
        </>
      )}
    </section>
  );
}
