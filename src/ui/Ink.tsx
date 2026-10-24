import { useEffect, useState } from 'react';
import { api } from './api';
import type { Ctx } from './App';
import { rng, stroke, layoutShelf, pagesOf, CHAIR_W, pushSaid, pushEnded, layoutPushBooks, type ShelfDay } from './penGeometry';

// Pen drawings that keep the shape of the book company: the wingback chair for a rest day, a push's shelf
// of books, and the manuscript lying on the desk. One fine pen, ink and pencil, nothing filled in, and the
// words written on the drawing in the same hand.

const n = (x: number) => x.toLocaleString();
const longDay = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', timeZone: 'UTC' });
const tz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return ''; } })();

/** The wingback: a tall back, ear-shaped wings flaring past rolled arms, a cushion, a skirt, short turned legs. */
const CHAIR = [
  'M19 31 L19 9 C19 4.5 24 2.5 30 2.5 C36 2.5 41 4.5 41 9 L41 31',
  'M19 8 C13 7.5 7.5 10 7.5 15.5 C7.5 19.5 9.5 22.5 12.5 23.5',
  'M41 8 C47 7.5 52.5 10 52.5 15.5 C52.5 19.5 50.5 22.5 47.5 23.5',
  'M12.5 23.5 C9.5 23.5 8.5 26.5 10.5 28 C11.5 28.8 12 29.5 12 30.5 L12 39',
  'M47.5 23.5 C50.5 23.5 51.5 26.5 49.5 28 C48.5 28.8 48 29.5 48 30.5 L48 39',
  'M12.5 30.5 C21 29 39 29 47.5 30.5 L47.5 34 C39 35 21 35 12.5 34 Z',
  'M12 39 L48 39',
  'M15 39 C15 41.5 14.4 43.5 13.4 44.8 M45 39 C45 41.5 45.6 43.5 46.6 44.8',
];
/** A wingback chair standing on (x, y), its feet on y. About 42 wide and 34 tall at scale 0.75. */
export function Chair({ x, y, scale = 0.75, title }: { x: number; y: number; scale?: number; title?: string }) {
  return (
    <g className="pen-chair" transform={`translate(${x} ${y - 45 * scale}) scale(${scale})`} fill="none" strokeWidth={1.25 / scale * 0.8} strokeLinecap="round" strokeLinejoin="round">
      {title && <title>{title}</title>}
      <rect x={6} y={1} width={48} height={45} fill="transparent" stroke="none" />
      {CHAIR.map((d) => <path key={d} d={d} />)}
    </g>
  );
}

export type Shelf = { name: string; start: string; end: string; goal: number | null; total: number; done: boolean; current: boolean; days: ShelfDay[]; dayNo: number; daysTotal: number };

const dayTitle = (d: ShelfDay) => d.rest && d.words <= 0 ? `${longDay(d.day)}: a rest day you set` : `${longDay(d.day)}${d.today ? ' (today)' : ''}: ${n(d.words)} words${d.met ? ', goal met' : ''}`;

