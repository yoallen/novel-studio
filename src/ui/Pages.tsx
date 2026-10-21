import { useState } from 'react';

// The notebook pattern for any long screen: numbered page tabs, one page at a time, All pages to see
// everything, and links to the page before and after. The page you were on is remembered for the session.
export interface PageDef { title: string; content: React.ReactNode; filled?: boolean; hidden?: boolean }

export function Pages({ storeKey, pages, label, compact }: { storeKey: string; pages: PageDef[]; label: string; compact?: boolean }) {
  const shown = pages.filter((p) => !p.hidden);
  const key = `ns-pages:${storeKey}`;
  const [no, setNoState] = useState<number | 'all'>(() => { try { const v = sessionStorage.getItem(key); return v === 'all' ? 'all' : v ? Number(v) : 0; } catch { return 0; } });
  const setNo = (n: number | 'all') => { setNoState(n); try { sessionStorage.setItem(key, String(n)); } catch { /* ignore */ } };
  const current = no === 'all' ? 'all' : Math.min(no, shown.length - 1);
  if (shown.length <= 1) return <>{shown[0]?.content}</>;
  return (
    <div className={'pages' + (compact ? ' pages-compact' : '')}>
      <nav className="record-pages" aria-label={`Pages of ${label}`}>
        <div role="tablist" aria-label="Pages">
          {shown.map((pg, i) => (
            <button key={pg.title} role="tab" aria-selected={current === i} className="record-page-tab" data-filled={pg.filled ? 'yes' : undefined} onClick={() => setNo(i)}>
              <span className="record-page-no">{i + 1}</span>{pg.title}
            </button>
          ))}
          <button role="tab" aria-selected={current === 'all'} className="record-page-tab record-page-all" onClick={() => setNo('all')}>All pages</button>
        </div>
      </nav>
      {shown.map((pg, i) => (current === 'all' || current === i) && (
        <div key={pg.title} className="record-page" role="tabpanel" aria-label={`Page ${i + 1}: ${pg.title}`}>
          {!compact && <p className="record-page-head"><span className="record-page-no">{i + 1}</span>{pg.title}</p>}
          {pg.content}
          {current !== 'all' && (
            <div className="row record-page-turn">
              {i > 0 && <button className="btn link small" onClick={() => setNo(i - 1)}>Page {i}: {shown[i - 1]!.title}</button>}
              <span className="grow" />
              {i < shown.length - 1 && <button className="btn link small" onClick={() => setNo(i + 1)}>Page {i + 2}: {shown[i + 1]!.title}</button>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
