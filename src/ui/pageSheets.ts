import { Extension } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Node as PMNode } from '@tiptap/pm/model';
import { turnsIn, wordsIn } from '../core/pages';

// Pages in the Writing Room. Every 250 words a sheet ends and the next begins, exactly at the word where the
// page turns, often mid-sentence, the way a word processor shows it. The turn is drawn as a widget between
// two words: it is never part of the text, so nothing she types, saves or exports changes because of it.

export interface PageInfo { offset: number; chapterStart: number }

export const pagesKey = new PluginKey<DecorationSet>('pageSheets');

function turn(endPage: number, nextPage: number) {
  const el = document.createElement('span');
  el.className = 'sheet-turn';
  el.contentEditable = 'false';
  el.setAttribute('role', 'separator');
  el.setAttribute('aria-label', `End of page ${endPage}. Page ${nextPage} begins.`);
  const fill = document.createElement('span'); fill.className = 'sheet-fill';
  const foot = document.createElement('span'); foot.className = 'sheet-foot'; foot.textContent = String(endPage);
  const gap = document.createElement('span'); gap.className = 'sheet-gap';
  el.append(fill, foot, gap);
  return el;
}

function build(doc: PMNode, info: PageInfo | null) {
  if (!info) return DecorationSet.empty;
  const out: Decoration[] = [];
  let before = info.offset;
  doc.descendants((node, pos) => {
    if (!node.isTextblock) return true;
    let text = '';
    const at: number[] = [];
    node.forEach((child, offset) => {
      if (child.isText) { for (let i = 0; i < child.text!.length; i++) at.push(pos + 1 + offset + i); text += child.text; }
      else { at.push(-1); text += '\n'; }
    });
    for (const t of turnsIn(text, before)) {
      const p = at[t.at];
      if (p == null || p < 0) continue;
      const next = info.chapterStart + t.page;
      out.push(Decoration.widget(p, () => turn(next - 1, next), { side: -1, key: `turn-${next}-${info.chapterStart}`, ignoreSelection: true }));
    }
    before += wordsIn(text);
    return false;
  });
  return DecorationSet.create(doc, out);
}

/** info is read on every change; dispatch a transaction with meta pagesKey after info itself changes. */
export function PageSheets(info: { current: PageInfo | null }) {
  return Extension.create({
    name: 'pageSheets',
    addProseMirrorPlugins() {
      return [new Plugin<DecorationSet>({
        key: pagesKey,
        state: {
          init: (_c, state) => build(state.doc, info.current),
          apply: (tr, old, _o, state) => (tr.docChanged || tr.getMeta(pagesKey) ? build(state.doc, info.current) : old),
        },
        props: { decorations: (state) => pagesKey.getState(state) },
      })];
    },
  });
}

/**
 * Give every sheet that starts at the top of a page at least a letter-shaped height, so pages look and
 * feel the same size. Only the blank space under the words grows; the words never move between sheets.
 */
export function fitSheets(page: HTMLElement, firstIsWhole: boolean) {
  const focus = page.closest('.focus');
  const fills = Array.from(page.querySelectorAll<HTMLElement>('.sheet-fill'));
  for (const f of fills) f.style.height = '0px';
  if (focus) return;
  const letter = page.clientWidth * 1.294;
  const pageTop = page.getBoundingClientRect().top;
  let top = pageTop, whole = firstIsWhole;
  for (const f of fills) {
    const host = f.parentElement!;
    const foot = host.querySelector<HTMLElement>('.sheet-foot');
    const used = f.getBoundingClientRect().top - top + (foot?.offsetHeight ?? 0);
    if (whole) f.style.height = `${Math.max(0, Math.round(letter - used))}px`;
    const gap = host.querySelector<HTMLElement>('.sheet-gap');
    top = gap ? gap.getBoundingClientRect().bottom : host.getBoundingClientRect().bottom;
    whole = true;
  }
}