/** One push, as a shelf of books: a book for each day written, as thick as its words. A long push fills more than one shelf, a month to each. */
export function ShelfDrawing({ shelf, label = true }: { shelf: Shelf; label?: boolean }) {
  const W = 680, ox = 40, top = label ? 138 : 92, rowH = 116;
  const rows: ShelfDay[][] = [];
  for (let i = 0; i < shelf.days.length; i += 31) rows.push(shelf.days.slice(i, i + 31));
  const shown = rows.filter((row, k) => k === 0 || row.some((d) => !d.future));
  const r = rng(`${shelf.start}|board`);
  const name = shelf.name || 'Your writing push';
  const said = pushSaid(shelf);
  const left = shelf.daysTotal - shelf.dayNo;
  const H = top + (shown.length - 1) * rowH + 16;
  return (
    <svg className="pen-drawing shelf-drawing" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${name}: ${said}`}>
      {label && <><text className="pen-ink" x={ox - 14} y={34} fontSize={30}>{name}</text><text className="pen-pencil-text" x={ox - 14 + name.length * 12.5 + 24} y={34} fontSize={22}>{said}</text></>}
      {shown.map((row, k) => {
        const base = top + k * rowH, last = k === shown.length - 1;
        const { items, end } = layoutShelf(row, W - ox - 120, `${shelf.start}${shelf.name}${k}`, true);
        // The shelf is as long as the push: a short push, a short shelf.
        // An ended push's shelf stops just past its bookend: nothing is left to wait for.
        const board = pushEnded(shelf) ? end + 150 : Math.max(end + 40, Math.min(W - ox - 40, row.length * 22 + 60), last && left > 0 ? end + 140 : 0);
        return (
          <g key={k}>
            {items.map((it) => it.kind === 'chair'
              ? <Chair key={it.day} x={ox + it.x - 4} y={base} title={dayTitle(row.find((d) => d.day === it.day)!)} />
              : (
                <g key={it.day} className={it.ink ? 'pen-ink' : 'pen-pencil'} transform={it.lean ? `rotate(${it.lean} ${ox + it.x + it.w} ${base})` : undefined} fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <title>{dayTitle(row.find((d) => d.day === it.day)!)}</title>
                  <rect x={ox + it.x} y={base - it.h} width={it.w} height={it.h} fill="transparent" stroke="none" />
                  <path d={stroke([[ox + it.x, base], [ox + it.x, base - it.h], [ox + it.x + it.w, base - it.h], [ox + it.x + it.w, base]], r)} strokeWidth={it.ink ? 1.15 : 0.95} />
                  <path d={stroke([[ox + it.x + 1.5, base - it.h + 7], [ox + it.x + it.w - 1.5, base - it.h + 7]], r)} strokeWidth={0.7} />
                  <path d={stroke([[ox + it.x + 1.5, base - it.h + 10], [ox + it.x + it.w - 1.5, base - it.h + 10]], r)} strokeWidth={0.7} />
                  <path d={stroke([[ox + it.x + 1.5, base - 9], [ox + it.x + it.w - 1.5, base - 9]], r)} strokeWidth={0.7} />
                  {it.today && <path className="pen-pink" d={`M${ox + it.x + it.w / 2 - 2} ${base - it.h + 2} l0 ${it.h * 0.4 + 30} l2 -4 l2 4 l0 ${-(it.h * 0.4 + 30)}`} strokeWidth={1.2} />}
                </g>
              ))}
            <g className="pen-ink" fill="none" strokeLinecap="round">
              <path d={stroke([[ox - 14, base + 1], [ox + board, base + 1]], r)} strokeWidth={1.4} />
              <path d={stroke([[ox - 14, base + 8], [ox + board, base + 8]], r)} strokeWidth={0.9} />
              <path d={stroke([[ox - 14, base + 1], [ox - 14, base + 8]], r)} strokeWidth={0.9} />
              <path d={stroke([[ox + board, base + 1], [ox + board, base + 8]], r)} strokeWidth={0.9} />
            </g>
            {last && !pushEnded(shelf) && left > 0 && <>
              <path className="pen-pencil" d={stroke([[ox + end + 10, base - 4], [ox + Math.max(board, end + 130) - 12, base - 4]], r)} strokeWidth={0.8} fill="none" />
              <text className="pen-pencil-text" x={ox + end + 22} y={base - 18} fontSize={22}>{left === 1 ? '1 more day' : `${left} more days`}</text>
            </>}
            {last && pushEnded(shelf) && <>
              <path className="pen-ink" d={stroke([[ox + end + 6, base], [ox + end + 6, base - 46], [ox + end + 12, base - 46], [ox + end + 12, base - 4], [ox + end + 26, base - 4], [ox + end + 26, base]], r)} fill="none" strokeWidth={1.2} />
              <text className="pen-ink-text" x={ox + end + 36} y={base - 8} fontSize={26}>THE END</text>
            </>}
          </g>
        );
      })}
    </svg>
  );
}

/** Finished pushes, each closed into one book on a shared shelf: as thick as its words, its name down the spine, ink if it reached its goal. */
export function FinishedShelf({ shelves }: { shelves: Shelf[] }) {
  const W = 680, ox = 40, top = 56, gap = 34;
  const oldest = [...shelves].sort((a, b) => a.start.localeCompare(b.start));
  const { books, rows, ends } = layoutPushBooks(oldest, W - ox - 90);
  // Each shelf sits just under its tallest book, so there is no empty air above the books.
  const bases: number[] = [];
  for (let k = 0, y = top; k < rows; k++) { y += Math.max(60, ...books.filter((b) => b.row === k).map((b) => b.h)); bases.push(y); y += gap; }
  const H = bases[rows - 1]! + 16;
  const r = rng('finished|board');
  return (
    <svg className="pen-drawing shelf-drawing finished-shelf" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Finished pushes: ${oldest.map((p) => `${p.name || 'Writing push'}, ${pushSaid(p)}`).join(' ')}`}>
      <text className="pen-ink" x={ox - 14} y={34} fontSize={28}>Finished pushes</text>
      {Array.from({ length: rows }, (_, k) => {
        const base = bases[k]!, end = ends[k]!, board = Math.max(end + 50, 220);
        return (
          <g key={k}>
            {books.filter((b) => b.row === k).map((b) => {
              const name = b.p.name || 'Writing push', x = ox + b.x;
              return (
                <g key={b.key} className={b.ink ? 'pen-ink' : 'pen-pencil'} fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <title>{`${name}, ${longDay(b.p.start)} to ${longDay(b.p.end)}: ${pushSaid(b.p)}`}</title>
                  <rect x={x} y={base - b.h} width={b.w} height={b.h} fill="transparent" stroke="none" />
                  <path d={stroke([[x, base], [x, base - b.h], [x + b.w, base - b.h], [x + b.w, base]], r)} strokeWidth={b.ink ? 1.15 : 0.95} />
                  <path d={stroke([[x + 1.5, base - b.h + 7], [x + b.w - 1.5, base - b.h + 7]], r)} strokeWidth={0.7} />
                  <path d={stroke([[x + 1.5, base - b.h + 10], [x + b.w - 1.5, base - b.h + 10]], r)} strokeWidth={0.7} />
                  <path d={stroke([[x + 1.5, base - 9], [x + b.w - 1.5, base - 9]], r)} strokeWidth={0.7} />
                  <text className={b.ink ? 'pen-ink-text' : 'pen-pencil-text'} transform={`translate(${x + b.w / 2 - b.size * 0.33} ${base - b.h + 19}) rotate(90)`} fontSize={b.size} stroke="none">{name}</text>
                </g>
              );
            })}
            <path className="pen-ink" d={stroke([[ox + end + 6, base], [ox + end + 6, base - 46], [ox + end + 12, base - 46], [ox + end + 12, base - 4], [ox + end + 26, base - 4], [ox + end + 26, base]], r)} fill="none" strokeWidth={1.2} />
            <g className="pen-ink" fill="none" strokeLinecap="round">
              <path d={stroke([[ox - 14, base + 1], [ox + board, base + 1]], r)} strokeWidth={1.4} />
              <path d={stroke([[ox - 14, base + 8], [ox + board, base + 8]], r)} strokeWidth={0.9} />
              <path d={stroke([[ox - 14, base + 1], [ox - 14, base + 8]], r)} strokeWidth={0.9} />
              <path d={stroke([[ox + board, base + 1], [ox + board, base + 8]], r)} strokeWidth={0.9} />
            </g>
          </g>
        );
      })}
    </svg>
  );
}

