import { useEffect, useMemo, useRef, useState } from 'react';
import { marked } from 'marked';

// Help: the whole User's Guide, inside the program. Every "Learn more" in Story Canon opens the
// right section here, so the answer to "what is this for?" is always one click away.

const files = import.meta.glob('./guide/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

const decode = (s: string) => s.replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
export const slug = (s: string) => decode(s.replace(/<[^>]+>/g, '')).toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

interface Chapter { id: string; title: string; md: string; heads: { level: number; text: string; id: string }[] }

export const CHAPTERS: Chapter[] = Object.keys(files).sort().map((path) => {
  const md = files[path]!;
  const id = path.replace(/^.*\/\d+-/, '').replace(/\.md$/, '');
  const heads = [...md.matchAll(/^(#{1,4}) (.+)$/gm)].map((m) => ({ level: m[1]!.length, text: m[2]!.replace(/[*_`]/g, ''), id: slug(m[2]!) }));
  return { id, title: heads[0]?.text ?? id, md, heads };
});

/** Where a heading id lives: its chapter. Heading ids are unique across the guide. */
function chapterOf(anchor: string) { return CHAPTERS.find((c) => c.id === anchor || c.heads.some((h) => h.id === anchor)) ?? CHAPTERS[0]!; }

function render(md: string) {
  const r = new marked.Renderer();
  r.heading = ({ tokens, depth }) => { const text = marked.Parser.parseInline(tokens); return `<h${depth} id="${slug(text)}" tabindex="-1">${text}</h${depth}>`; };
  // Links inside the guide to "#some-heading" stay inside Help.
  return marked.parse(md, { renderer: r, async: false }) as string;
}

export function Help({ anchor, onClose }: { anchor: string | null; onClose?: () => void }) {
  const [at, setAt] = useState<string>(anchor || CHAPTERS[0]?.id || '');
  const [q, setQ] = useState('');
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => { if (anchor) setAt(anchor); }, [anchor]);
  const chapter = chapterOf(at);
  const html = useMemo(() => render(chapter.md), [chapter]);
  useEffect(() => {
    const el = at && at !== chapter.id ? body.current?.querySelector<HTMLElement>(`#${CSS.escape(at)}`) : null;
    if (el) { el.scrollIntoView({ block: 'start' }); el.focus({ preventScroll: true }); el.classList.add('found'); window.setTimeout(() => el.classList.remove('found'), 2500); }
    else body.current?.scrollTo({ top: 0 });
  }, [at, chapter]);
  const hits = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 2) return [];
    const out: { chapter: Chapter; id: string; title: string; snippet: string }[] = [];
    for (const c of CHAPTERS) {
      const parts = c.md.split(/^(?=#{1,3} )/m);
      for (const p of parts) {
        const i = p.toLowerCase().indexOf(t);
        if (i < 0) continue;
        const head = p.match(/^#{1,3} (.+)$/m)?.[1] ?? c.title;
        out.push({ chapter: c, id: slug(head), title: head.replace(/[*_`]/g, ''), snippet: p.slice(Math.max(0, i - 60), i + 90).replace(/[#*_`>|]/g, ' ').replace(/-{3,}/g, ' ').replace(/\s+/g, ' ') });
      }
    }
    return out.slice(0, 40);
  }, [q]);
  function onClick(e: React.MouseEvent) {
    const a = (e.target as HTMLElement).closest('a');
    const href = a?.getAttribute('href') ?? '';
    if (href.startsWith('#')) { e.preventDefault(); setAt(href.slice(1)); }
  }
  return (
    <div className="help">
      <nav className="help-toc" aria-label="Guide chapters">
        <label className="field" style={{ margin: '0 0 0.75rem' }}><span>Search the guide</span><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="For example: beat, sprint, decided" /></label>
        {q.trim().length >= 2 ? (
          <ul className="help-hits">
            {hits.length === 0 && <li className="muted small">Nothing in the guide says "{q}". Try another word.</li>}
            {hits.map((h, i) => <li key={i}><button className="btn link small" onClick={() => { setAt(h.id); }}>{h.title}</button><span className="faint small"> in {h.chapter.title}</span><p className="small muted">…{h.snippet}…</p></li>)}
          </ul>
        ) : (
          <ol className="help-chapters">
            {CHAPTERS.map((c) => (
              <li key={c.id}>
                <button className="btn link" aria-current={c === chapter ? 'page' : undefined} onClick={() => setAt(c.id)}>{c.title}</button>
                {c === chapter && c.heads.filter((h) => h.level === 2).length > 0 && (
                  <ul>{c.heads.filter((h) => h.level === 2).map((h) => <li key={h.id}><button className="btn link small" onClick={() => setAt(h.id)}>{h.text}</button></li>)}</ul>
                )}
              </li>
            ))}
          </ol>
        )}
      </nav>
      <article className="help-body prose-help" ref={body} onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
      {onClose && <button className="btn small help-close" onClick={onClose}>Close Help</button>}
    </div>
  );
}

/** "Learn more" anywhere in the program: opens Help at the right section. */
export function LearnMore({ to, children = 'Learn more' }: { to: string; children?: React.ReactNode }) {
  return <button type="button" className="btn link small learn-more" onClick={() => window.dispatchEvent(new CustomEvent('ns-help', { detail: to }))}>{children}</button>;
}
