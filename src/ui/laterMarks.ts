import { Extension } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Node as PMNode } from '@tiptap/pm/model';
import { LATER_RE } from '../core/later';

// Notes left for later look like pencil in the margin: [[check her mother's name]].
// Ctrl+Shift+L starts one where the cursor is, so she never has to stop for the brackets.

function decorate(doc: PMNode) {
  const out: Decoration[] = [];
  doc.descendants((node, pos) => {
    if (!node.isTextblock) return true;
    // Read the block's text whole, so a note that crosses bold or italic is still one note.
    let text = '';
    const at: number[] = [];
    node.forEach((child, offset) => {
      if (child.isText) { for (let i = 0; i < child.text!.length; i++) at.push(pos + 1 + offset + i); text += child.text; }
      else { at.push(-1); text += '￼'; }
    });
    for (const m of text.matchAll(LATER_RE)) {
      const a = at[m.index!], b = at[m.index! + m[0].length - 1];
      if (a != null && b != null && a >= 0 && b >= 0) out.push(Decoration.inline(a, b + 1, { class: 'later-note', title: 'A note for later. It is not counted as story words.' }));
    }
    return false;
  });
  return DecorationSet.create(doc, out);
}

const key = new PluginKey<DecorationSet>('laterNotes');

export const LaterNotes = Extension.create({
  name: 'laterNotes',
  addKeyboardShortcuts() {
    return {
      'Mod-Shift-l': () => {
        const { from, to, empty } = this.editor.state.selection;
        if (!empty) {
          // Wrap what she selected, so a phrase can become a note in one keystroke.
          const chosen = this.editor.state.doc.textBetween(from, to, ' ');
          return this.editor.chain().insertContentAt({ from, to }, `[[${chosen}]]`).setTextSelection(from + 2 + chosen.length).run();
        }
        return this.editor.chain().insertContent('[[]]').setTextSelection(from + 2).run();
      },
    };
  },
  addProseMirrorPlugins() {
    return [new Plugin<DecorationSet>({
      key,
      state: {
        init: (_, state) => decorate(state.doc),
        apply: (tr, old) => (tr.docChanged ? decorate(tr.doc) : old),
      },
      props: { decorations: (state) => key.getState(state) },
    })];
  },
});