/** The manuscript lying on the desk: a standard title page under a binder clip, more page edges under it as it grows. */
export function Manuscript({ title, author, words, pages, scale = 1 }: { title: string; author: string; words: number; pages: number; scale?: number }) {
  const r = rng(`${title}|ms`);
  const w = 180, h = 232, ox = 22, oy = 30;
  const edges = Math.max(1, Math.min(6, Math.round(pages / 40)));
  const t = title.length > 22 ? 22 : title.length > 14 ? 26 : 30;
  const approx = words >= 1000 ? `about ${n(Math.round(words / 100) * 100)} words` : `${n(words)} words`;
  return (
    <svg className="pen-drawing manuscript" viewBox="0 0 240 300" width={240 * scale} height={300 * scale} role="img" aria-label={`${title}: ${n(pages)} pages, ${n(words)} words`}>
      <g transform={`rotate(-3 ${ox + w / 2} ${oy + h / 2})`}>
        {Array.from({ length: edges }, (_, k) => edges - k).map((k) => (
          <g key={k}>
            <rect x={ox + k * 3.2} y={oy + k * 2.6} width={w} height={h} className="pen-paper" />
            <path className="pen-pencil" d={stroke([[ox + k * 3.2 + w, oy + k * 2.6 + 8], [ox + k * 3.2 + w, oy + k * 2.6 + h], [ox + k * 3.2 + 8, oy + k * 2.6 + h]], r)} fill="none" strokeWidth={0.75} />
          </g>
        ))}
        <rect x={ox} y={oy} width={w} height={h} className="pen-sheet" />
        <path className="pen-ink" d={stroke([[ox, oy], [ox + w, oy], [ox + w, oy + h], [ox, oy + h]], r, true)} fill="none" strokeWidth={1.15} />
        <text className="pen-pencil-text" x={ox + 12} y={oy + 22} fontSize={13}>{author}</text>
        <text className="pen-pencil-text" x={ox + w - 12} y={oy + 22} fontSize={13} textAnchor="end">{approx}</text>
        <text className="pen-ink-text" x={ox + w / 2} y={oy + h * 0.47} fontSize={t} textAnchor="middle">{title}</text>
        {author && <text className="pen-pencil-text" x={ox + w / 2} y={oy + h * 0.47 + 24} fontSize={16} textAnchor="middle">by {author}</text>}
        <g className="pen-ink" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={stroke([[ox + w / 2 - 16, oy + 10], [ox + w / 2 - 12, oy - 4], [ox + w / 2 + 12, oy - 4], [ox + w / 2 + 16, oy + 10]], r, true)} strokeWidth={1.1} fill="var(--page)" />
          <path d={stroke([[ox + w / 2 - 9, oy - 4], [ox + w / 2 - 13, oy - 20], [ox + w / 2 - 3, oy - 23]], r)} strokeWidth={0.9} />
          <path d={stroke([[ox + w / 2 + 9, oy - 4], [ox + w / 2 + 13, oy - 20], [ox + w / 2 + 3, oy - 23]], r)} strokeWidth={0.9} />
        </g>
      </g>
    </svg>
  );
}

