import { useState } from 'react';
import { TEACH, NEED_WORDS, teachField } from './teach';
import { LearnMore } from './Help';

/** The heading already says "The common mistake", so the sentence need not say it again. */
const mistake = (m: string) => { const t = m.replace(/^the (common|usual) mistake (is|here is)\s*/i, ''); return t.charAt(0).toUpperCase() + t.slice(1); };

// Teaching beside the work. A small "What is this?" under a field label opens what the field is,
// why it matters, whether most books need it, the common mistake, and an example. Nothing opens
// on its own, so the page stays calm once she knows her way around.

export function FieldTeach({ kind, field, hint }: { kind: string; field: string; hint?: string }) {
  const t = teachField(kind, field);
  const [open, setOpen] = useState(false);
  if (!t) return hint ? <p className="field-hint">{hint}</p> : null;
  return (
    <div className="teach">
      <p className="field-hint">{t.what} <button type="button" className="btn link small teach-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Less' : 'Why it matters'}</button></p>
      {t.differs && <p className="field-differs"><span className="differs-head">Not the same as its neighbors.</span> {t.differs}</p>}
      {open && (
        <div className="teach-body">
          <p><span className="teach-need" data-need={t.need}>{NEED_WORDS[t.need]}</span> {t.why}</p>
          {t.mistake && <p><strong>The common mistake.</strong> {mistake(t.mistake)}</p>}
          {t.example && <p><strong>Example.</strong> {t.example}</p>}
        </div>
      )}
    </div>
  );
}

/** At the top of a record or a list of records: what this kind is for, folded once she has read it. */
export function KindTeach({ kind, label, helpAnchor }: { kind: string; label: string; helpAnchor?: string }) {
  const a = TEACH[kind]?.about;
  const key = `ns-teach-kind-${kind}`;
  const [open, setOpen] = useState<boolean>(() => { try { return localStorage.getItem(key) !== 'closed'; } catch { return true; } });
  if (!a) return null;
  const toggle = () => { const next = !open; setOpen(next); try { localStorage.setItem(key, next ? 'open' : 'closed'); } catch { /* ignore */ } };
  return (
    <section className="kind-teach" aria-label={`About ${label}`}>
      <button type="button" className="kind-teach-head" aria-expanded={open} onClick={toggle}><span aria-hidden="true">{open ? '▾' : '▸'}</span> About {label.charAt(0).toLowerCase() + label.slice(1)}: what they are and how to use them</button>
      {open && (
        <div className="teach-body">
          <p>{a.what} {a.why}</p>
          {a.differs && <p><strong>Not the same as.</strong> {a.differs}</p>}
          {a.when && <p><strong>When to use it.</strong> {a.when}</p>}
          {a.mistake && <p><strong>The common mistake.</strong> {mistake(a.mistake)}</p>}
          {a.example && <p><strong>Example.</strong> {a.example}</p>}
          {helpAnchor && <p><LearnMore to={helpAnchor}>Read the full chapter in Help</LearnMore></p>}
        </div>
      )}
    </section>
  );
}

/** Under a group heading on a record page: what this group of fields is for. */
export function GroupTeach({ kind, group }: { kind: string; group: string }) {
  const g = TEACH[kind]?.groups?.[group];
  return g ? <p className="group-hint">{g}</p> : null;
}
