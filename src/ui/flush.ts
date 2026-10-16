// Lets any part of the window make sure the open page is saved before doing something to the scene
// (deleting it, restoring an earlier version). Only one editor is open at a time.
let current: (() => Promise<void>) | null = null;
export function registerFlush(f: (() => Promise<void>) | null) { current = f; }
export async function flushEditor() { if (current) await current(); }

// The open page's editor, so side panels (Read it back) can find and select words on it.
import type { Editor as TipTapEditor } from '@tiptap/react';
let editorNow: TipTapEditor | null = null;
const listeners = new Set<() => void>();
export function registerEditor(e: TipTapEditor | null) { editorNow = e; listeners.forEach((f) => f()); }
export function currentEditor() { return editorNow; }
export function onEditorChange(f: () => void) { listeners.add(f); return () => { listeners.delete(f); }; }

/** The page's text with a map from text offsets back to editor positions. Blocks are separated by a newline. */
export function textMap(ed: TipTapEditor) {
  let text = '';
  const segs: { start: number; pos: number; len: number }[] = [];
  let firstBlock = true;
  ed.state.doc.descendants((node, pos) => {
    if (node.isTextblock) { if (!firstBlock) text += '\n'; firstBlock = false; }
    else if (node.type.name === 'horizontalRule') { if (!firstBlock) text += '\n'; firstBlock = false; text += '* * *'; }
    if (node.isText) { segs.push({ start: text.length, pos, len: node.text!.length }); text += node.text; }
    else if (node.type.name === 'hardBreak') text += '\n';
    return true;
  });
  const toPos = (off: number) => {
    for (const s of segs) if (off >= s.start && off <= s.start + s.len) return s.pos + (off - s.start);
    return null;
  };
  return { text, toPos };
}

/** Select a stretch of the page by text offsets and bring it into view. */
export function selectRange(from: number, to: number) {
  const ed = editorNow;
  if (!ed) return false;
  const m = textMap(ed);
  const a = m.toPos(from), b = m.toPos(to);
  if (a == null || b == null) return false;
  ed.chain().focus().setTextSelection({ from: a, to: b }).scrollIntoView().run();
  return true;
}