const authorOf = (s: any) => (s?.byline || s?.authorName || '').trim();
const perPage = (s: any) => (Array.isArray(s?.wordsPerPage) && s.wordsPerPage[0]) || 250;

/** The shelf page of Where was I?: the manuscript so far, and a shelf for every push. */
export function ShelfPage({ ctx }: { ctx: Ctx }) {
  const [shelves, setShelves] = useState<Shelf[] | null>(null);
  const [words, setWords] = useState<number | null>(null);
  const [finished, setFinished] = useState<any[]>([]);
  useEffect(() => {
    api.get(`/api/projects/${ctx.projectId}/drafts`).then((d: any[]) => setFinished(d.filter((x) => x.completed_at))).catch(() => setFinished([]));
    api.get(`/api/projects/${ctx.projectId}/shelves${tz ? `?tz=${encodeURIComponent(tz)}` : ''}`).then(setShelves).catch(() => setShelves([]));
    api.get(`/api/projects/${ctx.projectId}/progress${tz ? `?tz=${encodeURIComponent(tz)}` : ''}`).then((r: any) => setWords(r.bookWords)).catch(() => setWords(0));
  }, [ctx.projectId]);
  const s = ctx.settings ?? {};
  const pp = perPage(s), target = s.targetWords as number | null;
  const pages = pagesOf(words ?? 0, pp);
  // The push she is in stands on its own shelf, day by day, above the books of the pushes already finished.
  const running = shelves?.find((x) => !pushEnded(x)) ?? null;
  const ended = shelves?.filter((x) => pushEnded(x)) ?? [];
  return (
    <div className="shelf-page">
      <section aria-labelledby="ms-h" className="ms-so-far">
        <h3 id="ms-h">The manuscript so far</h3>
        <div className="ms-row">
          <Manuscript title={ctx.project?.title || 'Your novel'} author={authorOf(s)} words={words ?? 0} pages={pages} />
          <div className="ms-say">
            <p className="pen-big">{n(pages)} page{pages === 1 ? '' : 's'}</p>
            <p className="pen-line">{n(words ?? 0)} words, about {pp} to a page.</p>
            {finished.map((d) => <p key={d.id} className="pen-line pen-plum-text">{d.name} finished {longDay(String(d.completed_at).slice(0, 10))}, {n(d.words ?? 0)} words.</p>)}
            {target ? <p className="pen-line">{(words ?? 0) >= target ? `Past the ${n(target)} words you set.` : `At ${n(target)} words it will be about ${n(pagesOf(target, pp))}.`}</p> : null}
          </div>
        </div>
      </section>
      <section aria-labelledby="bc-h" className="bookcase">
        <h3 id="bc-h">Your writing pushes</h3>
        {shelves && shelves.length === 0 && <p className="muted">Your first writing push starts the first shelf. Set one in Settings, page 2 Goals and focused efforts.</p>}
        {running && <ShelfDrawing shelf={running} />}
        {ended.length > 0 && <FinishedShelf shelves={ended} />}
        {shelves && shelves.length > 0 && <p className="small muted">{running ? 'On the push you are in, a book is a day: a thick book was a big day, a slim one a short day, ink for a day you met your goal, pencil for a day you wrote less, and a chair is a rest day you set. ' : ''}When a push ends, its days close into one book on the shelf of finished pushes: as thick as the words it wrote, in ink if it reached its goal. Point at any book for its figures.</p>}
      </section>
    </div>
  );
}

/** The recap, for the week after a push ends: the manuscript, what the push wrote, and its full shelf. */
export function Recap({ ctx, r, name }: { ctx: Ctx; r: any; name: string }) {
  const [shelf, setShelf] = useState<Shelf | null>(null);
  useEffect(() => {
    api.get(`/api/projects/${ctx.projectId}/shelves${tz ? `?tz=${encodeURIComponent(tz)}` : ''}`).then((list: Shelf[]) => setShelf(list.find((x) => x.current) ?? null)).catch(() => setShelf(null));
  }, [ctx.projectId]);
  const s = ctx.settings ?? {};
  const pp = perPage(s);
  const written = r.days.filter((d: any) => !d.future && d.words > 0);
  const best = written.reduce((a: any, d: any) => (!a || d.words > a.words ? d : a), null);
  return (
    <div className="recap">
      <div className="ms-row">
        <Manuscript title={ctx.project?.title || 'Your novel'} author={authorOf(s)} words={r.bookWords} pages={pagesOf(r.bookWords, pp)} scale={0.9} />
        <div className="ms-say">
          {r.total > 0 ? <>
            <p className="pen-big">You wrote {n(r.total)} words.</p>
            <p className="pen-line pen-plum-text">That's this: {n(pagesOf(r.total, pp))} page{pagesOf(r.total, pp) === 1 ? '' : 's'} that did not exist on the first day of {name}.</p>
          </> : <>
            <p className="pen-big">{name} is over.</p>
            <p className="pen-line pen-plum-text">No words went down in it, and that is all it means. The manuscript is still here, and the next push starts fresh.</p>
          </>}
          {written.length > 0 && <p className="pen-line">{written.length} of {r.days.length} days{best ? `. Biggest day: ${n(best.words)} words, ${longDay(best.day)}.` : '.'}</p>}
        </div>
      </div>
      {shelf && <ShelfDrawing shelf={shelf} label={false} />}
    </div>
  );
}

export { CHAIR_W };
